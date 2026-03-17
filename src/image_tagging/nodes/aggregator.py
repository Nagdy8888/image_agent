"""Tag aggregator node: assembles the final TagRecord and sets processing status."""

from datetime import datetime, timezone
from typing import Any

from src.image_tagging.schemas.states import ImageTaggingState
from src.image_tagging.schemas.tags import TagRecord, ValidatedTag, HierarchicalTag

HIERARCHICAL_CATEGORIES = ("objects", "dominant_colors", "product_type")
FLAT_LIST_CATEGORIES = ("season", "theme", "design_elements", "occasion", "mood")
TAG_RECORD_SEASON = "season"
TAG_RECORD_THEME = "theme"
TAG_RECORD_OBJECTS = "objects"
TAG_RECORD_COLORS = "dominant_colors"
TAG_RECORD_DESIGN = "design_elements"
TAG_RECORD_OCCASION = "occasion"
TAG_RECORD_MOOD = "mood"
TAG_RECORD_PRODUCT = "product_type"


def _to_flat_list(vals: list[ValidatedTag]) -> list[str]:
    return [v.get("value", "") for v in vals if v.get("value")]


def _to_hierarchical_list(vals: list[ValidatedTag]) -> list[HierarchicalTag]:
    out: list[HierarchicalTag] = []
    for v in vals:
        value = v.get("value", "")
        parent = v.get("parent")
        if value and parent:
            out.append({"parent": parent, "child": value})
    return out


def _to_single_hierarchical(vals: list[ValidatedTag]) -> HierarchicalTag | None:
    ht_list = _to_hierarchical_list(vals)
    return ht_list[0] if ht_list else None


async def tag_aggregator(state: ImageTaggingState) -> dict[str, Any]:
    """
    Assemble TagRecord from validated_tags. Set processing_status and tag_record.
    needs_review is set by confidence_filter; we pass it through.
    """
    validated: dict[str, list[ValidatedTag]] = state.get("validated_tags") or {}
    needs_review = state.get("needs_review", False)
    image_id = state.get("image_id", "")
    error = state.get("error")

    if error:
        return {
            "processing_status": "failed",
            "tag_record": None,
        }

    record: TagRecord = {
        "image_id": image_id,
        "season": _to_flat_list(validated.get("season", [])),
        "theme": _to_flat_list(validated.get("theme", [])),
        "objects": _to_hierarchical_list(validated.get("objects", [])),
        "dominant_colors": _to_hierarchical_list(validated.get("dominant_colors", [])),
        "design_elements": _to_flat_list(validated.get("design_elements", [])),
        "occasion": _to_flat_list(validated.get("occasion", [])),
        "mood": _to_flat_list(validated.get("mood", [])),
        "product_type": _to_single_hierarchical(validated.get("product_type", [])) or {},
        "needs_review": needs_review,
        "processed_at": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
    }

    status = "needs_review" if needs_review else "complete"
    return {
        "tag_record": record,
        "processing_status": status,
    }
