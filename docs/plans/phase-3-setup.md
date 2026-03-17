# Phase 3: All 8 Parallel Taggers, Send API, TagResults Grid

## What This Phase Adds

- **Eight tagger nodes:** season, theme, objects, dominant_colors, design_elements, occasion, mood, product_type (each from taxonomy).
- **Send API:** Fan-out from one node to multiple taggers in parallel; collect results.
- **State:** `tags_by_category` (or equivalent) holding all categories’ tags.
- **API:** Full tag set in analyze response.
- **UI:** TagResults grid with 8 TagCategoryCards (one per category).

## Prerequisites

- Phase 2 done (taxonomy, TagResult, season tagger, TagCategoryCard, TagChip).

## Files Changed

- `src/image_tagging/taxonomy.py`: All 8 categories and allowed values.
- `src/image_tagging/`: 8 tagger nodes (or one parameterized), fan_out_to_taggers (Send), aggregating edges; state `tags_by_category`.
- API: response includes all categories.
- Frontend: grid of 8 TagCategoryCard components; map `tags_by_category` to cards.

## Step-by-Step Setup

1. Extend taxonomy to all 8 categories (flat and hierarchical as needed).
2. Implement each tagger node (or single node with category param); each reads vision + state, writes its category into state.
3. Use LangGraph Send API: after vision, send to all 8 taggers; add a node that merges results into `tags_by_category`.
4. Graph: vision → fan_out_to_taggers → aggregator → end.
5. API returns `tags_by_category`. Frontend renders 8 cards from it.

## How to Test

- Upload image; response has tags for all 8 categories; dashboard shows 8 cards with chips.

## Troubleshooting

- **Missing category in response:** Ensure aggregator collects every tagger’s output and state key names match.
- **Send API usage:** Confirm LangGraph version supports Send; follow docs for fan-out and join.
