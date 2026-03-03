import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { PieChart } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { ZoneBadge, KRIBadge, TreatmentBadge } from '@/components/ui/Badge'
import { aggregationApi, deptApi } from '@/api'
import type { Quarter } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']

export default function Aggregation() {
  const qc = useQueryClient()
  const [quarter, setQuarter] = useState<Quarter>('Q2')
  const [deptId, setDeptId] = useState('')

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: agg, isLoading } = useQuery({
    queryKey: ['aggregation', deptId, quarter],
    queryFn: () => deptId ? aggregationApi.get(deptId, quarter) : null,
    enabled: !!deptId,
  })

  const rankMut = useMutation({
    mutationFn: ({ riskId, rank }: { riskId: string; rank: number }) => aggregationApi.updateRank(riskId, quarter, rank),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['aggregation'] }); toast.success('Ranking updated') },
  })

  return (
    <div>
      <Header title="Risk Aggregation" subtitle="Consolidated risk dashboard per department and quarter" actions={
        <div className="flex items-center gap-3">
          <select value={deptId} onChange={e => setDeptId(e.target.value)} className="input w-52">
            <option value="">Select Department</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} className="input w-28">
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
        </div>
      } />
      <div className="p-6">
        {!deptId ? (
          <div className="card"><EmptyState message="Select a department to view the risk aggregation dashboard." icon={<PieChart className="w-12 h-12" />} /></div>
        ) : isLoading ? <PageSpinner /> : !agg || agg.risks.length === 0 ? (
          <div className="card"><EmptyState message="No risks found for this department and quarter." icon={<PieChart className="w-12 h-12" />} /></div>
        ) : (
          <div className="card overflow-x-auto">
            <table className="w-full min-w-max">
              <thead>
                <tr>
                  <th className="table-th">Rank</th>
                  <th className="table-th">Risk Event</th>
                  <th className="table-th text-center">Move</th>
                  <th className="table-th text-center">IRL</th>
                  <th className="table-th text-center">IRL Zone</th>
                  <th className="table-th text-center">RRL</th>
                  <th className="table-th text-center">RRL Zone</th>
                  <th className="table-th text-center">KRI Value</th>
                  <th className="table-th text-center">KRI Status</th>
                  <th className="table-th text-center">Compliance</th>
                  <th className="table-th text-center">Incidents</th>
                  <th className="table-th text-center">Treatment</th>
                  <th className="table-th">Owner Comments</th>
                </tr>
              </thead>
              <tbody>
                {agg.risks.map(row => (
                  <tr key={row.risk_id} className="hover:bg-slate-50">
                    <td className="table-td">
                      <input
                        type="number"
                        defaultValue={row.aggregate_ranking || ''}
                        className="input w-16 text-center text-sm"
                        onBlur={e => {
                          const val = parseInt(e.target.value)
                          if (!isNaN(val) && val !== row.aggregate_ranking) rankMut.mutate({ riskId: row.risk_id, rank: val })
                        }}
                      />
                    </td>
                    <td className="table-td max-w-xs"><p className="text-sm font-medium truncate" title={row.risk_event}>{row.risk_event}</p></td>
                    <td className="table-td text-center text-lg">{row.movement || '-'}</td>
                    <td className="table-td text-center font-mono font-semibold">{row.irl ?? '-'}</td>
                    <td className="table-td text-center"><ZoneBadge zone={row.irl_zone} /></td>
                    <td className="table-td text-center font-mono font-semibold">{row.rrl ?? '-'}</td>
                    <td className="table-td text-center"><ZoneBadge zone={row.rrl_zone} /></td>
                    <td className="table-td text-center font-mono">{row.latest_kri_value ?? '-'}</td>
                    <td className="table-td text-center"><KRIBadge status={row.latest_kri_status} /></td>
                    <td className="table-td text-center">
                      {row.compliance_response ? <span className={'badge ' + (row.compliance_response === 'Yes' ? 'bg-green-100 text-green-800 border-green-200' : 'bg-red-100 text-red-800 border-red-200')}>{row.compliance_response}</span> : <span className="text-slate-400 text-xs">-</span>}
                    </td>
                    <td className="table-td text-center">
                      <span className={'badge ' + (row.incident_count > 0 ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-600 border-slate-200')}>{row.incident_count}</span>
                    </td>
                    <td className="table-td text-center"><TreatmentBadge status={row.treatment_status} /></td>
                    <td className="table-td max-w-xs"><p className="text-xs text-slate-500 truncate">{row.risk_owner_comments || '-'}</p></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}