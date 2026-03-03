import uuid
from datetime import date
from sqlalchemy import (
    Column, String, Integer, Numeric, Boolean, Date, Text,
    ForeignKey, CheckConstraint, UniqueConstraint, Index
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database import Base


# ---------------------------------------------------------------------------
# Reference / Lookup Tables
# ---------------------------------------------------------------------------

class LikelihoodScale(Base):
    __tablename__ = "likelihood_scale"

    level = Column(Integer, primary_key=True)
    label = Column(String(50), nullable=False)
    description = Column(Text)


class ConsequenceScale(Base):
    __tablename__ = "consequence_scale"

    severity = Column(Integer, primary_key=True)
    label = Column(String(50), nullable=False)
    financial = Column(Text)
    reputation = Column(Text)
    human_capital = Column(Text)
    service_delivery = Column(Text)
    regulatory = Column(Text)
    projects = Column(Text)
    info_systems = Column(Text)


# ---------------------------------------------------------------------------
# Departments & CSFs
# ---------------------------------------------------------------------------

class Department(Base):
    __tablename__ = "departments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    assessed_unit = Column(String(255))
    objective = Column(Text)
    fiscal_year = Column(String(20), nullable=False)  # e.g. "2025/2026"

    csfs = relationship("CriticalSuccessFactor", back_populates="department", cascade="all, delete-orphan")
    risks = relationship("Risk", back_populates="department", cascade="all, delete-orphan")
    kpis = relationship("KPI", back_populates="department", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="department", cascade="all, delete-orphan")


class CriticalSuccessFactor(Base):
    __tablename__ = "critical_success_factors"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    pillar = Column(String(255), nullable=False)
    characteristics = Column(Text)

    department = relationship("Department", back_populates="csfs")
    risks = relationship("Risk", back_populates="csf")


# ---------------------------------------------------------------------------
# Risks (core entity)
# ---------------------------------------------------------------------------

class Risk(Base):
    __tablename__ = "risks"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    csf_id = Column(UUID(as_uuid=True), ForeignKey("critical_success_factors.id", ondelete="SET NULL"), nullable=True)

    risk_event = Column(Text, nullable=False)
    risk_source = Column(Text)
    risk_effect = Column(Text)

    # --- Inherent Risk ---
    likelihood_i = Column(Integer, CheckConstraint("likelihood_i BETWEEN 1 AND 5"))
    financial_i = Column(Integer, CheckConstraint("financial_i BETWEEN 1 AND 5"))
    reputation_i = Column(Integer, CheckConstraint("reputation_i BETWEEN 1 AND 5"))
    human_capital_i = Column(Integer, CheckConstraint("human_capital_i BETWEEN 1 AND 5"))
    service_delivery_i = Column(Integer, CheckConstraint("service_delivery_i BETWEEN 1 AND 5"))
    regulatory_i = Column(Integer, CheckConstraint("regulatory_i BETWEEN 1 AND 5"))
    projects_i = Column(Integer, CheckConstraint("projects_i BETWEEN 1 AND 5"))
    info_systems_i = Column(Integer, CheckConstraint("info_systems_i BETWEEN 1 AND 5"))

    # Computed + stored by application layer
    overall_inherent_consequence = Column(Integer)
    irl = Column(Integer)

    current_controls = Column(Text)

    # --- Residual Risk ---
    likelihood_r = Column(Integer, CheckConstraint("likelihood_r BETWEEN 1 AND 5"))
    financial_r = Column(Integer, CheckConstraint("financial_r BETWEEN 1 AND 5"))
    reputation_r = Column(Integer, CheckConstraint("reputation_r BETWEEN 1 AND 5"))
    human_capital_r = Column(Integer, CheckConstraint("human_capital_r BETWEEN 1 AND 5"))
    service_delivery_r = Column(Integer, CheckConstraint("service_delivery_r BETWEEN 1 AND 5"))
    regulatory_r = Column(Integer, CheckConstraint("regulatory_r BETWEEN 1 AND 5"))
    projects_r = Column(Integer, CheckConstraint("projects_r BETWEEN 1 AND 5"))
    info_systems_r = Column(Integer, CheckConstraint("info_systems_r BETWEEN 1 AND 5"))

    overall_residual_consequence = Column(Integer)
    rrl = Column(Integer)

    evaluation = Column(String(10), CheckConstraint("evaluation IN ('Accept','Treat')"))

    department = relationship("Department", back_populates="risks")
    csf = relationship("CriticalSuccessFactor", back_populates="risks")
    treatment_plans = relationship("TreatmentPlan", back_populates="risk", cascade="all, delete-orphan")
    kris = relationship("KRI", back_populates="risk", cascade="all, delete-orphan")
    compliance_controls = relationship("ComplianceControl", back_populates="risk", cascade="all, delete-orphan")
    incidents = relationship("Incident", back_populates="risk")
    aggregations = relationship("RiskAggregation", back_populates="risk", cascade="all, delete-orphan")


# ---------------------------------------------------------------------------
# Treatment Plans
# ---------------------------------------------------------------------------

class TreatmentPlan(Base):
    __tablename__ = "treatment_plans"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risk_id = Column(UUID(as_uuid=True), ForeignKey("risks.id", ondelete="CASCADE"), nullable=False)

    improvement_action = Column(Text, nullable=False)
    due_date = Column(Date)
    responsibility = Column(String(255))

    q1_status = Column(String(50))
    q1_comments = Column(Text)
    q1_further_action = Column(Text)

    q2_status = Column(String(50))
    q2_comments = Column(Text)
    q2_further_action = Column(Text)

    q3_status = Column(String(50))
    q3_comments = Column(Text)
    q3_further_action = Column(Text)

    q4_status = Column(String(50))
    q4_comments = Column(Text)
    q4_further_action = Column(Text)

    risk = relationship("Risk", back_populates="treatment_plans")


# ---------------------------------------------------------------------------
# KRIs
# ---------------------------------------------------------------------------

class KRI(Base):
    __tablename__ = "kris"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risk_id = Column(UUID(as_uuid=True), ForeignKey("risks.id", ondelete="CASCADE"), nullable=False)

    description = Column(Text, nullable=False)
    frequency = Column(String(50))  # Monthly | Quarterly | Annually
    green_threshold = Column(Numeric(10, 2), nullable=False)
    amber_threshold = Column(Numeric(10, 2), nullable=False)
    # "higher_is_better": value >= green = Green; "lower_is_better": value <= green = Green
    direction = Column(String(20), default="lower_is_better")
    responsibility = Column(String(255))

    risk = relationship("Risk", back_populates="kris")
    entries = relationship("KRIEntry", back_populates="kri", cascade="all, delete-orphan", order_by="KRIEntry.quarter")


class KRIEntry(Base):
    __tablename__ = "kri_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kri_id = Column(UUID(as_uuid=True), ForeignKey("kris.id", ondelete="CASCADE"), nullable=False)

    quarter = Column(String(10), nullable=False)  # Q1 | Q2 | Q3 | Q4
    entry_value = Column(Numeric(10, 2))
    status = Column(String(10))  # Green | Amber | Red — computed on write
    comments = Column(Text)
    action_taken = Column(Text)
    due_date = Column(Date)
    responsibility = Column(String(255))
    previous_action_status = Column(String(50))

    __table_args__ = (
        UniqueConstraint("kri_id", "quarter", name="uq_kri_entry_quarter"),
    )

    kri = relationship("KRI", back_populates="entries")


# ---------------------------------------------------------------------------
# KPIs
# ---------------------------------------------------------------------------

class KPI(Base):
    __tablename__ = "kpis"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)

    description = Column(Text, nullable=False)
    frequency = Column(String(50))
    green_threshold = Column(Numeric(10, 2), nullable=False)
    amber_threshold = Column(Numeric(10, 2), nullable=False)
    direction = Column(String(20), default="higher_is_better")
    responsibility = Column(String(255))

    department = relationship("Department", back_populates="kpis")
    entries = relationship("KPIEntry", back_populates="kpi", cascade="all, delete-orphan", order_by="KPIEntry.quarter")


