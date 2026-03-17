# 06 — API and Server

The FastAPI server is the HTTP entry point: it receives uploads, builds state, invokes the graph, and optionally writes to Supabase.

## Endpoints

- **GET /api/health** — Returns `{"status":"ok"}`.
- **POST /api/analyze-image** — Accepts a file upload; builds initial_state (image_id, image_base64, etc.); runs **graph.ainvoke**; returns vision_description, tags_by_category, validated_tags, flagged_tags, tag_record, saved_to_db, error. When Supabase is enabled, it upserts the tag record after a successful run.
- **GET /api/tag-image/{id}**, **GET /api/tag-images** — Return stored records (when DB configured).
- **GET /api/taxonomy**, **GET /api/search-images**, **GET /api/available-filters** — Taxonomy and search (Phase 6).
- **POST /api/bulk-upload**, **GET /api/bulk-status/{batch_id}** — Bulk processing (Phase 7).

## Where it lives

**`src/server.py`** — Defines the app, CORS, routes, and the analyze handler that reads the file, creates image_id and image_url, builds state, calls the graph, and optionally upserts to Supabase. Static uploads may be served from `/uploads`.

Next: [07-frontend-and-ui.md](07-frontend-and-ui.md)
