from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import KPI, KPIEntry, Department
from app.schemas.schemas import KPICreate, KPIUpdate, KPIOut, KPIEntryCreate, KPIEntryOut
from app.services.business_logic import indicator_status

router = APIRouter(prefix="/kpis", tags=["KPIs"])


@router.post("", response_model=KPIOut, status_code=201)
def create_kpi(payload: KPICreate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == payload.department_id).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    kpi = KPI(**payload.model_dump())
    db.add(kpi)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.get("", response_model=list[KPIOut])
def list_kpis(department: Optional[UUID] = Query(None), db: Session = Depends(get_db)):
    q = db.query(KPI)
    if department:
        q = q.filter(KPI.department_id == department)
    return q.all()


@router.get("/{kpi_id}", response_model=KPIOut)
def get_kpi(kpi_id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(404, "KPI not found")
    return kpi


@router.put("/{kpi_id}", response_model=KPIOut)
def update_kpi(kpi_id: UUID, payload: KPIUpdate, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(404, "KPI not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(kpi, field, val)
    db.commit()
    db.refresh(kpi)
    return kpi


@router.delete("/{kpi_id}", status_code=204)
def delete_kpi(kpi_id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(404, "KPI not found")
    db.delete(kpi)
    db.commit()


@router.post("/{kpi_id}/entries", response_model=KPIEntryOut, status_code=201)
def create_kpi_entry(kpi_id: UUID, payload: KPIEntryCreate, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(404, "KPI not found")
    existing = db.query(KPIEntry).filter(
        KPIEntry.kpi_id == kpi_id, KPIEntry.quarter == payload.quarter
    ).first()
    if existing:
        raise HTTPException(409, f"Entry for {payload.quarter} already exists.")
    status = indicator_status(
        payload.entry_value,
        float(kpi.green_threshold),
        float(kpi.amber_threshold),
        kpi.direction,
    )
    entry = KPIEntry(kpi_id=kpi_id, status=status, **payload.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


@router.put("/{kpi_id}/entries/{entry_id}", response_model=KPIEntryOut)
def update_kpi_entry(kpi_id: UUID, entry_id: UUID, payload: KPIEntryCreate, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(404, "KPI not found")
    entry = db.query(KPIEntry).filter(KPIEntry.id == entry_id, KPIEntry.kpi_id == kpi_id).first()
    if not entry:
        raise HTTPException(404, "Entry not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(entry, field, val)
    entry.status = indicator_status(
        float(entry.entry_value) if entry.entry_value is not None else None,
        float(kpi.green_threshold),
        float(kpi.amber_threshold),
        kpi.direction,
    )
    db.commit()
    db.refresh(entry)
    return entry


@router.get("/{kpi_id}/entries", response_model=list[KPIEntryOut])
def get_kpi_entries(kpi_id: UUID, db: Session = Depends(get_db)):
    kpi = db.query(KPI).filter(KPI.id == kpi_id).first()
    if not kpi:
        raise HTTPException(404, "KPI not found")
    return db.query(KPIEntry).filter(KPIEntry.kpi_id == kpi_id).all()
