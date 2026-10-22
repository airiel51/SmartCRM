from fastapi import APIRouter
from app.api.v1.endpoints import (
    customers,
    vehicles,
    services,
    appointments,
    inquiries,
    reminders,
    ai_recommendations,
    whatsapp,
    retention,
    acquisition,
    strategist,
    supabase_sync,
    deals,
    interactions,
    activities,
    analytics,
    ai_agents
)

api_router = APIRouter()

# Automotive Workshop Core Operational Endpoints
api_router.include_router(customers.router, prefix="/customers", tags=["customers"])
api_router.include_router(vehicles.router, prefix="/vehicles", tags=["vehicles"])
api_router.include_router(appointments.router, prefix="/appointments", tags=["appointments"])
api_router.include_router(services.router, prefix="/services", tags=["services"])
api_router.include_router(inquiries.router, prefix="/inquiries", tags=["inquiries"])
api_router.include_router(reminders.router, prefix="/reminders", tags=["reminders"])
api_router.include_router(ai_recommendations.router, prefix="/recommendations", tags=["ai-recommendations"])
api_router.include_router(whatsapp.router, prefix="/whatsapp", tags=["whatsapp"])

# Intelligence, Analytics & AI Agent Endpoints
api_router.include_router(analytics.router, prefix="/analytics", tags=["analytics"])
api_router.include_router(retention.router, prefix="/retention", tags=["retention"])
api_router.include_router(acquisition.router, prefix="/acquisition", tags=["acquisition"])
api_router.include_router(strategist.router, prefix="/strategist", tags=["strategist"])
api_router.include_router(ai_agents.router, prefix="/agents", tags=["ai-agents"])
api_router.include_router(supabase_sync.router, prefix="/supabase", tags=["supabase"])

# Compatibility Endpoints
api_router.include_router(deals.router, prefix="/deals", tags=["deals"])
api_router.include_router(interactions.router, prefix="/interactions", tags=["interactions"])
api_router.include_router(activities.router, prefix="/activities", tags=["activities"])
