from typing import List, Dict, Any, Optional
from datetime import datetime
from pydantic import BaseModel


class RiskFactor(BaseModel):
    factor: str
    impact: str # High, Medium, Low
    description: str


class RecommendedAction(BaseModel):
    id: str
    action_type: str # whatsapp_reminder, call, service_booking, promo_offer
    title: str
    description: str
    customer_id: str
    vehicle_id: Optional[str] = None
    priority: str = "High"
    payload: Dict[str, Any] = {}


class PredictiveAuditResponse(BaseModel):
    customer_id: str
    vehicle_id: Optional[str] = None
    lead_score: float
    churn_probability: float
    churn_risk_level: str
    health_score: int
    days_overdue: int = 0
    km_overdue: int = 0
    model_version: str
    risk_factors: List[RiskFactor] = []
    recommended_actions: List[RecommendedAction] = []
    generated_at: datetime


class OverdueVehicleItem(BaseModel):
    vehicle_id: str
    customer_id: str
    customer_name: str
    phone: str
    plate_number: str
    vehicle_model: str
    current_mileage: int
    last_service_date: Optional[str] = None
    next_service_due_date: Optional[str] = None
    days_overdue: int
    km_overdue: int
    maintenance_status: str
    churn_risk: str
    recommended_service: str
    reminder_draft: str


class RetentionScanResponse(BaseModel):
    total_vehicles_scanned: int
    overdue_count: int
    due_soon_count: int
    on_track_count: int
    overdue_vehicles: List[OverdueVehicleItem] = []
    scan_timestamp: datetime


class SendReminderRequest(BaseModel):
    vehicle_id: str
    customer_id: str
    phone: str
    message: str


class SendReminderResponse(BaseModel):
    success: bool
    phone: str
    message_sent: str
    interaction_id: str
    timestamp: datetime


class CampaignCreateRequest(BaseModel):
    title: str
    target_segment: str
    service_type: str
    promo_code: str
    discount_pct: int = 15
    message_template: str


class BusinessStrategistReportResponse(BaseModel):
    report_type: str
    repeat_service_rate: float
    monthly_revenue: float
    active_fleet_count: int
    overdue_vehicle_count: int
    demand_forecast: Dict[str, Any]
    parts_inventory_alerts: List[Dict[str, Any]]
    pricing_recommendations: List[Dict[str, Any]]
    high_churn_accounts: List[Dict[str, Any]]
    generated_at: datetime


class CopilotQueryRequest(BaseModel):
    query: str
    context_customer_id: Optional[str] = None
    context_vehicle_id: Optional[str] = None


class CopilotActionExecutionRequest(BaseModel):
    action_id: str
    action_type: str
    customer_id: str
    vehicle_id: Optional[str] = None
    payload: Dict[str, Any] = {}


class CopilotQueryResponse(BaseModel):
    reply: str
    intent: str
    data: Optional[Dict[str, Any]] = None
    suggested_actions: List[RecommendedAction] = []
