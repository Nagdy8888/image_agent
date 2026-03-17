# Image Tagging Agent

AI-powered image tagging: upload images, get structured tags (season, theme, objects, colors, design, occasion, mood, product type), save to Supabase, and search with filters.

**Stack:** LangGraph (OpenAI GPT-4o vision) + FastAPI + Supabase + Next.js.

- **Backend:** Pipeline (preprocessor → vision → 8 parallel taggers → validator → confidence filter → aggregator); REST API for analyze, tag, save, search, bulk upload.
- **Frontend:** Dashboard (upload, results, save, history), Search page (filters, detail modal), Bulk uploader.

**Quick start:** See [docs/quickstart/README.md](docs/quickstart/README.md) for local and Docker setup.

| Folder | Purpose |
|--------|---------|
| [docs/](docs/README.md) | Curriculum, quickstart, architecture, reports, errors, plans. |
| [frontend/](frontend/README.md) | Next.js dashboard and search UI. |
| [src/](src/README.md) | Backend package (image_tagging, Supabase, server). |
| [tests/](tests/README.md) | Tests and notebooks. |
