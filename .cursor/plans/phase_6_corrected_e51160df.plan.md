---
name: Phase 6 Corrected
overview: Corrected Phase 6 plan that aligns the search_filter_page plan with the detailed master plan, fixes API design, adds cascading filters, uses sidebar layout, creates proper Navbar, and adds the "Analyze New Image" reset button.
todos:
  - id: p6-1
    content: "Backend: Add GIN index on tag_record to sql/image_tags.sql"
    status: completed
  - id: p6-2
    content: "Backend: search_images_filtered() + get_available_filter_values() in supabase/client.py"
    status: completed
  - id: p6-3
    content: "Backend: GET /api/taxonomy, GET /api/search-images, GET /api/available-filters endpoints in server.py"
    status: completed
  - id: p6-4
    content: "Frontend: Navbar.tsx component (Tag Image + Search links, active underline)"
    status: completed
  - id: p6-5
    content: "Frontend: FilterDropdown.tsx (accordion, flat chips + hierarchical parent/child)"
    status: completed
  - id: p6-6
    content: "Frontend: types.ts (TaxonomyResponse, AvailableFilters, SearchFilters)"
    status: completed
  - id: p6-7
    content: "Frontend: /search page (sidebar filters + results grid + cascading behavior)"
    status: completed
  - id: p6-8
    content: "Frontend: DetailModal.tsx (full image + all tags on card click)"
    status: completed
  - id: p6-9
    content: "Dashboard: handleReset + Analyze New Image button in page.tsx + ImageUploader onReset prop"
    status: completed
  - id: p6-10
    content: "Docs: phase-6-setup.md, PROGRESS.md, CHANGELOG.md"
    status: completed
isProject: false
---

# Phase 6: Search Page + Dashboard Reset (Corrected)

## Issues Found in the search_filter_page Plan

After cross-referencing with the [detailed master plan](c:\Nagdy\Mustafa\MIS\image_agent.cursor\plans\image_tagging_detailed_d655d914.plan.md) (Phase 5, Steps 5.2-5.8), the following issues must be fixed:

### Issue 1: Missing cascading filter behavior (critical)

The current plan uses a static `GET /api/taxonomy` endpoint. The detailed plan specifies a **dynamic** `GET /api/available-filters` endpoint that narrows available options as filters are selected. Without this, users can select filter combinations that return zero results — bad UX. The user specifically asked for "lowering in the level" which implies cascading.

