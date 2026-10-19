from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.ai.business_strategist import business_strategist
from app.schemas.ai import BusinessStrategistReportResponse

router = APIRouter()


@router.get("/report", response_model=BusinessStrategistReportResponse)
def get_business_strategist_report(db: Session = Depends(get_db)):
    """
    Generates an executive AI business strategist report analyzing repeat-service rate,
    monthly workshop revenue trajectory, predictive parts demand, pricing optimization,
    and high-risk churn intervention accounts.
    """
    customer_count = db.query(Customer).count()
    vehicle_count = db.query(Vehicle).count()
    overdue_count = db.query(Vehicle).filter(Vehicle.maintenance_status == "Overdue").count()

    report = business_strategist.generate_strategist_report(
        customer_count=customer_count,
        vehicle_count=vehicle_count,
        overdue_count=overdue_count
    )
    return BusinessStrategistReportResponse(**report)
