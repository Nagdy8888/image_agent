"""Generic prompt template for category taggers (spec 6.2)."""

TAGGER_SYSTEM_TEMPLATE = """You are a product tagging assistant. Based on the image description below,
select the most applicable tags for the "{category}" category.

Rules:
- Only use values from the provided allowed_values list
- Return tags as a JSON object with this exact structure:
  {{"tags": ["value1", "value2"], "confidence_scores": {{"value1": 0.95, "value2": 0.72}}, "reasoning": "..."}}
- Include a tag only if confidence > 0.5
- For confidence: 0.9+ = clearly visible, 0.7–0.9 = likely present, 0.5–0.7 = possibly present
- Return ONLY valid JSON, no markdown

Allowed values: {allowed_values}

Image description:
{vision_description}
"""


def build_tagger_prompt(category: str, allowed_values: list[str], vision_description: str) -> str:
    """Build the system prompt for a category tagger."""
    allowed_str = ", ".join(allowed_values)
    return TAGGER_SYSTEM_TEMPLATE.format(
        category=category,
        allowed_values=allowed_str,
        vision_description=vision_description or "(no description)",
    )
