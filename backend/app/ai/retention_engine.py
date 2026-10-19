import uuid
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.core.config import settings


class RetentionEngine:
    """
    Autonomous Agentic AI Retention Engine.
    Monitors vehicle maintenance lifecycles, service intervals (oil, brakes, major),
    identifies overdue accounts, computes churn risks, and triggers automated
    interval-based maintenance reminders via WhatsApp.
    """

    @classmethod
    def evaluate_vehicle_maintenance(cls, vehicle_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Calculates days overdue, km overdue, maintenance status, and recommended service.
        """
        now = datetime.utcnow()
        current_mileage = vehicle_data.get("current_mileage", 0)
        last_service_mileage = vehicle_data.get("last_service_mileage", 0)
        next_due_mileage = vehicle_data.get("next_service_due_mileage", last_service_mileage + settings.INTERVAL_OIL_KM)
        
        last_service_date = vehicle_data.get("last_service_date")
        if isinstance(last_service_date, str):
            try:
                last_service_date = datetime.fromisoformat(last_service_date.replace("Z", "+00:00"))
                if last_service_date.tzinfo is not None:
                    last_service_date = last_service_date.replace(tzinfo=None)
            except Exception:
                last_service_date = None

        next_due_date = vehicle_data.get("next_service_due_date")
        if isinstance(next_due_date, str):
            try:
                next_due_date = datetime.fromisoformat(next_due_date.replace("Z", "+00:00"))
                if next_due_date.tzinfo is not None:
                    next_due_date = next_due_date.replace(tzinfo=None)
            except Exception:
                next_due_date = None

        if not next_due_date and last_service_date:
            next_due_date = last_service_date + timedelta(days=settings.INTERVAL_OIL_DAYS)

        # Calculate overdue metrics
        km_overdue = max(0, current_mileage - next_due_mileage)
        days_overdue = 0
        if next_due_date:
            days_diff = (now - next_due_date).days
            days_overdue = max(0, days_diff)

        # Determine maintenance status
        if km_overdue > 0 or days_overdue > 0:
            status = "Overdue"
            risk = "High" if (days_overdue > 30 or km_overdue > 2000) else "Medium"
        elif next_due_date and (next_due_date - now).days <= 14 or (next_due_mileage - current_mileage) <= 500:
            status = "Due Soon"
            risk = "Medium"
        else:
            status = "On Track"
            risk = "Low"

        # Determine recommended service package based on mileage milestone
        if current_mileage >= 80000:
            rec_service = "Major 80,000km Transmission, Timing Belt & Fluids Overhaul"
            est_cost = 680.00
        elif current_mileage >= 40000:
            rec_service = "Major 40,000km Spark Plug, Brake & Gearbox Inspection"
            est_cost = 450.00
        elif current_mileage >= 20000:
            rec_service = "20,000km Brake Pad Replacement & Rotor Skimming"
            est_cost = 280.00
        else:
            rec_service = "Full Synthetic 5,000km Periodic Oil & Filter Service"
            est_cost = 240.00

        # Draft WhatsApp Reminder Message
        cust_name = vehicle_data.get("customer_name", "Valued Customer")
        plate = vehicle_data.get("plate_number", "your vehicle")
        model = f"{vehicle_data.get('make', '')} {vehicle_data.get('model', '')}".strip() or "Vehicle"

        if status == "Overdue":
            reminder_text = (
                f"Salam & Hello {cust_name}! This is Airiel from Apex AutoWorks.\n\n"
                f"Our SmartCRM maintenance tracker indicates your {model} ({plate}) is currently {days_overdue} days / {km_overdue}km overdue for its {rec_service}.\n\n"
                f"Delaying engine lubrication or brake servicing can lead to premature mechanical wear. "
                f"We have reserved priority Bay 1 for you this week. Book today and receive a complimentary 25-point safety inspection!\n\n"
                f"Reply 'BOOK' to secure your preferred slot."
            )
        elif status == "Due Soon":
            reminder_text = (
                f"Hi {cust_name}! Friendly reminder from Apex AutoWorks: your {model} ({plate}) is approaching its service interval ({rec_service}).\n\n"
                f"Would you like us to prepare the parts and schedule a smooth 45-minute pit-stop service this weekend?\n\n"
                f"Reply with your preferred day or call us at +60 12-456 7890."
            )
        else:
            reminder_text = f"Hi {cust_name}! Your {model} ({plate}) is on track. Next service expected around {next_due_date.strftime('%d %b %Y') if next_due_date else 'in 3 months'}."

        return {
            "vehicle_id": vehicle_data.get("id"),
            "customer_id": vehicle_data.get("customer_id"),
            "customer_name": cust_name,
            "phone": vehicle_data.get("phone", ""),
            "plate_number": plate,
            "vehicle_model": model,
            "current_mileage": current_mileage,
            "last_service_date": last_service_date.isoformat() if last_service_date else None,
            "next_service_due_date": next_due_date.isoformat() if next_due_date else None,
            "days_overdue": days_overdue,
            "km_overdue": km_overdue,
            "maintenance_status": status,
            "churn_risk": risk,
            "recommended_service": rec_service,
            "estimated_cost": est_cost,
            "reminder_draft": reminder_text
        }

    @classmethod
    def scan_fleet(cls, vehicles_list: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Runs an autonomous retention scan over the entire fleet.
        """
        evaluated = [cls.evaluate_vehicle_maintenance(v) for v in vehicles_list]
        overdue = [v for v in evaluated if v["maintenance_status"] == "Overdue"]
        due_soon = [v for v in evaluated if v["maintenance_status"] == "Due Soon"]
        on_track = [v for v in evaluated if v["maintenance_status"] == "On Track"]

        return {
            "total_vehicles_scanned": len(vehicles_list),
            "overdue_count": len(overdue),
            "due_soon_count": len(due_soon),
            "on_track_count": len(on_track),
            "overdue_vehicles": overdue,
            "due_soon_vehicles": due_soon,
            "scan_timestamp": datetime.utcnow().isoformat()
        }


retention_engine = RetentionEngine()
