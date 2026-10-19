import logging
from typing import Optional, Dict, Any, List
from app.core.config import settings

logger = logging.getLogger("smartcrm.supabase")

_supabase_client = None

def get_supabase_client():
    """
    Returns a configured Supabase client if URL and KEY are set.
    Returns None if Supabase credentials are not provided (falls back to local ORM).
    """
    global _supabase_client
    if _supabase_client is not None:
        return _supabase_client

    if not settings.SUPABASE_URL or not (settings.SUPABASE_KEY or settings.SUPABASE_SERVICE_ROLE_KEY):
        logger.info("[Supabase] Credentials not set in environment. Running in local PostgreSQL / SQLite mode.")
        return None

    try:
        from supabase import create_client, Client
        key_to_use = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_KEY
        _supabase_client = create_client(settings.SUPABASE_URL, key_to_use)
        logger.info(f"[Supabase] Connected successfully to remote project at: {settings.SUPABASE_URL}")
        return _supabase_client
    except Exception as err:
        logger.error(f"[Supabase] Failed to initialize Supabase client: {err}")
        return None


def check_supabase_health() -> Dict[str, Any]:
    """
    Checks connection status and basic telemetry for Supabase integration.
    """
    client = get_supabase_client()
    if not client:
        return {
            "status": "not_configured",
            "message": "Supabase credentials not configured. Using local database engine.",
            "supabase_url": settings.SUPABASE_URL or "Not configured",
            "connected": False
        }
    
    try:
        # Simple test query on workshop_profiles or customers
        res = client.table("customers").select("id", count="exact").limit(1).execute()
        return {
            "status": "connected",
            "message": "Connected to Supabase PostgreSQL cloud database.",
            "supabase_url": settings.SUPABASE_URL,
            "connected": True,
            "records_found": res.count if hasattr(res, "count") else len(res.data or [])
        }
    except Exception as e:
        return {
            "status": "error",
            "message": f"Connection attempt failed: {str(e)}",
            "supabase_url": settings.SUPABASE_URL,
            "connected": False
        }
