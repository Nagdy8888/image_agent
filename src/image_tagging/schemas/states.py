"""LangGraph state definitions for the image tagging pipeline."""

from typing import Annotated, Optional, TypedDict
import operator

from src.image_tagging.schemas.tags import TagResult, ValidatedTag, FlaggedTag, TagRecord


class ImageTaggingState(TypedDict, total=False):
    image_id: str
    image_url: str
    image_base64: Optional[str]
    metadata: dict
    vision_description: str
    vision_raw_tags: dict
    partial_tags: Annotated[list[TagResult], operator.add]
    validated_tags: dict[str, list[ValidatedTag]]  # category -> list of ValidatedTag
    flagged_tags: list[FlaggedTag]
    tag_record: Optional[TagRecord]
    needs_review: bool  # Set by confidence_filter when >=3 flagged in one category
    error: Optional[str]
    processing_status: str  # "pending" | "complete" | "needs_review" | "failed"
