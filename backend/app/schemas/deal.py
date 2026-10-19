from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class DealBase(BaseModel):
    customer_id: str
    title: str
    value: float = 0.0
    stage: str = "Lead"
    win_probability: int = 20
    expected_close_date: Optional[datetime] = None


class DealCreate(DealBase):
    pass


class DealUpdate(BaseModel):
    title: Optional[str] = None
    value: Optional[float] = None
    stage: Optional[str] = None
    win_probability: Optional[int] = None
    expected_close_date: Optional[datetime] = None
    closed_at: Optional[datetime] = None


class DealResponse(DealBase):
    id: str
    closed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
