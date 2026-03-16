# Frontend

Next.js App Router frontend for the Image Tagging Agent dashboard and search page.

| Folder / File | Purpose |
|---------------|---------|
| `app/` | App Router: layout.tsx (Outfit + Inter, theme), page.tsx (dashboard), globals.css |
| `components/` | ThemeProvider, ThemeToggle, ImageUploader, ProcessingOverlay, JsonViewer, ConfidenceRing, TagCategories, TagCategoryCard, TagChip, FlaggedTags, **SaveToast**, **HistoryGrid** |
| `lib/` | types.ts, constants.ts, visionMapper.ts (vision_raw_tags → category tags for UI) |
| `Dockerfile` | Production build for docker-compose (NEXT_PUBLIC_API_URL) |

**Phase 1–2:** Dashboard with upload; ProcessingOverlay (Preprocessing → Vision Analysis → **Tagging**); vision description + confidence ring; **Season** card from backend tagger (`season_tags` + `season_confidence_scores`) via TagCategoryCard and TagChip; categorized tag boxes from vision (taxonomy-filtered); flagged tags; raw JSON. API returns `season_tags` and `season_confidence_scores` (Phase 2).

Run locally: `npm run dev` → http://localhost:3000.
