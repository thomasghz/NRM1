from __future__ import annotations
from datetime import date
from typing import Optional, List
from uuid import UUID
from pydantic import BaseModel, Field, model_validator


# ---------------------------------------------------------------------------
# Shared / Enums
# ---------------------------------------------------------------------------

VALID_QUARTERS = {"Q1", "Q2", "Q3", "Q4"}
VALID_STATUS = {"Not Started", "WIP", "Completed", "Overdue", "Select one"}
VALID_FREQUENCY = {"Monthly", "Quarterly", "Annually"}
VALID_DIRECTION = {"higher_is_better", "lower_is_better"}


# ---------------------------------------------------------------------------
# Department
# ---------------------------------------------------------------------------

class CSFCreate(BaseModel):
    pillar: str
    characteristics: Optional[str] = None


class CSFOut(CSFCreate):
    id: UUID
    department_id: UUID
    model_config = {"from_attributes": True}


class DepartmentCreate(BaseModel):
    name: str
    assessed_unit: Optional[str] = None
    objective: Optional[str] = None
    fiscal_year: str = "2025/2026"
    csfs: Optional[List[CSFCreate]] = []


class DepartmentUpdate(BaseModel):
    name: Optional[str] = None
    assessed_unit: Optional[str] = None
    objective: Optional[str] = None
    fiscal_year: Optional[str] = None


class DepartmentOut(BaseModel):
    id: UUID
    name: str
    assessed_unit: Optional[str]
    objective: Optional[str]
    fiscal_year: str
    csfs: List[CSFOut] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Risk
# ---------------------------------------------------------------------------

class RiskCreate(BaseModel):
    department_id: UUID
    csf_id: Optional[UUID] = None
    risk_event: str
    risk_source: Optional[str] = None
    risk_effect: Optional[str] = None

    # Inherent
    likelihood_i: Optional[int] = Field(None, ge=1, le=5)
    financial_i: Optional[int] = Field(None, ge=1, le=5)
    reputation_i: Optional[int] = Field(None, ge=1, le=5)
    human_capital_i: Optional[int] = Field(None, ge=1, le=5)
    service_delivery_i: Optional[int] = Field(None, ge=1, le=5)
    regulatory_i: Optional[int] = Field(None, ge=1, le=5)
    projects_i: Optional[int] = Field(None, ge=1, le=5)
    info_systems_i: Optional[int] = Field(None, ge=1, le=5)

    current_controls: Optional[str] = None

    # Residual
    likelihood_r: Optional[int] = Field(None, ge=1, le=5)
    financial_r: Optional[int] = Field(None, ge=1, le=5)
    reputation_r: Optional[int] = Field(None, ge=1, le=5)
    human_capital_r: Optional[int] = Field(None, ge=1, le=5)
    service_delivery_r: Optional[int] = Field(None, ge=1, le=5)
    regulatory_r: Optional[int] = Field(None, ge=1, le=5)
    projects_r: Optional[int] = Field(None, ge=1, le=5)
    info_systems_r: Optional[int] = Field(None, ge=1, le=5)

    evaluation: Optional[str] = None


class RiskUpdate(BaseModel):
    csf_id: Optional[UUID] = None
    risk_event: Optional[str] = None
    risk_source: Optional[str] = None
    risk_effect: Optional[str] = None
    likelihood_i: Optional[int] = Field(None, ge=1, le=5)
    financial_i: Optional[int] = Field(None, ge=1, le=5)
    reputation_i: Optional[int] = Field(None, ge=1, le=5)
    human_capital_i: Optional[int] = Field(None, ge=1, le=5)
    service_delivery_i: Optional[int] = Field(None, ge=1, le=5)
    regulatory_i: Optional[int] = Field(None, ge=1, le=5)
    projects_i: Optional[int] = Field(None, ge=1, le=5)
    info_systems_i: Optional[int] = Field(None, ge=1, le=5)
    current_controls: Optional[str] = None
    likelihood_r: Optional[int] = Field(None, ge=1, le=5)
    financial_r: Optional[int] = Field(None, ge=1, le=5)
    reputation_r: Optional[int] = Field(None, ge=1, le=5)
    human_capital_r: Optional[int] = Field(None, ge=1, le=5)
    service_delivery_r: Optional[int] = Field(None, ge=1, le=5)
    regulatory_r: Optional[int] = Field(None, ge=1, le=5)
    projects_r: Optional[int] = Field(None, ge=1, le=5)
    info_systems_r: Optional[int] = Field(None, ge=1, le=5)
    evaluation: Optional[str] = None


class IRLRRLOut(BaseModel):
    risk_id: UUID
    likelihood_i: Optional[int]
    overall_inherent_consequence: Optional[int]
    irl: Optional[int]
    irl_zone: Optional[str]
    likelihood_r: Optional[int]
    overall_residual_consequence: Optional[int]
    rrl: Optional[int]
    rrl_zone: Optional[str]
    evaluation: Optional[str]
    model_config = {"from_attributes": True}


