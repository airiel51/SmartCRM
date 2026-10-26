import os
import re
from typing import Dict, Any, Optional
import joblib


class VehicleDiagnosticEngine:
    """
    Automotive Workshop AI Diagnostic & Repair Recommendation Engine.
    Trained on the Kaggle Vehicle Service & Repair Dataset (neerugattivikram/vehicle-service-and-repair-dataset-for-analysis).
    
    When a customer messages with a problem or symptom:
    1. Identifies what is wrong with the car (COMMON PROBLEM / Diagnosed Fault).
    2. Suggests the appropriate workshop repair solution (SOLUTION USED).
    3. Provides parts required, estimated cost (MYR), and technical explanation.
    """

    def __init__(self):
        self.model_path = os.path.join(os.path.dirname(__file__), "models", "diagnostic_model.joblib")
        self.problem_model = None
        self.solution_model = None
        self.component_kb = {}
        self.service_catalog = {}
        self.dataset_source = "Automotive Expert Diagnostic KB (99 Components / 13 Systems)"
        self._load_model()

    def _load_model(self):
        if os.path.exists(self.model_path):
            try:
                bundle = joblib.load(self.model_path)
                self.problem_model = bundle.get("problem_model")
                self.solution_model = bundle.get("solution_model")
                self.component_kb = bundle.get("component_kb", {})
                self.service_catalog = bundle.get("service_catalog", {})
                self.dataset_source = bundle.get("dataset_source", self.dataset_source)
            except Exception as e:
                print(f"[DiagnosticEngine] Warning: Could not load trained joblib model ({e}). Using rule-based fallback.")
        else:
            print("[DiagnosticEngine] Notice: diagnostic_model.joblib not found. Using fallback diagnostics.")

    def diagnose_inquiry(
        self,
        message: str,
        vehicle_make: Optional[str] = None,
        service_history: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Runs ML inference on customer message and vehicle context.
        Returns:
            - system_category: Vehicle subsystem (e.g., ABS System, Emissions System)
            - diagnosed_problem: Faulty subcomponent (What is wrong with the car)
            - problem_confidence: Float confidence
            - recommended_solution: Suggested workshop repair action
            - solution_confidence: Float confidence
            - diagnosis_steps: Step-by-step diagnostic inspection checklist for technician
            - parts_required: Recommended replacement parts
            - estimated_cost: Price in RM
            - diagnostic_explanation: Technical reason for fault
        """
        clean_text = (message or "").strip()
        make = (vehicle_make or "Vehicle").strip()
        history = (service_history or "Regular Service").strip()

        # Fallback defaults
        default_result = {
            "system_category": "General Automotive Systems",
            "diagnosed_problem": "General Maintenance / Inspection Required",
            "problem_confidence": 0.65,
            "recommended_solution": "Diagnostic Scan And Vehicle Inspection",
            "solution_confidence": 0.70,
            "diagnosis_steps": [
                {"step": "Perform OBD-II diagnostic scan", "result": ["Fault codes present", "No codes"]},
                {"step": "Visual inspection of engine bay and fluid levels", "result": ["Abnormalities found", "Normal"]}
            ],
            "parts_required": "Multi-point visual check & OBD-II scanner interrogation",
            "estimated_cost": 150.00,
            "diagnostic_explanation": "Vehicle symptoms require technician inspection and computer code scan.",
            "is_ml_diagnosed": False,
            "model_dataset": self.dataset_source
        }

        if not clean_text:
            return default_result

        # Inference with trained Random Forest pipelines + Knowledge Base hybrid ranker
        if self.problem_model and self.solution_model:
            try:
                import re
                q = f"{make} {clean_text}"
                q_lower = clean_text.lower()
                classes = self.problem_model.classes_
                prob_probs = self.problem_model.predict_proba([q])[0]

                # Score each component combining ML posterior + semantic symptom matches
                best_component = None
                best_score = -1.0
                raw_prob_dict = dict(zip(classes, prob_probs))

                for cls_name in classes:
                    prob = raw_prob_dict.get(cls_name, 0.0)
                    score = prob
                    info = self.component_kb.get(cls_name, {})

                    cls_lower = cls_name.lower()
                    if cls_lower in q_lower:
                        score += 0.35
                    else:
                        tokens = [t for t in re.findall(r"\b\w+\b", cls_lower) if len(t) > 2 and t not in {"and", "the", "system", "for"}]
                        if tokens and all(t in q_lower for t in tokens):
                            score += 0.25
                        elif tokens and any(t in q_lower for t in tokens) and len(tokens) <= 2:
                            score += 0.10

                    # Symptom phrase and token overlaps
                    for s in info.get("symptoms", []):
                        s_lower = s.lower()
                        if s_lower in q_lower:
                            score += 0.30
                        else:
                            s_toks = set(re.findall(r"\b\w+\b", s_lower)) - {"the", "a", "in", "on", "from", "at", "with", "or"}
                            if s_toks:
                                overlap = sum(1 for st in s_toks if st in q_lower)
                                if overlap >= 2:
                                    score += 0.15 * (overlap / len(s_toks))

                    if score > best_score:
                        best_score = score
                        best_component = cls_name

                pred_prob = best_component or self.problem_model.predict([q])[0]
                prob_confidence = round(min(0.98, max(0.65, float(best_score if best_score > 0.4 else raw_prob_dict.get(pred_prob, 0.70)))), 3)

                sol_q = f"{make} {pred_prob} {q} {history}"
                pred_sol = self.solution_model.predict([sol_q])[0]
                sol_probs = self.solution_model.predict_proba([sol_q])[0]
                sol_confidence = round(min(0.99, max(0.70, float(max(sol_probs)))), 3)

                kb_info = self.component_kb.get(pred_prob, {})
                system_category = kb_info.get("category", "Automotive Systems")
                diag_steps = kb_info.get("diagnosis_steps", [
                    {"step": f"Inspect {pred_prob} for wear or damage", "result": ["Damaged/worn", "Good condition"]},
                    {"step": f"Check {system_category} connections and fluid", "result": ["Abnormal", "Normal"]}
                ])
                parts = kb_info.get("parts_required", f"OEM {pred_prob} Components & Labor")
                cost = float(kb_info.get("estimated_cost", 220.00))
                explanation = kb_info.get(
                    "explanation",
                    f"Fault identified in {system_category} ({pred_prob}). Technician inspection recommended."
                )

                return {
                    "system_category": system_category,
                    "diagnosed_problem": pred_prob,
                    "problem_confidence": prob_confidence,
                    "recommended_solution": pred_sol,
                    "solution_confidence": sol_confidence,
                    "diagnosis_steps": diag_steps,
                    "parts_required": parts,
                    "estimated_cost": cost,
                    "diagnostic_explanation": explanation,
                    "is_ml_diagnosed": True,
                    "model_dataset": self.dataset_source
                }
            except Exception as e:
                print(f"[DiagnosticEngine] Inference error: {e}")

        # Rule-based fallback if ML pipeline is unavailable
        return default_result


diagnostic_engine = VehicleDiagnosticEngine()
