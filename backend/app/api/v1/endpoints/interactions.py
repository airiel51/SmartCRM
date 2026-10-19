from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.interaction import Interaction
from app.models.customer import Customer
from app.schemas.interaction import InteractionCreate, InteractionResponse
from app.ai.nlp_service import nlp_service

router = APIRouter()


@router.get("/", response_model=List[InteractionResponse])
def get_interactions(
    customer_id: Optional[str] = None,
    channel: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: Session = Depends(get_db)
):
    """Retrieve interaction timeline logs."""
    query = db.query(Interaction)
    if customer_id:
        query = query.filter(Interaction.customer_id == customer_id)
    if channel:
        query = query.filter(Interaction.channel == channel)

    return query.order_by(Interaction.created_at.desc()).offset(skip).limit(limit).all()


@router.post("/", response_model=InteractionResponse, status_code=201)
def log_interaction(payload: InteractionCreate, db: Session = Depends(get_db)):
    """
    Ingest multichannel interaction log (Email, Chat, Call, Meeting, Note).
    Automatically runs NLP sentiment scoring and updates customer state.
    """
    customer = db.query(Customer).filter(Customer.id == payload.customer_id).first()
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found.")

    # 1. Run NLP Sentiment Analysis
    nlp_result = nlp_service.analyze_text(payload.raw_content)
    sentiment_score = nlp_result["sentiment_score"]
    sentiment_label = nlp_result["sentiment_label"]
    intent = nlp_result["key_intent"]

    meta = payload.meta_info or {}
    meta["detected_intent"] = intent
    meta["urgency"] = nlp_result["urgency"]

    # 2. Persist Interaction
    interaction = Interaction(
        customer_id=payload.customer_id,
        channel=payload.channel,
        direction=payload.direction or "Inbound",
        subject=payload.subject,
        raw_content=payload.raw_content,
        summary=f"[{intent}] {payload.raw_content[:90]}...",
        sentiment_score=sentiment_score,
        meta_info=meta
    )
    db.add(interaction)

    # 3. Update Customer's touchpoint timestamp & sentiment state
    customer.last_contacted_at = datetime.utcnow()
    customer.sentiment = sentiment_label

    db.commit()
    db.refresh(interaction)
    return interaction
