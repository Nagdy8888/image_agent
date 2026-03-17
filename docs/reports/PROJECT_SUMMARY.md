# Project Summary

**Problem:** Organize and search image libraries by structured tags (season, theme, objects, colors, design, occasion, mood, product type) without manual tagging.

**Solution:** An AI image-tagging agent (OpenAI GPT-4o + LangGraph) that analyzes images, runs eight parallel taggers against a fixed taxonomy, validates and confidence-filters tags, and stores results in Supabase. A dashboard supports single and bulk upload; a Search page lets users filter by any tag category.

**Outcome:** Phases 0–7 complete: full pipeline, Supabase persistence, search and filters, bulk upload. Images can be tagged at scale and discovered via the Search UI or API.
