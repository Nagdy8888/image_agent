# 11 — Bulk Upload

Multiple images can be uploaded and analyzed in one batch; the backend processes them sequentially and the frontend shows progress.

## Backend

- **POST /api/bulk-upload** — Accepts multiple files; creates a batch id; saves files and enqueues work; returns **{ batch_id, total, status }**. A background task processes each image through the full graph and upserts to Supabase.
- **GET /api/bulk-status/{batch_id}** — Returns **{ status, results, completed, failed }**; **results** is a list of { image_id, success, error?, ... }. The frontend uses **results.length** (or completed + failed) for progress.

## Frontend

**BulkUploader** (e.g. in **`components/BulkUploader.tsx`**) provides a multi-file drop zone, preview grid, and "Start Bulk Analysis". It POSTs to bulk-upload, then polls bulk-status until the batch is complete. Progress text and bar use the processed count; when done, **onBulkComplete** triggers a refetch of the history grid so new images appear in Tagged images and Search.

Next: See [reports/PROGRESS.md](../reports/PROGRESS.md) and [plans/](../plans/README.md) for further phases and status.
