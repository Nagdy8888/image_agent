# Docker setup

Run the full stack with Docker Compose.

1. **Prerequisites:** Docker and Docker Compose. **.env** at project root with at least `OPENAI_API_KEY`.
2. **Build:** From project root: `docker-compose build`
3. **Run:** `docker-compose up` (or `docker-compose up -d`). Frontend: http://localhost:3000, Backend: http://localhost:8000.
4. **Logs:** `docker-compose logs -f` for all; `docker-compose logs -f backend` or `frontend` for one service.
5. **Stop:** `docker-compose down`

Ports and env are in `docker-compose.yml`; override with `.env` at project root.

---

## Retrieve code from a running container

To copy the backend code **out of** a running container (e.g. if the image was built from another machine or you lost local source):

```bash
# Copy backend app and requirements to the host
docker cp image_agent-backend-1:/app/src ./src_from_container
docker cp image_agent-backend-1:/app/requirements.txt ./requirements_from_container.txt

# Optional: replace your local src/ with the container version
# (Windows PowerShell) copy into src, then remove __pycache__ under src
Copy-Item -Path .\src_from_container\* -Destination .\src\ -Recurse -Force
Get-ChildItem -Path .\src -Recurse -Directory -Filter "__pycache__" | Remove-Item -Recurse -Force
```

Use the container name from `docker ps` (e.g. `image_agent-backend-1`). Backend code in the image lives under `/app/src`; frontend under `/app` in the frontend container.
