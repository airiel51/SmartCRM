import os
from fastapi import APIRouter
from app.core.config import settings
from app.core.supabase import check_supabase_health, get_supabase_client

router = APIRouter()


@router.get("/health")
def get_supabase_status():
    """Returns connection and telemetry status of Supabase PostgreSQL."""
    return check_supabase_health()


@router.get("/schema-sql")
def get_supabase_schema():
    """Returns the complete Supabase SQL DDL script for easy database migration."""
    schema_path = os.path.join(os.path.dirname(__file__), "..", "..", "..", "..", "supabase", "schema.sql")
    try:
        with open(schema_path, "r", encoding="utf-8") as f:
            sql = f.read()
        return {
            "status": "success",
            "file": "supabase/schema.sql",
            "schema_sql": sql
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Unable to read schema.sql: {e}"
        }
