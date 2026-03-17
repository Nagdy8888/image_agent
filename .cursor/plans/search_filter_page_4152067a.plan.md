---
name: Search Filter Page
overview: Original plan for the Search page with filter-by-tags UI. Superseded by Phase 6 Corrected for cascading filters, sidebar layout, Navbar, and available-filters API.
todos:
  - id: sf-1
    content: "Backend: GET /api/taxonomy (static tag values for dropdowns)"
    status: completed
  - id: sf-2
    content: "Backend: search_by_tags or search_images_filtered for filtered results"
    status: completed
  - id: sf-3
    content: "Frontend: Search page with filter dropdowns (top row or sidebar)"
    status: completed
  - id: sf-4
    content: "Frontend: Results grid with thumbnail cards"
    status: completed
isProject: false
---

# Search Filter Page (Original)

This was the initial plan for adding a Search experience. The **Phase 6 Corrected** plan ([phase_6_corrected_e51160df.plan.md](phase_6_corrected_e51160df.plan.md)) refined it with:

- **Cascading filters** — `GET /api/available-filters` so options narrow as the user selects filters.
- **Sidebar layout** — 30% / 70% with accordion FilterDropdowns instead of a top row.
- **Navbar** — Reusable `Navbar.tsx` (Tag Image / Search) on both pages.
- **DetailModal** — Full image + all tags on card click.
- **Analyze New Image** — Dashboard reset without full refresh.
- **GIN index on tag_record** — For performant JSONB filter queries.
- **search_images_filtered()** — Per-category JSONB logic (flat, hierarchical list, hierarchical single).

## Original scope

- Expose taxonomy (season, theme, objects, colors, design, occasion, mood, product_type) for building filter UI.
- Allow filtering stored tag records by one or more tag values.
- Show results in a grid; each result shows thumbnail and key tags.

## Reference

See [phase_6_corrected_e51160df.plan.md](phase_6_corrected_e51160df.plan.md) for the full corrected implementation (backend endpoints, DB functions, frontend components, and docs).
