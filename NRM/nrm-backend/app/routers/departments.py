from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload

from app.database import get_db
from app.models.models import Department, CriticalSuccessFactor
from app.schemas.schemas import DepartmentCreate, DepartmentUpdate, DepartmentOut, CSFCreate, CSFOut

router = APIRouter(prefix="/departments", tags=["Departments"])


@router.post("", response_model=DepartmentOut, status_code=201)
def create_department(payload: DepartmentCreate, db: Session = Depends(get_db)):
    dept = Department(
        name=payload.name,
        assessed_unit=payload.assessed_unit,
        objective=payload.objective,
        fiscal_year=payload.fiscal_year,
    )
    db.add(dept)
    db.flush()
    for csf_data in (payload.csfs or []):
        csf = CriticalSuccessFactor(
            department_id=dept.id,
            pillar=csf_data.pillar,
            characteristics=csf_data.characteristics,
        )
        db.add(csf)
    db.commit()
    db.refresh(dept)
    return dept


@router.get("", response_model=list[DepartmentOut])
def list_departments(db: Session = Depends(get_db)):
    return (
        db.query(Department)
        .options(joinedload(Department.csfs))
        .all()
    )


@router.get("/{dept_id}", response_model=DepartmentOut)
def get_department(dept_id: UUID, db: Session = Depends(get_db)):
    dept = (
        db.query(Department)
        .options(joinedload(Department.csfs))
        .filter(Department.id == dept_id)
        .first()
    )
    if not dept:
        raise HTTPException(404, "Department not found")
    return dept


@router.put("/{dept_id}", response_model=DepartmentOut)
def update_department(dept_id: UUID, payload: DepartmentUpdate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    for field, val in payload.model_dump(exclude_none=True).items():
        setattr(dept, field, val)
    db.commit()
    db.refresh(dept)
    return dept


@router.delete("/{dept_id}", status_code=204)
def delete_department(dept_id: UUID, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    db.delete(dept)
    db.commit()


@router.post("/{dept_id}/csfs", response_model=CSFOut, status_code=201)
def add_csf(dept_id: UUID, payload: CSFCreate, db: Session = Depends(get_db)):
    dept = db.query(Department).filter(Department.id == dept_id).first()
    if not dept:
        raise HTTPException(404, "Department not found")
    csf = CriticalSuccessFactor(department_id=dept_id, **payload.model_dump())
    db.add(csf)
    db.commit()
    db.refresh(csf)
    return csf