**Fix:** Keep `GET /api/taxonomy` for initial dropdown population (it's fast and static). Add `GET /api/available-filters` that accepts current filters and returns only tag values that exist in the matching result set. On every filter change, call both the search endpoint AND available-filters to narrow the dropdowns.

### Issue 2: Missing `search_by_filters()` function

The current `client.py` only has `search_by_tags()` which does flat GIN array overlap — it cannot filter per-category. The plan mentions `search_images_filtered()` but needs the full implementation spec.

**Fix:** The new `search_images_filtered()` must handle three JSONB query patterns based on the actual [TagRecord schema](c:\Nagdy\Mustafa\MIS\image_agent\frontend\lib\types.ts) (lines 76-88):

- **Flat categories** (season, theme, design_elements, occasion, mood) — stored as JSONB string arrays:

```sql
  tag_record->'season' ?| array['christmas','easter']
  

```

- **Hierarchical list categories** (objects, dominant_colors) — stored as JSONB arrays of `{parent, child}` objects:

```sql
  EXISTS (SELECT 1 FROM jsonb_array_elements(tag_record->'objects') e
          WHERE e->>'parent' IN (...) OR e->>'child' IN (...))
  

```

- **Hierarchical single categories** (product_type) — stored as single `{parent, child}` object:

```sql
  (tag_record->'product_type'->>'parent' IN (...) OR tag_record->'product_type'->>'child' IN (...))
  

```

All category conditions are ANDed. Within a single category, values are ORed.

### Issue 3: Missing `get_available_filter_values()` function

Not present in `client.py` at all. This powers cascading drill-down.

**Fix:** Add `get_available_filter_values(filters)` to [client.py](c:\Nagdy\Mustafa\MIS\image_agent\src\services\supabase\client.py). If filters is empty/None, aggregate all distinct tag values from all records. If filters are provided, first filter records using `search_images_filtered`, then aggregate tag values from only the matching rows. Returns `dict[str, list[str]]`.

### Issue 4: No `Navbar.tsx` component

The plan says "add nav links" inline but the detailed plan (Step 5.7) specifies a proper reusable `Navbar.tsx` component.

**Fix:** Create `frontend/components/Navbar.tsx` — slim dark bar, "Tag Image" link (href="/") and "Search" link (href="/search"), active route gets blue underline. Use Next.js `Link` + `usePathname()`. Render in both pages.

### Issue 5: Frontend layout mismatch

The plan has filters as a top-row grid of dropdowns. The detailed plan (Step 5.8) uses a **sidebar layout** (30% / 70%) with accordion sections — far better for 8 categories.

**Fix:** Use sidebar layout with 8 accordion sections (collapsible). Active Filters summary bar at top of sidebar showing selected tags as removable pills + "Clear All" button. On mobile, sidebar becomes a slide-in drawer.

### Issue 6: No detail modal for search results

The plan doesn't specify what happens on card click. The detailed plan specifies a modal.

**Fix:** Clicking a result card opens a detail modal showing full-size image + all tag categories. Modal closes on overlay click or X button.

### Issue 7: Missing GIN index on `tag_record`

The current [image_tags.sql](c:\Nagdy\Mustafa\MIS\image_agent\sql\image_tags.sql) only indexes `search_index`. JSONB queries on `tag_record` will be slow without an index.

**Fix:** Add a GIN index on `tag_record`:

```sql
CREATE INDEX IF NOT EXISTS idx_image_tags_tag_record ON image_tags USING GIN (tag_record);
```

### Issue 8: `GET /api/taxonomy` must include hierarchical structure

The current plan's taxonomy response shape is correct but the implementation needs to read from [taxonomy.py](c:\Nagdy\Mustafa\MIS\image_agent\src\image_tagging\taxonomy.py) constants — specifically `OBJECTS_CATEGORIES`, `COLORS_CATEGORIES`, and `PRODUCT_CATEGORIES` for hierarchical groups.

---

## Corrected Implementation Plan

### Backend: 3 new endpoints + 2 new DB functions

**File: [src/services/supabase/client.py](c:\Nagdy\Mustafa\MIS\image_agent\src\services\supabase\client.py)**

Add two functions:

- `search_images_filtered(filters: dict, limit: int, offset: int)` — dynamic SQL with the three JSONB query patterns above, returns `list[dict]`
- `get_available_filter_values(filters: dict | None)` — if filters empty, query ALL rows; if filters provided, query matching rows. Aggregate distinct tag values per category from the `tag_record` JSONB. Returns `dict[str, list[str]]`

**File: [src/server.py](c:\Nagdy\Mustafa\MIS\image_agent\src\server.py)**

Add three endpoints:

- `GET /api/taxonomy` — reads from `taxonomy.py` constants (`SEASON`, `THEME`, `OBJECTS_CATEGORIES`, `COLORS_CATEGORIES`, `DESIGN`, `OCCASION`, `MOOD`, `PRODUCT_CATEGORIES`), returns `{ category: { type: "flat"|"hierarchical", values?: [...], groups?: {...} } }`
- `GET /api/search-images` — query params: `season`, `theme`, `objects`, `dominant_colors`, `design_elements`, `occasion`, `mood`, `product_type` (comma-separated), plus `limit`, `offset`. Calls `search_images_filtered()`
- `GET /api/available-filters` — same query params as search-images. Calls `get_available_filter_values()`. Returns `{ season: ["christmas", ...], theme: [...], ... }`

**File: [sql/image_tags.sql](c:\Nagdy\Mustafa\MIS\image_agent\sql\image_tags.sql)**

Add: `CREATE INDEX IF NOT EXISTS idx_image_tags_tag_record ON image_tags USING GIN (tag_record);`

### Frontend: Navbar, Search page, FilterDropdown, DetailModal, Reset button

**File: `frontend/components/Navbar.tsx` (new)**

- Slim horizontal bar, dark background
- "Tag Image" (href="/") and "Search" (href="/search")
- Active route: blue underline. Inactive: muted text
- Rendered in both `page.tsx` and `search/page.tsx`

**File: `frontend/components/FilterDropdown.tsx` (new)**

- Accordion-style component. Props: `category`, `type` ("flat" | "hierarchical"), `values`/`groups`, `availableValues`, `selectedValues`, `onToggle`
- Flat: list of clickable chips, only shows values in `availableValues`
- Hierarchical: parent sub-headers, child chips underneath. Only shows parents with available children
- Selected chips are filled/highlighted with an "x" to deselect

**File: `frontend/components/DetailModal.tsx` (new)**

- Full-size image + all 8 tag categories displayed as TagCategoryCards
- Framer Motion open/close animation
- Close on overlay click or X button

**File: `frontend/app/search/page.tsx` (new)**

- Two-column layout: sidebar (30%) + results (70%)
- Sidebar: "Filter by Tags" heading, Active Filters bar (pills + "Clear All"), 8 accordion FilterDropdowns
- Results: "Showing X results" count, responsive grid of cards (image thumbnail at top, image_id, status badge, top 5 tag pills)
- On page load: fetch `GET /api/taxonomy` once + `GET /api/available-filters` (no filters) + `GET /api/search-images` (no filters = all)
- On filter change: fetch `GET /api/search-images` + `GET /api/available-filters` with current filters
- Card click opens DetailModal
- Mobile: sidebar becomes drawer

**File: [frontend/app/page.tsx](c:\Nagdy\Mustafa\MIS\image_agent\frontend\app\page.tsx)**

- Add `Navbar` at top
- Add `handleReset()`: revokes preview URL, sets `file`, `previewUrl`, `result`, `metadata` to null
- State variables to reset (verified from lines 21-26): `file`, `previewUrl`, `result`, `metadata`

**File: [frontend/components/ImageUploader.tsx](c:\Nagdy\Mustafa\MIS\image_agent\frontend\components\ImageUploader.tsx)**

- Add optional `onReset` prop
- When `previewUrl` is shown (lines 57-86), render an "Analyze New Image" button below the preview metadata pills

**File: [frontend/lib/types.ts](c:\Nagdy\Mustafa\MIS\image_agent\frontend\lib\types.ts)**

- Add `TaxonomyCategory` type: `{ type: "flat"; values: string[] } | { type: "hierarchical"; groups: Record<string, string[]> }`
- Add `TaxonomyResponse`: `Record<string, TaxonomyCategory>`
- Add `AvailableFilters`: `Record<string, string[]>`
- Add `SearchFilters`: `Record<string, string[]>`

### Docs

- `docs/plans/phase-6-setup.md` — setup guide
- Update `docs/reports/PROGRESS.md` — Phase 6 done
- Update `CHANGELOG.md` — Phase 6 entry

## Files to create or change

- `src/services/supabase/client.py` — add `search_images_filtered()`, `get_available_filter_values()`
- `src/server.py` — add 3 endpoints: `/api/taxonomy`, `/api/search-images`, `/api/available-filters`
- `sql/image_tags.sql` — add GIN index on `tag_record`
- `frontend/components/Navbar.tsx` — new shared navigation component
- `frontend/components/FilterDropdown.tsx` — new accordion filter component
- `frontend/components/DetailModal.tsx` — new result detail modal
- `frontend/app/search/page.tsx` — new search page
- `frontend/app/page.tsx` — add Navbar + handleReset + "Analyze New Image" button
- `frontend/components/ImageUploader.tsx` — add `onReset` prop + reset button
- `frontend/lib/types.ts` — add TaxonomyResponse, AvailableFilters, SearchFilters
- `docs/plans/phase-6-setup.md` — setup guide
- `docs/reports/PROGRESS.md` — update
- `CHANGELOG.md` — update

