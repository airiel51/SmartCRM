from app.schemas.customer import CustomerBase, CustomerCreate, CustomerUpdate, CustomerResponse, VehicleBrief
from app.schemas.vehicle import VehicleBase, VehicleCreate, VehicleUpdate, VehicleResponse
from app.schemas.service_record import ServiceRecordBase, ServiceRecordCreate, ServiceRecordUpdate, ServiceRecordResponse
from app.schemas.whatsapp import WhatsAppInboundMessage, NLPExtractionResult, WhatsAppInteractionResponse, AutoBookRequest
from app.schemas.deal import DealBase, DealCreate, DealUpdate, DealResponse
from app.schemas.interaction import InteractionBase, InteractionCreate, InteractionResponse
from app.schemas.activity import ActivityBase, ActivityCreate, ActivityUpdate, ActivityResponse
from app.schemas.ai import (
    PredictiveAuditResponse, CopilotQueryRequest, CopilotQueryResponse, RecommendedAction,
    RetentionScanResponse, OverdueVehicleItem, SendReminderRequest, SendReminderResponse,
    CampaignCreateRequest, BusinessStrategistReportResponse
)

__all__ = [
    "CustomerBase", "CustomerCreate", "CustomerUpdate", "CustomerResponse", "VehicleBrief",
    "VehicleBase", "VehicleCreate", "VehicleUpdate", "VehicleResponse",
    "ServiceRecordBase", "ServiceRecordCreate", "ServiceRecordUpdate", "ServiceRecordResponse",
    "WhatsAppInboundMessage", "NLPExtractionResult", "WhatsAppInteractionResponse", "AutoBookRequest",
    "DealBase", "DealCreate", "DealUpdate", "DealResponse",
    "InteractionBase", "InteractionCreate", "InteractionResponse",
    "ActivityBase", "ActivityCreate", "ActivityUpdate", "ActivityResponse",
    "PredictiveAuditResponse", "CopilotQueryRequest", "CopilotQueryResponse", "RecommendedAction",
    "RetentionScanResponse", "OverdueVehicleItem", "SendReminderRequest", "SendReminderResponse",
    "CampaignCreateRequest", "BusinessStrategistReportResponse"
]