class KPIEntry(Base):
    __tablename__ = "kpi_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    kpi_id = Column(UUID(as_uuid=True), ForeignKey("kpis.id", ondelete="CASCADE"), nullable=False)

    quarter = Column(String(10), nullable=False)
    entry_value = Column(Numeric(10, 2))
    status = Column(String(10))  # computed
    comments = Column(Text)
    action_taken = Column(Text)
    due_date = Column(Date)
    responsibility = Column(String(255))

    __table_args__ = (
        UniqueConstraint("kpi_id", "quarter", name="uq_kpi_entry_quarter"),
    )

    kpi = relationship("KPI", back_populates="entries")


# ---------------------------------------------------------------------------
# Compliance
# ---------------------------------------------------------------------------

class ComplianceControl(Base):
    __tablename__ = "compliance_controls"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risk_id = Column(UUID(as_uuid=True), ForeignKey("risks.id", ondelete="CASCADE"), nullable=False)

    key_control = Column(Text, nullable=False)
    compliance_question = Column(Text)
    frequency = Column(String(50))
    responsibility = Column(String(255))

    risk = relationship("Risk", back_populates="compliance_controls")
    entries = relationship("ComplianceEntry", back_populates="control", cascade="all, delete-orphan")


class ComplianceEntry(Base):
    __tablename__ = "compliance_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    compliance_id = Column(UUID(as_uuid=True), ForeignKey("compliance_controls.id", ondelete="CASCADE"), nullable=False)

    quarter = Column(String(10), nullable=False)
    response = Column(String(10), CheckConstraint("response IN ('Yes','No')"))
    comments_for_no = Column(Text)  # required when response = "No"
    action_taken = Column(Text)
    due_date = Column(Date)
    responsibility = Column(String(255))
    status = Column(String(50))  # WIP | Completed

    __table_args__ = (
        UniqueConstraint("compliance_id", "quarter", name="uq_compliance_entry_quarter"),
    )

    control = relationship("ComplianceControl", back_populates="entries")


