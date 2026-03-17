# Database

Supabase (PostgreSQL) schema and client usage.

## Table: image_tags

| Column | Type | Description |
|--------|------|-------------|
| image_id | UUID / TEXT | Primary key. |
| tag_record | JSONB | Full TagRecord (season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type, needs_review, processed_at). |
| search_index | TEXT[] | Flat list of tag strings for GIN array search. |
| needs_review | BOOLEAN | True when ≥3 flagged in one category. |
| processing_status | TEXT | e.g. complete, needs_review. |
| image_url | TEXT | Optional URL/path for thumbnails. |
| created_at | TIMESTAMPTZ | Set on insert. |
| updated_at | TIMESTAMPTZ | Set on insert/update. |

**Indexes:** GIN on search_index for `search_index && $tags`. Optionally GIN on tag_record for JSONB filter queries.

## Client functions

In **`src/services/supabase/client.py`**:

- **build_search_index(tag_record)** — Builds flat string array from TagRecord for search_index.
- **upsert_tag_record(...)** — Insert or update one row.
- **get_tag_record(image_id)** — Fetch one row.
- **list_tag_images(limit, offset)** — Recent rows for history.
- **search_images_filtered(filters, limit, offset)** — Filter by category values (JSONB conditions); returns list of rows.
- **get_available_filter_values(filters)** — Distinct tag values in matching rows (cascading filters).

## Connection

**DATABASE_URL** (or **DATABASE_URI**) in .env. When unset, Supabase is disabled: no write, GET tag-image/tag-images return 503 or empty.
