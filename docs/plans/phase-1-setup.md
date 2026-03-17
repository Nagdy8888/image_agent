# Phase 1: Vision Analysis, Preprocessor, Graph, Dashboard UI

## What This Phase Adds

- **Preprocessor node:** Normalize image (e.g. resize, format) before vision.
- **Vision node:** Call OpenAI vision (GPT-4o) to get a text description of the image.
- **LangGraph:** Minimal graph: preprocessor → vision; state with image + description.
- **API:** `POST /api/analyze-image` (upload image, return vision result).
- **Dashboard UI:** Upload, overlay, display vision output and raw JSON.

## Prerequisites

- Phase 0 done (skeleton, Docker, config).
- `OPENAI_API_KEY` set in `.env`.

## Files Changed

- `src/image_tagging/`: state/schemas, preprocessor node, vision node, graph build.
- `src/main.py` or `server.py`: `POST /api/analyze-image` (multipart/form-data), call graph.
- `frontend/`: dashboard page, image upload component, result overlay (vision text + JSON).

## Step-by-Step Setup

1. Add state schema (e.g. image bytes/URL, vision_description).
2. Implement preprocessor node (resize/format); then vision node (OpenAI chat with image).
3. Build graph: start → preprocessor → vision → end.
4. Add FastAPI route: accept file upload, run graph, return `{ vision_description, ... }`.
5. Frontend: upload form, POST to `/api/analyze-image`, show description and raw response.

## How to Test

- Upload an image from the dashboard; response shows vision description.
- `curl -X POST -F "file=@image.jpg" http://localhost:8000/api/analyze-image` returns JSON with vision text.

## Troubleshooting

- **Vision timeout:** Increase client timeout; ensure image size is within API limits (preprocessor should resize).
- **CORS:** Enable CORS in FastAPI for the frontend origin.
