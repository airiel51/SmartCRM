from typing import Optional
from datetime import datetime
from pydantic import BaseModel


class ActivityBase(BaseModel):
    customer_id: str
    deal_id: Optional[str] = None
    assigned_to: Optional[str] = None
    type: str = "Task" # Task, Call, Meeting, Email
    title: str
    description: Optional[str] = None
    due_date: datetime
    status: str = "Pending" # Pending, Completed, Cancelled
    priority: str = "Normal" # Normal, High, Urgent


class ActivityCreate(ActivityBase):
    pass


class ActivityUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    status: Optional[str] = None
    priority: Optional[str] = None
    completed_at: Optional[datetime] = None


class ActivityResponse(ActivityBase):
    id: str
    completed_at: Optional[datetime] = None
    created_at: datetime

    class Config:
        from_attributes = True
