# Phase 7: Bulk Upload API, BulkUploader, Progress, History Refetch

## What This Phase Adds

- **API:** `POST /api/bulk-upload` (multiple files); `GET /api/bulk-status` (job id → status and progress).
- **Backend:** In-memory (or job) queue; process images through existing graph; write each to Supabase; update job status.
- **Frontend:** BulkUploader component (multi-file select, submit); progress bar or status text; on completion, refetch history (tag-images list).

## Prerequisites

- Phase 6 done (search, filters, dashboard). Phase 5 (Supabase save) in place.

## Files Changed

- `server.py`: POST bulk-upload (accept files, create job, return job_id); GET bulk-status (return status, progress, results).
- Backend: queue or background task to run graph + upsert per image; store job state (pending, running, completed, failed).
- Frontend: BulkUploader (input multiple, POST bulk-upload, poll GET bulk-status); progress UI; on done, refetch history list.

## Step-by-Step Setup

1. Define job storage (in-memory dict keyed by job_id); job state: pending, running, completed, error.
2. POST bulk-upload: save files temporarily or pass to worker; create job; return job_id. Worker runs graph for each image, upserts to Supabase, updates progress.
3. GET bulk-status?job_id=: return { status, progress (e.g. 3/10), results or error }.
4. Frontend: multi-file input, POST bulk-upload, poll bulk-status every 1–2 s; show progress; when completed, call GET tag-images and update HistoryGrid.

## How to Test

- Select 3+ images in BulkUploader; submit; progress updates; when done, history shows new rows. Reload; data persisted.

## Troubleshooting

- **Job not progressing:** Ensure worker or background task is actually running (asyncio task or thread).
- **Timeout on large batches:** Consider chunking or increasing client timeout; or process in background and poll longer.
