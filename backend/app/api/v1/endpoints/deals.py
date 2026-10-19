from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.deal import Deal
from app.models.customer import Customer
from app.schemas.deal import DealCreate, DealUpdate, DealResponse

router = APIRouter()


class StageUpdatePayload(BaseModel):
    stage: str
    win_probability: Optional[int] = None


@router.get("/", response_model=List[DealResponse])
def get_deals(
    customer_id: Optional[str] = None,
    stage: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """List all pipeline opportunities, optionally filtered by customer or stage."""
    query = db.query(Deal)
    if customer_id:
        query = query.filter(Deal.customer_id == customer_id)
    if stage:
        query = query.filter(Deal.stage == stage)
    return query.order_by(Deal.created_at.desc()).all()


@router.post("/", response_model=DealResponse, status_code=201)
def create_deal(payload: DealCreate, db: Session = Depends(get_db)):
    """Create a new sales deal attached to an existing customer."""
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Associated customer does not exist.")

    deal = Deal(
        customer_id=payload.customer_id,
        title=payload.title,
        value=payload.value,
        stage=payload.stage,
        win_probability=payload.win_probability,
        expected_close_date=payload.expected_close_date
    )
    db.add(deal)
    db.commit()
    db.refresh(deal)
    return deal


@router.patch("/{deal_id}/stage", response_model=DealResponse)
def update_deal_stage(deal_id: str, payload: StageUpdatePayload, db: Session = Depends(get_db)):
    """Move deal to another Kanban stage, auto-calculating win probabilities."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")

    deal.stage = payload.stage

    # Stage default probabilities
    stage_probs = {
        "Lead": 20,
        "Qualified": 40,
        "Proposal": 60,
        "Negotiation": 80,
        "Closed Won": 100,
        "Closed Lost": 0
    }

    if payload.win_probability is not None:
        deal.win_probability = payload.win_probability
    elif payload.stage in stage_probs:
        deal.win_probability = stage_probs[payload.stage]

    if payload.stage in ["Closed Won", "Closed Lost"]:
        deal.closed_at = datetime.utcnow()
    else:
        deal.closed_at = None

    db.commit()
    db.refresh(deal)
    return deal


@router.put("/{deal_id}", response_model=DealResponse)
def update_deal(deal_id: str, payload: DealUpdate, db: Session = Depends(get_db)):
    """Update deal details."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(deal, field, value)

    db.commit()
    db.refresh(deal)
    return deal


@router.delete("/{deal_id}", status_code=204)
def delete_deal(deal_id: str, db: Session = Depends(get_db)):
    """Delete a deal."""
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found.")

    db.delete(deal)
    db.commit()
    return None
