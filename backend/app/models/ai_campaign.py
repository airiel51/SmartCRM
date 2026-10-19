import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Text
from app.core.database import Base


class AICampaign(Base):
    __tablename__ = "ai_campaigns"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = Column(String(200), nullable=False)
    target_segment = Column(String(100), nullable=False)
    service_type = Column(String(100), nullable=False)
    promo_code = Column(String(30), nullable=False)
    discount_pct = Column(Integer, nullable=False, default=15)
    message_template = Column(Text, nullable=False)
    status = Column(String(30), nullable=False, default="Active") # Draft, Active, Completed
    audience_count = Column(Integer, nullable=False, default=0)
    sent_count = Column(Integer, nullable=False, default=0)
    conversion_count = Column(Integer, nullable=False, default=0)
    revenue_generated = Column(Numeric(12, 2), nullable=False, default=0.00)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)
