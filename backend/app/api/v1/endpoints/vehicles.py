from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.vehicle import Vehicle
from app.models.customer import Customer
from app.models.mileage_log import MileageLog
from app.schemas.vehicle import VehicleCreate, VehicleUpdate, VehicleResponse

router = APIRouter()


@router.get("", response_model=List[VehicleResponse])
def get_vehicles(
    search: Optional[str] = Query(None, description="Search by plate number, make or model"),
    maintenance_status: Optional[str] = Query(None, description="Filter by On Track, Due Soon, Overdue"),
    db: Session = Depends(get_db)
):
    query = db.query(Vehicle)
    if search:
        s = f"%{search.strip()}%"
        query = query.filter(
            (Vehicle.plate_number.ilike(s)) |
            (Vehicle.make.ilike(s)) |
            (Vehicle.model.ilike(s))
        )
    if maintenance_status:
        query = query.filter(Vehicle.maintenance_status == maintenance_status)

    vehicles = query.all()
    # Enrich response with customer details
    results = []
    for v in vehicles:
        res = VehicleResponse.model_validate(v)
        if v.customer:
            res.customer_name = v.customer.full_name
            res.customer_phone = v.customer.phone
        results.append(res)
    return results


@router.get("/{vehicle_id}", response_model=VehicleResponse)
def get_vehicle_by_id(vehicle_id: str, db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")
    res = VehicleResponse.model_validate(v)
    if v.customer:
        res.customer_name = v.customer.full_name
        res.customer_phone = v.customer.phone
    return res


@router.post("", response_model=VehicleResponse, status_code=201)
def register_vehicle(data: VehicleCreate, db: Session = Depends(get_db)):
    # Check customer exists
    cust = db.query(Customer).filter(Customer.id == data.customer_id).first()
    if not cust:
        raise HTTPException(status_code=404, detail="Associated customer not found")

    # Check plate uniqueness
    existing = db.query(Vehicle).filter(Vehicle.plate_number.ilike(data.plate_number.strip())).first()
    if existing:
        raise HTTPException(status_code=400, detail="Vehicle plate number already registered")

    vehicle = Vehicle(
        customer_id=data.customer_id,
        plate_number=data.plate_number.strip().upper(),
        make=data.make,
        model=data.model,
        year=data.year,
        vin=data.vin,
        transmission=data.transmission,
        fuel_type=data.fuel_type,
        current_mileage=data.current_mileage,
        daily_mileage_rate=data.daily_mileage_rate,
        oil_type=data.oil_type,
        last_service_date=data.last_service_date,
        last_service_mileage=data.last_service_mileage,
        next_service_due_date=data.next_service_due_date,
        next_service_due_mileage=data.next_service_due_mileage,
        maintenance_status=data.maintenance_status
    )
    db.add(vehicle)
    db.flush()

    # Log initial mileage
    if data.current_mileage > 0:
        log = MileageLog(
            vehicle_id=vehicle.id,
            mileage=data.current_mileage,
            source="Vehicle Registration Intake"
        )
        db.add(log)

    db.commit()
    db.refresh(vehicle)
    res = VehicleResponse.model_validate(vehicle)
    res.customer_name = cust.full_name
    res.customer_phone = cust.phone
    return res


@router.patch("/{vehicle_id}/odometer", response_model=VehicleResponse)
def update_odometer(vehicle_id: str, new_mileage: int = Query(..., ge=0), notes: Optional[str] = Query(None), db: Session = Depends(get_db)):
    v = db.query(Vehicle).filter(Vehicle.id == vehicle_id).first()
    if not v:
        raise HTTPException(status_code=404, detail="Vehicle not found")

    v.current_mileage = new_mileage
    # Recalculate status
    if new_mileage >= v.next_service_due_mileage:
        v.maintenance_status = "Overdue"
    elif (v.next_service_due_mileage - new_mileage) <= 500:
        v.maintenance_status = "Due Soon"
    else:
        v.maintenance_status = "On Track"

    # Add mileage log
    log = MileageLog(
        vehicle_id=v.id,
        mileage=new_mileage,
        source="Shop-Floor Inspection Update",
        notes=notes
    )
    db.add(log)
    db.commit()
    db.refresh(v)

    res = VehicleResponse.model_validate(v)
    if v.customer:
        res.customer_name = v.customer.full_name
        res.customer_phone = v.customer.phone
    return res
