import uuid
from typing import Dict, Any, List
from datetime import datetime, timedelta
from app.ai.ml_engine import predictive_engine


class CustomerAuditState:
    """State object passing between LangGraph agent nodes."""
    def __init__(self, customer_data: Dict[str, Any]):
        self.customer_data = customer_data
        self.metrics: Dict[str, Any] = {}
        self.predictions: Dict[str, Any] = {}
        self.recommendations: List[Dict[str, Any]] = []
        self.audit_log: List[str] = []


class LangGraphOrchestrator:
    """
    Multi-Agent Orchestrator following the LangGraph StateGraph design.
    Cycles through:
      Audit Monitor Node -> Risk Assessment Node -> Action Recommender Node -> Dispatcher Node
    """

    def audit_monitor_node(self, state: CustomerAuditState) -> CustomerAuditState:
        """Step 1: Ingests telemetry, vehicle odometer readings, and maintenance intervals."""
        cust = state.customer_data
        now = datetime.utcnow()

        last_contact = cust.get("last_contacted_at") or cust.get("last_visit_at")
        if isinstance(last_contact, str):
            try:
                last_contact = datetime.fromisoformat(last_contact.replace("Z", "+00:00"))
            except Exception:
                last_contact = None

        if last_contact:
            if last_contact.tzinfo is not None:
                last_contact = last_contact.replace(tzinfo=None)
            days_inactive = max(0, (now - last_contact).days)
        else:
            days_inactive = 30

        state.metrics = {
            "days_inactive": days_inactive,
            "interaction_count": cust.get("interaction_count", 3),
            "avg_sentiment": cust.get("avg_sentiment", 0.1),
            "overdue_activities": cust.get("overdue_activities", 0),
            "mrr": float(cust.get("total_spent", cust.get("mrr", 0.0))),
            "pipeline_value": float(cust.get("pipeline_value", 0.0)),
            "days_overdue": int(cust.get("days_overdue", 0)),
            "km_overdue": int(cust.get("km_overdue", 0)),
            "visit_count": int(cust.get("visit_count", 1)),
            "company": cust.get("company", "Vehicle Owner"),
            "name": cust.get("full_name", cust.get("name", "Customer")),
            "phone": cust.get("phone", ""),
            "plate_number": cust.get("plate_number", "")
        }
        state.audit_log.append(f"AuditMonitorNode: Evaluated {days_inactive} days inactivity, {state.metrics['days_overdue']} days overdue.")
        return state

    def risk_assessment_node(self, state: CustomerAuditState) -> CustomerAuditState:
        """Step 2: Executes ML inference for Churn Risk and Lead Scoring."""
        m = state.metrics
        preds = predictive_engine.predict_customer(
            days_inactive=m["days_inactive"],
            interaction_count=m["interaction_count"],
            avg_sentiment=m["avg_sentiment"],
            overdue_activities=m["overdue_activities"],
            mrr=m["mrr"],
            pipeline_value=m["pipeline_value"],
            days_overdue=m["days_overdue"],
            km_overdue=m["km_overdue"],
            visit_count=m["visit_count"]
        )
        state.predictions = preds
        state.audit_log.append(
            f"RiskAssessmentNode: Predicted Churn Risk={preds['churn_risk_level']} ({preds['churn_probability'] * 100:.1f}%), Lead Score={preds['lead_score']}"
        )
        return state

    def action_recommender_node(self, state: CustomerAuditState) -> CustomerAuditState:
        """Step 3: Synthesizes intelligent workshop actions based on retention profile."""
        m = state.metrics
        preds = state.predictions
        cust_id = state.customer_data.get("id", str(uuid.uuid4()))
        name = m["name"]
        phone = m["phone"]
        plate = m["plate_number"] or "Vehicle"

        recs = []

        # High Churn Risk or Overdue Maintenance: Trigger Automated WhatsApp Reminder
        if preds["churn_risk_level"] == "High" or m["days_overdue"] > 14:
            reminder_msg = (
                f"Salam {name}, this is Airiel from Apex AutoWorks. "
                f"Our records show your vehicle {plate} is overdue for scheduled maintenance. "
                f"Avoid unexpected engine wear—we have reserved Bay 1 for you this week with RM30 off our Liqui Moly synthetic service package. "
                f"Reply 'BOOK' to reserve your slot!"
            )
            recs.append({
                "id": str(uuid.uuid4()),
                "action_type": "whatsapp_reminder",
                "customer_id": cust_id,
                "priority": "Urgent",
                "title": f"Send Automated WhatsApp Service Reminder ({plate})",
                "description": f"Vehicle is {m['days_overdue']} days overdue. 1-click sends tailored WhatsApp reminder to {phone}.",
                "payload": {
                    "phone": phone,
                    "message": reminder_msg
                }
            })

            recs.append({
                "id": str(uuid.uuid4()),
                "action_type": "call",
                "customer_id": cust_id,
                "priority": "Urgent",
                "title": f"PIC Direct Call to {name}",
                "description": "Call customer to address potential satisfaction issues or mechanical concerns.",
                "payload": {
                    "phone": phone,
                    "due_date": (datetime.utcnow() + timedelta(days=1)).isoformat()
                }
            })

        # Medium Risk / Due Soon: Proactive Care Package
        elif preds["churn_risk_level"] == "Medium" or m["days_overdue"] > 0:
            recs.append({
                "id": str(uuid.uuid4()),
                "action_type": "whatsapp_reminder",
                "customer_id": cust_id,
                "priority": "High",
                "title": f"Send Maintenance Approaching Notice ({plate})",
                "description": f"Vehicle is approaching service interval. Send gentle WhatsApp prompt.",
                "payload": {
                    "phone": phone,
                    "message": f"Hi {name}! Friendly reminder from Apex AutoWorks: your {plate} is due for routine service soon. Reply with your preferred day to schedule a priority bay!"
                }
            })

        # High Loyalty & On Track: Promotional Upsell
        if preds["lead_score"] >= 80:
            recs.append({
                "id": str(uuid.uuid4()),
                "action_type": "promo_offer",
                "customer_id": cust_id,
                "priority": "Normal",
                "title": f"Offer VIP Multi-Point Safety Check & Rain Repellent",
                "description": "High engagement customer. Offer complimentary seasonal perk to reinforce loyalty.",
                "payload": {
                    "phone": phone,
                    "promo_code": "VIPCARE"
                }
            })

        if not recs:
            recs.append({
                "id": str(uuid.uuid4()),
                "action_type": "whatsapp_reminder",
                "customer_id": cust_id,
                "priority": "Normal",
                "title": f"Routine Maintenance Check-in ({plate})",
                "description": "Account is healthy. Maintain loyalty with scheduled reminder.",
                "payload": {
                    "phone": phone,
                    "message": f"Hi {name}, hope your {plate} is running smoothly! Let us know if you need any mechanical advice."
                }
            })

        state.recommendations = recs
        state.audit_log.append(f"ActionRecommenderNode: Generated {len(recs)} prioritized workshop recommendations.")
        return state

    def run_workflow(self, customer_data: Dict[str, Any]) -> Dict[str, Any]:
        """Runs the LangGraph agent state pipeline end-to-end."""
        state = CustomerAuditState(customer_data)
        state = self.audit_monitor_node(state)
        state = self.risk_assessment_node(state)
        state = self.action_recommender_node(state)

        return {
            "customer_id": customer_data.get("id"),
            "lead_score": state.predictions["lead_score"],
            "churn_probability": state.predictions["churn_probability"],
            "churn_risk_level": state.predictions["churn_risk_level"],
            "health_score": state.predictions["health_score"],
            "days_overdue": state.predictions.get("days_overdue", 0),
            "km_overdue": state.predictions.get("km_overdue", 0),
            "model_version": state.predictions["model_version"],
            "risk_factors": state.predictions["risk_factors"],
            "recommended_actions": state.recommendations,
            "generated_at": datetime.utcnow().isoformat(),
            "audit_trail": state.audit_log
        }


langgraph_orchestrator = LangGraphOrchestrator()
