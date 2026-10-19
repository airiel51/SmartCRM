from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field


class VehicleBrief(BaseModel):
    id: str
    plate_number: str
    make: str
    model: str
    year: int
    current_mileage: int
    maintenance_status: str
    next_service_due_date: Optional[datetime] = None
    next_service_due_mileage: int = 5000

    class Config:
        from_attributes = True


class CustomerBase(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None # alias
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    customer_type: str = "Individual"
    company: Optional[str] = None # alias
    status: str = "Active"
    health_score: int = 85
    churn_risk: str = "Low"
    sentiment: str = "Positive"
    total_spent: float = 0.0
    mrr: Optional[float] = 0.0 # legacy alias
    visit_count: int = 1
    tags: List[str] = []
    notes: Optional[str] = None


class CustomerCreate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    customer_type: str = "Individual"
    company: Optional[str] = None
    status: str = "Active"
    health_score: int = 85
    churn_risk: str = "Low"
    sentiment: str = "Positive"
    total_spent: float = 0.0
    mrr: Optional[float] = 0.0
    tags: List[str] = []
    notes: Optional[str] = None
    # Optional vehicle to register during intake
    vehicle_plate: Optional[str] = None
    vehicle_make: Optional[str] = None
    vehicle_model: Optional[str] = None
    vehicle_year: Optional[int] = 2021
    vehicle_mileage: Optional[int] = 0


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    name: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    customer_type: Optional[str] = None
    company: Optional[str] = None
    status: Optional[str] = None
    health_score: Optional[int] = None
    churn_risk: Optional[str] = None
    sentiment: Optional[str] = None
    total_spent: Optional[float] = None
    mrr: Optional[float] = None
    tags: Optional[List[str]] = None
    notes: Optional[str] = None


class CustomerResponse(BaseModel):
    id: str
    full_name: str
    name: str # computed alias
    phone: str
    email: Optional[str] = None
    address: Optional[str] = None
    customer_type: str = "Individual"
    company: str # computed alias
    status: str
    health_score: int
    churn_risk: str
    sentiment: str
    total_spent: float
    mrr: float # computed alias
    visit_count: int
    tags: List[str] = []
    notes: Optional[str] = None
    last_visit_at: Optional[datetime] = None
    last_contacted_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    vehicles: List[VehicleBrief] = []

    class Config:
        from_attributes = True
