from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class InteractionBase(BaseModel):
    customer_id: str
    channel: str # Email, Chat, Call, Meeting, Note
    direction: str = "Inbound"
    subject: Optional[str] = None
    raw_content: str
    summary: Optional[str] = None
    sentiment_score: float = 0.0
    meta_info: Dict[str, Any] = {}


class InteractionCreate(BaseModel):
    customer_id: str
    channel: str
    direction: Optional[str] = "Inbound"
    subject: Optional[str] = None
    raw_content: str
    meta_info: Optional[Dict[str, Any]] = {}


class InteractionResponse(InteractionBase):
    id: str
    created_at: datetime

    class Config:
        from_attributes = True
