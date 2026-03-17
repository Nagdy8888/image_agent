# Feature Checklist

| Feature | Status | Notes |
|---------|--------|-------|
| Phase 0 Project skeleton | Done | Structure, config, Docker |
| Phase 1 Vision analysis | Done | Preprocessor, vision node, POST /api/analyze-image, dashboard UI |
| Phase 2 Season tagger | Done | TagResult, partial_tags, season_tagger, TagCategoryCard, TagChip |
| Phase 3 All 8 parallel taggers | Done | Send API, fan_out_to_taggers, tags_by_category, TagResults grid |
| Phase 4 Validation & confidence | Done | Validator, confidence_filter, aggregator, TagRecord, FlaggedTags |
| Phase 5 Supabase | Done | image_tags, upsert/list/get, SaveToast, HistoryGrid |
| Phase 6 Search page | Done | Taxonomy, search-images, available-filters, Navbar, FilterDropdown, DetailModal, Analyze New Image |
| Phase 7 Bulk upload | Done | POST bulk-upload, GET bulk-status, BulkUploader, progress, history refetch |
| Documentation & rules | Done | Curriculum, quickstart, architecture, reports, errors, plans; Cursor rules |
