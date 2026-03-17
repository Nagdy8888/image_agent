"""Image preprocessor node: validates format, resizes, extracts metadata, converts to base64."""

import base64
import io
from typing import Any

import httpx
from PIL import Image

from src.image_tagging.schemas.states import ImageTaggingState

ALLOWED_FORMATS = {"JPEG", "PNG", "WEBP"}
MAX_LONG_EDGE = 1024


async def preprocess_image(state: ImageTaggingState) -> dict[str, Any]:
    image_bytes: bytes
    filename = "image"

    if state.get("image_base64"):
        image_bytes = base64.b64decode(state["image_base64"])
    elif state.get("image_url"):
        async with httpx.AsyncClient() as client:
            resp = await client.get(state["image_url"])
            resp.raise_for_status()
            image_bytes = resp.content
        filename = state["image_url"].split("/")[-1].split("?")[0] or "image"
    else:
        return {"error": "No image_base64 or image_url in state", "processing_status": "failed"}

    try:
        img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    except Exception as e:
        return {"error": f"Could not open image: {e}", "processing_status": "failed"}

    fmt = img.format or "JPEG"
    if fmt.upper() not in ALLOWED_FORMATS:
        return {"error": "Invalid image format", "processing_status": "failed"}

    w, h = img.size
    if max(w, h) > MAX_LONG_EDGE:
        ratio = MAX_LONG_EDGE / max(w, h)
        new_w = int(w * ratio)
        new_h = int(h * ratio)
        img = img.resize((new_w, new_h), Image.Resampling.LANCZOS)
        w, h = new_w, new_h

    buffer = io.BytesIO()
    img.save(buffer, format=fmt, quality=85)
    out_bytes = buffer.getvalue()

    metadata = {
        "filename": filename,
        "format": fmt,
        "width": w,
        "height": h,
        "file_size_bytes": len(out_bytes),
    }

    image_base64 = base64.b64encode(out_bytes).decode("utf-8")
    return {"image_base64": image_base64, "metadata": metadata}
