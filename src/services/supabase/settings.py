"""Supabase connection settings loaded from environment variables."""

import os

# Postgres connection string (Supabase provides this in project settings → Database)
# Use DATABASE_URL or DATABASE_URI
DATABASE_URL = os.getenv("DATABASE_URL") or os.getenv("DATABASE_URI") or ""

# Set to False to skip DB writes (e.g. when no DB configured)
SUPABASE_ENABLED = bool(DATABASE_URL.strip())
