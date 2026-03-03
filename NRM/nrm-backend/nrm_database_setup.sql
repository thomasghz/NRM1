-- =============================================================================
-- NATIONAL RISK MANAGEMENT SYSTEM
-- PostgreSQL Database & Schema Creation Script
-- 
-- Usage:
--   Step 1 (as superuser):  psql -U postgres -f nrm_database_setup.sql
--   Step 2 (connect to db): psql -U nrm_user -d nrm_db -f nrm_database_setup.sql
--   Or run entirely:        psql -U postgres -c "\i nrm_database_setup.sql"
-- =============================================================================


-- =============================================================================
-- PART 1: DATABASE & USER
-- =============================================================================

-- Create application user (skip if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'nrm_user') THEN
    CREATE USER nrm_user WITH PASSWORD 'nrm_pass';
    RAISE NOTICE 'User nrm_user created.';
  ELSE
    RAISE NOTICE 'User nrm_user already exists, skipping.';
  END IF;
END
$$;

-- Create database (skip if already exists)
SELECT 'CREATE DATABASE nrm_db OWNER nrm_user ENCODING ''UTF8'''
  WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'nrm_db')
\gexec

GRANT ALL PRIVILEGES ON DATABASE nrm_db TO nrm_user;

-- =============================================================================
-- IMPORTANT: Connect to nrm_db before running the rest of this script.
-- In psql:  \c nrm_db
-- =============================================================================

\c nrm_db

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "pgcrypto";


-- =============================================================================
-- PART 2: REFERENCE / LOOKUP TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS likelihood_scale (
    level        INTEGER PRIMARY KEY CHECK (level BETWEEN 1 AND 5),
    label        VARCHAR(50)  NOT NULL,
    description  TEXT
);

CREATE TABLE IF NOT EXISTS consequence_scale (
    severity         INTEGER PRIMARY KEY CHECK (severity BETWEEN 1 AND 5),
    label            VARCHAR(50) NOT NULL,
    financial        TEXT,
    reputation       TEXT,
    human_capital    TEXT,
    service_delivery TEXT,
    regulatory       TEXT,
    projects         TEXT,
    info_systems     TEXT
);

CREATE TABLE IF NOT EXISTS risk_acceptance_criteria (
    id          SERIAL PRIMARY KEY,
    score_min   INTEGER      NOT NULL,
    score_max   INTEGER      NOT NULL,
    zone        VARCHAR(20)  NOT NULL,   -- Low | Medium | High | Critical
    action      VARCHAR(60)  NOT NULL,   -- Accept | Monitor | Treat | Treat + Escalate
    colour_hex  CHAR(6)                  -- e.g. 92D050 (green), FFC000 (amber), FF0000 (red)
);


