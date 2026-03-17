# 04 — Vision and Preprocessing

The preprocessor validates and prepares the image; the vision node calls GPT-4o and returns structured JSON.

## Preprocessor node

Lives in **`src/image_tagging/nodes/preprocessor.py`**. It validates the image (format, size), resizes if needed, and converts it to base64. It may set metadata (dimensions, format). It updates state with the prepared image_base64 and metadata so the vision node can use it.

## Vision node

Lives in **`src/image_tagging/nodes/vision.py`** (or similar). It calls the OpenAI vision API (GPT-4o) with the image and a prompt that asks for structured JSON (e.g. visual_description, seasonal_indicators, color_observations). The response is parsed and written into state as **vision_description** and **vision_raw_tags** (or equivalent). Downstream taggers use this to produce taxonomy-backed tags.

## Flow

preprocess → vision → (taggers). Both nodes are synchronous with state; the server invokes the whole graph with ainvoke.

Next: [05-taggers-and-taxonomy.md](05-taggers-and-taxonomy.md)
