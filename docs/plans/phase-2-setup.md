# Phase 2: Season Tagger, TagResult, TagCategoryCard + TagChip

## What This Phase Adds

- **Taxonomy:** Season (and possibly other categories) defined in code (e.g. `src/image_tagging/taxonomy.py`).
- **TagResult / partial_tags:** Schema for one category’s tags; state field `partial_tags` (e.g. `season`).
- **Season tagger node:** From vision description, output season tags from taxonomy.
- **API:** Response includes `season_tags` (or under a generic tag result).
- **UI:** TagCategoryCard and TagChip components to show tags per category.

## Prerequisites

- Phase 1 done (vision, graph, analyze endpoint, dashboard).

## Files Changed

- `src/image_tagging/taxonomy.py`: TAXONOMY with at least `season`.
- `src/image_tagging/`: TagResult (or equivalent) schema, season_tagger node, state with `partial_tags`.
- Graph: vision → season_tagger → end; state carries `partial_tags`.
- API: analyze response includes tag results per category.
- Frontend: TagCategoryCard, TagChip, display season (and later other categories) on dashboard.

## Step-by-Step Setup

1. Add taxonomy (season values); add TagResult model and `partial_tags` to state.
2. Implement season_tagger: input vision description, output tags from taxonomy (LLM or rule-based).
3. Add season_tagger to graph after vision; write result to state.
4. Return `partial_tags` (or `season_tags`) from `POST /api/analyze-image`.
5. Frontend: TagCategoryCard for “Season”, TagChip for each tag; render from API response.

## How to Test

- Upload image; response includes season tags; dashboard shows Season card with chips.

## Troubleshooting

- **Empty season:** Check taxonomy keys and tagger prompt/output parsing.
- **Type errors:** Ensure TagResult and state schema match (e.g. list of strings vs list of objects).