class RiskOut(BaseModel):
    id: UUID
    department_id: UUID
    csf_id: Optional[UUID]
    risk_event: str
    risk_source: Optional[str]
    risk_effect: Optional[str]
    likelihood_i: Optional[int]
    financial_i: Optional[int]
    reputation_i: Optional[int]
    human_capital_i: Optional[int]
    service_delivery_i: Optional[int]
    regulatory_i: Optional[int]
    projects_i: Optional[int]
    info_systems_i: Optional[int]
    overall_inherent_consequence: Optional[int]
    irl: Optional[int]
    irl_zone: Optional[str] = None
    current_controls: Optional[str]
    likelihood_r: Optional[int]
    financial_r: Optional[int]
    reputation_r: Optional[int]
    human_capital_r: Optional[int]
    service_delivery_r: Optional[int]
    regulatory_r: Optional[int]
    projects_r: Optional[int]
    info_systems_r: Optional[int]
    overall_residual_consequence: Optional[int]
    rrl: Optional[int]
    rrl_zone: Optional[str] = None
    evaluation: Optional[str]
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Treatment Plans
# ---------------------------------------------------------------------------

class TreatmentPlanCreate(BaseModel):
    risk_id: UUID
    improvement_action: str
    due_date: Optional[date] = None
    responsibility: Optional[str] = None


class TreatmentPlanUpdate(BaseModel):
    improvement_action: Optional[str] = None
    due_date: Optional[date] = None
    responsibility: Optional[str] = None
    q1_status: Optional[str] = None
    q1_comments: Optional[str] = None
    q1_further_action: Optional[str] = None
    q2_status: Optional[str] = None
    q2_comments: Optional[str] = None
    q2_further_action: Optional[str] = None
    q3_status: Optional[str] = None
    q3_comments: Optional[str] = None
    q3_further_action: Optional[str] = None
    q4_status: Optional[str] = None
    q4_comments: Optional[str] = None
    q4_further_action: Optional[str] = None


class TreatmentPlanOut(BaseModel):
    id: UUID
    risk_id: UUID
    improvement_action: str
    due_date: Optional[date]
    responsibility: Optional[str]
    q1_status: Optional[str]
    q1_comments: Optional[str]
    q1_further_action: Optional[str]
    q2_status: Optional[str]
    q2_comments: Optional[str]
    q2_further_action: Optional[str]
    q3_status: Optional[str]
    q3_comments: Optional[str]
    q3_further_action: Optional[str]
    q4_status: Optional[str]
    q4_comments: Optional[str]
    q4_further_action: Optional[str]
    # Derived: effective status for a given quarter (computed by service layer)
    effective_status: Optional[str] = None
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# KRIs
# ---------------------------------------------------------------------------

class KRICreate(BaseModel):
    risk_id: UUID
    description: str
    frequency: Optional[str] = None
    green_threshold: float
    amber_threshold: float
    direction: str = "lower_is_better"
    responsibility: Optional[str] = None


class KRIUpdate(BaseModel):
    description: Optional[str] = None
    frequency: Optional[str] = None
    green_threshold: Optional[float] = None
    amber_threshold: Optional[float] = None
    direction: Optional[str] = None
    responsibility: Optional[str] = None


class KRIEntryCreate(BaseModel):
    quarter: str
    entry_value: float
    comments: Optional[str] = None
    action_taken: Optional[str] = None
    due_date: Optional[date] = None
    responsibility: Optional[str] = None
    previous_action_status: Optional[str] = None


class KRIEntryOut(BaseModel):
    id: UUID
    kri_id: UUID
    quarter: str
    entry_value: Optional[float]
    status: Optional[str]
    comments: Optional[str]
    action_taken: Optional[str]
    due_date: Optional[date]
    responsibility: Optional[str]
    previous_action_status: Optional[str]
    model_config = {"from_attributes": True}


class KRIOut(BaseModel):
    id: UUID
    risk_id: UUID
    description: str
    frequency: Optional[str]
    green_threshold: float
    amber_threshold: float
    direction: str
    responsibility: Optional[str]
    entries: List[KRIEntryOut] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# KPIs
# ---------------------------------------------------------------------------

class KPICreate(BaseModel):
    department_id: UUID
    description: str
    frequency: Optional[str] = None
    green_threshold: float
    amber_threshold: float
    direction: str = "higher_is_better"
    responsibility: Optional[str] = None


class KPIUpdate(BaseModel):
    description: Optional[str] = None
    frequency: Optional[str] = None
    green_threshold: Optional[float] = None
    amber_threshold: Optional[float] = None
    direction: Optional[str] = None
    responsibility: Optional[str] = None


class KPIEntryCreate(BaseModel):
    quarter: str
    entry_value: float
    comments: Optional[str] = None
    action_taken: Optional[str] = None
    due_date: Optional[date] = None
    responsibility: Optional[str] = None


class KPIEntryOut(BaseModel):
    id: UUID
    kpi_id: UUID
    quarter: str
    entry_value: Optional[float]
    status: Optional[str]
    comments: Optional[str]
    action_taken: Optional[str]
    due_date: Optional[date]
    responsibility: Optional[str]
    model_config = {"from_attributes": True}


