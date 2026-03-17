"""FastAPI application server for the image tagging agent."""

import asyncio
import base64
import uuid
from pathlib import Path

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from src.image_tagging import taxonomy as taxonomy_module
from src.image_tagging.image_tagging import graph
from src.services.supabase.client import (
    build_search_index,
    get_available_filter_values as db_get_available_filter_values,
    get_tag_record as db_get_tag_record,
    list_tag_images as db_list_tag_images,
    search_images_filtered as db_search_images_filtered,
    upsert_tag_record as db_upsert_tag_record,
)
from src.services.supabase.settings import SUPABASE_ENABLED

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ROOT = Path(__file__).resolve().parent.parent
UPLOADS_DIR = ROOT / "uploads"
UPLOADS_DIR.mkdir(exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(UPLOADS_DIR)), name="uploads")

# In-memory batch progress for bulk upload (ephemeral; cleared on restart)
_batches: dict[str, dict] = {}


@app.get("/api/health")
def health():
    return {"status": "ok"}


@app.post("/api/analyze-image")
async def analyze_image(file: UploadFile):
    content = await file.read()
    ext = (file.filename or "").split(".")[-1].lower() or "jpg"
    if ext not in ("jpg", "jpeg", "png", "webp"):
        ext = "jpg"
    image_id = str(uuid.uuid4())
    filename = f"{image_id}.{ext}"
    filepath = UPLOADS_DIR / filename
    filepath.write_bytes(content)

    image_url = f"/uploads/{filename}"
    image_base64 = base64.b64encode(content).decode("utf-8")

    initial_state = {
        "image_id": image_id,
        "image_url": image_url,
        "image_base64": image_base64,
        "metadata": {},
        "vision_description": "",
        "vision_raw_tags": {},
        "partial_tags": [],
        "processing_status": "pending",
    }

    result = await graph.ainvoke(initial_state)

    partial_tags = result.get("partial_tags") or []
    tags_by_category = {}
    for p in partial_tags:
        cat = p.get("category")
        if cat:
            tags_by_category[cat] = {
                "tags": p.get("tags") or [],
                "confidence_scores": p.get("confidence_scores") or {},
            }
    season_result = tags_by_category.get("season", {})
    season_tags = season_result.get("tags", [])
    season_confidence_scores = season_result.get("confidence_scores", {})

    status = result.get("processing_status") or ("complete" if not result.get("error") else "failed")
    validated_tags = result.get("validated_tags") or {}
    flagged_tags = result.get("flagged_tags") or []
    tag_record = result.get("tag_record")
    saved_to_db = False
    if tag_record and not result.get("error") and SUPABASE_ENABLED:
        try:
            search_index = build_search_index(tag_record)
            await asyncio.to_thread(
                db_upsert_tag_record,
                image_id=tag_record.get("image_id", result.get("image_id", "")),
                tag_record=tag_record,
                search_index=search_index,
                needs_review=tag_record.get("needs_review", False),
                processing_status=status,
                image_url=result.get("image_url"),
            )
            saved_to_db = True
        except Exception:
            pass  # Don't fail the request if DB write fails

    # Overall confidence 0–100: average of all tag confidences (from validated_tags or tags_by_category)
    confidence = None
    if validated_tags:
        scores = []
        for tag_list in validated_tags.values():
            for vt in tag_list:
                if isinstance(vt, dict) and "confidence" in vt:
                    scores.append(float(vt["confidence"]))
        if scores:
            confidence = round(sum(scores) / len(scores) * 100)
    elif tags_by_category:
        scores = []
        for cat_data in tags_by_category.values():
            for _, c in (cat_data.get("confidence_scores") or {}).items():
                try:
                    scores.append(float(c))
                except (TypeError, ValueError):
                    pass
        if scores:
            confidence = round(sum(scores) / len(scores) * 100)

    return {
        "image_id": result.get("image_id"),
        "image_url": result.get("image_url"),
        "vision_description": result.get("vision_description", ""),
        "vision_raw_tags": result.get("vision_raw_tags", {}),
        "metadata": result.get("metadata", {}),
        "processing_status": status,
        "error": result.get("error"),
        "partial_tags": partial_tags,
        "tags_by_category": tags_by_category,
        "season_tags": season_tags,
        "season_confidence_scores": season_confidence_scores,
        "confidence": confidence,
        "validated_tags": validated_tags,
        "flagged_tags": flagged_tags,
        "tag_record": tag_record,
        "saved_to_db": saved_to_db,
    }


