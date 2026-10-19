import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class MileageLog(Base):
    __tablename__ = "mileage_logs"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    mileage = Column(Integer, nullable=False)
    source = Column(String(50), nullable=False, default="Workshop Inspection") # Inspection, WhatsApp, Service
    notes = Column(Text, nullable=True)
    recorded_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)

    # Relationships
    vehicle = relationship("Vehicle", back_populates="mileage_logs")
