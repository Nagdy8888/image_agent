"""Builds the LangGraph StateGraph with all nodes and edges."""

from langgraph.graph import END, START, StateGraph

from src.image_tagging.schemas.states import ImageTaggingState
from src.image_tagging.nodes.preprocessor import preprocess_image
from src.image_tagging.nodes.vision import analyze_image
from src.image_tagging.nodes.taggers import (
    tag_season,
    tag_theme,
    tag_objects,
    tag_colors,
    tag_design,
    tag_occasion,
    tag_mood,
    tag_product,
)
from src.image_tagging.nodes.routing import fan_out_to_taggers
from src.image_tagging.nodes.validator import tag_validator
from src.image_tagging.nodes.confidence import confidence_filter
from src.image_tagging.nodes.aggregator import tag_aggregator

EXPECTED_TAGGERS = 8


def route_after_validator(state: ImageTaggingState) -> str:
    """Only proceed to confidence_filter when all 8 taggers have run."""
    partial = state.get("partial_tags") or []
    return "confidence_filter" if len(partial) >= EXPECTED_TAGGERS else END


def build_graph():
    builder = StateGraph(ImageTaggingState)
    builder.add_node("image_preprocessor", preprocess_image)
    builder.add_node("vision_analyzer", analyze_image)
    builder.add_node("season_tagger", tag_season)
    builder.add_node("theme_tagger", tag_theme)
    builder.add_node("objects_tagger", tag_objects)
    builder.add_node("colors_tagger", tag_colors)
    builder.add_node("design_tagger", tag_design)
    builder.add_node("occasion_tagger", tag_occasion)
    builder.add_node("mood_tagger", tag_mood)
    builder.add_node("product_tagger", tag_product)
    builder.add_node("tag_validator", tag_validator)
    builder.add_node("confidence_filter", confidence_filter)
    builder.add_node("tag_aggregator", tag_aggregator)

    builder.add_edge(START, "image_preprocessor")
    builder.add_edge("image_preprocessor", "vision_analyzer")
    builder.add_conditional_edges("vision_analyzer", fan_out_to_taggers)

    for node in [
        "season_tagger", "theme_tagger", "objects_tagger", "colors_tagger",
        "design_tagger", "occasion_tagger", "mood_tagger", "product_tagger",
    ]:
        builder.add_edge(node, "tag_validator")

    builder.add_conditional_edges("tag_validator", route_after_validator)
    builder.add_edge("confidence_filter", "tag_aggregator")
    builder.add_edge("tag_aggregator", END)

    return builder.compile()
