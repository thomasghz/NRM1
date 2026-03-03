import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Building2, Activity, ShieldCheck, AlertOctagon, TrendingUp } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'
import Header from '@/components/layout/Header'
import { PageSpinner } from '@/components/ui/Spinner'
import { ZoneBadge } from '@/components/ui/Badge'
import { deptApi, riskApi, incidentApi } from '@/api'
import type { Quarter } from '@/types'

const QUARTER_OPTIONS: Quarter[] = ['Q1', 'Q2', 'Q3', 'Q4']
const ZONE_COLORS = { Low: '#16a34a', Medium: '#d97706', High: '#ea580c', Critical: '#dc2626' }

export default function Dashboard() {
  const [quarter, setQuarter] = useState<Quarter>('Q2')

  const { data: departments = [], isLoading: loadingDepts } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: risks = [], isLoading: loadingRisks } = useQuery({ queryKey: ['risks'], queryFn: () => riskApi.list() })
  const { data: incidents = [] } = useQuery({ queryKey: ['incidents'], queryFn: () => incidentApi.list() })

  if (loadingDepts || loadingRisks) return <PageSpinner />

  const zoneCounts = risks.reduce<Record<string, number>>((acc, r) => {
    const z = r.rrl_zone || 'Unknown'
    acc[z] = (acc[z] || 0) + 1
    return acc
  }, {})

  const pieData = Object.entries(zoneCounts).map(([name, value]) => ({ name, value }))

  const deptRiskCounts = departments.map(d => ({
    name: d.name.length > 12 ? d.name.slice(0, 12) + '...' : d.name,
    risks: risks.filter(r => r.department_id === d.id).length,
  }))

  const stats = [
    { label: 'Departments',      value: departments.length,                                icon: Building2,    color: 'bg-blue-50 text-blue-600' },
    { label: 'Total Risks',      value: risks.length,                                      icon: AlertTriangle, color: 'bg-orange-50 text-orange-600' },
    { label: 'Critical Risks',   value: risks.filter(r => r.rrl_zone === 'Critical').length, icon: TrendingUp,  color: 'bg-red-50 text-red-600' },
    { label: 'Incidents',        value: incidents.length,                                  icon: AlertOctagon,  color: 'bg-purple-50 text-purple-600' },
  ]

  return (
    <div>
      <Header
        title="Dashboard"
        subtitle="National Risk Management Overview"
        actions={
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} className="input w-32">
            {QUARTER_OPTIONS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        }
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-4 gap-4">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="card p-5 flex items-center gap-4">
              <div className={'p-3 rounded-xl ' + color}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-800">{value}</p>
                <p className="text-sm text-slate-500">{label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Risk Distribution by Zone</h2>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => name + ': ' + value}>
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={ZONE_COLORS[entry.name as keyof typeof ZONE_COLORS] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="card p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4">Risks per Department</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={deptRiskCounts}>
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="risks" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h2 className="text-base font-semibold text-slate-800">Top Risks by Residual Risk Level</h2>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="table-th">Risk Event</th>
                <th className="table-th">Department</th>
                <th className="table-th">IRL</th>
                <th className="table-th">RRL</th>
                <th className="table-th">Zone</th>
                <th className="table-th">Evaluation</th>
              </tr>
            </thead>
            <tbody>
              {[...risks].sort((a, b) => (b.rrl || 0) - (a.rrl || 0)).slice(0, 8).map(risk => {
                const dept = departments.find(d => d.id === risk.department_id)
                return (
                  <tr key={risk.id} className="hover:bg-slate-50">
                    <td className="table-td max-w-xs">
                      <p className="truncate font-medium text-slate-800">{risk.risk_event}</p>
                    </td>
                    <td className="table-td text-slate-500">{dept?.name || '-'}</td>
                    <td className="table-td font-mono font-medium">{risk.irl ?? '-'}</td>
                    <td className="table-td font-mono font-medium">{risk.rrl ?? '-'}</td>
                    <td className="table-td"><ZoneBadge zone={risk.rrl_zone} /></td>
                    <td className="table-td">
                      {risk.evaluation ? (
                        <span className={'badge ' + (risk.evaluation === 'Treat' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200')}>
                          {risk.evaluation}
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}