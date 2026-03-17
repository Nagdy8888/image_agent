# Key Decisions

| Decision | Rationale |
|----------|-----------|
| LangGraph for pipeline | Clear state flow, conditional routing, parallel taggers (Send API) without custom orchestration. |
| Single taxonomy in code | `src/image_tagging/taxonomy.py` as source of truth; API and UI stay in sync. |
| Supabase (PostgreSQL) | Hosted Postgres with JSONB and GIN index on search_index for fast filtered search. |
| In-memory bulk queue | Phase 7 bulk processing uses in-process queue; sufficient for single-instance; can replace with job queue later. |
| FilterDropdown shows full taxonomy | Users can select any value; "available" filters only drive UX (opacity/tooltip). |
