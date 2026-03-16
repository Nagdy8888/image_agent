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
}
