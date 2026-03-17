---
name: Image Tagging Phased (0–7)
overview: Phased rollout of the image tagging agent — skeleton, vision, taggers, validation, Supabase, search page, bulk upload. Each phase has a docs/plans/phase-N-setup.md guide.
todos:
  - id: ph-0
    content: "Phase 0: Project skeleton, Docker, config"
    status: completed
  - id: ph-1
    content: "Phase 1: Vision + preprocessor, POST /api/analyze-image, dashboard UI"
    status: completed
  - id: ph-2
    content: "Phase 2: Season tagger, partial_tags, TagCategoryCard"
    status: completed
  - id: ph-3
    content: "Phase 3: All 8 parallel taggers (Send API), TagResults grid"
    status: completed
  - id: ph-4
    content: "Phase 4: Validator, confidence_filter, aggregator, TagRecord, FlaggedTags"
    status: completed
  - id: ph-5
    content: "Phase 5: Supabase, image_tags, SaveToast, HistoryGrid"
    status: completed
  - id: ph-6
    content: "Phase 6: Search page, Navbar, taxonomy/search/available-filters, DetailModal, Analyze New Image"
    status: completed
  - id: ph-7
    content: "Phase 7: Bulk upload API + BulkUploader, progress, history refetch"
    status: completed
isProject: false
---

# Image Tagging — Phased Implementation (0–7)

High-level phase list. For detailed steps and file lists, see the **detailed master plan** ([image_tagging_detailed_d655d914.plan.md](image_tagging_detailed_d655d914.plan.md)) and **Phase 6 Corrected** ([phase_6_corrected_e51160df.plan.md](phase_6_corrected_e51160df.plan.md)).


| Phase | Title                   | Deliverables                                                                                                       |
| ----- | ----------------------- | ------------------------------------------------------------------------------------------------------------------ |
| 0     | Project skeleton        | Structure, Docker, config, empty modules                                                                           |
| 1     | Vision analysis         | Preprocessor, vision node, graph, POST /api/analyze-image, dashboard (upload, overlay, vision, raw JSON)           |
| 2     | Season tagger           | Taxonomy, TagResult, partial_tags, season_tagger node, API season_tags, TagCategoryCard + TagChip                  |
| 3     | All 8 taggers           | Send API, fan_out_to_taggers, 8 tagger nodes, tags_by_category, TagResults grid (8 cards)                          |
| 4     | Validation & confidence | tag_validator, confidence_filter, tag_aggregator, TagRecord, flagged_tags, needs_review, FlaggedTags UI            |
| 5     | Supabase                | image_tags table, search_index, upsert/list/get, GET tag-image/tag-images, SaveToast, HistoryGrid                  |
| 6     | Search page + reset     | GET taxonomy/search-images/available-filters, Navbar, FilterDropdown, /search page, DetailModal, Analyze New Image |
| 7     | Bulk upload             | POST bulk-upload, GET bulk-status, BulkUploader, progress bar, history refetch                                     |


## Setup guides

Each phase has a setup guide in **docs/plans/**:

- [phase-0-setup.md](docs/plans/phase-0-setup.md) … [phase-7-setup.md](docs/plans/phase-7-setup.md) (paths from project root)

Guides include: What this phase adds, prerequisites, files changed, step-by-step setup, how to test, troubleshooting.

## Progress

Track status in **docs/reports/PROGRESS.md** (mermaid diagram) and **docs/reports/FEATURES.md** (checklist).