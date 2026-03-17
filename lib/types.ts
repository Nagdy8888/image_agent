/** Vision analyzer JSON output (from GPT-4o). */
export interface VisionDescription {
  visual_description: string;
  dominant_mood: string;
  visible_subjects: string[];
  color_observations: string;
  design_observations: string;
  seasonal_indicators: string;
  style_indicators: string;
  text_present: string;
}

/** Flagged tag (low confidence or not_in_taxonomy) — Phase 4 API shape */
export interface FlaggedTag {
  category: string;
  value: string;
  confidence: number;
  reason: string;
}

/** One category's result from a tagger (e.g. season_tagger). */
export interface PartialTagResult {
  category: string;
  tags: string[];
  confidence_scores: Record<string, number>;
}

/** Response from POST /api/analyze-image */
export interface AnalyzeImageResponse {
  image_id: string;
  image_url: string;
  vision_description: string;
  vision_raw_tags: Record<string, unknown>;
  metadata: {
    filename?: string;
    format?: string;
    width?: number;
    height?: number;
    file_size_bytes?: number;
  };
  processing_status: "pending" | "complete" | "needs_review" | "failed";
  error?: string;
  /** Overall confidence 0–100 (optional; Phase 4+) */
  confidence?: number | null;
  /** Tags below confidence threshold (optional; Phase 4+) */
  flagged_tags?: FlaggedTag[];
  /** Per-category tagger results (Phase 2+: season, then all 8 in Phase 3) */
  partial_tags?: PartialTagResult[];
  /** Flattened per-category tags and confidence (Phase 3): category -> { tags, confidence_scores } */
  tags_by_category?: Record<string, { tags: string[]; confidence_scores: Record<string, number> }>;
  /** Season tags from season_tagger (Phase 2) */
  season_tags?: string[];
  /** Season tag confidence scores 0–1 (Phase 2) */
  season_confidence_scores?: Record<string, number>;
  /** Validated tags per category (Phase 4) */
  validated_tags?: Record<string, Array<{ value: string; confidence: number; parent?: string }>>;
  /** Final TagRecord (Phase 4) */
  tag_record?: TagRecord;
  /** True when record was persisted to Supabase (Phase 5) */
  saved_to_db?: boolean;
}

/** One item from GET /api/tag-images (history list) */
export interface TagImageItem {
  image_id: string;
  tag_record: TagRecord;
  search_index?: string[];
  needs_review: boolean;
  processing_status: string;
  image_url?: string | null;
  created_at?: string;
  updated_at?: string;
}

/** Final assembled tag record (Phase 4) */
export interface TagRecord {
  image_id: string;
  season: string[];
  theme: string[];
  objects: Array<{ parent: string; child: string }>;
  dominant_colors: Array<{ parent: string; child: string }>;
  design_elements: string[];
  occasion: string[];
  mood: string[];
  product_type: { parent: string; child: string };
  needs_review: boolean;
  processed_at: string;
}

/** One category in GET /api/taxonomy response (Phase 6) */
export type TaxonomyCategory =
  | { type: "flat"; values: string[] }
  | { type: "hierarchical"; groups: Record<string, string[]> };

/** GET /api/taxonomy response */
export type TaxonomyResponse = Record<string, TaxonomyCategory>;

/** GET /api/available-filters response: category -> list of tag values present in (filtered) data */
export type AvailableFilters = Record<string, string[]>;

/** Selected filters for search: category -> selected tag values */
export type SearchFilters = Record<string, string[]>;

/** Response from POST /api/bulk-upload */
export interface BulkUploadResponse {
  batch_id: string;
  total: number;
  status: string;
}

/** One item in GET /api/bulk-status results */
export interface BulkResultItem {
  image_id: string;
  image_url: string;
  processing_status: string;
  error?: string;
}

/** Response from GET /api/bulk-status/{batch_id} */
export interface BulkStatusResponse {
  batch_id: string;
  total: number;
  completed: number;
  failed: number;
  status: string;
  results: BulkResultItem[];
}
