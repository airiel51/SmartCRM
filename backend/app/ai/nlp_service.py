import re
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta


class NLPService:
    """
    Automotive Workshop WhatsApp Natural Language Processing (NLP) Extraction Engine.
    Converts unstructured customer chat inquiries into structured service bookings,
    extracts vehicle symptoms, detects car license plates and models, scores sentiment,
    and drafts automated confirmation replies with quotes.
    """

    # Common vehicle makes in Malaysian & regional automotive markets
    VEHICLE_MAKES = [
        "perodua", "proton", "honda", "toyota", "nissan", "mazda", "bmw",
        "mercedes", "hyundai", "kia", "volkswagen", "mitsubishi", "ford", "subaru"
    ]

    VEHICLE_MODELS = {
        "perodua": ["myvi", "bezza", "axia", "ativa", "alza", "aruz"],
        "proton": ["x50", "x70", "saga", "persona", "iriz", "exora", "s70"],
        "honda": ["civic", "city", "cr-v", "hr-v", "accord", "jazz", "br-v"],
        "toyota": ["vios", "yaris", "corolla", "camry", "hilux", "innova", "cross", "fortuner"],
        "nissan": ["almera", "serena", "x-trail", "navara"],
        "mazda": ["mazda 2", "mazda 3", "mazda 6", "cx-3", "cx-5", "cx-30"],
        "bmw": ["320i", "330i", "520i", "530i", "x1", "x3", "x5", "m sport"]
    }

    # Symptom to Service Category Mapping
    SYMPTOM_SERVICE_MAP = [
        {
            "keywords": ["brake", "squeak", "squeal", "grind", "stopping", "pedal spongy", "pad"],
            "symptom": "Brake System Friction & Squeaking Noise",
            "service": "Brake Pad & Rotor Inspection & Replacement",
            "estimated_cost": 280.00,
            "parts": "Ceramic Brake Pads & Rotor Skimming"
        },
        {
            "keywords": ["oil", "engine oil", "lube", "filter", "service interval", "periodic service", "mileage service"],
            "symptom": "Periodic Maintenance Interval Due",
            "service": "Full Synthetic Engine Oil & Filter Service",
            "estimated_cost": 240.00,
            "parts": "Liqui Moly 5W-30 Full Synthetic (4L) + OEM Oil Filter"
        },
        {
            "keywords": ["aircond", "air con", "air-con", "ac", "not cold", "warm air", "hot air", "blower", "refrigerant"],
            "symptom": "Air Conditioning Lukewarm / Not Cooling",
            "service": "Air Conditioning System Flush & R134a Re-gas",
            "estimated_cost": 210.00,
            "parts": "R134a Refrigerant + Cabin Pollen Filter"
        },
        {
            "keywords": ["vibrat", "shake", "shaking", "check engine", "yellow light", "warning light", "misfire", "rough idle"],
            "symptom": "Engine Vibration & Warning Light Alert",
            "service": "OBD-II Computer Diagnostic & Spark Plug Inspection",
            "estimated_cost": 180.00,
            "parts": "Diagnostic Scan + Iridium Spark Plugs"
        },
        {
            "keywords": ["battery", "dead", "jumpstart", "alternator", "crank", "won't start", "no power"],
            "symptom": "Battery Weak / Vehicle Failure to Crank",
            "service": "Battery Health Test & AGM/EFB Replacement",
            "estimated_cost": 320.00,
            "parts": "Maintenance-Free Automotive Battery"
        },
        {
            "keywords": ["gearbox", "transmission", "jerk", "gear slip", "atf", "cvt fluid"],
            "symptom": "Transmission Hesitation or Jerking",
            "service": "Transmission / Gearbox Fluid Flush",
            "estimated_cost": 350.00,
            "parts": "Synthetic ATF/CVT Fluid + Transmission Filter"
        },
        {
            "keywords": ["tire", "tyre", "alignment", "camber", "pulling", "balancing"],
            "symptom": "Steering Pulling / Uneven Tire Wear",
            "service": "Laser Wheel Alignment & 4-Wheel Balancing",
            "estimated_cost": 95.00,
            "parts": "Wheel Weights & Laser Alignment Calibration"
        }
    ]

    POSITIVE_WORDS = {
        "great", "excellent", "love", "awesome", "fantastic", "happy", "pleased",
        "impressed", "smooth", "thank", "thanks", "terima kasih", "good", "perfect",
        "reliable", "fast", "best", "satisfied", "appreciate"
    }

    NEGATIVE_WORDS = {
        "bad", "terrible", "awful", "unhappy", "frustrated", "delay", "slow",
        "broken", "fail", "expensive", "disappointed", "poor", "leak", "jerk",
        "shaking", "vibrating", "squeaking", "noise", "smoke", "hot", "emergency", "stuck"
    }

    URGENT_WORDS = {
        "urgent", "immediately", "asap", "critical", "emergency", "stuck",
        "cannot drive", "warning light", "overheating", "towing", "breakdown"
    }

    KNOWN_MODEL_CODES = {"X50", "X70", "X90", "S70", "CX3", "CX5", "CX30", "CX8", "M3", "M4", "M5", "G20", "G30", "F30", "W205", "W213", "C200", "E200", "E300", "A200", "A250"}

    @classmethod
    def extract_license_plate(cls, text: str) -> Optional[str]:
        """
        Extracts Malaysian automotive license plate numbers (e.g. WXY 8821, PNG 4419, VAB 2020, JRS 7731, KV 5502, BQP 9912).
        Prioritizes explicit keywords ('plate', 'plat') and distinguishes from car model codes.
        """
        # 1. Check explicit keyword: e.g. "plate VAB 2020", "plat WXY8821"
        explicit_match = re.search(r'(?:plate|plat|no\s*plat|car\s*plate|registration)\s*[:#]?\s*([A-Za-z]{1,3}\s*\d{1,4}(?:\s*[A-Za-z])?)\b', text, re.IGNORECASE)
        if explicit_match:
            candidate = explicit_match.group(1).strip().upper()
            parts = re.split(r'(\d+)', candidate)
            if len(parts) >= 2 and parts[1].isdigit():
                letters = parts[0].strip()
                digits = parts[1].strip()
                trailing = parts[2].strip() if len(parts) > 2 else ""
                clean_candidate = f"{letters} {digits}{trailing}".strip()
                code_check = f"{letters}{digits}"
                if code_check not in cls.KNOWN_MODEL_CODES and len(letters) >= 1:
                    return clean_candidate

        # 2. General scan across text
        pattern = r"\b([A-Z]{1,3}\s*\d{1,4}\s*[A-Z]?)\b"
        matches = re.findall(pattern, text, re.IGNORECASE)
        candidates = []
        for m in matches:
            cleaned = m.strip().upper()
            parts = re.split(r"(\d+)", cleaned)
            if len(parts) >= 2 and parts[1].isdigit():
                letters = parts[0].strip()
                digits = parts[1].strip()
                trailing = parts[2].strip() if len(parts) > 2 else ""
                formatted = f"{letters} {digits}{trailing}".strip()
                code_check = f"{letters}{digits}"
                if code_check not in cls.KNOWN_MODEL_CODES and len(digits) >= 1 and len(letters) >= 1:
                    candidates.append((formatted, len(digits)))

        if candidates:
            # Sort by digit count descending (real plates usually have 3-4 digits, e.g. 2020, 8821)
            candidates.sort(key=lambda x: x[1], reverse=True)
            return candidates[0][0]

        return None

    @classmethod
    def extract_vehicle_make_model(cls, text: str) -> Dict[str, Optional[str]]:
        """Identifies vehicle make and model from text."""
        clean_text = text.lower()
        found_make = None
        found_model = None

        for make, models in cls.VEHICLE_MODELS.items():
            if make in clean_text:
                found_make = make.capitalize()
                for mod in models:
                    if mod in clean_text:
                        found_model = mod.upper() if len(mod) <= 4 else mod.title()
                        break
                break

        if not found_make:
            # Check models directly if user omitted make (e.g. "my Myvi is making noise")
            for make, models in cls.VEHICLE_MODELS.items():
                for mod in models:
                    if f" {mod} " in f" {clean_text} ":
                        found_make = make.capitalize()
                        found_model = mod.upper() if len(mod) <= 4 else mod.title()
                        break
                if found_make:
                    break

        return {"make": found_make, "model": found_model}

    @classmethod
    def extract_appointment_time(cls, text: str) -> Optional[str]:
        """Extracts desired appointment time from chat."""
        clean_text = text.lower()
        days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday", "tomorrow", "today"]
        times = ["morning", "afternoon", "evening", "10am", "11am", "2pm", "3pm", "4pm", "2:30pm", "10:30am"]

        found_day = None
        found_time = None

        for d in days:
            if d in clean_text:
                found_day = d.capitalize()
                break

        for t in times:
            if t in clean_text:
                found_time = t.upper()
                break

        if found_day and found_time:
            return f"{found_day} at {found_time}"
        elif found_day:
            return f"{found_day} (Time to confirm with PIC)"
        elif found_time:
            return f"Upcoming slot at {found_time}"
        return "Next Available Service Bay Slot"

    @classmethod
    def analyze_chat(cls, text: str, phone: str = "+60 12-000 0000", customer_name: Optional[str] = None) -> Dict[str, Any]:
        """
        Full NLP parsing pass on incoming WhatsApp message:
        Extracts plate, make, model, symptoms, recommended service, sentiment, urgency,
        and generates an automated WhatsApp reply message.
        """
        if not text:
            return {
                "phone": phone,
                "sentiment_score": 0.0,
                "sentiment_label": "Neutral",
                "urgency": "Normal",
                "intent": "General Inquiry",
                "recommended_service": "General Vehicle Inspection",
                "estimated_cost": 50.00,
                "suggested_auto_reply": "Hi! Thank you for contacting Apex AutoWorks. How can we assist your vehicle today?"
            }

        clean_text = text.lower()
        words = re.findall(r"\b\w+\b", clean_text)
        total_words = len(words) or 1

        # 1. Sentiment & Urgency
        pos_count = sum(1 for w in words if w in cls.POSITIVE_WORDS)
        neg_count = sum(1 for w in words if w in cls.NEGATIVE_WORDS)
        urgent_count = sum(1 for w in words if w in cls.URGENT_WORDS)

        raw_score = (pos_count - neg_count) / max(total_words * 0.15, 1.0)
        sentiment_score = max(-1.0, min(1.0, round(raw_score, 3)))

        if sentiment_score > 0.10:
            sentiment_label = "Positive"
        elif sentiment_score < -0.10:
            sentiment_label = "Negative"
        else:
            sentiment_label = "Neutral"

        if urgent_count > 0 or "asap" in clean_text or "critical" in clean_text or "breakdown" in clean_text:
            urgency = "Urgent"
        elif neg_count >= 2:
            urgency = "High"
        else:
            urgency = "Normal"

        # 2. Extract Entities
        plate = cls.extract_license_plate(text)
        car_info = cls.extract_vehicle_make_model(text)
        make = car_info["make"]
        model = car_info["model"]
        appointment = cls.extract_appointment_time(text)

        # 3. ML Vehicle Diagnostic & Solution Inference (Kaggle-Trained Model)
        from app.ai.diagnostic_engine import diagnostic_engine
        
        ml_diag = diagnostic_engine.diagnose_inquiry(
            message=text,
            vehicle_make=make,
            service_history="Regular Maintenance"
        )
        
        system_category = ml_diag.get("system_category", "Automotive Systems")
        diagnosed_problem = ml_diag.get("diagnosed_problem", "General Maintenance / Inspection Required")
        problem_confidence = ml_diag.get("problem_confidence", 0.70)
        recommended_service = ml_diag.get("recommended_solution", "Periodic Vehicle Inspection & Maintenance")
        solution_confidence = ml_diag.get("solution_confidence", 0.75)
        diagnosis_steps = ml_diag.get("diagnosis_steps", [])
        estimated_cost = ml_diag.get("estimated_cost", 180.00)
        parts_summary = ml_diag.get("parts_required", "Multi-point safety inspection")
        diagnostic_explanation = ml_diag.get("diagnostic_explanation", "Routine diagnostic assessment recommended.")

        symptoms_detected = [diagnosed_problem]
        for mapping in cls.SYMPTOM_SERVICE_MAP:
            for kw in mapping["keywords"]:
                if kw in clean_text:
                    if mapping["symptom"] not in symptoms_detected:
                        symptoms_detected.append(mapping["symptom"])
                    break

        # 4. Intent Classification
        if any(w in clean_text for w in ["book", "appointment", "drop by", "come in", "slot", "bring"]):
            intent = "Service Booking Request"
        elif any(w in clean_text for w in ["how much", "price", "cost", "quote", "rate"]):
            intent = "Price & Quote Inquiry"
        elif any(w in clean_text for w in ["reschedule", "change time", "cancel"]):
            intent = "Appointment Reschedule"
        else:
            intent = "Symptom Consultation"

        # 5. Build Vehicle Matched String
        if make and model:
            veh_str = f"{make} {model}"
        elif make:
            veh_str = make
        elif model:
            veh_str = model
        else:
            veh_str = "your vehicle"

        if plate:
            veh_str += f" ({plate})"

        # 6. Generate Automated WhatsApp Reply with Diagnosis & Suggested Solution
        client_greeting = f"Hi {customer_name}" if customer_name else "Hello"
        reply = (
            f"{client_greeting}! Thank you for contacting Apex AutoWorks & Diagnostic Centre.\n\n"
            f"🔍 *AI Diagnosis for {veh_str}*:\n"
            f"• Subsystem: {system_category}\n"
            f"• Component Identified: {diagnosed_problem} ({int(problem_confidence * 100)}% match)\n"
            f"• Assessment: {diagnostic_explanation}\n\n"
            f"🛠️ *Suggested Workshop Solution*:\n"
            f"• Package: {recommended_service} ({int(solution_confidence * 100)}% match)\n"
            f"• Parts & Labor: {parts_summary}\n"
            f"• Estimated Quote: RM {estimated_cost:.2f}\n"
            f"• Bay Slot: {appointment}\n\n"
            f"Our PIC Airiel has reserved a preliminary bay slot for you. "
            f"Please reply 'CONFIRM' to finalize your booking, or let us know if you prefer a different time!"
        )

        return {
            "phone": phone,
            "customer_name": customer_name,
            "vehicle_plate": plate,
            "vehicle_make": make,
            "vehicle_model": model,
            "vehicle_matched": veh_str,
            "symptoms_detected": symptoms_detected,
            "system_category": system_category,
            "diagnosed_problem": diagnosed_problem,
            "problem_confidence": problem_confidence,
            "recommended_service": recommended_service,
            "solution_confidence": solution_confidence,
            "diagnosis_steps": diagnosis_steps,
            "parts_required": parts_summary,
            "diagnostic_explanation": diagnostic_explanation,
            "is_ml_diagnosed": True,
            "estimated_cost": estimated_cost,
            "requested_appointment": appointment,
            "sentiment_score": sentiment_score,
            "sentiment_label": sentiment_label,
            "urgency": urgency,
            "intent": intent,
            "suggested_auto_reply": reply,
            "can_auto_book": True
        }


nlp_service = NLPService()
