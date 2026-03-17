"""Supabase PostgreSQL client for storing and retrieving tag records."""

import json
from contextlib import contextmanager
from typing import Any

import psycopg2
from psycopg2.extras import RealDictCursor

from src.services.supabase.settings import DATABASE_URL, SUPABASE_ENABLED

TABLE_NAME = "image_tags"


def build_search_index(tag_record: dict[str, Any]) -> list[str]:
    """Build flat list of tag values from TagRecord for GIN-indexed search."""
    out: list[str] = []
    # Flat lists
    for key in ("season", "theme", "design_elements", "occasion", "mood"):
        for v in tag_record.get(key) or []:
            if v:
                out.append(str(v))
    # Hierarchical: objects, dominant_colors (list of {parent, child})
    for key in ("objects", "dominant_colors"):
        for item in tag_record.get(key) or []:
            if isinstance(item, dict):
                p, c = item.get("parent"), item.get("child")
                if p:
                    out.append(p)
                if c:
                    out.append(c)
    # product_type: single {parent, child}
    pt = tag_record.get("product_type")
    if isinstance(pt, dict):
        if pt.get("parent"):
            out.append(pt["parent"])
        if pt.get("child"):
            out.append(pt["child"])
    return out


def _get_conn():
    if not DATABASE_URL:
        raise ValueError("DATABASE_URL or DATABASE_URI not set")
    return psycopg2.connect(DATABASE_URL)


@contextmanager
def get_connection():
    conn = _get_conn()
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()


def upsert_tag_record(
    image_id: str,
    tag_record: dict[str, Any],
    search_index: list[str],
    needs_review: bool = False,
    processing_status: str = "complete",
    image_url: str | None = None,
) -> None:
    """Insert or update a single row in image_tags."""
    if not SUPABASE_ENABLED:
        return
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO image_tags (image_id, tag_record, search_index, needs_review, processing_status, image_url)
                VALUES (%s, %s, %s, %s, %s, %s)
                ON CONFLICT (image_id) DO UPDATE SET
                    tag_record = EXCLUDED.tag_record,
                    search_index = EXCLUDED.search_index,
                    needs_review = EXCLUDED.needs_review,
                    processing_status = EXCLUDED.processing_status,
                    image_url = COALESCE(EXCLUDED.image_url, image_tags.image_url),
                    updated_at = NOW()
                """,
                (
                    image_id,
                    json.dumps(tag_record),
                    search_index,
                    needs_review,
                    processing_status,
                    image_url or None,
                ),
            )


def get_tag_record(image_id: str) -> dict[str, Any] | None:
    """Fetch one row by image_id. Returns dict with tag_record, search_index, etc. or None."""
    if not SUPABASE_ENABLED:
        return None
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT image_id, tag_record, search_index, needs_review, processing_status, image_url, created_at, updated_at
                FROM image_tags WHERE image_id = %s
                """,
                (image_id,),
            )
            row = cur.fetchone()
    if not row:
        return None
    out = dict(row)
    if isinstance(out.get("tag_record"), str):
        out["tag_record"] = json.loads(out["tag_record"])
    return out


def list_tag_images(limit: int = 50, offset: int = 0) -> list[dict[str, Any]]:
    """List recent records (by updated_at desc). Returns list of dicts with image_id, tag_record, processing_status, etc."""
    if not SUPABASE_ENABLED:
        return []
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT image_id, tag_record, search_index, needs_review, processing_status, image_url, created_at, updated_at
                FROM image_tags
                ORDER BY updated_at DESC
                LIMIT %s OFFSET %s
                """,
                (limit, offset),
            )
            rows = cur.fetchall()
    out = []
    for row in rows:
        d = dict(row)
        if isinstance(d.get("tag_record"), str):
            d["tag_record"] = json.loads(d["tag_record"])
        out.append(d)
    return out


def search_by_tags(tags: list[str]) -> list[dict[str, Any]]:
    """Return rows whose search_index contains any of the given tags (GIN array overlap)."""
    if not SUPABASE_ENABLED or not tags:
        return []
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT image_id, tag_record, search_index, needs_review, processing_status, image_url, created_at, updated_at
                FROM image_tags
                WHERE search_index && %s
                ORDER BY updated_at DESC
                """,
                (tags,),
            )
            rows = cur.fetchall()
    out = []
    for row in rows:
        d = dict(row)
        if isinstance(d.get("tag_record"), str):
            d["tag_record"] = json.loads(d["tag_record"])
        out.append(d)
    return out


