from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class WhatsAppInboundMessage(BaseModel):
    phone: str
    message: str
    sender_name: Optional[str] = None
    vehicle_plate: Optional[str] = None


class NLPExtractionResult(BaseModel):
    phone: str
    customer_name: Optional[str] = None
    customer_id: Optional[str] = None
    vehicle_plate: Optional[str] = None
    vehicle_id: Optional[str] = None
    vehicle_matched: Optional[str] = None
    symptoms_detected: List[str] = []
    recommended_service: str
    estimated_cost: float
    requested_appointment: Optional[str] = None
    sentiment_score: float
    sentiment_label: str
    urgency: str
    intent: str
    suggested_auto_reply: str
    can_auto_book: bool = True


class WhatsAppInteractionResponse(BaseModel):
    id: str
    customer_id: Optional[str] = None
    vehicle_id: Optional[str] = None
    phone: str
    direction: str
    raw_message: str
    nlp_extracted_intent: Optional[str] = None
    nlp_extracted_symptoms: List[str] = []
    nlp_extracted_plate: Optional[str] = None
    sentiment_score: float
    urgency: str
    auto_reply_sent: Optional[str] = None
    booking_id: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class AutoBookRequest(BaseModel):
    phone: str
    customer_name: Optional[str] = None
    plate_number: str
    make: Optional[str] = "Proton"
    model: Optional[str] = "X50"
    service_type: str
    symptoms: Optional[str] = None
    scheduled_date: Optional[str] = None
    estimated_amount: float = 240.00
