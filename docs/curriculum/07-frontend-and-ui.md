# 07 — Frontend and UI

The Next.js app provides the dashboard (upload, results) and integrates with the analyze API.

## Dashboard

The main page (e.g. **`app/page.tsx`** or **`frontend/app/page.tsx`**) has an upload area (ImageUploader), calls **POST /api/analyze-image** with the selected file, and shows a processing overlay (steps: Preprocessing, Vision Analysis, Tagging, Validating). When the response returns, it displays the vision description, a confidence ring, tag categories (TagCategoryCard + TagChip), FlaggedTags if any, and a raw JSON viewer. "Analyze New Image" resets state. Bulk Upload section allows multiple files and shows progress.

## Key components

- **ImageUploader** — File drop/select, preview, optional onReset and "Analyze New Image".
- **ProcessingOverlay** — Step indicators while the request is in flight.
- **TagCategoryCard / TagChip** — One card per category; chips for each tag (and optional confidence).
- **FlaggedTags** — List of flagged tags with category, value, confidence, reason.
- **SaveToast** — Shown when saved_to_db is true.
- **HistoryGrid** — Fetches GET /api/tag-images and shows previously tagged images.

## API base URL

The frontend uses **NEXT_PUBLIC_API_URL** (or a default) to call the backend; ensure it points to the running FastAPI server.

Next: [08-parallel-taggers-and-send-api.md](08-parallel-taggers-and-send-api.md)
