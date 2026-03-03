from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import (
    departments, risks, treatment_plans,
    kris, kpis, compliance, incidents,
    aggregation, export,
)

app = FastAPI(
    title="National Risk Management System API",
    description=(
        "Backend API for the NRM System — manages risks, KRIs, KPIs, "
        "compliance controls, incidents, and generates Excel reports."
    ),
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# ---------------------------------------------------------------------------
# CORS — adjust origins for your frontend in production
# ---------------------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---------------------------------------------------------------------------
# Routers
# ---------------------------------------------------------------------------
app.include_router(departments.router)
app.include_router(risks.router)
app.include_router(treatment_plans.router)
app.include_router(kris.router)
app.include_router(kpis.router)
app.include_router(compliance.router)
app.include_router(incidents.router)
app.include_router(aggregation.router)
app.include_router(export.router)


@app.get("/", tags=["Health"])
def root():
    return {
        "service": "NRM Backend API",
        "version": "1.0.0",
        "docs": "/docs",
    }


@app.get("/health", tags=["Health"])
def health():
    return {"status": "ok"}
