import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


class ServiceReminderBase(BaseModel):
    reminder_type: str = Field(..., description="oil_change, synthetic_oil, brake_service, major_service, general_inspection")
    due_date: Optional[datetime] = None
    due_mileage: Optional[int] = None
    priority: str = Field(default="normal")  # low, normal, high, urgent
    notes: Optional[str] = None


class ServiceReminderCreate(ServiceReminderBase):
    workshop_id: Optional[uuid.UUID] = None
    vehicle_id: uuid.UUID
    customer_id: uuid.UUID
    status: str = Field(default="upcoming")  # upcoming, due, overdue


class ServiceReminderUpdate(BaseModel):
    status: Optional[str] = None  # upcoming, due, overdue, dismissed, scheduled, completed
    priority: Optional[str] = None
    notes: Optional[str] = None


class ServiceReminderResponse(ServiceReminderBase):
    id: uuid.UUID
    workshop_id: uuid.UUID
    vehicle_id: uuid.UUID
    customer_id: uuid.UUID
    status: str
    last_sent_at: Optional[datetime] = None
    send_count: int = 0
    created_at: datetime
    updated_at: datetime

    # Denormalized fields for quick UI rendering
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    vehicle_plate: Optional[str] = None
    vehicle_model: Optional[str] = None
    current_mileage: Optional[int] = None

    class Config:
        from_attributes = True
