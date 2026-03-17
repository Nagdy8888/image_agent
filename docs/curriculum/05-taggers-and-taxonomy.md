# 05 — Taggers and Taxonomy

Taxonomy defines allowed tag values; each tagger node produces a TagResult for one category.

## Taxonomy

**`src/image_tagging/taxonomy.py`** holds the single source of truth: SEASON, THEME, OBJECTS_CATEGORIES, COLORS_CATEGORIES, DESIGN, OCCASION, MOOD, PRODUCT_CATEGORIES. Flat categories are lists of strings; hierarchical ones are dicts of group name → list of values. The validator uses this to reject invalid tags.

## Tagger nodes

Each tagger (e.g. **`src/image_tagging/nodes/season_tagger.py`**) reads vision output and taxonomy, calls the LLM (or maps) to pick tags from the taxonomy, and returns a **TagResult** (category, tags, confidence_scores). Results are merged into state via the **partial_tags** reducer. The API maps partial_tags to **tags_by_category** and, for Phase 2, exposes **season_tags** and **season_confidence_scores**.

## API exposure

The server builds tags_by_category from result["partial_tags"] and returns it (and optionally season_tags/season_confidence_scores) in the analyze response so the frontend can render TagCategoryCard and TagChip per category.

Next: [06-api-and-server.md](06-api-and-server.md)