# ---------------------------------------------------------------------------
# Incidents
# ---------------------------------------------------------------------------

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    department_id = Column(UUID(as_uuid=True), ForeignKey("departments.id", ondelete="CASCADE"), nullable=False)
    risk_id = Column(UUID(as_uuid=True), ForeignKey("risks.id", ondelete="SET NULL"), nullable=True)

    serial_no = Column(Integer)
    quarter = Column(String(10))
    details = Column(Text)
    incident_date = Column(Date)
    location = Column(String(255))
    direct_financial_impact = Column(Boolean, default=False)
    non_financial_impact = Column(Text)
    action_taken = Column(Text)
    risk_causes = Column(Text)
    risk_effects = Column(Text)
    control_failed = Column(Text)
    corrective_action = Column(Text)
    case_summary_done = Column(Boolean, default=False)
    managers_comments = Column(Text)
    further_corrective_action = Column(Text)
    due_date = Column(Date)

    department = relationship("Department", back_populates="incidents")
    risk = relationship("Risk", back_populates="incidents")


# ---------------------------------------------------------------------------
# Risk Aggregation
# ---------------------------------------------------------------------------

class RiskAggregation(Base):
    __tablename__ = "risk_aggregation"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    risk_id = Column(UUID(as_uuid=True), ForeignKey("risks.id", ondelete="CASCADE"), nullable=False)
    quarter = Column(String(10), nullable=False)

    aggregate_ranking = Column(Integer)
    movement = Column(String(5))  # ↑ | ↓ | →
    risk_owner_comments = Column(Text)
    action_being_taken = Column(Text)
    due_date = Column(Date)
    responsible_person = Column(String(255))

    __table_args__ = (
        UniqueConstraint("risk_id", "quarter", name="uq_aggregation_risk_quarter"),
    )

    risk = relationship("Risk", back_populates="aggregations")
