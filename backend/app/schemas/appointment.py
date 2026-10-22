import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class AppointmentBase(BaseModel):
    scheduled_at: datetime
    service_type: str = Field(..., min_length=2, max_length=120)
    assigned_bay: Optional[str] = "Bay 1"
    estimated_duration_minutes: int = Field(60, ge=15, le=480)
    customer_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class AppointmentCreate(AppointmentBase):
    workshop_id: Optional[uuid.UUID] = None
    customer_id: uuid.UUID
    vehicle_id: uuid.UUID


class AppointmentUpdate(BaseModel):
    scheduled_at: Optional[datetime] = None
    service_type: Optional[str] = None
    status: Optional[str] = None  # scheduled, confirmed, in_progress, completed, cancelled, no_show
    assigned_bay: Optional[str] = None
    estimated_duration_minutes: Optional[int] = None
    customer_notes: Optional[str] = None
    internal_notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: uuid.UUID
    workshop_id: uuid.UUID
    customer_id: uuid.UUID
    vehicle_id: uuid.UUID
    status: str
    created_at: datetime
    updated_at: datetime
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    vehicle_plate: Optional[str] = None
    vehicle_model: Optional[str] = None

    class Config:
        from_attributes = True
