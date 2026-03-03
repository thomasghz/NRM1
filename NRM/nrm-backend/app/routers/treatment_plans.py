from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import TreatmentPlan, Risk
from app.schemas.schemas import TreatmentPlanCreate, TreatmentPlanUpdate, TreatmentPlanOut
from app.services.business_logic import effective_treatment_status

router = APIRouter(prefix="/treatment-plans", tags=["Treatment Plans"])


def _enrich_plan(plan: TreatmentPlan, quarter: Optional[str] = None) -> TreatmentPlanOut:
    out = TreatmentPlanOut.model_validate(plan)
    if quarter:
        q = quarter.lower()
        status = getattr(plan, f"{q}_status", None)
        out.effective_status = effective_treatment_status(status, plan.due_date)
    return out


@router.post("", response_model=TreatmentPlanOut, status_code=201)
def create_plan(payload: TreatmentPlanCreate, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == payload.risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    plan = TreatmentPlan(**payload.model_dump())
    db.add(plan)
    db.commit()
    db.refresh(plan)
    return _enrich_plan(plan)


@router.get("", response_model=list[TreatmentPlanOut])
def list_plans(
    risk: Optional[UUID] = Query(None),
    quarter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(TreatmentPlan)
    if risk:
        q = q.filter(TreatmentPlan.risk_id == risk)
    plans = q.all()
    return [_enrich_plan(p, quarter) for p in plans]


@router.get("/{plan_id}", response_model=TreatmentPlanOut)
def get_plan(plan_id: UUID, quarter: Optional[str] = Query(None), db: Session = Depends(get_db)):
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, "Treatment plan not found")
    return _enrich_plan(plan, quarter)


@router.put("/{plan_id}", response_model=TreatmentPlanOut)
def update_plan(plan_id: UUID, payload: TreatmentPlanUpdate, db: Session = Depends(get_db)):
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, "Treatment plan not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(plan, field, val)
    db.commit()
    db.refresh(plan)
    return _enrich_plan(plan)


@router.delete("/{plan_id}", status_code=204)
def delete_plan(plan_id: UUID, db: Session = Depends(get_db)):
    plan = db.query(TreatmentPlan).filter(TreatmentPlan.id == plan_id).first()
    if not plan:
        raise HTTPException(404, "Treatment plan not found")
    db.delete(plan)
    db.commit()
