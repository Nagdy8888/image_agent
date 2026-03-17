# 01 — Project Overview

What the project does, how data flows, and what stack it uses.

## What the project does

The **Image Tagging Agent** analyzes images and assigns structured tags in eight categories (season, theme, objects, dominant colors, design elements, occasion, mood, product type). A **LangGraph** pipeline runs preprocess → vision (GPT-4o) → eight parallel taggers → validator → confidence filter → aggregator. Results can be stored in **Supabase** and searched via a **Search** page. The **frontend** (Next.js) provides upload (single and bulk), tag results, and filtered search.

## High-level flow

1. User uploads an image (dashboard or bulk).
2. Request hits the backend; the graph runs and produces a **TagRecord**.
3. Optional: TagRecord is written to Supabase (image_tags table).
4. Frontend shows tags, flagged items, and "Saved to database" when applicable. Users can open the Search page to filter stored images by tags.

## Tech stack

- **Backend:** Python, FastAPI, LangGraph, OpenAI GPT-4o. Agent lives under `src/image_tagging/`; Supabase client in `src/services/supabase/`.
- **Frontend:** Next.js (App Router), React, TypeScript. Dashboard and Search pages; components in `components/` (or `frontend/components/` if using a frontend subfolder).
- **Database:** Supabase (PostgreSQL); table `image_tags` with tag_record (JSONB) and search_index (array).

## Where to look

- Entry: `src/server.py` (FastAPI), `src/image_tagging/image_tagging.py` (compiled graph).
- Pipeline: `src/image_tagging/graph_builder.py`, `src/image_tagging/nodes/`.
- Taxonomy: `src/image_tagging/taxonomy.py`.

Next: [02-langgraph-basics.md](02-langgraph-basics.md)
