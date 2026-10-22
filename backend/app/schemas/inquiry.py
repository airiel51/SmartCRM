import uuid
from datetime import datetime
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field


class NLPExtractedEntities(BaseModel):
    customer_name: Optional[str] = None
    phone: Optional[str] = None
    plate_number: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    symptoms: List[str] = Field(default_factory=list)
    requested_service: Optional[str] = None
    preferred_date: Optional[str] = None
    preferred_time: Optional[str] = None
    urgency: str = Field(default="normal")  # normal, high, urgent
    confidence: float = Field(default=0.85, ge=0.0, le=1.0)
    provider: str = Field(default="rules_fallback")


class InquiryBase(BaseModel):
    channel: str = Field(default="whatsapp")  # whatsapp, phone, walk_in, web, email
    sender_name: Optional[str] = None
    sender_phone: str = Field(..., min_length=5, max_length=50)
    raw_message: str = Field(..., min_length=1)


class InquiryCreate(InquiryBase):
    workshop_id: Optional[uuid.UUID] = None
    extracted_data: Optional[NLPExtractedEntities] = None


class InquiryUpdate(BaseModel):
    status: Optional[str] = None  # new, reviewed, converted, rejected
    extracted_data: Optional[Dict[str, Any]] = None
    staff_notes: Optional[str] = None


class InquiryConvertRequest(BaseModel):
    customer_name: str
    phone: str
    plate_number: str
    make: str
    model: str
    year: Optional[int] = 2022
    service_type: str
    scheduled_at: Optional[datetime] = None
    assigned_bay: Optional[str] = "Bay 1"
    notes: Optional[str] = None


class InquiryResponse(InquiryBase):
    id: uuid.UUID
    workshop_id: uuid.UUID
    status: str
    extracted_data: Dict[str, Any]
    extraction_confidence: float
    extraction_provider: str
    converted_customer_id: Optional[uuid.UUID] = None
    converted_vehicle_id: Optional[uuid.UUID] = None
    converted_appointment_id: Optional[uuid.UUID] = None
    reviewed_at: Optional[datetime] = None
    staff_notes: Optional[str] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