async def _process_one_bulk_item(image_id: str, image_url: str, content: bytes, ext: str) -> dict:
    """Run one image through the graph and optionally save to Supabase. Returns result summary."""
    image_base64 = base64.b64encode(content).decode("utf-8")
    initial_state = {
        "image_id": image_id,
        "image_url": image_url,
        "image_base64": image_base64,
        "metadata": {},
        "vision_description": "",
        "vision_raw_tags": {},
        "partial_tags": [],
        "processing_status": "pending",
    }
    try:
        result = await graph.ainvoke(initial_state)
    except Exception as e:
        return {"image_id": image_id, "image_url": image_url, "processing_status": "failed", "error": str(e)}
    status = result.get("processing_status") or ("complete" if not result.get("error") else "failed")
    tag_record = result.get("tag_record")
    if tag_record and not result.get("error") and SUPABASE_ENABLED:
        try:
            search_index = build_search_index(tag_record)
            await asyncio.to_thread(
                db_upsert_tag_record,
                image_id=tag_record.get("image_id", image_id),
                tag_record=tag_record,
                search_index=search_index,
                needs_review=tag_record.get("needs_review", False),
                processing_status=status,
                image_url=image_url,
            )
        except Exception:
            pass
    return {
        "image_id": image_id,
        "image_url": image_url,
        "processing_status": status,
        "error": result.get("error"),
    }


async def _run_bulk_batch(batch_id: str) -> None:
    """Background task: process each image in the batch sequentially and update _batches[batch_id]."""
    batch = _batches.get(batch_id)
    if not batch:
        return
    for item in batch["items"]:
        image_id, image_url, filepath = item["image_id"], item["image_url"], item["filepath"]
        if not filepath.exists():
            batch["results"].append({
                "image_id": image_id,
                "image_url": image_url,
                "processing_status": "failed",
                "error": "File not found",
            })
            batch["failed"] += 1
            continue
        content = filepath.read_bytes()
        summary = await _process_one_bulk_item(image_id, image_url, content, item["ext"])
        batch["results"].append(summary)
        if summary.get("processing_status") == "failed":
            batch["failed"] += 1
        else:
            batch["completed"] += 1
    batch["status"] = "complete"


@app.post("/api/bulk-upload")
async def bulk_upload(files: list[UploadFile] = File(default=[])):
    """Accept multiple images, save to disk, start background processing, return batch_id for polling."""
    if not files:
        raise HTTPException(status_code=400, detail="No files provided")
    batch_items = []
    for f in files:
        content = await f.read()
        ext = (f.filename or "").split(".")[-1].lower() or "jpg"
        if ext not in ("jpg", "jpeg", "png", "webp"):
            ext = "jpg"
        image_id = str(uuid.uuid4())
        filename = f"{image_id}.{ext}"
        filepath = UPLOADS_DIR / filename
        filepath.write_bytes(content)
        image_url = f"/uploads/{filename}"
        batch_items.append({"image_id": image_id, "image_url": image_url, "filepath": filepath, "ext": ext})
    batch_id = str(uuid.uuid4())
    _batches[batch_id] = {
        "batch_id": batch_id,
        "total": len(batch_items),
        "completed": 0,
        "failed": 0,
        "status": "processing",
        "results": [],
        "items": batch_items,
    }
    asyncio.create_task(_run_bulk_batch(batch_id))
    return {"batch_id": batch_id, "total": len(batch_items), "status": "processing"}


@app.get("/api/bulk-status/{batch_id}")
async def bulk_status(batch_id: str):
    """Return current progress and results for a bulk upload batch."""
    batch = _batches.get(batch_id)
    if not batch:
        raise HTTPException(status_code=404, detail="Batch not found")
    results = [{"image_id": r["image_id"], "image_url": r["image_url"], "processing_status": r["processing_status"], "error": r.get("error")} for r in batch["results"]]
    return {
        "batch_id": batch["batch_id"],
        "total": batch["total"],
        "completed": batch["completed"],
        "failed": batch["failed"],
        "status": batch["status"],
        "results": results,
    }


