from uuid import UUID
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Incident
from app.schemas.schemas import IncidentCreate, IncidentUpdate, IncidentOut, IncidentCountOut

router = APIRouter(prefix="/incidents", tags=["Incidents"])


@router.post("", response_model=IncidentOut, status_code=201)
def create_incident(payload: IncidentCreate, db: Session = Depends(get_db)):
    incident = Incident(**payload.model_dump())
    db.add(incident)
    db.commit()
    db.refresh(incident)
    return incident


@router.get("", response_model=list[IncidentOut])
def list_incidents(
    risk: Optional[UUID] = Query(None),
    department: Optional[UUID] = Query(None),
    quarter: Optional[str] = Query(None),
    db: Session = Depends(get_db),
):
    q = db.query(Incident)
    if risk:
        q = q.filter(Incident.risk_id == risk)
    if department:
        q = q.filter(Incident.department_id == department)
    if quarter:
        q = q.filter(Incident.quarter == quarter)
    return q.all()


@router.get("/count", response_model=IncidentCountOut)
def count_incidents(
    risk: UUID = Query(...),
    quarter: str = Query(...),
    db: Session = Depends(get_db),
):
    count = (
        db.query(Incident)
        .filter(Incident.risk_id == risk, Incident.quarter == quarter)
        .count()
    )
    return IncidentCountOut(risk_id=risk, quarter=quarter, count=count)


@router.get("/{incident_id}", response_model=IncidentOut)
def get_incident(incident_id: UUID, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    return inc


@router.put("/{incident_id}", response_model=IncidentOut)
def update_incident(incident_id: UUID, payload: IncidentUpdate, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(inc, field, val)
    db.commit()
    db.refresh(inc)
    return inc


@router.delete("/{incident_id}", status_code=204)
def delete_incident(incident_id: UUID, db: Session = Depends(get_db)):
    inc = db.query(Incident).filter(Incident.id == incident_id).first()
    if not inc:
        raise HTTPException(404, "Incident not found")
    db.delete(inc)
    db.commit()
