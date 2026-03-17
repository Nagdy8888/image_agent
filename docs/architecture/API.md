# API

FastAPI endpoints.

| Method | Path | Description |
|--------|------|-------------|
| GET | /api/health | Returns `{"status":"ok"}`. |
| POST | /api/analyze-image | Body: multipart file. Returns vision_description, tags_by_category, validated_tags, flagged_tags, tag_record, saved_to_db, error. |
| GET | /api/tag-image/{image_id} | Returns stored row (tag_record, search_index, etc.). 404 if not found; 503 if DB not configured. |
| GET | /api/tag-images | Query: limit, offset. Returns `{ items: [ ... ] }` for history. |
| GET | /api/taxonomy | Returns full taxonomy (flat and hierarchical) for filter dropdowns. |
| GET | /api/search-images | Query: season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type (comma-separated), limit, offset. Returns `{ items: [ ... ] }`. |
| GET | /api/available-filters | Same query params as search-images. Returns `{ category: [ values ] }` for cascading filters. |
| POST | /api/bulk-upload | Body: multipart files (key "files"). Returns `{ batch_id, total, status }`. |
| GET | /api/bulk-status/{batch_id} | Returns `{ batch_id, total, completed, failed, status, results }`. |

**Base URL:** Backend runs on port 8000 by default. Frontend uses NEXT_PUBLIC_API_URL.
