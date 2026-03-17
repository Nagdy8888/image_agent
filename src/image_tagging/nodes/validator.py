"""Tag validator node: checks all tags against the taxonomy enums."""

from typing import Any

from src.image_tagging.schemas.states import ImageTaggingState
from src.image_tagging.schemas.tags import TagResult, ValidatedTag, FlaggedTag
from src.image_tagging.taxonomy import is_valid_tag, get_parent_for_value

EXPECTED_CATEGORIES = 8


async def tag_validator(state: ImageTaggingState) -> dict[str, Any]:
    """
    Run only when all 8 taggers have contributed (len(partial_tags) == 8).
    Validate each tag against taxonomy; valid -> validated_tags, invalid -> flagged_tags.
    """
    partial_tags: list[TagResult] = state.get("partial_tags") or []
    if len(partial_tags) < EXPECTED_CATEGORIES:
        return {}

    validated: dict[str, list[ValidatedTag]] = {}
    flagged: list[FlaggedTag] = []

    for item in partial_tags:
        category = (item.get("category") or "").strip()
        if not category:
            continue
        tags = item.get("tags") or []
        scores = item.get("confidence_scores") or {}
        validated[category] = []
        for tag_value in tags:
            conf = scores.get(tag_value, 0.0)
            if not is_valid_tag(category, tag_value):
                flagged.append({
                    "category": category,
                    "value": tag_value,
                    "confidence": conf,
                    "reason": "not_in_taxonomy",
                })
                continue
            parent = get_parent_for_value(category, tag_value)
            vt: ValidatedTag = {"value": tag_value, "confidence": conf}
            if parent:
                vt["parent"] = parent
            validated[category].append(vt)

    return {
        "validated_tags": validated,
        "flagged_tags": flagged,
    }
