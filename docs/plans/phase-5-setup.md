# Phase 5: Supabase, image_tags Table, SaveToast, HistoryGrid

## What This Phase Adds

- **Supabase:** PostgreSQL; `image_tags` table (id, image_url/path, tag_record JSONB, search_index, created_at, etc.).
- **Client:** `upsert_tag_record`, `get_tag_record`, `list_tag_images`; build search_index from tag_record for search.
- **API:** `GET /api/tag-image?image_id=...`, `GET /api/tag-images` (list); save flow that calls upsert after analyze.
- **UI:** SaveToast (success/error after save); HistoryGrid listing saved tag images (thumb + link or detail).

## Prerequisites

- Phase 4 done (TagRecord, aggregator). Supabase project created; URL and key in `.env`.

## Files Changed

- `sql/image_tags.sql` or migrations: create `image_tags` table, indexes (e.g. GIN on search_index).
- `src/supabase/` or `src/db/`: client with upsert, get, list, build_search_index.
- API: POST save (or analyze returns and frontend calls save); GET tag-image, GET tag-images.
- Frontend: SaveToast, HistoryGrid, load history from GET tag-images.

## Step-by-Step Setup

1. Create Supabase project; add `SUPABASE_URL`, `SUPABASE_SERVICE_KEY` to `.env`.
2. Run SQL: create `image_tags` (id, image_url, tag_record JSONB, search_index, created_at); GIN index on search_index.
3. Implement client: build_search_index(tag_record), upsert_tag_record, get_tag_record, list_tag_images.
4. Add API: save endpoint (upsert); GET tag-image by id; GET tag-images (list).
5. Frontend: after analyze, “Save” calls save API; show SaveToast; HistoryGrid fetches GET tag-images and displays list.

## How to Test

- Analyze image, click Save; toast shows success; HistoryGrid shows new row. Reload page; history persists.

## Troubleshooting

- **Upsert fails:** Check Supabase key has table write permission; confirm column types (JSONB, text).
- **search_index empty:** Ensure build_search_index is called before upsert and includes all searchable tag values.
