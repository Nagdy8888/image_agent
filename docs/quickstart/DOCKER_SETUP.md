# Docker setup

Run the full stack with Docker Compose.

1. **Prerequisites:** Docker and Docker Compose. **.env** at project root with at least `OPENAI_API_KEY`.
2. **Build:** From project root: `docker-compose build`
3. **Run:** `docker-compose up` (or `docker-compose up -d`). Frontend: http://localhost:3000, Backend: http://localhost:8000.
4. **Logs:** `docker-compose logs -f` for all; `docker-compose logs -f backend` or `frontend` for one service.
5. **Stop:** `docker-compose down`

Ports and env are in `docker-compose.yml`; override with `.env` at project root.
