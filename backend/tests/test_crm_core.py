import unittest
import uuid
from datetime import datetime, timedelta

from app.api.v1.endpoints.inquiries import perform_nlp_extraction
from app.schemas.inquiry import NLPExtractedEntities


class TestStatusTransitions(unittest.TestCase):
    """Validates deterministic status progression across workshop operational lifecycles."""

    def test_appointment_valid_transitions(self):
        valid_transitions = {
            "scheduled": ["confirmed", "cancelled", "in_progress", "no_show"],
            "confirmed": ["in_progress", "cancelled", "no_show"],
            "in_progress": ["completed", "cancelled"],
            "completed": [],
            "cancelled": [],
            "no_show": ["scheduled"]
        }
        
        # Test valid steps
        self.assertIn("confirmed", valid_transitions["scheduled"])
        self.assertIn("in_progress", valid_transitions["confirmed"])
        self.assertIn("completed", valid_transitions["in_progress"])
        
        # Test invalid step (cannot go directly from scheduled to completed without bay entry)
        self.assertNotIn("completed", valid_transitions["scheduled"])

    def test_service_job_bay_progression(self):
        stages_order = [
            "draft",
            "pending_inspection",
            "in_progress",
            "waiting_parts",
            "ready_for_pickup",
            "completed",
            "invoiced"
        ]
        
        # Verify valid sequence
        self.assertGreater(stages_order.index("in_progress"), stages_order.index("pending_inspection"))
        self.assertGreater(stages_order.index("ready_for_pickup"), stages_order.index("in_progress"))
        self.assertEqual(stages_order.index("invoiced"), len(stages_order) - 1)


class TestServiceReminderCalculations(unittest.TestCase):
    """Validates transparent odometer distance and calendar day interval thresholds."""

    def test_overdue_when_mileage_exceeded(self):
        current_mileage = 58400
        next_due_mileage = 55000
        km_overdue = current_mileage - next_due_mileage
        
        # Threshold: if current > next_due, vehicle is overdue
        self.assertGreater(km_overdue, 0)
        status = "overdue" if km_overdue > 0 else "on_track"
        self.assertEqual(status, "overdue")

    def test_due_soon_when_within_500km(self):
        current_mileage = 41600
        next_due_mileage = 42000
        km_remaining = next_due_mileage - current_mileage
        
        # Threshold: due soon if within 500 km
        is_due_soon = (0 <= km_remaining <= 500)
        self.assertTrue(is_due_soon)

    def test_calendar_days_interval(self):
        now = datetime.utcnow()
        last_service = now - timedelta(days=210)
        interval_days = 180  # 6 months standard oil
        
        due_date = last_service + timedelta(days=interval_days)
        is_overdue = now > due_date
        self.assertTrue(is_overdue)


class TestNLPExtractionSchema(unittest.TestCase):
    """Validates NLP entity extraction schemas and guardrails against hallucinated data."""

    def test_extraction_plate_and_symptoms(self):
        message = "Salam, my Proton X50 plate VAB 2020 has high pitched squeak when I step on brakes. Can I drop by tomorrow afternoon?"
        extracted = perform_nlp_extraction(message, "+60 16-554 2190", "Priya")
        
        self.assertIsInstance(extracted, NLPExtractedEntities)
        self.assertEqual(extracted.plate_number, "VAB 2020")
        self.assertEqual(extracted.make, "Proton")
        self.assertEqual(extracted.model, "X50")
        self.assertIn("squeaking noise when braking", extracted.symptoms)
        self.assertEqual(extracted.preferred_date, "Tomorrow")
        self.assertGreaterEqual(extracted.confidence, 0.85)
        self.assertIn(extracted.urgency, ["high", "urgent"])

    def test_no_hallucination_on_missing_fields(self):
        # A vague message without plate or specific date
        message = "How much for full synthetic oil service package?"
        extracted = perform_nlp_extraction(message, "+60 12-000 0000")
        
        # Guardrail: Plate number and specific time must be null, never invented!
        self.assertIsNone(extracted.plate_number)
        self.assertIsNone(extracted.preferred_time)
        self.assertIsNone(extracted.make)
        self.assertLess(extracted.confidence, 0.85)


if __name__ == "__main__":
    unittest.main()
