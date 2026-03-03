from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import ComplianceControl, ComplianceEntry, Risk
from app.schemas.schemas import (
    ComplianceControlCreate, ComplianceControlOut,
    ComplianceEntryCreate, ComplianceEntryOut,
)

router = APIRouter(prefix="/compliance", tags=["Compliance"])


@router.post("", response_model=ComplianceControlOut, status_code=201)
def create_control(payload: ComplianceControlCreate, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == payload.risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    ctrl = ComplianceControl(**payload.model_dump())
    db.add(ctrl)
    db.commit()
    db.refresh(ctrl)
    return ctrl


@router.get("", response_model=list[ComplianceControlOut])
def list_controls(
    risk: Optional[UUID] = Query(None),
    quarter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(ComplianceControl)
    if risk:
        q = q.filter(ComplianceControl.risk_id == risk)
    return q.all()


@router.get("/{ctrl_id}", response_model=ComplianceControlOut)
def get_control(ctrl_id: UUID, db: Session = Depends(get_db)):
    ctrl = db.query(ComplianceControl).filter(ComplianceControl.id == ctrl_id).first()
    if not ctrl:
        raise HTTPException(404, "Compliance control not found")
    return ctrl


@router.delete("/{ctrl_id}", status_code=204)
def delete_control(ctrl_id: UUID, db: Session = Depends(get_db)):
    ctrl = db.query(ComplianceControl).filter(ComplianceControl.id == ctrl_id).first()
    if not ctrl:
        raise HTTPException(404, "Compliance control not found")
    db.delete(ctrl)
    db.commit()


@router.post("/{ctrl_id}/entries", response_model=ComplianceEntryOut, status_code=201)
def create_entry(ctrl_id: UUID, payload: ComplianceEntryCreate, db: Session = Depends(get_db)):
    ctrl = db.query(ComplianceControl).filter(ComplianceControl.id == ctrl_id).first()
    if not ctrl:
        raise HTTPException(404, "Compliance control not found")
    existing = db.query(ComplianceEntry).filter(
        ComplianceEntry.compliance_id == ctrl_id,
        ComplianceEntry.quarter == payload.quarter,
    ).first()
    if existing:
        raise HTTPException(409, f"Entry for {payload.quarter} already exists.")
    entry = ComplianceEntry(compliance_id=ctrl_id, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{ctrl_id}/entries/{entry_id}", response_model=ComplianceEntryOut)
def update_entry(ctrl_id: UUID, entry_id: UUID, payload: ComplianceEntryCreate, db: Session = Depends(get_db)):
    entry = db.query(ComplianceEntry).filter(
        ComplianceEntry.id == entry_id,
        ComplianceEntry.compliance_id == ctrl_id,
    ).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(entry, field, val)
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{ctrl_id}/entries", response_model=list[ComplianceEntryOut])
def list_entries(
    ctrl_id: UUID,
    quarter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    ctrl = db.query(ComplianceControl).filter(ComplianceControl.id == ctrl_id).first()
    if not ctrl:
        raise HTTPException(404, "Compliance control not found")
    q = db.query(ComplianceEntry).filter(ComplianceEntry.compliance_id == ctrl_id)
    if quarter:
        q = q.filter(ComplianceEntry.quarter == quarter)
    return q.all()
