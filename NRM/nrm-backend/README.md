# National Risk Management System — Backend API

A production-ready FastAPI backend for the NRM System. Manages the full risk lifecycle:
risks, treatment plans, KRIs, KPIs, compliance controls, incidents, and generates filled `.xlsx` exports.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111 |
| ORM | SQLAlchemy 2.0 |
| Database | PostgreSQL 16 |
| Migrations | Alembic |
| Validation | Pydantic v2 |
| Excel Export | openpyxl |
| Server | Uvicorn |

---

## Quick Start (Docker — recommended)

```bash
# 1. Clone / copy this directory
cd nrm-backend

# 2. Copy environment file
cp .env.example .env

# 3. Start database + API
docker-compose up --build

# 4. API is live at http://localhost:8000
# 5. Interactive docs at http://localhost:8000/docs
```

---

## Manual Setup (without Docker)

### Prerequisites
- Python 3.11+
- PostgreSQL 14+ running locally

### Steps

```bash
# 1. Create virtual environment
python -m venv venv
source venv/bin/activate          # Linux/Mac
venv\Scripts\activate             # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — set DATABASE_URL to your Postgres connection string

# 4. Create the database (in psql or pgAdmin)
CREATE DATABASE nrm_db;
CREATE USER nrm_user WITH PASSWORD 'nrm_pass';
GRANT ALL PRIVILEGES ON DATABASE nrm_db TO nrm_user;

# 5. Run migrations (creates all tables + seeds reference data)
alembic upgrade head

# 6. Start the API server
uvicorn app.main:app --reload --port 8000
```

---

## Project Structure

```
nrm-backend/
├── app/
│   ├── main.py                  # FastAPI app, CORS, router registration
│   ├── config.py                # Settings (DATABASE_URL, etc.)
│   ├── database.py              # SQLAlchemy engine + session + Base
│   ├── models/
│   │   └── models.py            # All ORM models (10 tables)
│   ├── schemas/
│   │   └── schemas.py           # All Pydantic request/response schemas
│   ├── routers/
│   │   ├── departments.py       # POST/GET/PUT /departments
│   │   ├── risks.py             # POST/GET/PUT /risks + /irl-rrl
│   │   ├── treatment_plans.py   # POST/GET/PUT /treatment-plans
│   │   ├── kris.py              # POST/GET/PUT /kris + /entries
│   │   ├── kpis.py              # POST/GET/PUT /kpis + /entries
│   │   ├── compliance.py        # POST/GET/PUT /compliance + /entries
│   │   ├── incidents.py         # POST/GET/PUT /incidents + /count
│   │   ├── aggregation.py       # GET /aggregation + rank/comments updates
│   │   └── export.py            # GET /export/template → .xlsx download
│   └── services/
│       ├── business_logic.py    # IRL/RRL, KRI status, treatment status, zones
│       └── excel_export.py      # openpyxl workbook generation
├── alembic/
│   ├── env.py                   # Alembic environment
│   └── versions/
│       └── 0001_initial_schema.py  # Full schema + reference data seed
├── alembic.ini
├── docker-compose.yml
├── Dockerfile
├── requirements.txt
└── .env.example
```

---

## API Endpoints

### Departments & CSFs
| Method | Path | Description |
|---|---|---|
| POST | `/departments` | Create department + CSFs |
| GET | `/departments` | List all departments |
| GET | `/departments/{id}` | Get department detail |
| PUT | `/departments/{id}` | Update department |
| DELETE | `/departments/{id}` | Delete department |
| POST | `/departments/{id}/csfs` | Add CSF to department |

### Risks
| Method | Path | Description |
|---|---|---|
| POST | `/risks` | Create risk (IRL/RRL auto-computed) |
| GET | `/risks?department=UUID` | List risks (filterable) |
| GET | `/risks/{id}` | Get risk |
| PUT | `/risks/{id}` | Update risk (recomputes IRL/RRL) |
| DELETE | `/risks/{id}` | Delete risk |
| GET | `/risks/{id}/irl-rrl` | Computed scores + zones |

### Treatment Plans
| Method | Path | Description |
|---|---|---|
| POST | `/treatment-plans` | Create action |
| GET | `/treatment-plans?risk=UUID&quarter=Q2` | List (with effective status) |
| PUT | `/treatment-plans/{id}` | Update status/comments |
| DELETE | `/treatment-plans/{id}` | Delete |

### KRIs
| Method | Path | Description |
|---|---|---|
| POST | `/kris` | Define KRI for a risk |
| GET | `/kris?risk=UUID` | List KRIs |
| PUT | `/kris/{id}` | Update KRI definition |
| DELETE | `/kris/{id}` | Delete KRI |
| POST | `/kris/{id}/entries` | Submit quarterly entry (status auto-computed) |
| PUT | `/kris/{id}/entries/{eid}` | Update entry |
| GET | `/kris/{id}/entries` | All entries with computed status |

### KPIs
Same structure as KRIs, under `/kpis`.

### Compliance
| Method | Path | Description |
|---|---|---|
| POST | `/compliance` | Define control + question |
| GET | `/compliance?risk=UUID` | List controls |
| POST | `/compliance/{id}/entries` | Submit Yes/No response |
| PUT | `/compliance/{id}/entries/{eid}` | Update entry |
| GET | `/compliance/{id}/entries?quarter=Q2` | List entries |

### Incidents
| Method | Path | Description |
|---|---|---|
| POST | `/incidents` | Log incident |
| GET | `/incidents?risk=UUID&quarter=Q2` | List incidents |
| GET | `/incidents/count?risk=UUID&quarter=Q2` | Count for aggregation |
| PUT | `/incidents/{id}` | Update incident |
| DELETE | `/incidents/{id}` | Delete incident |

### Risk Aggregation
| Method | Path | Description |
|---|---|---|
| GET | `/aggregation?department=UUID&quarter=Q2` | Full dashboard |
| PUT | `/aggregation/{riskId}/rank?quarter=Q2` | Set manual ranking |
| PUT | `/aggregation/{riskId}/comments?quarter=Q2` | Add narrative/owner comments |

### Export
| Method | Path | Description |
|---|---|---|
| GET | `/export/template?department=UUID&quarter=Q2` | Download filled `.xlsx` |

---

## Business Logic

### IRL / RRL
```
overall_consequence = MAX(financial, reputation, human_capital,
                          service_delivery, regulatory, projects, info_systems)
IRL = likelihood_i × overall_inherent_consequence
RRL = likelihood_r × overall_residual_consequence
```

### Risk Zones
| Score | Zone |
|---|---|
| 1–4 | Low |
| 5–9 | Medium |
| 10–19 | High |
| 20–25 | Critical |

### KRI / KPI Status
```
lower_is_better:  value ≤ green → Green | ≤ amber → Amber | else → Red
higher_is_better: value ≥ green → Green | ≥ amber → Amber | else → Red
```

### Treatment Auto-Overdue
If `DueDate < today` and `status ≠ Completed` → status is displayed as `Overdue`.

---

## Running Migrations

```bash
# Apply all migrations
alembic upgrade head

# Create a new migration after model changes
alembic revision --autogenerate -m "describe_change"

# Rollback one migration
alembic downgrade -1
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://nrm_user:nrm_pass@localhost:5432/nrm_db` | Postgres connection |
| `SECRET_KEY` | `change-this-in-production` | App secret |
| `DEBUG` | `True` | Debug mode |
