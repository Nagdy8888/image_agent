"""Pydantic models for tag results, validated tags, flagged tags, and the final TagRecord."""

from typing import Optional, TypedDict


class TagResult(TypedDict, total=False):
    """Output from a single category tagger node. Appended to partial_tags via reducer."""
    category: str
    tags: list[str]
    confidence_scores: dict[str, float]  # tag_value -> 0.0–1.0


class TaggerOutput(TypedDict):
    """Structured LLM output for a tagger (parsed from JSON)."""
    tags: list[str]
    confidence_scores: dict[str, float]
    reasoning: str


class ValidatedTag(TypedDict, total=False):
    """Single tag that passed taxonomy validation."""
    value: str
    confidence: float
    parent: Optional[str]  # For hierarchical categories


class FlaggedTag(TypedDict):
    """Tag below confidence threshold or rejected by validator."""
    category: str
    value: str
    confidence: float
    reason: str


class HierarchicalTag(TypedDict):
    """Parent-child pair for objects, dominant_colors, product_type."""
    parent: str
    child: str


class TagRecord(TypedDict, total=False):
    """Final assembled record for an image."""
    image_id: str
    season: list[str]
    theme: list[str]
    objects: list[HierarchicalTag]
    dominant_colors: list[HierarchicalTag]
    design_elements: list[str]
    occasion: list[str]
    mood: list[str]
    product_type: HierarchicalTag  # Single; spec says one product type per image
    needs_review: bool
    processed_at: str  # ISO timestamp
