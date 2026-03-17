---
name: Image Tagging Detailed (Master Plan)
overview: Master plan for the full image tagging pipeline and search experience — backend graph, Supabase, API, frontend dashboard and search page with cascading filters.
todos:
  - id: det-1
    content: "Phase 0–4: Graph (preprocess, vision, 8 taggers, validator, confidence, aggregator)"
    status: completed
  - id: det-2
    content: "Phase 5: Supabase image_tags, search_index, upsert/list/get, SaveToast, HistoryGrid"
    status: completed
  - id: det-3
    content: "Phase 5.2–5.8: Taxonomy API, search_images_filtered, available-filters, Navbar, Search page, DetailModal"
    status: completed
  - id: det-4
    content: "Phase 7: Bulk upload API and BulkUploader"
    status: completed
isProject: false
---

# Image Tagging Agent — Detailed Master Plan

Single reference for the full system: LangGraph pipeline, Supabase persistence, API surface, and frontend (dashboard + search).

---

## Phase 0: Project skeleton

- Repo structure, `src/image_tagging/`, FastAPI server, Next.js app, Docker.
- Config, settings, empty nodes/schemas/prompts.

## Phase 1: Vision analysis

- **Preprocessor node** — validate image, resize, base64, metadata.
- **Vision node** — GPT-4o vision → JSON (visual_description, seasonal_indicators, etc.).
- **Graph:** preprocess → vision → END.
- **API:** `POST /api/analyze-image` (file upload → state → graph.ainvoke).
- **Frontend:** Upload, processing overlay, vision description, confidence ring, raw tags, raw JSON.

## Phase 2: Season tagger

- **Taxonomy** — `taxonomy.py` (SEASON, THEME, …).
- **TagResult** / **partial_tags** reducer in state.
- **season_tagger node** — prompt + taxonomy → tags + confidence_scores.
- **Graph:** preprocess → vision → season_tagger → END.
- **API:** response includes `season_tags`, `season_confidence_scores`.
- **Frontend:** TagCategoryCard + TagChip for Season.

## Phase 3: All 8 parallel taggers

- **Send API** — fan_out_to_taggers routing.
- **8 tagger nodes** — season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type.
- **Graph:** preprocess → vision → [8 taggers] → END.
- **API:** `tags_by_category` (all 8).
- **Frontend:** TagResults grid with 8 TagCategoryCards.

## Phase 4: Validation and confidence

- **tag_validator** — taxonomy check; invalid → flagged_tags.
- **confidence_filter** — threshold; low → flagged_tags; ≥3 flagged in one category → needs_review.
- **tag_aggregator** — build **TagRecord** (season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type, needs_review, processed_at).
- **Graph:** [8 taggers] → tag_validator → confidence_filter → tag_aggregator → END.
- **API:** validated_tags, flagged_tags, tag_record.
- **Frontend:** FlaggedTags panel, ProcessingOverlay step 4.

## Phase 5: Supabase integration

- **DB:** image_tags table (image_id, tag_record JSONB, search_index TEXT[], needs_review, processing_status, image_url, created_at, updated_at). GIN on search_index.
- **Client:** build_search_index(tag_record), upsert_tag_record(), get_tag_record(), list_tag_images(), search_by_tags().
- **Server:** after graph.ainvoke, if tag_record and SUPABASE_ENABLED → upsert; response saved_to_db.
- **API:** GET /api/tag-image/{id}, GET /api/tag-images.
- **Frontend:** SaveToast, HistoryGrid (tagged images).

### Phase 5.2–5.8: Search and filters (see Phase 6 Corrected)

- **5.2** GIN index on tag_record for JSONB queries.
- **5.3** search_images_filtered(filters, limit, offset) — flat + hierarchical JSONB conditions, AND across categories.
- **5.4** get_available_filter_values(filters) — cascading: distinct tag values from matching rows.
- **5.5** GET /api/taxonomy, GET /api/search-images, GET /api/available-filters.
- **5.6** Taxonomy + SearchFilters types (TaxonomyResponse, AvailableFilters).
- **5.7** Navbar.tsx (Tag Image / Search), shared on both pages.
- **5.8** Search page: sidebar (30%) with Active Filters + 8 accordion FilterDropdowns; results grid (70%); DetailModal on card click; cascading filter behavior.

## Phase 6: Search page + dashboard reset (corrected)

Fully specified in [phase_6_corrected_e51160df.plan.md](phase_6_corrected_e51160df.plan.md): backend endpoints and DB functions, Navbar, FilterDropdown, DetailModal, /search page layout, handleReset and "Analyze New Image" on dashboard.

## Phase 7: Bulk upload

- **API:** POST /api/bulk-upload (multi-file), GET /api/bulk-status/{batch_id}.
- **Backend:** in-memory batch queue, background task runs full pipeline per image, upsert to Supabase.
- **Frontend:** BulkUploader (drop zone, preview grid, Start Bulk Analysis, progress bar, per-thumbnail status, View in Search / Clear). History refetch on bulk complete.

---

## Key files


| Area          | Files                                                                      |
| ------------- | -------------------------------------------------------------------------- |
| Graph         | src/image_tagging/graph_builder.py, image_tagging.py, nodes/*.py           |
| Taxonomy      | src/image_tagging/taxonomy.py                                              |
| State/schemas | src/image_tagging/schemas/*.py                                             |
| DB            | src/services/supabase/client.py, settings.py; sql/image_tags.sql           |
| API           | src/server.py                                                              |
| Frontend      | frontend/app/page.tsx, app/search/page.tsx; components/*.tsx; lib/types.ts |


