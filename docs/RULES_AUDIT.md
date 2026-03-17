# Cursor Rules Audit

**Date:** 2026-03-17  
**Repo:** image_agent (current on-disk state)

This document lists what is **missing or wrong** relative to the six Cursor rules: curriculum-learning, documentation-structure, error-log, folder-readme, phase-setup-guide, progress-diagram.

---

## 1. curriculum-learning

**Rule:** `docs/curriculum/` with README (“Learning Curriculum”), numbered lessons (01-, 02-, …), concept-first, cross-link “Next”.

| Check | Status | Notes |
|-------|--------|--------|
| `docs/curriculum/` exists | ❌ Missing | Folder not present on disk |
| `docs/curriculum/README.md` | ❌ Missing | — |
| Numbered lessons (01–11) | ❌ Missing | No curriculum lesson files |
| Reading order + one-line descriptions | ❌ Missing | — |

**Summary:** Entire `docs/curriculum/` is missing. No curriculum docs to audit.

---

## 2. documentation-structure

**Rule:** `docs/` has subfolders curriculum, quickstart, architecture, reports, errors, plans; each with README and specified files. `CHANGELOG.md` at root.

| Item | Status | Notes |
|------|--------|--------|
| `docs/README.md` | ❌ Missing | Index of subfolders not on disk |
| `docs/curriculum/` | ❌ Missing | — |
| `docs/quickstart/` | ❌ Missing | No README, SETUP.md, DOCKER_SETUP.md, DEPLOY.md, IMAGE_UPLOAD_GUIDE.md |
| `docs/architecture/` | ❌ Missing | No README, OVERVIEW.md, GRAPH_NODES.md, TAXONOMY.md, DATABASE.md, API.md, FRONTEND.md, PROMPTS.md |
| `docs/reports/` | ❌ Missing | No README, PROGRESS.md, FEATURES.md, PROJECT_SUMMARY.md, DECISIONS.md |
| `docs/errors/` | ❌ Missing | No README or NNN-*.md error logs |
| `docs/plans/` | ⚠️ Partial | Folder exists; only `phase-1-setup.md` (empty). Missing README, phase-0, phase-2–7 |
| `CHANGELOG.md` at root | ✅ Present | Exists (Phase 0 only) |

**Summary:** Only `docs/plans/` exists (one empty file). All other doc subfolders and `docs/README.md` are missing.

---

## 3. error-log

**Rule:** Errors documented in `docs/errors/NNN-short-description.md` with template (Date, File(s), Type, Message, Root Cause, Solution, Prevention).

| Check | Status | Notes |
|-------|--------|--------|
| `docs/errors/` | ❌ Missing | Folder not present |
| `docs/errors/README.md` | ❌ Missing | — |
| Any NNN-*.md error file | ❌ Missing | No error logs |

**Summary:** Error-log structure not present. No errors documented.

---

## 4. folder-readme

**Rule:** Every folder has README.md with short description and Contents table. Root README = high-level overview + link to `docs/quickstart/README.md`.

| Folder | README present? | Notes |
|--------|------------------|--------|
| Project root | ✅ Yes | But titled “Frontend” only; no link to docs/quickstart/README.md; describes frontend only, not full project |
| `docs/` | ❌ No | — |
| `docs/plans/` | ❌ No | — |
| `src/` | ❌ No | — |
| `frontend/` | ✅ Yes | Has Contents table |
| `tests/` | ❌ No | — |
| `app/` | ❌ No | (if treated as top-level folder) |
| `components/` | ❌ No | — |
| `lib/` | ❌ No | — |
| `.cursor/` | ✅ Yes | — |
| `.cursor/plans/` | ✅ Yes | — |

**Summary:** Root README doesn’t match rule (no quickstart link; frontend-only). Missing READMEs: docs, docs/plans, src, tests (and any other project folders that should have one per rule).

---

## 5. phase-setup-guide

**Rule:** Each phase has `docs/plans/phase-N-setup.md` with: What This Phase Adds, Prerequisites, Files Changed, Step-by-Step Setup, How to Test, Troubleshooting.

| File | Status | Notes |
|------|--------|--------|
| `docs/plans/phase-0-setup.md` | ❌ Missing | — |
| `docs/plans/phase-1-setup.md` | ⚠️ Empty | File exists, 0 bytes; no sections |
| `docs/plans/phase-2-setup.md` | ❌ Missing | — |
| `docs/plans/phase-3-setup.md` | ❌ Missing | — |
| `docs/plans/phase-4-setup.md` | ❌ Missing | — |
| `docs/plans/phase-5-setup.md` | ❌ Missing | — |
| `docs/plans/phase-6-setup.md` | ❌ Missing | — |
| `docs/plans/phase-7-setup.md` | ❌ Missing | — |

**Summary:** Only phase-1 file exists and is empty. Phase 0 and phases 2–7 are missing. No phase guide is complete.

---

## 6. progress-diagram

**Rule:** `docs/reports/PROGRESS.md` with mermaid flowchart, status markers ([done], [NOW], [ ]), “Last updated”, “Current Step”.

| Check | Status | Notes |
|-------|--------|--------|
| `docs/reports/PROGRESS.md` | ❌ Missing | Folder docs/reports/ not present |
| Mermaid diagram | ❌ Missing | — |
| Status markers | ❌ Missing | — |

**Summary:** Progress diagram and reports folder are missing.

---

## Summary table

| Rule | Status | Critical gaps |
|------|--------|----------------|
| curriculum-learning | ❌ Not met | No docs/curriculum/ or lessons |
| documentation-structure | ❌ Not met | Missing docs index, quickstart, architecture, reports, errors; plans incomplete |
| error-log | ❌ Not met | No docs/errors/ |
| folder-readme | ⚠️ Partial | Root README doesn’t link to quickstart; missing READMEs in docs, docs/plans, src, tests |
| phase-setup-guide | ❌ Not met | Only empty phase-1; phase-0 and 2–7 missing |
| progress-diagram | ❌ Not met | No docs/reports/PROGRESS.md |

---

## Recommended next steps

1. **docs/README.md** — Add index linking to curriculum, quickstart, architecture, reports, errors, plans.
2. **docs/curriculum/** — Add README (“Learning Curriculum”) and numbered lessons 01–11 (or current set).
3. **docs/quickstart/** — Add README, SETUP.md, DOCKER_SETUP.md; optionally DEPLOY.md, IMAGE_UPLOAD_GUIDE.md.
4. **docs/architecture/** — Add README and OVERVIEW.md, GRAPH_NODES.md, DATABASE.md, API.md; optionally TAXONOMY.md, FRONTEND.md, PROMPTS.md.
5. **docs/reports/** — Add README, PROGRESS.md (mermaid + status), FEATURES.md, PROJECT_SUMMARY.md, DECISIONS.md.
6. **docs/errors/** — Add README; add NNN-*.md when errors are logged.
7. **docs/plans/** — Add README; add phase-0-setup.md through phase-7-setup.md with required sections; fill phase-1-setup.md.
8. **Root README** — Expand to full project overview and add link to `docs/quickstart/README.md`.
9. **Folder READMEs** — Add README.md to docs, docs/plans, src, tests (and any other folders that should have one per rule).
