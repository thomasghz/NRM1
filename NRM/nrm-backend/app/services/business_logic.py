"""
NRM Business Logic
All computed fields and domain rules live here so they are testable
independently from the database layer.
"""
from datetime import date
from typing import Optional


ZONE_MAP = [
    (1, 4, "Low"),
    (5, 9, "Medium"),
    (10, 19, "High"),
    (20, 25, "Critical"),
]


def risk_zone(score: Optional[int]) -> Optional[str]:
    if score is None:
        return None
    for low, high, label in ZONE_MAP:
        if low <= score <= high:
            return label
    return "Critical" if score > 25 else "Low"


def compute_overall_consequence(*values: Optional[int]) -> Optional[int]:
    valid = [v for v in values if v is not None]
    return max(valid) if valid else None


def compute_irl(likelihood: Optional[int], *consequence_dims: Optional[int]) -> Optional[int]:
    oc = compute_overall_consequence(*consequence_dims)
    if likelihood is None or oc is None:
        return None
    return likelihood * oc


def compute_rrl(likelihood_r: Optional[int], *consequence_dims: Optional[int]) -> Optional[int]:
    oc = compute_overall_consequence(*consequence_dims)
    if likelihood_r is None or oc is None:
        return None
    return likelihood_r * oc


def derive_evaluation(rrl: Optional[int]) -> Optional[str]:
    if rrl is None:
        return None
    return "Accept" if rrl <= 9 else "Treat"


def apply_risk_calculations(risk_obj) -> None:
    inherent_dims = [
        risk_obj.financial_i, risk_obj.reputation_i, risk_obj.human_capital_i,
        risk_obj.service_delivery_i, risk_obj.regulatory_i,
        risk_obj.projects_i, risk_obj.info_systems_i,
    ]
    residual_dims = [
        risk_obj.financial_r, risk_obj.reputation_r, risk_obj.human_capital_r,
        risk_obj.service_delivery_r, risk_obj.regulatory_r,
        risk_obj.projects_r, risk_obj.info_systems_r,
    ]
    risk_obj.overall_inherent_consequence = compute_overall_consequence(*inherent_dims)
    risk_obj.irl = compute_irl(risk_obj.likelihood_i, *inherent_dims)
    risk_obj.overall_residual_consequence = compute_overall_consequence(*residual_dims)
    risk_obj.rrl = compute_rrl(risk_obj.likelihood_r, *residual_dims)
    if risk_obj.evaluation is None:
        risk_obj.evaluation = derive_evaluation(risk_obj.rrl)


def indicator_status(
    value: Optional[float],
    green_threshold: float,
    amber_threshold: float,
    direction: str = "lower_is_better",
) -> Optional[str]:
    if value is None:
        return None
    if direction == "lower_is_better":
        if value <= green_threshold:
            return "Green"
        elif value <= amber_threshold:
            return "Amber"
        return "Red"
    else:
        if value >= green_threshold:
            return "Green"
        elif value >= amber_threshold:
            return "Amber"
        return "Red"


def effective_treatment_status(
    stored_status: Optional[str],
    due_date: Optional[date],
    current_date: Optional[date] = None,
) -> Optional[str]:
    if stored_status == "Completed":
        return "Completed"
    today = current_date or date.today()
    if due_date and today > due_date and stored_status != "Completed":
        return "Overdue"
    return stored_status


def risk_movement(current_rrl: Optional[int], previous_rrl: Optional[int]) -> str:
    if current_rrl is None or previous_rrl is None:
        return "\u2192"
    if current_rrl > previous_rrl:
        return "\u2191"
    elif current_rrl < previous_rrl:
        return "\u2193"
    return "\u2192"


QUARTER_ORDER = ["Q1", "Q2", "Q3", "Q4"]

QUARTER_LABELS = {
    "Q1": "Sept 2025/2026",
    "Q2": "Dec 2025/2026",
    "Q3": "March 2025/2026",
    "Q4": "June 2025/2026",
}


def previous_quarter(quarter: str) -> Optional[str]:
    try:
        idx = QUARTER_ORDER.index(quarter)
    except ValueError:
        return None
    return QUARTER_ORDER[idx - 1] if idx > 0 else None
