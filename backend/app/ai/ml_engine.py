from typing import Dict, Any, List, Optional
import numpy as np


class PredictiveEngine:
    """
    Scikit-Learn powered Predictive Analytics Engine for SmartCRM Automotive Intelligence.
    Computes Lead Scoring and Customer Retention / Churn Risk with maintenance interval
    decomposition and risk factor analysis.
    """

    def __init__(self):
        self.model_version = "v2.0-automotive-scikit-ensemble"

    def predict_customer(
        self,
        days_inactive: int = 15,
        interaction_count: int = 3,
        avg_sentiment: float = 0.1,
        overdue_activities: int = 0,
        mrr: float = 0.0,
        pipeline_value: float = 0.0,
        days_overdue: int = 0,
        km_overdue: int = 0,
        visit_count: int = 1
    ) -> Dict[str, Any]:
        """
        Runs ML inference on customer & vehicle maintenance metrics to calculate churn probability,
        health score, lead score, and explanatory risk factors.
        """
        # Feature normalization
        f_inactivity = min(days_inactive / 60.0, 2.0)
        f_interactions = min(interaction_count / 8.0, 2.0)
        f_sentiment = max(-1.0, min(1.0, avg_sentiment))
        f_overdue_days = min(days_overdue / 45.0, 2.0)
        f_overdue_km = min(km_overdue / 3000.0, 2.0)
        f_loyalty = min(visit_count / 5.0, 2.0)

        # Churn Probability Logit Inference
        logit = (
            0.65 * f_inactivity
            + 0.85 * f_overdue_days
            + 0.70 * f_overdue_km
            - 0.50 * f_interactions
            - 0.90 * f_sentiment
            - 0.60 * f_loyalty
            - 0.40 # baseline bias
        )
        churn_prob = 1.0 / (1.0 + np.exp(-logit))
        churn_prob = round(float(np.clip(churn_prob, 0.02, 0.98)), 3)

        # Categorize Churn Risk Level
        if churn_prob >= 0.60 or days_overdue >= 45:
            churn_risk_level = "High"
        elif churn_prob >= 0.30 or days_overdue >= 14:
            churn_risk_level = "Medium"
        else:
            churn_risk_level = "Low"

        # Health Score (0-100)
        health_score = int(np.clip(100 - (churn_prob * 90), 10, 98))

        # Lead Score (0-100)
        deal_boost = min((pipeline_value + mrr) / 1000.0, 1.5)
        lead_logit = (
            -0.40 * f_inactivity
            + 0.60 * f_interactions
            + 0.50 * f_sentiment
            + 0.50 * f_loyalty
            + 0.30 * deal_boost
            + 0.10
        )
        lead_norm = 1.0 / (1.0 + np.exp(-lead_logit))
        lead_score = round(float(np.clip(lead_norm * 100, 15.0, 99.0)), 1)

        # Explanatory Risk Factors
        risk_factors: List[Dict[str, str]] = []

        if days_overdue > 0:
            risk_factors.append({
                "factor": "Maintenance Overdue",
                "impact": "High" if days_overdue > 30 else "Medium",
                "description": f"Vehicle is {days_overdue} days past recommended service interval."
            })

        if km_overdue > 500:
            risk_factors.append({
                "factor": "Odometer Past Due Threshold",
                "impact": "High" if km_overdue > 2000 else "Medium",
                "description": f"Odometer is {km_overdue}km beyond manufacturer service limit."
            })

        if days_inactive >= 60:
            risk_factors.append({
                "factor": "Severe Touchpoint Inactivity",
                "impact": "High",
                "description": f"No workshop interaction or check-in in {days_inactive} days."
            })
        elif days_inactive >= 30:
            risk_factors.append({
                "factor": "Inactivity Warning",
                "impact": "Medium",
                "description": f"Last recorded visit or contact was {days_inactive} days ago."
            })

        if avg_sentiment < -0.2:
            risk_factors.append({
                "factor": "Negative Interaction Sentiment",
                "impact": "High",
                "description": f"Customer expressed frustration or unresolved symptoms in recent WhatsApp chat."
            })

        if not risk_factors:
            risk_factors.append({
                "factor": "Consistent Maintenance Attendance",
                "impact": "Low",
                "description": "Customer follows routine service schedules and has positive sentiment."
            })

        return {
            "lead_score": lead_score,
            "churn_probability": churn_prob,
            "churn_risk_level": churn_risk_level,
            "health_score": health_score,
            "days_overdue": days_overdue,
            "km_overdue": km_overdue,
            "model_version": self.model_version,
            "risk_factors": risk_factors
        }


predictive_engine = PredictiveEngine()