-- =============================================================================
-- PART 3: CORE ENTITIES
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Departments
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS departments (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    name           VARCHAR(255) NOT NULL,
    assessed_unit  VARCHAR(255),
    objective      TEXT,
    fiscal_year    VARCHAR(20)  NOT NULL DEFAULT '2025/2026',
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
    updated_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Critical Success Factors (linked to a department)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS critical_success_factors (
    id             UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id  UUID         NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    pillar         VARCHAR(255) NOT NULL,
    characteristics TEXT,
    created_at     TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Risks  (central entity)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risks (
    id              UUID  PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id   UUID  NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    csf_id          UUID  REFERENCES critical_success_factors(id) ON DELETE SET NULL,

    risk_event      TEXT  NOT NULL,
    risk_source     TEXT,
    risk_effect     TEXT,

    -- Inherent risk scores (1–5 each)
    likelihood_i            INTEGER CHECK (likelihood_i            BETWEEN 1 AND 5),
    financial_i             INTEGER CHECK (financial_i             BETWEEN 1 AND 5),
    reputation_i            INTEGER CHECK (reputation_i            BETWEEN 1 AND 5),
    human_capital_i         INTEGER CHECK (human_capital_i         BETWEEN 1 AND 5),
    service_delivery_i      INTEGER CHECK (service_delivery_i      BETWEEN 1 AND 5),
    regulatory_i            INTEGER CHECK (regulatory_i            BETWEEN 1 AND 5),
    projects_i              INTEGER CHECK (projects_i              BETWEEN 1 AND 5),
    info_systems_i          INTEGER CHECK (info_systems_i          BETWEEN 1 AND 5),

    -- Computed: max of the 7 consequence dimensions (stored by app layer)
    overall_inherent_consequence  INTEGER,
    -- Computed: likelihood_i * overall_inherent_consequence
    irl                           INTEGER,

    current_controls  TEXT,

    -- Residual risk scores (1–5 each)
    likelihood_r            INTEGER CHECK (likelihood_r            BETWEEN 1 AND 5),
    financial_r             INTEGER CHECK (financial_r             BETWEEN 1 AND 5),
    reputation_r            INTEGER CHECK (reputation_r            BETWEEN 1 AND 5),
    human_capital_r         INTEGER CHECK (human_capital_r         BETWEEN 1 AND 5),
    service_delivery_r      INTEGER CHECK (service_delivery_r      BETWEEN 1 AND 5),
    regulatory_r            INTEGER CHECK (regulatory_r            BETWEEN 1 AND 5),
    projects_r              INTEGER CHECK (projects_r              BETWEEN 1 AND 5),
    info_systems_r          INTEGER CHECK (info_systems_r          BETWEEN 1 AND 5),

    -- Computed: max of the 7 residual consequence dimensions
    overall_residual_consequence  INTEGER,
    -- Computed: likelihood_r * overall_residual_consequence
    rrl                           INTEGER,

    evaluation  VARCHAR(10) CHECK (evaluation IN ('Accept', 'Treat')),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Treatment Plans  (per risk, status stored per quarter)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS treatment_plans (
    id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id             UUID         NOT NULL REFERENCES risks(id) ON DELETE CASCADE,

    improvement_action  TEXT         NOT NULL,
    due_date            DATE,
    responsibility      VARCHAR(255),

    -- Q1 (July–Sept)
    q1_status           VARCHAR(50)  CHECK (q1_status IN ('Not Started','WIP','Completed','Overdue','Select one')),
    q1_comments         TEXT,
    q1_further_action   TEXT,

    -- Q2 (Oct–Dec)
    q2_status           VARCHAR(50)  CHECK (q2_status IN ('Not Started','WIP','Completed','Overdue','Select one')),
    q2_comments         TEXT,
    q2_further_action   TEXT,

    -- Q3 (Jan–Mar)
    q3_status           VARCHAR(50)  CHECK (q3_status IN ('Not Started','WIP','Completed','Overdue','Select one')),
    q3_comments         TEXT,
    q3_further_action   TEXT,

    -- Q4 (Apr–Jun)
    q4_status           VARCHAR(50)  CHECK (q4_status IN ('Not Started','WIP','Completed','Overdue','Select one')),
    q4_comments         TEXT,
    q4_further_action   TEXT,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Key Risk Indicators (KRIs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kris (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id          UUID          NOT NULL REFERENCES risks(id) ON DELETE CASCADE,

    description      TEXT          NOT NULL,
    frequency        VARCHAR(50)   CHECK (frequency IN ('Monthly','Quarterly','Annually')),
    green_threshold  NUMERIC(10,2) NOT NULL,
    amber_threshold  NUMERIC(10,2) NOT NULL,
    -- lower_is_better: fewer incidents = good
    -- higher_is_better: higher adoption % = good
    direction        VARCHAR(20)   NOT NULL DEFAULT 'lower_is_better'
                                   CHECK (direction IN ('lower_is_better','higher_is_better')),
    responsibility   VARCHAR(255),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kri_entries (
    id                      UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    kri_id                  UUID          NOT NULL REFERENCES kris(id) ON DELETE CASCADE,

    quarter                 VARCHAR(10)   NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
    entry_value             NUMERIC(10,2),
    -- Computed by app: Green | Amber | Red
    status                  VARCHAR(10)   CHECK (status IN ('Green','Amber','Red')),

    comments                TEXT,
    action_taken            TEXT,
    due_date                DATE,
    responsibility          VARCHAR(255),
    previous_action_status  VARCHAR(50),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_kri_entry_quarter UNIQUE (kri_id, quarter)
);

-- ---------------------------------------------------------------------------
-- Key Performance Indicators (KPIs)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS kpis (
    id               UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id    UUID          NOT NULL REFERENCES departments(id) ON DELETE CASCADE,

    description      TEXT          NOT NULL,
    frequency        VARCHAR(50)   CHECK (frequency IN ('Monthly','Quarterly','Annually')),
    green_threshold  NUMERIC(10,2) NOT NULL,
    amber_threshold  NUMERIC(10,2) NOT NULL,
    direction        VARCHAR(20)   NOT NULL DEFAULT 'higher_is_better'
                                   CHECK (direction IN ('lower_is_better','higher_is_better')),
    responsibility   VARCHAR(255),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_entries (
    id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    kpi_id        UUID          NOT NULL REFERENCES kpis(id) ON DELETE CASCADE,

    quarter       VARCHAR(10)   NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
    entry_value   NUMERIC(10,2),
    -- Computed: Green | Amber | Red
    status        VARCHAR(10)   CHECK (status IN ('Green','Amber','Red')),

    comments      TEXT,
    action_taken  TEXT,
    due_date      DATE,
    responsibility VARCHAR(255),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_kpi_entry_quarter UNIQUE (kpi_id, quarter)
);

-- ---------------------------------------------------------------------------
-- Compliance Controls & Responses
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS compliance_controls (
    id                   UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id              UUID         NOT NULL REFERENCES risks(id) ON DELETE CASCADE,

    key_control          TEXT         NOT NULL,
    compliance_question  TEXT,
    frequency            VARCHAR(50)  CHECK (frequency IN ('Monthly','Quarterly','Annually')),
    responsibility       VARCHAR(255),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS compliance_entries (
    id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    compliance_id    UUID        NOT NULL REFERENCES compliance_controls(id) ON DELETE CASCADE,

    quarter          VARCHAR(10) NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
    response         VARCHAR(10) CHECK (response IN ('Yes','No')),
    -- Required when response = 'No'
    comments_for_no  TEXT,
    action_taken     TEXT,
    due_date         DATE,
    responsibility   VARCHAR(255),
    status           VARCHAR(50) CHECK (status IN ('WIP','Completed','Select one')),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_compliance_entry_quarter UNIQUE (compliance_id, quarter),

    -- Enforce: comments_for_no must be filled when response = 'No'
    CONSTRAINT chk_no_requires_comment
        CHECK (response != 'No' OR (comments_for_no IS NOT NULL AND comments_for_no <> ''))
);

-- ---------------------------------------------------------------------------
-- Incidents
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidents (
    id                         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    department_id              UUID        NOT NULL REFERENCES departments(id) ON DELETE CASCADE,
    risk_id                    UUID        REFERENCES risks(id) ON DELETE SET NULL,

    serial_no                  INTEGER,
    quarter                    VARCHAR(10) CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
    details                    TEXT,
    incident_date              DATE,
    location                   VARCHAR(255),
    direct_financial_impact    BOOLEAN     NOT NULL DEFAULT FALSE,
    non_financial_impact       TEXT,
    action_taken               TEXT,
    risk_causes                TEXT,
    risk_effects               TEXT,
    control_failed             TEXT,
    corrective_action          TEXT,
    case_summary_done          BOOLEAN     NOT NULL DEFAULT FALSE,
    managers_comments          TEXT,
    further_corrective_action  TEXT,
    due_date                   DATE,

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Risk Aggregation  (computed dashboard row, one per risk per quarter)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS risk_aggregation (
    id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    risk_id             UUID        NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    quarter             VARCHAR(10) NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),

    -- User-assigned rank (1 = highest priority)
    aggregate_ranking   INTEGER     CHECK (aggregate_ranking >= 1),
    -- Movement vs previous quarter: ↑ worsened | ↓ improved | → stable
    movement            VARCHAR(5),

    risk_owner_comments TEXT,
    action_being_taken  TEXT,
    due_date            DATE,
    responsible_person  VARCHAR(255),

    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT uq_aggregation_risk_quarter UNIQUE (risk_id, quarter)
);


-- =============================================================================
-- PART 4: INDEXES
-- =============================================================================

-- Risks filtered by department (most common query)
CREATE INDEX IF NOT EXISTS idx_risks_department_id
    ON risks(department_id);

-- Treatment plans per risk
CREATE INDEX IF NOT EXISTS idx_treatment_plans_risk_id
    ON treatment_plans(risk_id);

-- KRIs per risk
CREATE INDEX IF NOT EXISTS idx_kris_risk_id
    ON kris(risk_id);

-- KRI entries per KRI + quarter
CREATE INDEX IF NOT EXISTS idx_kri_entries_kri_id
    ON kri_entries(kri_id);
CREATE INDEX IF NOT EXISTS idx_kri_entries_quarter
    ON kri_entries(quarter);

-- KPIs per department
CREATE INDEX IF NOT EXISTS idx_kpis_department_id
    ON kpis(department_id);

-- KPI entries per KPI
CREATE INDEX IF NOT EXISTS idx_kpi_entries_kpi_id
    ON kpi_entries(kpi_id);

-- Compliance per risk
CREATE INDEX IF NOT EXISTS idx_compliance_controls_risk_id
    ON compliance_controls(risk_id);
CREATE INDEX IF NOT EXISTS idx_compliance_entries_compliance_id
    ON compliance_entries(compliance_id);

-- Incidents: filter by department, risk, quarter (aggregation use case)
CREATE INDEX IF NOT EXISTS idx_incidents_department_id
    ON incidents(department_id);
CREATE INDEX IF NOT EXISTS idx_incidents_risk_id
    ON incidents(risk_id);
CREATE INDEX IF NOT EXISTS idx_incidents_quarter
    ON incidents(quarter);

-- Risk aggregation lookup
CREATE INDEX IF NOT EXISTS idx_risk_aggregation_risk_id
    ON risk_aggregation(risk_id);
CREATE INDEX IF NOT EXISTS idx_risk_aggregation_quarter
    ON risk_aggregation(quarter);

-- CSFs per department
CREATE INDEX IF NOT EXISTS idx_csf_department_id
    ON critical_success_factors(department_id);


-- =============================================================================
-- PART 5: AUTO-UPDATE updated_at TRIGGER
-- =============================================================================

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
DECLARE
    tbl TEXT;
BEGIN
    FOREACH tbl IN ARRAY ARRAY[
        'departments','risks','treatment_plans',
        'kri_entries','kpi_entries',
        'compliance_entries','incidents','risk_aggregation'
    ]
    LOOP
        EXECUTE format(
            'DROP TRIGGER IF EXISTS trg_set_updated_at ON %I;
             CREATE TRIGGER trg_set_updated_at
             BEFORE UPDATE ON %I
             FOR EACH ROW EXECUTE FUNCTION set_updated_at();',
            tbl, tbl
        );
    END LOOP;
END;
$$;


-- =============================================================================
-- PART 6: SEED REFERENCE DATA
-- =============================================================================

-- Likelihood Scale (1–5)
INSERT INTO likelihood_scale (level, label, description)
VALUES
    (1, 'Rare',           'May occur only in exceptional circumstances (<10% probability)'),
    (2, 'Unlikely',       'Could occur at some time (10–30% probability)'),
    (3, 'Possible',       'Might occur at some time (30–50% probability)'),
    (4, 'Likely',         'Will probably occur in most circumstances (50–70% probability)'),
    (5, 'Almost Certain', 'Is expected to occur in most circumstances (>70% probability)')
ON CONFLICT (level) DO NOTHING;

-- Consequence Scale (1–5, 7 dimensions)
INSERT INTO consequence_scale
    (severity, label, financial, reputation, human_capital, service_delivery, regulatory, projects, info_systems)
VALUES
    (1, 'Insignificant',
        'Negligible financial loss (<0.1% budget)',
        'Minor internal criticism only',
        'No injury or illness',
        'Brief disruption < 1 day, no SLA breach',
        'Minor procedural breach, no penalty',
        'Minor delay < 1 week, within budget',
        'Minimal data loss, fully recoverable within hours'),

    (2, 'Minor',
        'Minor financial loss (0.1–1% budget)',
        'Limited external criticism, quickly resolved',
        'First-aid treatment only',
        'Disruption 1–3 days, minor SLA breach',
        'Regulatory notice issued, no fine',
        'Schedule slip 1–4 weeks, cost overrun <5%',
        'Some data loss, recoverable within 1 day'),

    (3, 'Moderate',
        'Significant financial loss (1–5% budget)',
        'Negative media coverage, reputational damage',
        'Medical treatment required, lost time',
        'Disruption 3–14 days, significant SLA breach',
        'Formal investigation, potential fine',
        'Schedule slip 1–3 months, cost overrun 5–15%',
        'Major data loss, recovery takes several days'),

    (4, 'Major',
        'Major financial loss (5–20% budget)',
        'Sustained negative media, senior leadership scrutiny',
        'Serious injury, permanent disability possible',
        'Service disruption >2 weeks, major SLA breach',
        'Regulatory sanction, significant fine',
        'Project failure, cost overrun >15%',
        'Critical system failure, recovery >1 week'),

    (5, 'Catastrophic',
        'Critical financial loss (>20% budget or existential threat)',
        'Loss of public confidence, political intervention',
        'Fatality or multiple serious injuries',
        'Full service collapse, long-term inability to operate',
        'Criminal prosecution, licence revocation',
        'Programme collapse, complete write-off',
        'Permanent or unrecoverable data/system loss')
ON CONFLICT (severity) DO NOTHING;

-- Risk Acceptance Criteria (Heat Map)
INSERT INTO risk_acceptance_criteria (score_min, score_max, zone, action, colour_hex)
VALUES
    ( 1,  4, 'Low',      'Accept — monitor annually',                '92D050'),
    ( 5,  9, 'Medium',   'Monitor — review quarterly',               'FFC000'),
    (10, 19, 'High',     'Treat — implement controls immediately',   'FF6600'),
    (20, 25, 'Critical', 'Treat + Escalate — immediate escalation',  'FF0000')
ON CONFLICT DO NOTHING;


-- =============================================================================
-- PART 7: GRANT TABLE PERMISSIONS TO nrm_user
-- =============================================================================

GRANT USAGE ON SCHEMA public TO nrm_user;

GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO nrm_user;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO nrm_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO nrm_user;

ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT USAGE, SELECT ON SEQUENCES TO nrm_user;


-- =============================================================================
-- PART 8: VERIFICATION QUERIES
-- =============================================================================

-- Show all created tables with row counts
SELECT
    tablename                              AS table_name,
    pg_size_pretty(pg_total_relation_size(
        quote_ident(tablename)))           AS total_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Confirm reference data was seeded
SELECT 'likelihood_scale'       AS ref_table, COUNT(*) AS rows FROM likelihood_scale
UNION ALL
SELECT 'consequence_scale',                   COUNT(*) FROM consequence_scale
UNION ALL
SELECT 'risk_acceptance_criteria',            COUNT(*) FROM risk_acceptance_criteria;

\echo ''
\echo '✅  NRM database schema created and seeded successfully.'
\echo '    Connect your API using: postgresql://nrm_user:nrm_pass@localhost:5432/nrm_db'
