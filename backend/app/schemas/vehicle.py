from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel


class VehicleBase(BaseModel):
    customer_id: str
    plate_number: str
    make: str
    model: str
    year: int
    vin: Optional[str] = None
    transmission: str = "Automatic"
    fuel_type: str = "Petrol"
    current_mileage: int = 0
    daily_mileage_rate: int = 40
    oil_type: str = "Full Synthetic 5W-30"


class VehicleCreate(VehicleBase):
    last_service_date: Optional[datetime] = None
    last_service_mileage: Optional[int] = 0
    next_service_due_date: Optional[datetime] = None
    next_service_due_mileage: Optional[int] = 5000
    maintenance_status: str = "On Track"


class VehicleUpdate(BaseModel):
    plate_number: Optional[str] = None
    make: Optional[str] = None
    model: Optional[str] = None
    year: Optional[int] = None
    vin: Optional[str] = None
    transmission: Optional[str] = None
    fuel_type: Optional[str] = None
    current_mileage: Optional[int] = None
    daily_mileage_rate: Optional[int] = None
    oil_type: Optional[str] = None
    last_service_date: Optional[datetime] = None
    last_service_mileage: Optional[int] = None
    next_service_due_date: Optional[datetime] = None
    next_service_due_mileage: Optional[int] = None
    maintenance_status: Optional[str] = None


class VehicleResponse(VehicleBase):
    id: str
    last_service_date: Optional[datetime] = None
    last_service_mileage: int = 0
    next_service_due_date: Optional[datetime] = None
    next_service_due_mileage: int = 5000
    maintenance_status: str = "On Track"
    created_at: datetime
    updated_at: datetime
    customer_name: Optional[str] = None
    customer_phone: Optional[str] = None

    class Config:
        from_attributes = True