FLAT_CATEGORIES = ("season", "theme", "design_elements", "occasion", "mood")
HIERARCHICAL_LIST_CATEGORIES = ("objects", "dominant_colors")
PRODUCT_TYPE_CATEGORY = "product_type"


def search_images_filtered(
    filters: dict[str, list[str]],
    limit: int = 50,
    offset: int = 0,
) -> list[dict[str, Any]]:
    """Return rows matching all category filters. AND across categories, OR within a category."""
    if not SUPABASE_ENABLED:
        return []
    filters = {k: [v for v in vals if v] for k, vals in (filters or {}).items() if vals}
    if not filters:
        return list_tag_images(limit=limit, offset=offset)
    conditions: list[str] = []
    params: list[Any] = []
    for cat, values in filters.items():
        if not values:
            continue
        if cat in FLAT_CATEGORIES:
            placeholders = ",".join("%s" for _ in values)
            conditions.append(
                "\n                EXISTS (\n                    SELECT 1 FROM jsonb_array_elements_text(tag_record->%s) AS e\n                    WHERE e::text IN (" + placeholders + ")\n                )"
            )
            params.append(cat)
            params.extend(values)
        elif cat in HIERARCHICAL_LIST_CATEGORIES:
            placeholders = ",".join("%s" for _ in values)
            conditions.append(
                "\n                EXISTS (\n                    SELECT 1 FROM jsonb_array_elements(tag_record->%s) AS elem\n                    WHERE elem->>'parent' IN (" + placeholders + ")\n                       OR elem->>'child' IN (" + placeholders + ")\n                )"
            )
            params.append(cat)
            params.extend(values)
            params.extend(values)
        elif cat == PRODUCT_TYPE_CATEGORY:
            conditions.append(
                " (tag_record->'product_type'->>'parent' IN ("
                + ",".join("%s" for _ in values)
                + ") OR tag_record->'product_type'->>'child' IN ("
                + ",".join("%s" for _ in values)
                + "))"
            )
            params.extend(values)
            params.extend(values)
    if not conditions:
        return list_tag_images(limit=limit, offset=offset)
    sql = """
        SELECT image_id, tag_record, search_index, needs_review, processing_status, image_url, created_at, updated_at
        FROM image_tags
        WHERE """ + " AND ".join(conditions) + """
        ORDER BY updated_at DESC
        LIMIT %s OFFSET %s
    """
    params.extend([limit, offset])
    with get_connection() as conn:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            rows = cur.fetchall()
    out = []
    for row in rows:
        d = dict(row)
        if isinstance(d.get("tag_record"), str):
            d["tag_record"] = json.loads(d["tag_record"])
        out.append(d)
    return out


def get_available_filter_values(filters: dict[str, list[str]] | None) -> dict[str, list[str]]:
    """Aggregate distinct tag values per category from matching rows. Empty filters = all rows."""
    if not SUPABASE_ENABLED:
        return {}
    if not filters or not any(filters.values()):
        rows = list_tag_images(limit=10000, offset=0)
    else:
        rows = search_images_filtered(filters, limit=10000, offset=0)
    out: dict[str, list[str]] = {
        "season": [],
        "theme": [],
        "objects": [],
        "dominant_colors": [],
        "design_elements": [],
        "occasion": [],
        "mood": [],
        "product_type": [],
    }
    seen: dict[str, set[str]] = {k: set() for k in out}
    for row in rows:
        tr = row.get("tag_record") or {}
        if isinstance(tr, str):
            tr = json.loads(tr)
        for key in FLAT_CATEGORIES:
            arr = tr.get(key)
            if isinstance(arr, list):
                for v in arr:
                    if isinstance(v, str) and v and v not in seen[key]:
                        seen[key].add(v)
                        out[key].append(v)
        for key in HIERARCHICAL_LIST_CATEGORIES:
            arr = tr.get(key)
            if isinstance(arr, list):
                for item in arr:
                    if isinstance(item, dict):
                        for k in ("parent", "child"):
                            v = item.get(k)
                            if isinstance(v, str) and v and v not in seen[key]:
                                seen[key].add(v)
                                out[key].append(v)
        pt = tr.get("product_type")
        if isinstance(pt, dict):
            for k in ("parent", "child"):
                v = pt.get(k)
                if isinstance(v, str) and v and v not in seen["product_type"]:
                    seen["product_type"].add(v)
                    out["product_type"].append(v)
    for k in out:
        out[k].sort()
    return out
