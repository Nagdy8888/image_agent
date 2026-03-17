# Backend (src)

Python package for the image tagging agent: LangGraph pipeline, Supabase client, and FastAPI server.

| Area | Purpose |
|------|---------|
| `image_tagging_agent/` (or `image_tagging/`) | State/schemas, taxonomy, preprocessor, vision, taggers, validator, confidence_filter, aggregator, graph. |
| Supabase / DB | Client: build_search_index, upsert_tag_record, get_tag_record, list_tag_images, search_images_filtered, get_available_filter_values. |
| Server | FastAPI: health, analyze-image, tag-image, tag-images, taxonomy, search-images, available-filters, bulk-upload, bulk-status. |

Run: see [docs/quickstart/README.md](../docs/quickstart/README.md).
