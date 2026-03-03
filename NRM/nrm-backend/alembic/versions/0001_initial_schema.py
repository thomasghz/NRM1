"""Initial NRM schema

Revision ID: 0001
Revises:
Create Date: 2025-01-01
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "likelihood_scale",
        sa.Column("level", sa.Integer(), primary_key=True),
        sa.Column("label", sa.String(50), nullable=False),
        sa.Column("description", sa.Text()),
    )

    op.create_table(
        "consequence_scale",
        sa.Column("severity", sa.Integer(), primary_key=True),
        sa.Column("label", sa.String(50), nullable=False),
        sa.Column("financial", sa.Text()),
        sa.Column("reputation", sa.Text()),
        sa.Column("human_capital", sa.Text()),
        sa.Column("service_delivery", sa.Text()),
        sa.Column("regulatory", sa.Text()),
        sa.Column("projects", sa.Text()),
        sa.Column("info_systems", sa.Text()),
    )

    op.create_table(
        "departments",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False),
        sa.Column("assessed_unit", sa.String(255)),
        sa.Column("objective", sa.Text()),
        sa.Column("fiscal_year", sa.String(20), nullable=False),
    )

    op.create_table(
        "critical_success_factors",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("department_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("departments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("pillar", sa.String(255), nullable=False),
        sa.Column("characteristics", sa.Text()),
    )

    op.create_table(
        "risks",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("department_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("departments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("csf_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("critical_success_factors.id", ondelete="SET NULL"), nullable=True),
        sa.Column("risk_event", sa.Text(), nullable=False),
        sa.Column("risk_source", sa.Text()),
        sa.Column("risk_effect", sa.Text()),
        # Inherent
        sa.Column("likelihood_i", sa.Integer()),
        sa.Column("financial_i", sa.Integer()),
        sa.Column("reputation_i", sa.Integer()),
        sa.Column("human_capital_i", sa.Integer()),
        sa.Column("service_delivery_i", sa.Integer()),
        sa.Column("regulatory_i", sa.Integer()),
        sa.Column("projects_i", sa.Integer()),
        sa.Column("info_systems_i", sa.Integer()),
        sa.Column("overall_inherent_consequence", sa.Integer()),
        sa.Column("irl", sa.Integer()),
        sa.Column("current_controls", sa.Text()),
        # Residual
        sa.Column("likelihood_r", sa.Integer()),
        sa.Column("financial_r", sa.Integer()),
        sa.Column("reputation_r", sa.Integer()),
        sa.Column("human_capital_r", sa.Integer()),
        sa.Column("service_delivery_r", sa.Integer()),
        sa.Column("regulatory_r", sa.Integer()),
        sa.Column("projects_r", sa.Integer()),
        sa.Column("info_systems_r", sa.Integer()),
        sa.Column("overall_residual_consequence", sa.Integer()),
        sa.Column("rrl", sa.Integer()),
        sa.Column("evaluation", sa.String(10),
                  sa.CheckConstraint("evaluation IN ('Accept','Treat')")),
    )

    op.create_table(
        "treatment_plans",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("risk_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("risks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("improvement_action", sa.Text(), nullable=False),
        sa.Column("due_date", sa.Date()),
        sa.Column("responsibility", sa.String(255)),
        sa.Column("q1_status", sa.String(50)),
        sa.Column("q1_comments", sa.Text()),
        sa.Column("q1_further_action", sa.Text()),
        sa.Column("q2_status", sa.String(50)),
        sa.Column("q2_comments", sa.Text()),
        sa.Column("q2_further_action", sa.Text()),
        sa.Column("q3_status", sa.String(50)),
        sa.Column("q3_comments", sa.Text()),
        sa.Column("q3_further_action", sa.Text()),
        sa.Column("q4_status", sa.String(50)),
        sa.Column("q4_comments", sa.Text()),
        sa.Column("q4_further_action", sa.Text()),
    )

    op.create_table(
        "kris",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("risk_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("risks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("frequency", sa.String(50)),
        sa.Column("green_threshold", sa.Numeric(10, 2), nullable=False),
        sa.Column("amber_threshold", sa.Numeric(10, 2), nullable=False),
        sa.Column("direction", sa.String(20), server_default="lower_is_better"),
        sa.Column("responsibility", sa.String(255)),
    )

    op.create_table(
        "kri_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("kri_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("kris.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quarter", sa.String(10), nullable=False),
        sa.Column("entry_value", sa.Numeric(10, 2)),
        sa.Column("status", sa.String(10)),
        sa.Column("comments", sa.Text()),
        sa.Column("action_taken", sa.Text()),
        sa.Column("due_date", sa.Date()),
        sa.Column("responsibility", sa.String(255)),
        sa.Column("previous_action_status", sa.String(50)),
        sa.UniqueConstraint("kri_id", "quarter", name="uq_kri_entry_quarter"),
    )

    op.create_table(
        "kpis",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("department_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("departments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("description", sa.Text(), nullable=False),
        sa.Column("frequency", sa.String(50)),
        sa.Column("green_threshold", sa.Numeric(10, 2), nullable=False),
        sa.Column("amber_threshold", sa.Numeric(10, 2), nullable=False),
        sa.Column("direction", sa.String(20), server_default="higher_is_better"),
        sa.Column("responsibility", sa.String(255)),
    )

    op.create_table(
        "kpi_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("kpi_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("kpis.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quarter", sa.String(10), nullable=False),
        sa.Column("entry_value", sa.Numeric(10, 2)),
        sa.Column("status", sa.String(10)),
        sa.Column("comments", sa.Text()),
        sa.Column("action_taken", sa.Text()),
        sa.Column("due_date", sa.Date()),
        sa.Column("responsibility", sa.String(255)),
        sa.UniqueConstraint("kpi_id", "quarter", name="uq_kpi_entry_quarter"),
    )

    op.create_table(
        "compliance_controls",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("risk_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("risks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("key_control", sa.Text(), nullable=False),
        sa.Column("compliance_question", sa.Text()),
        sa.Column("frequency", sa.String(50)),
        sa.Column("responsibility", sa.String(255)),
    )

    op.create_table(
        "compliance_entries",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("compliance_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("compliance_controls.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quarter", sa.String(10), nullable=False),
        sa.Column("response", sa.String(10),
                  sa.CheckConstraint("response IN ('Yes','No')")),
        sa.Column("comments_for_no", sa.Text()),
        sa.Column("action_taken", sa.Text()),
        sa.Column("due_date", sa.Date()),
        sa.Column("responsibility", sa.String(255)),
        sa.Column("status", sa.String(50)),
        sa.UniqueConstraint("compliance_id", "quarter", name="uq_compliance_entry_quarter"),
    )

    op.create_table(
        "incidents",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("department_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("departments.id", ondelete="CASCADE"), nullable=False),
        sa.Column("risk_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("risks.id", ondelete="SET NULL"), nullable=True),
        sa.Column("serial_no", sa.Integer()),
        sa.Column("quarter", sa.String(10)),
        sa.Column("details", sa.Text()),
        sa.Column("incident_date", sa.Date()),
        sa.Column("location", sa.String(255)),
        sa.Column("direct_financial_impact", sa.Boolean(), server_default="false"),
        sa.Column("non_financial_impact", sa.Text()),
        sa.Column("action_taken", sa.Text()),
        sa.Column("risk_causes", sa.Text()),
        sa.Column("risk_effects", sa.Text()),
        sa.Column("control_failed", sa.Text()),
        sa.Column("corrective_action", sa.Text()),
        sa.Column("case_summary_done", sa.Boolean(), server_default="false"),
        sa.Column("managers_comments", sa.Text()),
        sa.Column("further_corrective_action", sa.Text()),
        sa.Column("due_date", sa.Date()),
    )

    op.create_table(
        "risk_aggregation",
        sa.Column("id", postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column("risk_id", postgresql.UUID(as_uuid=True),
                  sa.ForeignKey("risks.id", ondelete="CASCADE"), nullable=False),
        sa.Column("quarter", sa.String(10), nullable=False),
        sa.Column("aggregate_ranking", sa.Integer()),
        sa.Column("movement", sa.String(5)),
        sa.Column("risk_owner_comments", sa.Text()),
        sa.Column("action_being_taken", sa.Text()),
        sa.Column("due_date", sa.Date()),
        sa.Column("responsible_person", sa.String(255)),
        sa.UniqueConstraint("risk_id", "quarter", name="uq_aggregation_risk_quarter"),
    )

    # Seed reference tables
    op.execute("""
    INSERT INTO likelihood_scale (level, label, description) VALUES
    (1, 'Rare',       'May occur only in exceptional circumstances (< 10% chance)'),
    (2, 'Unlikely',   'Could occur at some time (10-30% chance)'),
    (3, 'Possible',   'Might occur at some time (30-50% chance)'),
    (4, 'Likely',     'Will probably occur in most circumstances (50-70% chance)'),
    (5, 'Almost Certain', 'Is expected to occur in most circumstances (> 70% chance)');
    """)

    op.execute("""
    INSERT INTO consequence_scale (severity, label, financial, reputation, human_capital, service_delivery, regulatory, projects, info_systems) VALUES
    (1, 'Insignificant', 'Negligible financial loss', 'Minor internal criticism', 'No injury', 'Brief disruption < 1 day', 'Minor breach, no penalty', 'Minor delay', 'Minimal data loss'),
    (2, 'Minor',         'Minor financial loss',      'Limited external criticism', 'First aid only', 'Disruption 1-3 days', 'Regulatory notice', 'Schedule slip < 1 week', 'Some data loss, recoverable'),
    (3, 'Moderate',      'Significant financial loss','Negative media coverage', 'Medical treatment required', 'Disruption 3-14 days', 'Formal investigation', 'Schedule slip > 1 week', 'Major data loss'),
    (4, 'Major',         'Major financial loss',      'Sustained negative media', 'Serious injury', 'Disruption > 2 weeks', 'Regulatory sanction', 'Project failure', 'Critical system failure'),
    (5, 'Catastrophic',  'Critical financial loss',   'Loss of public confidence', 'Fatality', 'Full service collapse', 'Criminal prosecution', 'Programme collapse', 'Permanent data/system loss');
    """)


def downgrade() -> None:
    op.drop_table("risk_aggregation")
    op.drop_table("incidents")
    op.drop_table("compliance_entries")
    op.drop_table("compliance_controls")
    op.drop_table("kpi_entries")
    op.drop_table("kpis")
    op.drop_table("kri_entries")
    op.drop_table("kris")
    op.drop_table("treatment_plans")
    op.drop_table("risks")
    op.drop_table("critical_success_factors")
    op.drop_table("departments")
    op.drop_table("consequence_scale")
    op.drop_table("likelihood_scale")
