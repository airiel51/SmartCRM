import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Numeric, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import relationship
from app.core.database import Base


class ServiceRecord(Base):
    __tablename__ = "service_records"

    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    customer_id = Column(String(36), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False, index=True)
    vehicle_id = Column(String(36), ForeignKey("vehicles.id", ondelete="CASCADE"), nullable=False, index=True)
    technician_id = Column(String(36), ForeignKey("workshop_users.id", ondelete="SET NULL"), nullable=True)
    service_type = Column(String(100), nullable=False) # e.g. "Full Synthetic Engine Oil Service"
    odometer_reading = Column(Integer, nullable=False, default=0)
    service_bay = Column(String(30), nullable=False, default="Bay 1")
    stage = Column(String(50), nullable=False, default="Scheduled", index=True) 
    # Stages: 'Inquiry', 'Scheduled', 'In Progress', 'Quality Inspection', 'Ready for Pickup', 'Completed', 'Invoiced'
    symptoms_reported = Column(Text, nullable=True)
    diagnosis = Column(Text, nullable=True)
    parts_list = Column(JSON, nullable=False, default=list) # [{ name, qty, unit_price }]
    labor_cost = Column(Numeric(10, 2), nullable=False, default=80.00)
    parts_cost = Column(Numeric(10, 2), nullable=False, default=160.00)
    total_amount = Column(Numeric(10, 2), nullable=False, default=240.00)
    payment_status = Column(String(30), nullable=False, default="Pending") # Pending, Paid, Partial
    scheduled_date = Column(DateTime, nullable=False, default=datetime.utcnow)
    started_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    technician_notes = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    # Relationships
    customer = relationship("Customer", back_populates="service_records")
    vehicle = relationship("Vehicle", back_populates="service_records")

    # Compatibility properties for legacy deal pipeline
    @property
    def title(self):
        v_plate = self.vehicle.plate_number if self.vehicle else "Vehicle"
        return f"{self.service_type} - {v_plate}"

    @property
    def value(self):
        return self.total_amount

    @property
    def win_probability(self):
        stage_map = {
            "Inquiry": 25,
            "Scheduled": 60,
            "In Progress": 85,
            "Quality Inspection": 95,
            "Ready for Pickup": 98,
            "Completed": 100,
            "Invoiced": 100
        }
        return stage_map.get(self.stage, 50)
