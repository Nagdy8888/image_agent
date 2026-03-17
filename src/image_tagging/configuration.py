"""Runtime configuration for thresholds, model names, and limits."""

# Model used for taggers (can override via settings.OPENAI_MODEL)
DEFAULT_TAGGER_MODEL = "gpt-4o"

# Max number of dominant colors to return from colors_tagger
MAX_DOMINANT_COLORS = 5

# Max number of objects to return from objects_tagger
MAX_OBJECTS = 10

# Confidence threshold: tags below this are flagged (0.0–1.0)
CONFIDENCE_THRESHOLD = 0.65

# If this many or more tags are flagged in a single category, set needs_review
FLAGGED_PER_CATEGORY_THRESHOLD = 3
