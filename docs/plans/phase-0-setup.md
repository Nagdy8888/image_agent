# Phase 0: Project Skeleton

## What This Phase Adds

- Project structure (backend `src/`, frontend, tests).
- Docker setup for backend (and optionally frontend).
- Config (e.g. env, logging) and empty modules so the app runs.

## Prerequisites

- Python 3.11+, Node.js, Docker (optional).
- Repo cloned.

## Files Changed

- Root: `Dockerfile`, `docker-compose.yml`, `pyproject.toml` or `requirements.txt`, `.env.example`, `README.md`.
- `src/`: package layout, `__init__.py`, minimal `main.py` or FastAPI app entry.
- `frontend/`: existing or scaffold (Vite/React).
- `tests/`: placeholder or minimal test.

## Step-by-Step Setup

1. Clone the repo and `cd image_agent`.
2. Copy `.env.example` to `.env` and set `OPENAI_API_KEY` (and any other keys).
3. Backend: `pip install -r requirements.txt` (or `uv sync`), run `python -m src.main` or `uvicorn` as in README.
4. Frontend: `cd frontend && npm install && npm run dev`.
5. Optional: `docker compose up --build` to run backend in Docker.

## How to Test

- Backend health endpoint returns 200 (e.g. `GET /health` or `/`).
- Frontend loads at `http://localhost:5173` (or configured port).

## Troubleshooting

- **Port in use:** Change backend/frontend port in config or docker-compose.
- **Module not found:** Ensure you run from project root and `src` is on `PYTHONPATH` or install the package in editable mode.
