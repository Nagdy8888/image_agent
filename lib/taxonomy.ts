/**
 * Tag taxonomy from spec section 5. Only these values are allowed per category.
 * Must stay in sync with src/image_tagging/taxonomy.py.
 */

export const SEASON = [
  "christmas", "hanukkah", "kwanzaa", "new_years", "valentines_day", "st_patricks_day",
  "easter", "mothers_day", "fathers_day", "fourth_of_july", "halloween", "thanksgiving",
  "diwali", "eid", "birthday", "wedding_anniversary", "baby_shower", "graduation", "all_occasion",
] as const;

export const THEME = [
  "whimsical", "traditional", "modern", "minimalist", "elegant_luxury", "rustic_farmhouse",
  "vintage_retro", "kawaii_cute", "floral_botanical", "tropical", "religious", "feminine",
  "masculine", "kids_juvenile", "nature_organic", "abstract", "typographic", "photorealistic",
] as const;

export const OBJECTS = [
  "santa", "mrs_claus", "elf", "reindeer", "snowman", "grinch", "easter_bunny", "witch", "ghost",
  "angel", "cupid", "gnome", "fairy", "mermaid", "unicorn", "dragon", "superhero",
  "bear", "rabbit", "cat", "dog", "bird", "fox", "owl", "penguin", "deer", "sheep", "squirrel",
  "butterfly", "bee", "flamingo", "sloth", "dinosaur",
  "christmas_tree", "wreath", "holly", "mistletoe", "flower", "rose", "sunflower", "leaf", "cactus",
  "pumpkin", "tree", "mushroom", "rainbow", "cloud", "sun", "moon", "star", "snowflake", "fireworks",
  "cake", "cupcake", "cookie", "candy", "chocolate", "wine", "champagne", "coffee", "gingerbread",
  "ice_cream", "fruit", "pie",
  "gift_box", "ribbon", "bow", "balloon", "candle", "ornament", "stocking", "heart", "diamond",
  "crown", "key", "crayon", "pencil", "book", "camera", "bicycle", "car", "boat", "umbrella",
  "envelope", "trophy",
  "house", "castle", "hotel", "cityscape", "barn", "beach", "forest", "mountain", "space", "church",
  "cross", "star_of_david", "crescent", "peace_sign", "infinity", "anchor", "compass",
  "musical_note", "sports_ball",
] as const;

export const COLORS = [
  "crimson", "scarlet", "cherry", "burgundy", "rose_red", "hot_pink", "blush", "coral", "salmon",
  "bubblegum", "burnt_orange", "peach", "amber", "tangerine", "yellow", "gold", "mustard", "lemon",
  "cream_yellow", "forest_green", "mint", "lime", "sage", "olive", "emerald", "navy", "sky_blue",
  "teal", "royal_blue", "baby_blue", "denim", "lavender", "violet", "plum", "lilac", "mauve",
  "white", "off_white", "beige", "tan", "brown", "gray_light", "gray_dark", "black",
  "gold_metallic", "silver_metallic", "rose_gold", "bronze", "copper",
] as const;

export const DESIGN = [
  "stripes", "checkered", "plaid_tartan", "polka_dots", "argyle", "houndstooth", "chevron",
  "herringbone", "ikat", "paisley", "geometric", "abstract_pattern", "floral_pattern", "toile",
  "damask", "glitter_sparkle", "foil_metallic", "watercolor", "hand_drawn_sketch", "embossed_effect",
  "linen_texture", "kraft_texture", "all_over_print", "centered_motif", "scattered_elements",
  "border_frame", "tiled_repeat", "asymmetric", "symmetrical", "diagonal_layout",
  "handlettering", "serif_type", "sans_serif_type", "script_cursive", "block_letters", "no_text",
] as const;

export const OCCASION = [
  "gifting_general", "gifting_premium", "corporate_branded", "party_supplies",
  "wedding_event", "kids_party", "self_gifting", "charitable_cause",
] as const;

export const MOOD = [
  "joyful_fun", "elegant_sophisticated", "romantic", "nostalgic_sentimental", "spooky_dark",
  "peaceful_calm", "bold_energetic", "cozy_warm", "fresh_bright",
] as const;

export const PRODUCT = [
  "gift_bag", "gift_bag_small", "gift_bag_medium", "gift_bag_large", "gift_bag_extra_large", "wine_bag",
  "bottle_bag", "tote_style", "gift_card_envelope", "standard_gift_card", "money_holder", "oversized_card", "boxed_notecard",
  "gift_wrap", "wrapping_paper_sheet", "wrapping_paper_roll", "tissue_paper", "gift_tissue_set",
  "gift_box", "box_lid", "collapsible_box", "window_box", "accessory", "ribbon_spool", "bow_pack", "tag_label", "filler_shred",
] as const;

export type CategoryKey = "Season" | "Theme" | "Objects" | "Colors" | "Design" | "Occasion" | "Mood" | "Product";

const TAXONOMY: Record<CategoryKey, readonly string[]> = {
  Season: SEASON,
  Theme: THEME,
  Objects: OBJECTS,
  Colors: COLORS,
  Design: DESIGN,
  Occasion: OCCASION,
  Mood: MOOD,
  Product: PRODUCT,
};

/** Normalize raw string to underscore lowercase for matching. */
function norm(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, "_").replace(/[^a-z0-9_]/g, "");
}

/**
 * Map a raw vision value to a taxonomy enum for the category, or null if no match.
 * Tries exact match, then normalized match, then "contains" for known aliases.
 */
export function mapToTaxonomy(category: CategoryKey, rawValue: string): string | null {
  const allowed = TAXONOMY[category] as readonly string[];
  const n = norm(rawValue);
  if (!n) return null;
  if (allowed.includes(n as never)) return n;
  const nNoUnderscore = n.replace(/_/g, "");
  for (const v of allowed) {
    if (v.replace(/_/g, "") === nNoUnderscore) return v;
  }
  // [canonical, ...aliases] — if raw matches any alias, return canonical
  const aliases: Record<string, [string, ...string[]][]> = {
    Season: [["christmas", "xmas", "holiday"], ["new_years", "new year"], ["valentines_day", "valentine"]],
    Objects: [["santa", "santa claus", "santa_claus"], ["christmas_tree", "christmas tree"], ["gift_box", "gift box"]],
    Colors: [["gold", "gold"], ["red", "crimson", "scarlet", "cherry"], ["green", "forest_green", "mint"]],
    Mood: [["joyful_fun", "joyful", "fun"], ["cozy_warm", "cozy", "warm"], ["elegant_sophisticated", "elegant"]],
    Theme: [["traditional", "traditional"], ["whimsical", "whimsical"]],
    Occasion: [["gifting_general", "gift", "gifting", "gift_giving"]],
    Product: [["gift_wrap", "gift wrap", "packaging"], ["gift_bag", "gift bag"]],
  };
  const list = aliases[category];
  if (list) {
    for (const [canonical, ...aliasList] of list) {
      if (aliasList.some((alias) => n === norm(alias) || n.includes(norm(alias)) || norm(alias).includes(n))) return canonical;
    }
  }
  const found = allowed.find((v) => v.includes(n) || n.includes(v));
  return found ?? null;
}

/** Return only values that exist in the taxonomy for this category. */
export function filterToTaxonomy(category: CategoryKey, rawValues: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const raw of rawValues) {
    const mapped = mapToTaxonomy(category, raw);
    if (mapped && !seen.has(mapped)) {
      seen.add(mapped);
      out.push(mapped);
    }
  }
  return out;
}

export function getAllowedValues(category: CategoryKey): readonly string[] {
  return TAXONOMY[category];
}
