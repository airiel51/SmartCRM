import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Customer(Base):
    __tablename__ = "customers"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    full_name = Column(String(120), nullable=False)
    phone = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=True, index=True)
    address = Column(Text, nullable=True)
    customer_type = Column(String(30), nullable=False, default="Individual") # Individual, Fleet, VIP
    status = Column(String(50), nullable=False, default="Active") # Active, Due Soon, Overdue, Churned
    health_score = Column(Integer, nullable=False, default=85) # 0 to 100
    churn_risk = Column(String(20), nullable=False, default="Low") # Low, Medium, High
    sentiment = Column(String(20), nullable=False, default="Positive") # Positive, Neutral, Negative
    total_spent = Column(Numeric(12, 2), nullable=False, default=0.00)
    visit_count = Column(Integer, nullable=False, default=1)
    tags = Column(JSON, nullable=False, default=list)
    notes = Column(Text, nullable=True)
    last_visit_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    vehicles = relationship("Vehicle", back_populates="customer", cascade="all, delete-orphan")
    service_records = relationship("ServiceRecord", back_populates="customer", cascade="all, delete-orphan")
    whatsapp_interactions = relationship("WhatsAppInteraction", back_populates="customer", cascade="all, delete-orphan")
    predictive_scores = relationship("PredictiveScore", back_populates="customer", cascade="all, delete-orphan")
    deals = relationship("Deal", back_populates="customer", cascade="all, delete-orphan")
    activities = relationship("Activity", back_populates="customer", cascade="all, delete-orphan")
    interactions = relationship("Interaction", back_populates="customer", cascade="all, delete-orphan")

    # Compatibility properties for legacy views
    @property
    def name(self):
        return self.full_name

    @property
    def company(self):
        # Return first vehicle plate/model or Individual
        if self.vehicles and len(self.vehicles) > 0:
            return f"{self.vehicles[0].make} {self.vehicles[0].model} ({self.vehicles[0].plate_number})"
        return "Private Vehicle Owner"

    @property
    def mrr(self):
        return self.total_spent
