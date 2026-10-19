from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.activity import Activity
from app.models.customer import Customer
from app.schemas.activity import ActivityCreate, ActivityUpdate, ActivityResponse

router = APIRouter()


@router.get("/", response_model=List[ActivityResponse])
def get_activities(
    customer_id: Optional[str] = None,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List scheduled activities, follow-ups, and tasks."""
    query = db.query(Activity)
    if customer_id:
        query = query.filter(Activity.customer_id == customer_id)
    if status:
        query = query.filter(Activity.status == status)
    if priority:
        query = query.filter(Activity.priority == priority)

    return query.order_by(Activity.due_date.asc()).all()


@router.post("/", response_model=ActivityResponse, status_code=201)
def create_activity(payload: ActivityCreate, db: Session = Depends(get_db)):
    """Create a new activity or reminder."""
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    activity = Activity(
        customer_id=payload.customer_id,
        deal_id=payload.deal_id,
        assigned_to=payload.assigned_to,
        type=payload.type,
        title=payload.title,
        description=payload.description,
        due_date=payload.due_date,
        status=payload.status,
        priority=payload.priority
    )
    db.add(activity)
    db.commit()
    db.refresh(activity)
    return activity


@router.patch("/{activity_id}/complete", response_model=ActivityResponse)
def complete_activity(activity_id: str, db: Session = Depends(get_db)):
    """Mark an activity as completed."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found.")

    activity.status = "Completed"
    activity.completed_at = datetime.utcnow()
    db.commit()
    db.refresh(activity)
    return activity


@router.delete("/{activity_id}", status_code=204)
def delete_activity(activity_id: str, db: Session = Depends(get_db)):
    """Delete an activity."""
    activity = db.query(Activity).filter(Activity.id == activity_id).first()
    if not activity:
        raise HTTPException(status_code=404, detail="Activity not found.")

    db.delete(activity)
    db.commit()
    return None
