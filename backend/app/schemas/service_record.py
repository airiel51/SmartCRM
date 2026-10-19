from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class ServiceRecordBase(BaseModel):
    customer_id: str
    vehicle_id: str
    service_type: str
    odometer_reading: int = 0
    service_bay: str = "Bay 1"
    stage: str = "Scheduled" # 'Inquiry', 'Scheduled', 'In Progress', 'Quality Inspection', 'Ready for Pickup', 'Completed', 'Invoiced'
    symptoms_reported: Optional[str] = None
    diagnosis: Optional[str] = None
    parts_list: List[Dict[str, Any]] = []
    labor_cost: float = 80.00
    parts_cost: float = 160.00
    total_amount: float = 240.00
    payment_status: str = "Pending"
    scheduled_date: Optional[datetime] = None
    technician_notes: Optional[str] = None


class ServiceRecordCreate(ServiceRecordBase):
    pass


class ServiceRecordUpdate(BaseModel):
    service_type: Optional[str] = None
    odometer_reading: Optional[int] = None
    service_bay: Optional[str] = None
    stage: Optional[str] = None
    symptoms_reported: Optional[str] = None
    diagnosis: Optional[str] = None
    parts_list: Optional[List[Dict[str, Any]]] = None
    labor_cost: Optional[float] = None
    parts_cost: Optional[float] = None
    total_amount: Optional[float] = None
    payment_status: Optional[str] = None
    scheduled_date: Optional[datetime] = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    technician_notes: Optional[str] = None


class ServiceRecordResponse(ServiceRecordBase):
    id: str
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None
    vehicle_plate: Optional[str] = None
    vehicle_model: Optional[str] = None
    title: Optional[str] = None # legacy alias
    value: Optional[float] = None # legacy alias
    win_probability: Optional[int] = None # legacy alias

    class Config:
        from_attributes = True
