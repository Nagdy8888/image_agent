export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const CATEGORY_COLORS: Record<string, string> = {
  season: "amber",
  theme: "violet",
  objects: "teal",
  dominant_colors: "red",
  design_elements: "rose",
  occasion: "sky",
  mood: "purple",
  product_type: "emerald",
};
