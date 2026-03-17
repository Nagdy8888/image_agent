"""All category tagger nodes using a generic tagger pattern."""

import asyncio
import json
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from src.image_tagging import settings
from src.image_tagging.prompts.tagger import build_tagger_prompt
from src.image_tagging.schemas.states import ImageTaggingState
from src.image_tagging.schemas.tags import TagResult
from src.image_tagging.taxonomy import get_allowed_values


async def _run_tagger(category: str, state: ImageTaggingState) -> TagResult | None:
    """
    Run a single category tagger: call LLM with taxonomy-allowed values and vision description,
    parse JSON, return TagResult for partial_tags.
    """
    vision_description = state.get("vision_description") or ""
    vision_raw = state.get("vision_raw_tags") or {}
    if isinstance(vision_raw, dict) and vision_raw:
        parts = []
        if vision_raw.get("visual_description"):
            parts.append(str(vision_raw["visual_description"]))
        if vision_raw.get("seasonal_indicators"):
            parts.append(f"Seasonal cues: {vision_raw['seasonal_indicators']}")
        if vision_raw.get("dominant_mood"):
            parts.append(f"Mood: {vision_raw['dominant_mood']}")
        if vision_raw.get("visible_subjects"):
            parts.append(f"Visible: {', '.join(vision_raw['visible_subjects'])}")
        if parts:
            vision_description = "\n".join(parts)

    allowed = get_allowed_values(category)
    if not allowed:
        return None

    prompt = build_tagger_prompt(category, allowed, vision_description)
    llm = ChatOpenAI(model=settings.OPENAI_MODEL, api_key=settings.OPENAI_API_KEY)
    messages = [
        SystemMessage(content=prompt),
        HumanMessage(content="Return the JSON object for the tags and confidence_scores."),
    ]

    last_error = None
    for attempt in range(3):
        try:
            response = await llm.ainvoke(messages)
            text = (response.content or "").strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            raw = json.loads(text)
            tags = raw.get("tags") or []
            confidence_scores = raw.get("confidence_scores") or {}
            if not tags:
                return {"category": category, "tags": [], "confidence_scores": {}}
            return {
                "category": category,
                "tags": tags,
                "confidence_scores": confidence_scores,
            }
        except Exception as e:
            last_error = e
            if attempt < 2:
                await asyncio.sleep(1 * (2**attempt))

    return {"category": category, "tags": [], "confidence_scores": {}}


async def tag_season(state: ImageTaggingState) -> dict[str, Any]:
    """Season tagger node. Appends one TagResult to partial_tags."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("season", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_theme(state: ImageTaggingState) -> dict[str, Any]:
    """Theme tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("theme", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_objects(state: ImageTaggingState) -> dict[str, Any]:
    """Objects & subjects tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("objects", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_colors(state: ImageTaggingState) -> dict[str, Any]:
    """Dominant colors tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("dominant_colors", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_design(state: ImageTaggingState) -> dict[str, Any]:
    """Design elements tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("design_elements", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_occasion(state: ImageTaggingState) -> dict[str, Any]:
    """Occasion / use case tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("occasion", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_mood(state: ImageTaggingState) -> dict[str, Any]:
    """Mood / tone tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("mood", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}


async def tag_product(state: ImageTaggingState) -> dict[str, Any]:
    """Product type tagger node."""
    if state.get("error"):
        return {"partial_tags": []}
    result = await _run_tagger("product_type", state)
    if result is None:
        return {"partial_tags": []}
    return {"partial_tags": [result]}
