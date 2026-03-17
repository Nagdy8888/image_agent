# Architecture

Technical reference for the Image Tagging Agent.

| Document | Description |
|----------|-------------|
| [OVERVIEW.md](OVERVIEW.md) | System architecture and high-level flow (mermaid). |
| [GRAPH_NODES.md](GRAPH_NODES.md) | LangGraph nodes: purpose, inputs, outputs; routing. |
| [DATABASE.md](DATABASE.md) | Supabase schema, image_tags, search_index, client functions. |
| [API.md](API.md) | FastAPI endpoints: routes, request/response. |

Current: Full pipeline (preprocess → vision → 8 taggers → validator → confidence → aggregator); Supabase write and filtered search; bulk upload. Frontend: dashboard + Search page.
