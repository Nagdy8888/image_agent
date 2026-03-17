# Phase 4: Validator, Confidence Filter, Aggregator, TagRecord, FlaggedTags

## What This Phase Adds

- **tag_validator node:** Validates tags against taxonomy (e.g. spellcheck, allowed values).
- **confidence_filter:** Keeps or drops tags by confidence threshold; may set `needs_review`.
- **tag_aggregator:** Merges tagger outputs into a single TagRecord (and optionally flagged_tags).
- **TagRecord / FlaggedTags:** Final schema for DB and API (validated tags + flags).
- **UI:** FlaggedTags display (e.g. needs_review, low confidence) on dashboard.

## Prerequisites

- Phase 3 done (all 8 taggers, tags_by_category, TagResults grid).

## Files Changed

- `src/image_tagging/`: tag_validator, confidence_filter, tag_aggregator nodes; TagRecord and FlaggedTags schemas.
- Graph: after taggers, validator → confidence_filter → aggregator → end.
- API: analyze response returns TagRecord (+ flagged_tags); optional needs_review flag.
- Frontend: FlaggedTags component; show warnings or review cue when needed.

## Step-by-Step Setup

1. Define TagRecord (all categories, ids, etc.) and FlaggedTags (e.g. low_confidence, invalid).
2. Implement tag_validator: check each tag against taxonomy; mark invalid.
3. Implement confidence_filter: apply threshold; set needs_review for borderline.
4. Implement tag_aggregator: merge validated/filtered tags into TagRecord; build flagged list.
5. Wire graph: taggers → validator → confidence_filter → aggregator → end.
6. API returns TagRecord (+ flagged_tags). Frontend shows FlaggedTags when non-empty.

## How to Test

- Upload image; response has TagRecord and optionally flagged_tags; UI shows flags when present.

## Troubleshooting

- **All tags flagged:** Lower confidence threshold or relax validator rules.
- **TagRecord shape:** Align with Phase 5 Supabase schema (column names, JSONB structure).
