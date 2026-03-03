from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, Query
from fastapi.responses import Response
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.excel_export import generate_workbook

router = APIRouter(prefix="/export", tags=["Export"])


@router.get("/template")
def export_template(
    department: UUID = Query(..., description="Department UUID"),
    quarter: str = Query(..., description="Q1 | Q2 | Q3 | Q4"),
    db: Session = Depends(get_db),
):
    """Generate a fully populated NRM .xlsx workbook for the given department and quarter."""
    valid_quarters = {"Q1", "Q2", "Q3", "Q4"}
    if quarter not in valid_quarters:
        raise HTTPException(400, f"quarter must be one of {valid_quarters}")
    try:
        xlsx_bytes = generate_workbook(db, department, quarter)
    except ValueError as e:
        raise HTTPException(404, str(e))
    except RuntimeError as e:
        raise HTTPException(500, str(e))

    filename = f"NRM_{department}_{quarter}.xlsx"
    return Response(
        content=xlsx_bytes,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": f'attachment; filename="{filename}"'},
    )