class KPIOut(BaseModel):
    id: UUID
    department_id: UUID
    description: str
    frequency: Optional[str]
    green_threshold: float
    amber_threshold: float
    direction: str
    responsibility: Optional[str]
    entries: List[KPIEntryOut] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Compliance
# ---------------------------------------------------------------------------

class ComplianceControlCreate(BaseModel):
    risk_id: UUID
    key_control: str
    compliance_question: Optional[str] = None
    frequency: Optional[str] = None
    responsibility: Optional[str] = None


class ComplianceEntryCreate(BaseModel):
    quarter: str
    response: str  # Yes | No
    comments_for_no: Optional[str] = None
    action_taken: Optional[str] = None
    due_date: Optional[date] = None
    responsibility: Optional[str] = None
    status: Optional[str] = None

    @model_validator(mode="after")
    def comments_required_for_no(self):
        if self.response == "No" and not self.comments_for_no:
            raise ValueError("comments_for_no is required when response is 'No'")
        return self


class ComplianceEntryOut(BaseModel):
    id: UUID
    compliance_id: UUID
    quarter: str
    response: Optional[str]
    comments_for_no: Optional[str]
    action_taken: Optional[str]
    due_date: Optional[date]
    responsibility: Optional[str]
    status: Optional[str]
    model_config = {"from_attributes": True}


class ComplianceControlOut(BaseModel):
    id: UUID
    risk_id: UUID
    key_control: str
    compliance_question: Optional[str]
    frequency: Optional[str]
    responsibility: Optional[str]
    entries: List[ComplianceEntryOut] = []
    model_config = {"from_attributes": True}


# ---------------------------------------------------------------------------
# Incidents
# ---------------------------------------------------------------------------

class IncidentCreate(BaseModel):
    department_id: UUID
    risk_id: Optional[UUID] = None
    serial_no: Optional[int] = None
    quarter: Optional[str] = None
    details: Optional[str] = None
    incident_date: Optional[date] = None
    location: Optional[str] = None
    direct_financial_impact: bool = False
    non_financial_impact: Optional[str] = None
    action_taken: Optional[str] = None
    risk_causes: Optional[str] = None
    risk_effects: Optional[str] = None
    control_failed: Optional[str] = None
    corrective_action: Optional[str] = None
    case_summary_done: bool = False
    managers_comments: Optional[str] = None
    further_corrective_action: Optional[str] = None
    due_date: Optional[date] = None


class IncidentUpdate(BaseModel):
    risk_id: Optional[UUID] = None
    quarter: Optional[str] = None
    details: Optional[str] = None
    incident_date: Optional[date] = None
    location: Optional[str] = None
    direct_financial_impact: Optional[bool] = None
    non_financial_impact: Optional[str] = None
    action_taken: Optional[str] = None
    risk_causes: Optional[str] = None
    risk_effects: Optional[str] = None
    control_failed: Optional[str] = None
    corrective_action: Optional[str] = None
    case_summary_done: Optional[bool] = None
    managers_comments: Optional[str] = None
    further_corrective_action: Optional[str] = None
    due_date: Optional[date] = None


class IncidentOut(BaseModel):
    id: UUID
    department_id: UUID
    risk_id: Optional[UUID]
    serial_no: Optional[int]
    quarter: Optional[str]
    details: Optional[str]
    incident_date: Optional[date]
    location: Optional[str]
    direct_financial_impact: bool
    non_financial_impact: Optional[str]
    action_taken: Optional[str]
    risk_causes: Optional[str]
    risk_effects: Optional[str]
    control_failed: Optional[str]
    corrective_action: Optional[str]
    case_summary_done: bool
    managers_comments: Optional[str]
    further_corrective_action: Optional[str]
    due_date: Optional[date]
    model_config = {"from_attributes": True}


class IncidentCountOut(BaseModel):
    risk_id: UUID
    quarter: str
    count: int


# ---------------------------------------------------------------------------
# Risk Aggregation
# ---------------------------------------------------------------------------

class AggregationRow(BaseModel):
    risk_id: UUID
    risk_event: str
    aggregate_ranking: Optional[int]
    movement: Optional[str]
    irl: Optional[int]
    irl_zone: Optional[str]
    rrl: Optional[int]
    rrl_zone: Optional[str]
    latest_kri_value: Optional[float]
    latest_kri_status: Optional[str]
    kri_corrective_action_status: Optional[str]
    compliance_response: Optional[str]
    compliance_corrective_action_status: Optional[str]
    incident_count: int
    treatment_status: Optional[str]
    risk_owner_comments: Optional[str]
    action_being_taken: Optional[str]
    due_date: Optional[date]
    responsible_person: Optional[str]


class AggregationOut(BaseModel):
    department_id: UUID
    quarter: str
    risks: List[AggregationRow]


class AggregationRankUpdate(BaseModel):
    aggregate_ranking: int = Field(..., ge=1)


class AggregationCommentsUpdate(BaseModel):
    risk_owner_comments: Optional[str] = None
    action_being_taken: Optional[str] = None
    due_date: Optional[date] = None
    responsible_person: Optional[str] = None
