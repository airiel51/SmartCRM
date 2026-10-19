import uuid
from datetime import datetime
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Interaction(Base):
    __tablename__ = "interactions"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    channel = Column(String(30), nullable=False, index=True) # Email, Chat, Call, Meeting, Note
    direction = Column(String(20), nullable=False, default="Inbound") # Inbound, Outbound
    subject = Column(String(255), nullable=True)
    raw_content = Column(Text, nullable=False)
    summary = Column(Text, nullable=True)
    sentiment_score = Column(Numeric(4, 3), nullable=False, default=0.000) # -1.0 to 1.0
    meta_info = Column("metadata", JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="interactions")
