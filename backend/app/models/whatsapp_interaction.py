import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class WhatsAppInteraction(Base):
    __tablename__ = "whatsapp_interactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="SET NULL"), nullable=True, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="SET NULL"), nullable=True, index=True)
    phone = Column(String(50), nullable=False, index=True)
    direction = Column(String(20), nullable=False, default="Inbound") # Inbound, Outbound
    raw_message = Column(Text, nullable=False)
    nlp_extracted_intent = Column(String(100), nullable=True) # Service Booking, Symptom Consultation, etc.
    nlp_extracted_symptoms = Column(JSON, nullable=False, default=list) # ["squeaking brakes", "engine noise"]
    nlp_extracted_plate = Column(String(30), nullable=True) # e.g. "PNG 4419"
    sentiment_score = Column(Numeric(4, 3), nullable=False, default=0.000) # -1.0 to +1.0
    urgency = Column(String(20), nullable=False, default="Normal") # Normal, High, Urgent
    auto_reply_sent = Column(Text, nullable=True)
    booking_id = Column(String(36), ForeignKey("service_records.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    customer = relationship("Customer", back_populates="whatsapp_interactions")
