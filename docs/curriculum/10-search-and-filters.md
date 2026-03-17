# 10 — Search and Filters

The Search page lets users filter stored images by the eight taxonomy categories; the backend serves taxonomy, available filter values, and filtered results.

## Backend

- **GET /api/taxonomy** — Returns the full taxonomy from **`src/image_tagging/taxonomy.py`** (flat and hierarchical) for building dropdowns.
- **GET /api/search-images** — Query params per category (and limit/offset); calls **search_images_filtered** in **`src/services/supabase/client.py`**; returns **{ items: [ ... ] }**.
- **GET /api/available-filters** — Returns which tag values still have results (optionally constrained by current filters) via **get_available_filter_values** for cascading UX.

## Frontend

The **Search** page (e.g. **`app/search/page.tsx`**) has a sidebar with "Filter by Tags", Active Filters pills, and eight **FilterDropdown** components (accordion, flat or hierarchical). Results appear in a grid; clicking a card opens **DetailModal** with the full tag record. **Navbar** links "Tag Image" (dashboard) and "Search".

Next: [11-bulk-upload.md](11-bulk-upload.md)
