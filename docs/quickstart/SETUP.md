# Local setup

Get running without Docker.

1. **Clone** the repo; open a shell at the project root.
2. **Backend:** `pip install -r requirements.txt`. Create **.env** with `OPENAI_API_KEY`. Optional: `DATABASE_URL`, `SUPABASE_ENABLED`, `OPENAI_MODEL`.
3. **Run backend:** From project root, `uvicorn src.server:app --reload --host 0.0.0.0 --port 8000` (or `python -m uvicorn src.server:app --reload`). Backend: http://localhost:8000.
4. **Frontend:** `cd frontend && npm install && npm run dev` (or from root if frontend is in a subfolder). Set `NEXT_PUBLIC_API_URL=http://localhost:8000` if needed.
5. **Verify:** http://localhost:8000/api/health → `{"status":"ok"}`; upload an image at http://localhost:3000.
