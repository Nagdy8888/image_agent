# 08 — Parallel Taggers and Send API

All eight taggers run in parallel using LangGraph’s Send API; the graph fans out from vision to each tagger and then collects results.

## Send API and routing

After the vision node, the graph uses a **routing** node (e.g. **fan_out_to_taggers**) that returns multiple **Send** calls—one per tagger. Each tagger runs with the same state; their returned updates (TagResult per category) are merged into **partial_tags** by the reducer. This yields **tags_by_category** for all eight categories in one pass.

## Eight taggers

The tagger nodes (in **`src/image_tagging/nodes/`**) cover: season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type. Each reads vision output and taxonomy and produces a TagResult. The graph then routes to tag_validator → confidence_filter → tag_aggregator.

## Frontend

The dashboard’s **TagResults** grid renders eight **TagCategoryCard** components (one per category), each showing tags and optional confidence. Category names and accent colors can be defined in constants or config.

Next: [09-database-and-supabase.md](09-database-and-supabase.md)
