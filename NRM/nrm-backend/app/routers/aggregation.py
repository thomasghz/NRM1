from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import (
    Risk, RiskAggregation, KRI, KRIEntry,
    ComplianceControl, ComplianceEntry, Incident, TreatmentPlan,
)
from app.schemas.schemas import (
    AggregationOut, AggregationRow,
    AggregationRankUpdate, AggregationCommentsUpdate,
)
from app.services.business_logic import (
    risk_zone, effective_treatment_status,
    risk_movement, previous_quarter,
)

router = APIRouter(prefix="/aggregation", tags=["Risk Aggregation"])


def _get_or_create_agg(db: Session, risk_id: UUID, quarter: str) -> RiskAggregation:
    agg = db.query(RiskAggregation).filter(
        RiskAggregation.risk_id == risk_id,
        RiskAggregation.quarter == quarter,
    ).first()
    if not agg:
        agg = RiskAggregation(risk_id=risk_id, quarter=quarter)
        db.add(agg)
        db.flush()
    return agg


def _build_row(risk: Risk, quarter: str, db: Session) -> AggregationRow:
    prev_q = previous_quarter(quarter)

    # KRI latest
    latest_kri_val = None
    latest_kri_status = None
    kri_action_status = None
    for kri in risk.kris:
        entry = next((e for e in kri.entries if e.quarter == quarter), None)
        if entry:
            latest_kri_val = float(entry.entry_value) if entry.entry_value is not None else None
            latest_kri_status = entry.status
            kri_action_status = entry.previous_action_status

    # Compliance
    comp_response = None
    comp_action_status = None
    for ctrl in risk.compliance_controls:
        entry = next((e for e in ctrl.entries if e.quarter == quarter), None)
        if entry:
            comp_response = entry.response
            comp_action_status = entry.status

    # Incidents
    inc_count = sum(1 for i in risk.incidents if i.quarter == quarter)

    # Treatment
    treatment_status = None
    q_lower = quarter.lower()
    for plan in risk.treatment_plans:
        s = getattr(plan, f"{q_lower}_status", None)
        treatment_status = effective_treatment_status(s, plan.due_date)
        break

    # Aggregation override data
    agg = next((a for a in risk.aggregations if a.quarter == quarter), None)

    # Movement: compare current RRL vs previous quarter's RRL
    # (simplified: we store RRL on the risk entity which is always "current")
    prev_rrl = None
    if prev_q:
        prev_agg = next((a for a in risk.aggregations if a.quarter == prev_q), None)
        # In a full implementation you would store historical RRL per quarter.
        # For now movement is neutral unless we have prior data.

    movement = "\u2192"  # default stable

    return AggregationRow(
        risk_id=risk.id,
        risk_event=risk.risk_event,
        aggregate_ranking=agg.aggregate_ranking if agg else None,
        movement=agg.movement if (agg and agg.movement) else movement,
        irl=risk.irl,
        irl_zone=risk_zone(risk.irl),
        rrl=risk.rrl,
        rrl_zone=risk_zone(risk.rrl),
        latest_kri_value=latest_kri_val,
        latest_kri_status=latest_kri_status,
        kri_corrective_action_status=kri_action_status,
        compliance_response=comp_response,
        compliance_corrective_action_status=comp_action_status,
        incident_count=inc_count,
        treatment_status=treatment_status,
        risk_owner_comments=agg.risk_owner_comments if agg else None,
        action_being_taken=agg.action_being_taken if agg else None,
        due_date=agg.due_date if agg else None,
        responsible_person=agg.responsible_person if agg else None,
    )


@router.get("", response_model=AggregationOut)
def get_aggregation(
    department: UUID = Query(...),
    quarter: str = Query(...),
    db: Session = Depends(get_db),
):
    risks = (
        db.query(Risk)
        .options(
            joinedload(Risk.kris).joinedload(KRI.entries),
            joinedload(Risk.compliance_controls).joinedload(ComplianceControl.entries),
            joinedload(Risk.incidents),
            joinedload(Risk.treatment_plans),
            joinedload(Risk.aggregations),
        )
        .filter(Risk.department_id == department)
        .all()
    )

    rows = [_build_row(r, quarter, db) for r in risks]
    rows.sort(key=lambda r: r.aggregate_ranking if r.aggregate_ranking else 9999)

    return AggregationOut(department_id=department, quarter=quarter, risks=rows)


@router.put("/{risk_id}/rank", response_model=dict)
def update_rank(
    risk_id: UUID,
    payload: AggregationRankUpdate,
    quarter: str = Query(...),
    db: Session = Depends(get_db),
):
    agg = _get_or_create_agg(db, risk_id, quarter)
    agg.aggregate_ranking = payload.aggregate_ranking
    db.commit()
    return {"risk_id": str(risk_id), "quarter": quarter, "aggregate_ranking": payload.aggregate_ranking}


@router.put("/{risk_id}/comments", response_model=dict)
def update_comments(
    risk_id: UUID,
    payload: AggregationCommentsUpdate,
    quarter: str = Query(...),
    db: Session = Depends(get_db),
):
    agg = _get_or_create_agg(db, risk_id, quarter)
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(agg, field, val)
    db.commit()
    return {"status": "updated", "risk_id": str(risk_id), "quarter": quarter}
