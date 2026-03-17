# 03 — State and Schemas

State is the data that flows through the graph; schemas define its shape.

## ImageTaggingState

The **state** is a TypedDict (or dict) that every node reads and returns updates for. It holds: image_id, image_url, image_base64, metadata, vision_description, vision_raw_tags, partial_tags (list of TagResult per category), validated_tags, flagged_tags, tag_record, needs_review, processing_status, error. Nodes return a dict of keys to merge into state (reducers combine partial_tags).

## Key schemas

- **TagResult** — One category’s output: category, tags (list), confidence_scores (dict). Produced by each tagger node; collected in **partial_tags**.
- **TagRecord** — Final aggregated record: season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type, needs_review, processed_at. Built by the tag_aggregator from validated_tags.
- **Taxonomy** — Allowed tag values per category; defined in **`src/image_tagging/taxonomy.py`** (SEASON, THEME, OBJECTS_CATEGORIES, etc.).

## Where they live

- **`src/image_tagging/schemas/`** — TypedDict/Pydantic definitions (states, tags, TagRecord, ValidatedTag, FlaggedTag, etc.).
- **`src/image_tagging/taxonomy.py`** — Single source of truth for allowed values (flat and hierarchical).

Next: [04-vision-and-preprocessing.md](04-vision-and-preprocessing.md)
