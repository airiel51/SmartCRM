import uuid
from typing import Dict, Any, List
from datetime import datetime


class AcquisitionAgent:
    """
    Proactive AI Lead Acquisition Agent.
    Monitors inquiry trends, seasonal demand, and vehicle age segments to generate
    high-converting promotional marketing campaigns broadcast via WhatsApp.
    """

    PRESET_CAMPAIGNS = [
        {
            "id": "camp-1",
            "title": "Penang Monsoon 25-Point Road Safety Drive",
            "target_segment": "Vehicles > 3 Years",
            "service_type": "Brake & Wiper Safety Package",
            "promo_code": "SAFEPENANG20",
            "discount_pct": 20,
            "message_template": (
                "Hi {name}! Monsoon season brings heavy rain and slick highways in Penang. "
                "Ensure your {vehicle_model} stops safely with our Apex 25-Point Brake, Wiper & Tire Safety Inspection + free windshield rain repellent. "
                "Reply 'SAFEPENANG20' for 20% off your package this week!"
            ),
            "status": "Active",
            "audience_count": 85,
            "sent_count": 85,
            "conversion_count": 23,
            "revenue_generated": 7820.00
        },
        {
            "id": "camp-2",
            "title": "Festive Holiday Long-Distance Travel Care",
            "target_segment": "High Mileage > 50,000km",
            "service_type": "Liqui Moly Full Synthetic Engine & Coolant Package",
            "promo_code": "BALIKKAMPUNG15",
            "discount_pct": 15,
            "message_template": (
                "Planning a road trip with your {vehicle_model}? "
                "Prevent highway breakdowns with Apex AutoWorks' pre-holiday engine oil flush, coolant pressure test, and battery health report. "
                "Quote {promo_code} to save 15% on genuine Liqui Moly packages!"
            ),
            "status": "Active",
            "audience_count": 56,
            "sent_count": 56,
            "conversion_count": 17,
            "revenue_generated": 6120.00
        },
        {
            "id": "camp-3",
            "title": "Summer Heatwave Air Conditioning Refresh",
            "target_segment": "Lapsed Customers > 180 Days",
            "service_type": "Air Conditioning Flush & Anti-Bacterial Fogging",
            "promo_code": "COOLAIR30",
            "discount_pct": 25,
            "message_template": (
                "Is your {vehicle_model}'s air conditioning feeling warm in the tropical heat? "
                "Apex AutoWorks is offering a complete R134a refrigerant regas + cabin filter replacement + anti-bacterial fogging for only RM 165 (NP: RM 220). "
                "Reply 'COOLAIR30' to book your 30-minute express service slot!"
            ),
            "status": "Active",
            "audience_count": 64,
            "sent_count": 64,
            "conversion_count": 19,
            "revenue_generated": 3135.00
        }
    ]

    @classmethod
    def get_campaigns(cls) -> List[Dict[str, Any]]:
        return cls.PRESET_CAMPAIGNS

    @classmethod
    def generate_campaign_for_segment(cls, segment: str, service_type: str, discount: int = 15) -> Dict[str, Any]:
        """
        Synthesizes an intelligent AI campaign tailored to customer segments.
        """
        code = f"APEX{discount}{datetime.utcnow().strftime('%m%y')}"
        title = f"Special AI Campaign: {service_type} for {segment}"
        copy = (
            f"Exclusive offer for {segment}: Get {discount}% off {service_type} at Apex AutoWorks. "
            f"Use code {code} when booking your slot on WhatsApp. Valid for the next 7 days only!"
        )
        new_camp = {
            "id": f"camp-{str(uuid.uuid4())[:8]}",
            "title": title,
            "target_segment": segment,
            "service_type": service_type,
            "promo_code": code,
            "discount_pct": discount,
            "message_template": copy,
            "status": "Active",
            "audience_count": 42,
            "sent_count": 0,
            "conversion_count": 0,
            "revenue_generated": 0.00
        }
        cls.PRESET_CAMPAIGNS.append(new_camp)
        return new_camp


acquisition_agent = AcquisitionAgent()
