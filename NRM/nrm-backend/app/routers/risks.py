from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Risk
from app.schemas.schemas import RiskCreate, RiskUpdate, RiskOut, IRLRRLOut
from app.services.business_logic import apply_risk_calculations, risk_zone

router = APIRouter(prefix="/risks", tags=["Risks"])


def _enrich(risk: Risk) -> dict:
    d = {c.name: getattr(risk, c.name) for c in risk.__table__.columns}
    d["irl_zone"] = risk_zone(risk.irl)
    d["rrl_zone"] = risk_zone(risk.rrl)
    return d


@router.post("", response_model=RiskOut, status_code=201)
def create_risk(payload: RiskCreate, db: Session = Depends(get_db)):
    risk = Risk(**payload.model_dump())
    apply_risk_calculations(risk)
    db.add(risk)
    db.commit()
    db.refresh(risk)
    return _enrich(risk)


@router.get("", response_model=list[RiskOut])
def list_risks(
    department: Optional[UUID] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Risk).options(joinedload(Risk.csf))
    if department:
        q = q.filter(Risk.department_id == department)
    return [_enrich(r) for r in q.all()]


@router.get("/{risk_id}", response_model=RiskOut)
def get_risk(risk_id: UUID, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    return _enrich(risk)


@router.put("/{risk_id}", response_model=RiskOut)
def update_risk(risk_id: UUID, payload: RiskUpdate, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(risk, field, val)
    apply_risk_calculations(risk)
    db.commit()
    db.refresh(risk)
    return _enrich(risk)


@router.delete("/{risk_id}", status_code=204)
def delete_risk(risk_id: UUID, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    db.delete(risk)
    db.commit()


@router.get("/{risk_id}/irl-rrl", response_model=IRLRRLOut)
def get_irl_rrl(risk_id: UUID, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    return IRLRRLOut(
        risk_id=risk.id,
        likelihood_i=risk.likelihood_i,
        overall_inherent_consequence=risk.overall_inherent_consequence,
        irl=risk.irl,
        irl_zone=risk_zone(risk.irl),
        likelihood_r=risk.likelihood_r,
        overall_residual_consequence=risk.overall_residual_consequence,
        rrl=risk.rrl,
        rrl_zone=risk_zone(risk.rrl),
        evaluation=risk.evaluation,
    )
