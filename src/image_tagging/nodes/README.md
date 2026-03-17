# nodes

Graph nodes for the image tagging pipeline.

| File | Purpose |
|------|---------|
| `preprocessor.py` | Validate, resize, metadata, base64 |
| `vision.py` | GPT-4o vision analysis |
| `taggers.py` | All 8 category tagger nodes (season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type) |
| `routing.py` | Fan-out to parallel taggers (returns list of Send for vision_analyzer → 8 taggers) |
| `validator.py` | Validate all tags against taxonomy; invalid → flagged_tags |
| `confidence.py` | Filter by CONFIDENCE_THRESHOLD; low → flagged_tags; sets needs_review if ≥3 per category |
| `aggregator.py` | Assemble TagRecord from validated_tags; set processing_status |
