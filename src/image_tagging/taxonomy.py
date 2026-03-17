"""
Tag taxonomy from spec section 5. All tag values are predefined enums.
Single source of truth for allowed values per category.
"""

# 5.1 Season / Holiday — flat multi-select
SEASON = [
    "christmas",
    "hanukkah",
    "kwanzaa",
    "new_years",
    "valentines_day",
    "st_patricks_day",
    "easter",
    "mothers_day",
    "fathers_day",
    "fourth_of_july",
    "halloween",
    "thanksgiving",
    "diwali",
    "eid",
    "birthday",
    "wedding_anniversary",
    "baby_shower",
    "graduation",
    "all_occasion",
]

# 5.2 Theme / Aesthetic — flat multi-select
THEME = [
    "whimsical",
    "traditional",
    "modern",
    "minimalist",
    "elegant_luxury",
    "rustic_farmhouse",
    "vintage_retro",
    "kawaii_cute",
    "floral_botanical",
    "tropical",
    "religious",
    "feminine",
    "masculine",
    "kids_juvenile",
    "nature_organic",
    "abstract",
    "typographic",
    "photorealistic",
]

# 5.3 Objects & Subjects — hierarchical; flat list of all allowed values for validation
OBJECTS_CATEGORIES = {
    "characters": [
        "santa", "mrs_claus", "elf", "reindeer", "snowman", "grinch",
        "easter_bunny", "witch", "ghost", "angel", "cupid", "gnome",
        "fairy", "mermaid", "unicorn", "dragon", "superhero",
    ],
    "animals": [
        "bear", "rabbit", "cat", "dog", "bird", "fox", "owl", "penguin",
        "deer", "sheep", "squirrel", "butterfly", "bee", "flamingo", "sloth", "dinosaur",
    ],
    "plants_nature": [
        "christmas_tree", "wreath", "holly", "mistletoe", "flower", "rose", "sunflower",
        "leaf", "cactus", "pumpkin", "tree", "mushroom", "rainbow", "cloud", "sun", "moon",
        "star", "snowflake", "fireworks",
    ],
    "food_drink": [
        "cake", "cupcake", "cookie", "candy", "chocolate", "wine", "champagne",
        "coffee", "gingerbread", "ice_cream", "fruit", "pie",
    ],
    "objects_items": [
        "gift_box", "ribbon", "bow", "balloon", "candle", "ornament", "stocking",
        "heart", "diamond", "crown", "key", "crayon", "pencil", "book", "camera",
        "bicycle", "car", "boat", "umbrella", "envelope", "trophy",
    ],
    "places_architecture": [
        "house", "castle", "hotel", "cityscape", "barn", "beach", "forest",
        "mountain", "space", "church",
    ],
    "symbols_icons": [
        "cross", "star_of_david", "crescent", "peace_sign", "infinity",
        "anchor", "compass", "musical_note", "sports_ball",
    ],
}
OBJECTS = [v for vals in OBJECTS_CATEGORIES.values() for v in vals]

# 5.4 Dominant Colors — hierarchical; flat list for validation
COLORS_CATEGORIES = {
    "red_family": ["crimson", "scarlet", "cherry", "burgundy", "rose_red"],
    "pink_family": ["hot_pink", "blush", "coral", "salmon", "bubblegum"],
    "orange_family": ["burnt_orange", "peach", "amber", "tangerine"],
    "yellow_family": ["yellow", "gold", "mustard", "lemon", "cream_yellow"],
    "green_family": ["forest_green", "mint", "lime", "sage", "olive", "emerald"],
    "blue_family": ["navy", "sky_blue", "teal", "royal_blue", "baby_blue", "denim"],
    "purple_family": ["lavender", "violet", "plum", "lilac", "mauve"],
    "neutral_family": ["white", "off_white", "beige", "tan", "brown", "gray_light", "gray_dark", "black"],
    "metallic_family": ["gold_metallic", "silver_metallic", "rose_gold", "bronze", "copper"],
}
COLORS = [v for vals in COLORS_CATEGORIES.values() for v in vals]

# 5.5 Design Elements & Style — flat multi-select
DESIGN = [
    "stripes", "checkered", "plaid_tartan", "polka_dots", "argyle", "houndstooth",
    "chevron", "herringbone", "ikat", "paisley", "geometric", "abstract_pattern",
    "floral_pattern", "toile", "damask", "glitter_sparkle", "foil_metallic",
    "watercolor", "hand_drawn_sketch", "embossed_effect", "linen_texture", "kraft_texture",
    "all_over_print", "centered_motif", "scattered_elements", "border_frame",
    "tiled_repeat", "asymmetric", "symmetrical", "diagonal_layout",
    "handlettering", "serif_type", "sans_serif_type", "script_cursive", "block_letters", "no_text",
]

# 5.6 Occasion / Use Case
OCCASION = [
    "gifting_general", "gifting_premium", "corporate_branded", "party_supplies",
    "wedding_event", "kids_party", "self_gifting", "charitable_cause",
]

# 5.7 Mood / Tone
MOOD = [
    "joyful_fun", "elegant_sophisticated", "romantic", "nostalgic_sentimental",
    "spooky_dark", "peaceful_calm", "bold_energetic", "cozy_warm", "fresh_bright",
]

# 5.8 Product Type — hierarchical; flat list includes parent categories for validation
PRODUCT_CATEGORIES = {
    "gift_bag": ["gift_bag_small", "gift_bag_medium", "gift_bag_large", "gift_bag_extra_large", "wine_bag", "bottle_bag", "tote_style"],
    "gift_card_envelope": ["standard_gift_card", "money_holder", "oversized_card", "boxed_notecard"],
    "gift_wrap": ["wrapping_paper_sheet", "wrapping_paper_roll", "tissue_paper", "gift_tissue_set"],
    "gift_box": ["box_lid", "collapsible_box", "window_box"],
    "accessory": ["ribbon_spool", "bow_pack", "tag_label", "filler_shred"],
}
PRODUCT = ["gift_bag", "gift_card_envelope", "gift_wrap", "gift_box", "accessory"] + [
    v for vals in PRODUCT_CATEGORIES.values() for v in vals
]

# Category key -> allowed values (for validators and taggers)
TAXONOMY = {
    "season": SEASON,
    "theme": THEME,
    "objects": OBJECTS,
    "dominant_colors": COLORS,
    "design_elements": DESIGN,
    "occasion": OCCASION,
    "mood": MOOD,
    "product_type": PRODUCT,
}


def get_allowed_values(category: str) -> list[str]:
    """Return the list of allowed tag values for a category."""
    return list(TAXONOMY.get(category, []))


def is_valid_tag(category: str, value: str) -> bool:
    """Return True if value is in the taxonomy for that category."""
    allowed = TAXONOMY.get(category)
    return allowed is not None and value.strip().lower() in {v.lower() for v in allowed}


def get_parent_for_value(category: str, value: str) -> str | None:
    """Return parent key for hierarchical categories (objects, dominant_colors, product_type), else None."""
    val_lower = value.strip().lower()
    if category == "objects":
        for parent, children in OBJECTS_CATEGORIES.items():
            if val_lower in {c.lower() for c in children}:
                return parent
        return None
    if category == "dominant_colors":
        for parent, children in COLORS_CATEGORIES.items():
            if val_lower in {c.lower() for c in children}:
                return parent
        return None
    if category == "product_type":
        for parent, children in PRODUCT_CATEGORIES.items():
            if val_lower in {c.lower() for c in children} or val_lower == parent.lower():
                return parent
        return None
    return None
