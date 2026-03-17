# Learning Curriculum

Structured lessons for a **fresh engineer** to learn the Image Tagging Agent: concepts first, then where they live in the code. Read in **numbered order** (01, 02, …).

## Lessons (reading order)

| # | Lesson | Description |
|---|--------|-------------|
| 01 | [01-project-overview.md](01-project-overview.md) | What the project does, high-level flow, tech stack. |
| 02 | [02-langgraph-basics.md](02-langgraph-basics.md) | LangGraph here: where the graph is built and invoked. |
| 03 | [03-state-and-schemas.md](03-state-and-schemas.md) | State and schemas: ImageTaggingState, partial_tags, TagResult, taxonomy. |
| 04 | [04-vision-and-preprocessing.md](04-vision-and-preprocessing.md) | Preprocessor and vision node (GPT-4o → JSON). |
| 05 | [05-taggers-and-taxonomy.md](05-taggers-and-taxonomy.md) | Taxonomy, tagger prompt, season tagger, API tagger results. |
| 06 | [06-api-and-server.md](06-api-and-server.md) | FastAPI: health, POST /api/analyze-image, state in/out. |
| 07 | [07-frontend-and-ui.md](07-frontend-and-ui.md) | Next.js dashboard: upload, API call, vision + tags + raw JSON. |
| 08 | [08-parallel-taggers-and-send-api.md](08-parallel-taggers-and-send-api.md) | Send API, fan_out_to_taggers, 8 taggers, TagResults grid. |
| 09 | [09-database-and-supabase.md](09-database-and-supabase.md) | TagRecords in Supabase, search_index, SaveToast, HistoryGrid. |
| 10 | [10-search-and-filters.md](10-search-and-filters.md) | Search page: taxonomy, available-filters, search-images, FilterDropdown, DetailModal. |
| 11 | [11-bulk-upload.md](11-bulk-upload.md) | Bulk upload API, BulkUploader, progress, history refetch. |

Read in order for best understanding. See [reports/PROGRESS.md](../reports/PROGRESS.md) and [plans/](../plans/README.md) for status and phase guides.
