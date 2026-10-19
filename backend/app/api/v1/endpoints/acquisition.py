from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.ai_campaign import AICampaign
from app.ai.acquisition_agent import acquisition_agent
from app.schemas.ai import CampaignCreateRequest

router = APIRouter()


@router.get("/campaigns")
def get_campaigns(db: Session = Depends(get_db)):
    db_camps = db.query(AICampaign).all()
    if not db_camps:
        return acquisition_agent.get_campaigns()
    return db_camps


@router.post("/generate")
def generate_campaign(
    segment: str = Query(..., description="Target segment, e.g. 'Vehicles > 3 Years'"),
    service_type: str = Query(..., description="Service package, e.g. 'Brake Safety Package'"),
    discount_pct: int = Query(15, ge=5, le=50),
    db: Session = Depends(get_db)
):
    camp = acquisition_agent.generate_campaign_for_segment(segment, service_type, discount_pct)
    db_camp = AICampaign(
        title=camp["title"],
        target_segment=camp["target_segment"],
        service_type=camp["service_type"],
        promo_code=camp["promo_code"],
        discount_pct=camp["discount_pct"],
        message_template=camp["message_template"],
        status="Active",
        audience_count=camp["audience_count"]
    )
    db.add(db_camp)
    db.commit()
    db.refresh(db_camp)
    return db_camp


@router.post("/{campaign_id}/broadcast")
def broadcast_campaign(campaign_id: str, db: Session = Depends(get_db)):
    camp = db.query(AICampaign).filter(AICampaign.id == campaign_id).first()
    if not camp:
        # Check in memory preset
        for p in acquisition_agent.PRESET_CAMPAIGNS:
            if p["id"] == campaign_id:
                p["sent_count"] = p["audience_count"]
                return {
                    "success": True,
                    "message": f"Broadcasted '{p['title']}' to {p['audience_count']} customer WhatsApp threads.",
                    "sent_count": p["sent_count"]
                }
        raise HTTPException(status_code=404, detail="Campaign not found")

    camp.sent_count = camp.audience_count
    db.commit()
    return {
        "success": True,
        "message": f"Broadcasted '{camp.title}' to {camp.audience_count} customer WhatsApp threads.",
        "sent_count": camp.sent_count
    }
