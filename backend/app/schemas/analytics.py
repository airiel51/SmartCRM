from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel


class DateRangeFilter(BaseModel):
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    period: Optional[str] = "30d"  # today, 7d, 30d, 90d, year, all


class WorkshopMetrics(BaseModel):
    total_customers: int = 0
    active_vehicles: int = 0
    today_appointments: int = 0
    open_service_jobs: int = 0
    due_reminders: int = 0
    overdue_reminders: int = 0
    new_inquiries: int = 0
    total_revenue_period: float = 0.0
    paid_revenue_period: float = 0.0
    pending_revenue_period: float = 0.0
    completed_jobs_count: int = 0
    avg_ticket_value: float = 0.0
    currency_symbol: str = "RM"


class StageBreakdownItem(BaseModel):
    stage: str
    count: int
    total_value: float


class RevenueByServiceType(BaseModel):
    service_type: str
    count: int
    revenue: float


class DailyRevenueItem(BaseModel):
    date: str
    revenue: float
    job_count: int


class BayOccupancyItem(BaseModel):
    bay: str
    current_job_id: Optional[str] = None
    plate_number: Optional[str] = None
    service_type: Optional[str] = None
    stage: Optional[str] = None
    is_occupied: bool = False


class AnalyticsOverviewResponse(BaseModel):
    metrics: WorkshopMetrics
    stage_breakdown: List[StageBreakdownItem] = []
    revenue_by_service: List[RevenueByServiceType] = []
    daily_revenue: List[DailyRevenueItem] = []
    bay_occupancy: List[BayOccupancyItem] = []
    generated_at: datetime
    is_empty_dataset: bool = False
