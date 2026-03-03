# NRM Frontend

React + TypeScript + Vite frontend for the National Risk Management System.

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Set API URL (copy and edit)
cp env.example .env

# 3. Start dev server
npm run dev
# App runs at http://localhost:5173
```

## Prerequisites

- Node.js 18+
- The NRM Backend API running at http://localhost:8000

## Tech Stack

| Technology | Version | Purpose |
|---|---|---|
| React | 18 | UI framework |
| TypeScript | 5 | Type safety |
| Vite | 5 | Build tool |
| Tailwind CSS | 3 | Styling |
| TanStack Query | 5 | Server state / API caching |
| React Router | 6 | Client-side routing |
| React Hook Form | 7 | Form management |
| Axios | 1.7 | HTTP client |
| Recharts | 2 | Charts |
| Lucide React | 0.394 | Icons |
| React Hot Toast | 2 | Notifications |

## Project Structure

```
src/
  api/
    index.ts          - Axios client + all API functions (deptApi, riskApi, kriApi...)
  types/
    index.ts          - All TypeScript interfaces matching backend schemas
  utils/
    index.ts          - cn(), zoneColor(), kriColor(), formatDate()...
  components/
    layout/
      Sidebar.tsx     - Navigation sidebar
      Header.tsx      - Page header with title + actions slot
    ui/
      Badge.tsx       - ZoneBadge, KRIBadge, TreatmentBadge
      Modal.tsx       - Reusable dialog
      Spinner.tsx     - PageSpinner, EmptyState
  pages/
    Dashboard.tsx     - Overview charts + top risks table
    Departments.tsx   - Manage departments + CSFs
    Risks.tsx         - Full risk register with IRL/RRL scoring
    TreatmentPlans.tsx- Quarterly improvement actions
    KRIs.tsx          - Key Risk Indicators + quarterly entries
    KPIs.tsx          - Key Performance Indicators + entries
    Compliance.tsx    - Compliance controls + Yes/No responses
    Incidents.tsx     - Incident log
    Aggregation.tsx   - Risk aggregation dashboard (read + rank)
    Export.tsx        - Download filled Excel workbook
  App.tsx             - Route definitions
  main.tsx            - App entry point + providers
  index.css           - Tailwind base + component classes
```

## Pages Overview

| Page | Route | Description |
|---|---|---|
| Dashboard | /dashboard | Charts: zone distribution, risks per dept, top risks table |
| Departments | /departments | Create/edit departments, view CSFs |
| Risk Register | /risks | Full CRUD with 7-dimension scoring, IRL/RRL auto-computed |
| Treatment Plans | /treatment-plans | Quarterly actions, status per Q1-Q4 |
| KRIs | /kris | Define KRIs, submit quarterly values, Green/Amber/Red auto |
| KPIs | /kpis | Department KPIs with same threshold logic |
| Compliance | /compliance | Yes/No responses, comments required for No |
| Incidents | /incidents | Full incident log with corrective actions |
| Risk Aggregation | /aggregation | Cross-risk dashboard, editable rankings |
| Export | /export | Download .xlsx for any department + quarter |

## Building for Production

```bash
npm run build
# Output in dist/ folder - serve with any static host
```

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| VITE_API_URL | /api | Backend API base URL |
