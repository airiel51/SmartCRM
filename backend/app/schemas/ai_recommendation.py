import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class SupportingEvidence(BaseModel):
    fact: str
    detail: str


class AIRecommendationBase(BaseModel):
    category: str = Field(..., description="retention, maintenance_upsell, inventory_demand, service_scheduling, pricing")
    title: str = Field(..., min_length=3, max_length=200)
    recommendation: str
    supporting_evidence: List[SupportingEvidence] = Field(default_factory=list)
    confidence_score: float = Field(default=0.85, ge=0.0, le=1.0)
    provider: str = Field(default="rules_fallback")  # gemini-2.5-flash, rules_fallback
    status: str = Field(default="suggested")  # suggested, approved, dismissed, executed
    action_payload: Dict[str, Any] = Field(default_factory=dict)


class AIRecommendationCreate(AIRecommendationBase):
    workshop_id: Optional[uuid.UUID] = None
    customer_id: Optional[uuid.UUID] = None
    vehicle_id: Optional[uuid.UUID] = None


class AIRecommendationUpdate(BaseModel):
    status: Optional[str] = None  # suggested, approved, dismissed, executed
    notes: Optional[str] = None


class AIRecommendationResponse(AIRecommendationBase):
    id: uuid.UUID
    workshop_id: uuid.UUID
    customer_id: Optional[uuid.UUID] = None
    vehicle_id: Optional[uuid.UUID] = None
    created_at: datetime
    updated_at: datetime

    customer_name: Optional[str] = None
    vehicle_plate: Optional[str] = None

    class Config:
        from_attributes = True
