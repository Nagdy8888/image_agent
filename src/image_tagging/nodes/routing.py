"""Fan-out routing function that returns Send calls for parallel tagger execution."""

from langgraph.types import Send

from src.image_tagging.schemas.states import ImageTaggingState


TAGGER_NODES = [
    "season_tagger",
    "theme_tagger",
    "objects_tagger",
    "colors_tagger",
    "design_tagger",
    "occasion_tagger",
    "mood_tagger",
    "product_tagger",
]


def fan_out_to_taggers(state: ImageTaggingState) -> list[Send]:
    """Return one Send per tagger so all 8 run in parallel after vision_analyzer."""
    return [Send(node_name, state) for node_name in TAGGER_NODES]
