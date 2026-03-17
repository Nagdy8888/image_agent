# 02 — LangGraph Basics

What LangGraph is in this project, where the graph is built, and how it is invoked.

## Role of LangGraph

**LangGraph** is used to run the image-tagging pipeline as a stateful graph: nodes (preprocessor, vision, taggers, validator, confidence filter, aggregator) run in sequence or parallel; state is updated at each step. The graph is compiled once and invoked per request with an initial state (image_id, image_base64, etc.).

## Where the graph is built

- **`src/image_tagging/graph_builder.py`** — Builds the graph: adds nodes (preprocess, vision, taggers, validator, confidence_filter, tag_aggregator), edges, and conditional routing (e.g. fan-out to eight taggers). Returns a compiled StateGraph.
- **`src/image_tagging/image_tagging.py`** — Imports the builder and exposes the compiled **graph** (and optionally the checkpointer). This is the entry point referenced by the server.

## How it is invoked

In **`src/server.py`**, for each analyze request the server builds **initial_state** (image_id, image_url, image_base64, metadata, empty vision/partial_tags, processing_status). It then runs **`await graph.ainvoke(initial_state)`** and uses the result (tag_record, validated_tags, flagged_tags, error, etc.) to respond and optionally write to Supabase.

Next: [03-state-and-schemas.md](03-state-and-schemas.md)
