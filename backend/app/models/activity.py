import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base


class Activity(Base):
    __tablename__ = "activities"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    deal_id = Column(String(36), ForeignKey("deals.id", ondelete="SET NULL"), nullable=True)
    assigned_to = Column(String(36), ForeignKey("workshop_users.id", ondelete="SET NULL"), nullable=True)
    type = Column(String(30), nullable=False, default="Task") # Task, Call, Meeting, Email
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    due_date = Column(DateTime, nullable=False, index=True)
    status = Column(String(30), nullable=False, default="Pending", index=True) # Pending, Completed, Cancelled
    priority = Column(String(20), nullable=False, default="Normal") # Normal, High, Urgent
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="activities")
    deal = relationship("Deal", back_populates="activities")
