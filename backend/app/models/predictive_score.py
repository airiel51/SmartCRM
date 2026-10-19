import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class PredictiveScore(Base):
    __tablename__ = "predictive_scores"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=True, index=True)
    lead_score = Column(Numeric(5, 2), nullable=False, default=75.00) # 0 to 100
    churn_probability = Column(Numeric(4, 3), nullable=False, default=0.150) # 0.000 to 1.000
    retention_risk_level = Column(String(20), nullable=False, default="Low") # Low, Medium, High
    days_overdue = Column(Integer, nullable=False, default=0)
    km_overdue = Column(Integer, nullable=False, default=0)
    model_version = Column(String(50), nullable=False, default="v2.0-automotive-rf")
    risk_factors = Column(JSON, nullable=False, default=list)
    recommended_actions = Column(JSON, nullable=False, default=list)
    generated_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="predictive_scores")
    vehicle = relationship("Vehicle", back_populates="predictive_scores")
