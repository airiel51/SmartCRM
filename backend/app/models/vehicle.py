import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class Vehicle(Base):
    __tablename__ = "vehicles"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    plate_number = Column(String(30), unique=True, nullable=False, index=True) # e.g. "PNG 4419", "WXY 8821"
    make = Column(String(50), nullable=False) # e.g. "Honda", "Toyota", "Proton", "Perodua"
    model = Column(String(80), nullable=False) # e.g. "Civic RS 1.5 Turbo"
    year = Column(Integer, nullable=False)
    vin = Column(String(50), nullable=True)
    transmission = Column(String(20), nullable=False, default="Automatic") # Automatic, Manual, CVT, DCT
    fuel_type = Column(String(20), nullable=False, default="Petrol")
    current_mileage = Column(Integer, nullable=False, default=0)
    daily_mileage_rate = Column(Integer, nullable=False, default=40)
    oil_type = Column(String(50), nullable=False, default="Full Synthetic 5W-30")
    last_service_date = Column(DateTime, nullable=True)
    last_service_mileage = Column(Integer, nullable=False, default=0)
    next_service_due_date = Column(DateTime, nullable=True)
    next_service_due_mileage = Column(Integer, nullable=False, default=5000)
    maintenance_status = Column(String(30), nullable=False, default="On Track") # On Track, Due Soon, Overdue
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="vehicles")
    service_records = relationship("ServiceRecord", back_populates="vehicle", cascade="all, delete-orphan")
    mileage_logs = relationship("MileageLog", back_populates="vehicle", cascade="all, delete-orphan")
    predictive_scores = relationship("PredictiveScore", back_populates="vehicle", cascade="all, delete-orphan")
