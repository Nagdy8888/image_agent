# 09 — Database and Supabase

Tag records are persisted to PostgreSQL (Supabase) after a successful run; the frontend shows a save toast and a history grid.

## When the write happens

The write is **not** inside the graph. In **`src/server.py`**, after **graph.ainvoke**, the server checks for **tag_record** and no **error**. If **SUPABASE_ENABLED** (DATABASE_URL set), it builds **search_index** from the tag record and calls **upsert_tag_record** (image_id, tag_record, search_index, needs_review, processing_status, image_url). The response includes **saved_to_db: true** when the write succeeds.

## Client and table

- **`src/services/supabase/client.py`** — **build_search_index(tag_record)** flattens tags for array search; **upsert_tag_record**, **get_tag_record**, **list_tag_images**, **search_images_filtered**, **get_available_filter_values**.
- **image_tags** table — image_id (PK), tag_record (JSONB), search_index (TEXT[]), needs_review, processing_status, image_url, created_at, updated_at. GIN index on search_index (and optionally tag_record) for fast filter queries.

## Frontend

When the response has **saved_to_db: true**, **SaveToast** is shown. **HistoryGrid** fetches **GET /api/tag-images** and displays thumbnails and top tags; it refetches when a new image is saved.

Next: [10-search-and-filters.md](10-search-and-filters.md)
