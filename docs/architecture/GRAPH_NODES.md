# Graph nodes

LangGraph nodes in the image tagging pipeline.

| Node | Purpose | Inputs | Outputs |
|------|---------|--------|--------|
| **preprocessor** | Validate image, resize, base64 | image_base64, metadata | image_base64, metadata |
| **vision** | GPT-4o vision → JSON | image_base64 | vision_description, vision_raw_tags |
| **season_tagger** | Tags for season from taxonomy | vision_raw_tags | partial_tags (season) |
| **theme_tagger** | Tags for theme | vision_raw_tags | partial_tags (theme) |
| **objects_tagger** | Tags for objects (hierarchical) | vision_raw_tags | partial_tags (objects) |
| **dominant_colors_tagger** | Tags for dominant_colors | vision_raw_tags | partial_tags (dominant_colors) |
| **design_elements_tagger** | Tags for design_elements | vision_raw_tags | partial_tags (design_elements) |
| **occasion_tagger** | Tags for occasion | vision_raw_tags | partial_tags (occasion) |
| **mood_tagger** | Tags for mood | vision_raw_tags | partial_tags (mood) |
| **product_type_tagger** | Tags for product_type | vision_raw_tags | partial_tags (product_type) |
| **tag_validator** | Check tags against taxonomy | partial_tags | validated_tags, flagged_tags |
| **confidence_filter** | Apply threshold; set needs_review | validated_tags, flagged_tags | validated_tags, flagged_tags, needs_review |
| **tag_aggregator** | Build TagRecord; set processing_status | validated_tags | tag_record, processing_status |

**Routing:** After vision, the graph fans out to all eight taggers (Send API); then all results flow into tag_validator → confidence_filter → tag_aggregator → END.

**Location:** `src/image_tagging/nodes/` (one file per node or group). Graph built in `src/image_tagging/graph_builder.py`.
