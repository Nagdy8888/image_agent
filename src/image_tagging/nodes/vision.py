"""Vision analyzer node: sends image to GPT-4o and returns structured JSON description."""

import asyncio
import json
from typing import Any

from langchain_core.messages import HumanMessage, SystemMessage
from langchain_openai import ChatOpenAI

from src.image_tagging import settings
from src.image_tagging.prompts.vision import VISION_SYSTEM_PROMPT
from src.image_tagging.schemas.states import ImageTaggingState


async def analyze_image(state: ImageTaggingState) -> dict[str, Any]:
    base64_str = state.get("image_base64")
    if not base64_str:
        return {"error": "No image_base64 in state", "processing_status": "failed"}

    fmt = (state.get("metadata") or {}).get("format", "jpeg")
    mime = "image/jpeg" if fmt.upper() == "JPEG" else f"image/{fmt.lower()}"
    data_uri = f"data:{mime};base64,{base64_str}"

    llm = ChatOpenAI(model=settings.OPENAI_MODEL, api_key=settings.OPENAI_API_KEY)

    messages = [
        SystemMessage(content=VISION_SYSTEM_PROMPT),
        HumanMessage(content=[{"type": "image_url", "image_url": {"url": data_uri}}]),
    ]

    last_error = None
    for attempt in range(3):
        try:
            response = await llm.ainvoke(messages)
            text = response.content.strip()
            if text.startswith("```"):
                text = text.split("```")[1]
                if text.startswith("json"):
                    text = text[4:]
            raw = json.loads(text)
            vision_description = text
            vision_raw_tags = raw
            return {"vision_description": vision_description, "vision_raw_tags": vision_raw_tags}
        except Exception as e:
            last_error = e
            if attempt < 2:
                await asyncio.sleep(1 * (2**attempt))

    return {
        "error": str(last_error),
        "processing_status": "failed",
    }
