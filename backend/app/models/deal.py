import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base


class Deal(Base):
    __tablename__ = "deals"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String(200), nullable=False)
    value = Column(Numeric(14, 2), nullable=False, default=0.00)
    stage = Column(String(50), nullable=False, default="Lead", index=True) # Lead, Qualified, Proposal, Negotiation, Closed Won, Closed Lost
    win_probability = Column(Integer, nullable=False, default=20)
    expected_close_date = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="deals")
    activities = relationship("Activity", back_populates="deal")
