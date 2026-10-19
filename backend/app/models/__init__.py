from app.models.user import User
from app.models.customer import Customer
from app.models.vehicle import Vehicle
from app.models.service_record import ServiceRecord
from app.models.mileage_log import MileageLog
from app.models.whatsapp_interaction import WhatsAppInteraction
from app.models.ai_campaign import AICampaign
from app.models.predictive_score import PredictiveScore
from app.models.deal import Deal
from app.models.activity import Activity
from app.models.interaction import Interaction

__all__ = [
    "User",
    "Customer",
    "Vehicle",
    "ServiceRecord",
    "MileageLog",
    "WhatsAppInteraction",
    "AICampaign",
    "PredictiveScore",
    "Deal",
    "Activity",
    "Interaction",
]
