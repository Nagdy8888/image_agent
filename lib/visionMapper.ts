/**
 * Maps vision_raw_tags from the API into categorized tag arrays for the UI.
 * Only tags that match the Tag Taxonomy (spec section 5) are included.
 * Vision returns: visual_description, dominant_mood, visible_subjects,
 * color_observations, design_observations, seasonal_indicators, style_indicators, text_present.
 */
import { filterToTaxonomy } from "./taxonomy";

export const CATEGORY_ORDER = [
  "Season",
  "Theme",
  "Objects",
  "Colors",
  "Design",
  "Occasion",
  "Mood",
  "Product",
] as const;

export type CategoryKey = (typeof CATEGORY_ORDER)[number];

export interface CategoryTags {
  [key: string]: string[];
}

const MAX_TAG_LENGTH = 28;

/** Split string into tags; long phrases are broken into words so no tag exceeds MAX_TAG_LENGTH. */
function toTags(s: string | undefined, splitOn = /[,;]+/): string[] {
  if (typeof s !== "string" || !s.trim()) return [];
  const raw = s.split(splitOn).map((t) => t.trim().toLowerCase().replace(/\s+/g, "_")).filter(Boolean);
  const result: string[] = [];
  for (const t of raw) {
    if (t.length <= MAX_TAG_LENGTH) {
      result.push(t);
    } else {
      const words = t.split("_").filter(Boolean);
      let current = "";
      for (const w of words) {
        const next = current ? `${current}_${w}` : w;
        if (next.length <= MAX_TAG_LENGTH) current = next;
        else {
          if (current) result.push(current);
          current = w.length > MAX_TAG_LENGTH ? w.slice(0, MAX_TAG_LENGTH) : w;
        }
      }
      if (current) result.push(current);
    }
  }
  return result;
}

function colorWords(s: string | undefined): string[] {
  if (typeof s !== "string" || !s.trim()) return [];
  return toTags(s).slice(0, 8);
}

export function visionToCategoryTags(raw: Record<string, unknown>): CategoryTags {
  const tags: CategoryTags = {};
  for (const k of CATEGORY_ORDER) tags[k] = [];

  const seasonalRaw = toTags(raw.seasonal_indicators as string);
  tags["Season"] = filterToTaxonomy("Season", seasonalRaw);

  const moodRaw = toTags(raw.dominant_mood as string, /[\s,;]+/);
  tags["Theme"] = filterToTaxonomy("Theme", moodRaw);
  tags["Mood"] = filterToTaxonomy("Mood", moodRaw);

  const subjects = raw.visible_subjects as string[] | undefined;
  if (Array.isArray(subjects)) {
    const objectsRaw = subjects
      .map((s) => String(s).trim().toLowerCase().replace(/\s+/g, "_"))
      .filter(Boolean)
      .map((t) => (t.length > MAX_TAG_LENGTH ? t.slice(0, MAX_TAG_LENGTH) : t));
    tags["Objects"] = filterToTaxonomy("Objects", objectsRaw);
  }

  const colorObs = raw.color_observations as string | undefined;
  const colorsRaw = colorWords(colorObs).length ? colorWords(colorObs) : (typeof colorObs === "string" ? toTags(colorObs).slice(0, 6) : []);
  tags["Colors"] = filterToTaxonomy("Colors", colorsRaw);

  const designObs = raw.design_observations as string | undefined;
  const styleObs = raw.style_indicators as string | undefined;
  const designRaw = typeof designObs === "string"
    ? toTags(designObs)
    : [];
  const styleRaw = typeof styleObs === "string" ? toTags(styleObs).slice(0, 4) : [];
  tags["Design"] = filterToTaxonomy("Design", [...designRaw, ...styleRaw]).slice(0, 10);

  const occasionRaw: string[] = [];
  if (seasonalRaw.some((s) => /christmas|holiday|gift|winter|new year/i.test(s))) {
    occasionRaw.push("gifting_general", "gift_giving");
  }
  tags["Occasion"] = filterToTaxonomy("Occasion", occasionRaw);

  const productRaw: string[] = [];
  if (tags["Design"].length || (typeof designObs === "string" && /gift|packag|wrap|decorative/i.test(designObs))) {
    productRaw.push("gift_wrap", "gift_bag");
  }
  tags["Product"] = filterToTaxonomy("Product", productRaw);

  return tags;
}
