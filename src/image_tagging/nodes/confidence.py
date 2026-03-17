"""Confidence filter node: flags tags below the confidence threshold."""

from typing import Any

from src.image_tagging import configuration
from src.image_tagging.schemas.states import ImageTaggingState
from src.image_tagging.schemas.tags import ValidatedTag, FlaggedTag


async def confidence_filter(state: ImageTaggingState) -> dict[str, Any]:
    """
    Filter validated_tags by CONFIDENCE_THRESHOLD. Tags below threshold move to
    flagged_tags with reason "low_confidence". If >= FLAGGED_PER_CATEGORY_THRESHOLD
    in any category, set needs_review (handled in aggregator using flagged list).
    """
    validated: dict[str, list[ValidatedTag]] = dict(state.get("validated_tags") or {})
    flagged: list[FlaggedTag] = list(state.get("flagged_tags") or [])
    threshold = configuration.CONFIDENCE_THRESHOLD
    above: dict[str, list[ValidatedTag]] = {}
    flagged_per_cat: dict[str, int] = {}

    for category, tag_list in validated.items():
        above[category] = []
        flagged_per_cat[category] = 0
        for vt in tag_list:
            conf = vt.get("confidence", 0.0)
            if conf >= threshold:
                above[category].append(vt)
            else:
                flagged.append({
                    "category": category,
                    "value": vt.get("value", ""),
                    "confidence": conf,
                    "reason": "low_confidence",
                })
                flagged_per_cat[category] += 1

    needs_review = any(
        count >= configuration.FLAGGED_PER_CATEGORY_THRESHOLD
        for count in flagged_per_cat.values()
    )

    return {
        "validated_tags": above,
        "flagged_tags": flagged,
        "needs_review": needs_review,
    }