@app.get("/api/tag-image/{image_id}")
async def get_tag_image(image_id: str):
    """Retrieve a stored tag record by image_id."""
    if not SUPABASE_ENABLED:
        raise HTTPException(status_code=503, detail="Database not configured")
    try:
        row = await asyncio.to_thread(db_get_tag_record, image_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    if not row:
        raise HTTPException(status_code=404, detail="Record not found")
    return row


@app.get("/api/tag-images")
async def list_tag_images(limit: int = 50, offset: int = 0):
    """List recent tag records (for history view)."""
    if not SUPABASE_ENABLED:
        return {"items": []}
    try:
        items = await asyncio.to_thread(db_list_tag_images, limit=limit, offset=offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"items": items}


def _parse_filter_params(
    season: str | None = None,
    theme: str | None = None,
    objects: str | None = None,
    dominant_colors: str | None = None,
    design_elements: str | None = None,
    occasion: str | None = None,
    mood: str | None = None,
    product_type: str | None = None,
) -> dict[str, list[str]]:
    out = {}
    if season:
        out["season"] = [v.strip() for v in season.split(",") if v.strip()]
    if theme:
        out["theme"] = [v.strip() for v in theme.split(",") if v.strip()]
    if objects:
        out["objects"] = [v.strip() for v in objects.split(",") if v.strip()]
    if dominant_colors:
        out["dominant_colors"] = [v.strip() for v in dominant_colors.split(",") if v.strip()]
    if design_elements:
        out["design_elements"] = [v.strip() for v in design_elements.split(",") if v.strip()]
    if occasion:
        out["occasion"] = [v.strip() for v in occasion.split(",") if v.strip()]
    if mood:
        out["mood"] = [v.strip() for v in mood.split(",") if v.strip()]
    if product_type:
        out["product_type"] = [v.strip() for v in product_type.split(",") if v.strip()]
    return out


@app.get("/api/taxonomy")
def get_taxonomy():
    """Return full taxonomy (flat and hierarchical) for building filter dropdowns."""
    return {
        "season": {"type": "flat", "values": list(getattr(taxonomy_module, "SEASON", []))},
        "theme": {"type": "flat", "values": list(getattr(taxonomy_module, "THEME", []))},
        "objects": {
            "type": "hierarchical",
            "groups": {k: list(v) for k, v in getattr(taxonomy_module, "OBJECTS_CATEGORIES", {}).items()},
        },
        "dominant_colors": {
            "type": "hierarchical",
            "groups": {k: list(v) for k, v in getattr(taxonomy_module, "COLORS_CATEGORIES", {}).items()},
        },
        "design_elements": {"type": "flat", "values": list(getattr(taxonomy_module, "DESIGN", []))},
        "occasion": {"type": "flat", "values": list(getattr(taxonomy_module, "OCCASION", []))},
        "mood": {"type": "flat", "values": list(getattr(taxonomy_module, "MOOD", []))},
        "product_type": {
            "type": "hierarchical",
            "groups": {k: list(v) for k, v in getattr(taxonomy_module, "PRODUCT_CATEGORIES", {}).items()},
        },
    }


@app.get("/api/search-images")
async def search_images(
    season: str | None = None,
    theme: str | None = None,
    objects: str | None = None,
    dominant_colors: str | None = None,
    design_elements: str | None = None,
    occasion: str | None = None,
    mood: str | None = None,
    product_type: str | None = None,
    limit: int = 50,
    offset: int = 0,
):
    """Search images by tag filters. AND across categories, OR within a category."""
    if not SUPABASE_ENABLED:
        return {"items": []}
    filters = _parse_filter_params(
        season=season,
        theme=theme,
        objects=objects,
        dominant_colors=dominant_colors,
        design_elements=design_elements,
        occasion=occasion,
        mood=mood,
        product_type=product_type,
    )
    try:
        items = await asyncio.to_thread(db_search_images_filtered, filters, limit, offset)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    return {"items": items}


@app.get("/api/available-filters")
async def available_filters(
    season: str | None = None,
    theme: str | None = None,
    objects: str | None = None,
    dominant_colors: str | None = None,
    design_elements: str | None = None,
    occasion: str | None = None,
    mood: str | None = None,
    product_type: str | None = None,
):
    """Return tag values that exist in the (filtered) result set for cascading dropdowns."""
    if not SUPABASE_ENABLED:
        return {}
    filters = _parse_filter_params(
        season=season,
        theme=theme,
        objects=objects,
        dominant_colors=dominant_colors,
        design_elements=design_elements,
        occasion=occasion,
        mood=mood,
        product_type=product_type,
    )
    try:
        return await asyncio.to_thread(db_get_available_filter_values, filters if any(filters.values()) else None)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
