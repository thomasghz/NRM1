from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import KRI, KRIEntry, Risk
from app.schemas.schemas import KRICreate, KRIUpdate, KRIOut, KRIEntryCreate, KRIEntryOut
from app.services.business_logic import indicator_status

router = APIRouter(prefix="/kris", tags=["KRIs"])


@router.post("", response_model=KRIOut, status_code=201)
def create_kri(payload: KRICreate, db: Session = Depends(get_db)):
    risk = db.query(Risk).filter(Risk.id == payload.risk_id).first()
    if not risk:
        raise HTTPException(404, "Risk not found")
    kri = KRI(**payload.model_dump())
    db.add(kri)
    db.commit()
    db.refresh(kri)
    return kri


@router.get("", response_model=list[KRIOut])
def list_kris(risk: Optional[UUID] = Query(None), db: Session = Depends(get_db)):
    q = db.query(KRI)
    if risk:
        q = q.filter(KRI.risk_id == risk)
    return q.all()


@router.get("/{kri_id}", response_model=KRIOut)
def get_kri(kri_id: UUID, db: Session = Depends(get_db)):
    kri = db.query(KRI).filter(KRI.id == kri_id).first()
    if not kri:
        raise HTTPException(404, "KRI not found")
    return kri


@router.put("/{kri_id}", response_model=KRIOut)
def update_kri(kri_id: UUID, payload: KRIUpdate, db: Session = Depends(get_db)):
    kri = db.query(KRI).filter(KRI.id == kri_id).first()
    if not kri:
        raise HTTPException(404, "KRI not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(kri, field, val)
    db.commit()
    db.refresh(kri)
    return kri


@router.delete("/{kri_id}", status_code=204)
def delete_kri(kri_id: UUID, db: Session = Depends(get_db)):
    kri = db.query(KRI).filter(KRI.id == kri_id).first()
    if not kri:
        raise HTTPException(404, "KRI not found")
    db.delete(kri)
    db.commit()


@router.post("/{kri_id}/entries", response_model=KRIEntryOut, status_code=201)
def create_kri_entry(kri_id: UUID, payload: KRIEntryCreate, db: Session = Depends(get_db)):
    kri = db.query(KRI).filter(KRI.id == kri_id).first()
    if not kri:
        raise HTTPException(404, "KRI not found")

    existing = db.query(KRIEntry).filter(
        KRIEntry.kri_id == kri_id, KRIEntry.quarter == payload.quarter
    ).first()
    if existing:
        raise HTTPException(409, f"Entry for quarter {payload.quarter} already exists. Use PUT to update.")

    status = indicator_status(
        payload.entry_value,
        float(kri.green_threshold),
        float(kri.amber_threshold),
        kri.direction,
    )
    entry = KRIEntry(kri_id=kri_id, status=status, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{kri_id}/entries/{entry_id}", response_model=KRIEntryOut)
def update_kri_entry(kri_id: UUID, entry_id: UUID, payload: KRIEntryCreate, db: Session = Depends(get_db)):
    kri = db.query(KRI).filter(KRI.id == kri_id).first()
    if not kri:
        raise HTTPException(404, "KRI not found")
    entry = db.query(KRIEntry).filter(KRIEntry.id == entry_id, KRIEntry.kri_id == kri_id).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(entry, field, val)
    entry.status = indicator_status(
        float(entry.entry_value) if entry.entry_value is not None else None,
        float(kri.green_threshold),
        float(kri.amber_threshold),
        kri.direction,
    )
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{kri_id}/entries", response_model=list[KRIEntryOut])
def get_kri_entries(kri_id: UUID, db: Session = Depends(get_db)):
    kri = db.query(KRI).filter(KRI.id == kri_id).first()
    if not kri:
        raise HTTPException(404, "KRI not found")
    return db.query(KRIEntry).filter(KRIEntry.kri_id == kri_id).all()
