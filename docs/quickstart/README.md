# Quickstart

Get the Image Tagging Agent running quickly.

## Contents

| File | Description |
|------|-------------|
| [README.md](README.md) | This index |
| [SETUP.md](SETUP.md) | Clone, install, .env, run locally |
| [DOCKER_SETUP.md](DOCKER_SETUP.md) | Build, run, compose, logs |

## Prerequisites

- **Python 3.11+** (backend), **Node.js 18+** (frontend), or **Docker Compose** for full stack.
- **.env** at project root: `OPENAI_API_KEY` (required). Optional: `DATABASE_URL` for Supabase.

## Run with Docker

```bash
docker-compose build
docker-compose up
```

- Frontend: http://localhost:3000  
- Backend: http://localhost:8000  
- Health: http://localhost:8000/api/health

## Run locally

See [SETUP.md](SETUP.md) for backend and frontend commands.
