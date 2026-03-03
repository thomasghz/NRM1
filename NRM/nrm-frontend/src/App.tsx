import { Routes, Route, Navigate } from 'react-router-dom'
import Sidebar from '@/components/layout/Sidebar'
import Dashboard from '@/pages/Dashboard'
import Departments from '@/pages/Departments'
import Risks from '@/pages/Risks'
import TreatmentPlans from '@/pages/TreatmentPlans'
import KRIs from '@/pages/KRIs'
import KPIs from '@/pages/KPIs'
import Compliance from '@/pages/Compliance'
import Incidents from '@/pages/Incidents'
import Aggregation from '@/pages/Aggregation'
import Export from '@/pages/Export'

export default function App() {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/departments" element={<Departments />} />
          <Route path="/risks" element={<Risks />} />
          <Route path="/treatment-plans" element={<TreatmentPlans />} />
          <Route path="/kris" element={<KRIs />} />
          <Route path="/kpis" element={<KPIs />} />
          <Route path="/compliance" element={<Compliance />} />
          <Route path="/incidents" element={<Incidents />} />
          <Route path="/aggregation" element={<Aggregation />} />
          <Route path="/export" element={<Export />} />
        </Routes>
      </main>
    </div>
  )
}
