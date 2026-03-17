---
name: Smarter Agent Tag Selection
overview: Improve how the agent selects tags from vision output and taxonomy — confidence thresholds, taxonomy alignment, and handling ambiguous or multi-value categories.
todos:
  - id: tag-1
    content: "Review confidence threshold (CONFIDENCE_THRESHOLD) and FLAGGED_PER_CATEGORY_THRESHOLD"
    status: pending
  - id: tag-2
    content: "Ensure all tagger prompts constrain output to taxonomy-only values"
    status: pending
  - id: tag-3
    content: "Consider multi-select vs single-select per category (e.g. product_type single, season multi)"
    status: pending
  - id: tag-4
    content: "Document tag selection rules in architecture/PROMPTS.md or TAXONOMY.md"
    status: pending
isProject: false
---

# Smarter Agent Tag Selection

Plan for improving how the image tagging agent chooses and returns tags: taxonomy alignment, confidence, and category-specific rules.

## Goals

1. **Taxonomy-only output** — Every tagger should return only values from `src/image_tagging/taxonomy.py`. The validator already flags invalid tags; tightening prompts reduces flagged noise.
2. **Confidence thresholds** — Current CONFIDENCE_THRESHOLD (e.g. 0.65) and FLAGGED_PER_CATEGORY_THRESHOLD (e.g. 3) in `configuration.py` drive what goes into tag_record vs flagged_tags. Tune or make configurable if needed.
3. **Multi vs single value** — Some categories allow multiple tags (season, theme, objects, dominant_colors, design_elements, occasion, mood); product_type is a single {parent, child}. Ensure tagger prompts and aggregator logic match.
4. **Ambiguous images** — When vision is uncertain, prefer fewer high-confidence tags over many low-confidence ones; needs_review can surface edge cases for human review.

## Where it lives

- **Taxonomy:** `src/image_tagging/taxonomy.py` — single source of truth for allowed values (flat and hierarchical).
- **Configuration:** `src/image_tagging/configuration.py` — CONFIDENCE_THRESHOLD, FLAGGED_PER_CATEGORY_THRESHOLD.
- **Validator:** `src/image_tagging/nodes/validator.py` — checks tags against taxonomy; invalid → flagged_tags.
- **Confidence filter:** `src/image_tagging/nodes/confidence.py` — filters by threshold; sets needs_review when too many flagged in one category.
- **Prompts:** `src/image_tagging/prompts/` — tagger prompts should instruct the model to pick only from the provided taxonomy list.

## Possible improvements

- Add a “strict taxonomy” instruction to each tagger prompt (e.g. “Return only values from the following list”).
- Expose confidence thresholds via env or settings for A/B testing.
- In the UI, show confidence on TagCategoryCard or in DetailModal so users see why a tag was included or flagged.
- Document the tag selection flow (vision → taggers → validator → confidence → aggregator) in docs/architecture/PROMPTS.md or a dedicated TAXONOMY.md.

## Related plans

- [image_tagging_detailed_d655d914.plan.md](image_tagging_detailed_d655d914.plan.md) — Phase 4 (validator, confidence, aggregator).
- [phase_6_corrected_e51160df.plan.md](phase_6_corrected_e51160df.plan.md) — Search and filters (taxonomy API, FilterDropdown).
