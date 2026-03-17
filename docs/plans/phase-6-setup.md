# Phase 6: Search Page, Navbar, Filters, DetailModal, Analyze New Image

## What This Phase Adds

- **API:** `GET /api/taxonomy`, `GET /api/search-images` (query with filters), `GET /api/available-filters` (cascading options).
- **Backend:** `search_images_filtered()`, `get_available_filter_values()` in Supabase client (per-category and hierarchical filters).
- **Frontend:** Navbar (Tag Image + Search links, active state); /search page with sidebar filters + results grid; FilterDropdown (accordion, chips); DetailModal (full image + all tags on card click); “Analyze New Image” reset on dashboard.

## Prerequisites

- Phase 5 done (image_tags, search_index, list_tag_images, Supabase client).

## Files Changed

- `src/supabase/client.py`: search_images_filtered(filters), get_available_filter_values(filters).
- `server.py`: GET /api/taxonomy, GET /api/search-images, GET /api/available-filters.
- Frontend: Navbar.tsx, FilterDropdown.tsx, types (TaxonomyResponse, AvailableFilters, SearchFilters); /search page; DetailModal.tsx; dashboard handleReset + “Analyze New Image” button.

## Step-by-Step Setup

1. Add GIN index on tag_record (or search_index) if not already; implement search_images_filtered (flat + hierarchical filters per DATABASE.md).
2. Implement get_available_filter_values(current_filters) to return only values present in matching rows.
3. Expose GET taxonomy, GET search-images (query params), GET available-filters (query params).
4. Frontend: Navbar with links; /search with sidebar (FilterDropdown per category) and results grid; on filter change, refetch search + available-filters.
5. DetailModal: on card click, show full image and full TagRecord. Dashboard: “Analyze New Image” clears state and resets upload.

## How to Test

- Open /search; select filters; results update; available options narrow. Click result; DetailModal shows. Dashboard “Analyze New Image” resets form.

## Troubleshooting

- **Zero results for valid filters:** Check filter key names and JSONB query (flat array vs hierarchical object) in search_images_filtered.
- **Available filters not narrowing:** Ensure get_available_filter_values is called with current filters and uses same query logic as search.
