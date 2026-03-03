import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, BarChart3 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { KRIBadge } from '@/components/ui/Badge'
import { kpiApi, deptApi } from '@/api'
import type { KPI, KPIEntry, Quarter } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']

export default function KPIs() {
  const qc = useQueryClient()
  const [quarter, setQuarter] = useState<Quarter>('Q2')
  const [deptFilter, setDeptFilter] = useState('')
  const [kpiModal, setKpiModal] = useState(false)
  const [entryModal, setEntryModal] = useState<KPI | null>(null)
  const { register: rKPI, handleSubmit: hKPI, reset: resetKPI } = useForm<Partial<KPI>>({ defaultValues: { direction: 'higher_is_better' } })
  const { register: rEntry, handleSubmit: hEntry, reset: resetEntry } = useForm<Partial<KPIEntry>>()

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: kpis = [], isLoading } = useQuery({ queryKey: ['kpis', deptFilter], queryFn: () => kpiApi.list(deptFilter || undefined) })

  const createMut = useMutation({ mutationFn: kpiApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['kpis'] }); toast.success('KPI created'); setKpiModal(false) }, onError: (e: Error) => toast.error(e.message) })
  const entryMut = useMutation({
    mutationFn: ({ kpiId, data }: { kpiId: string; data: Partial<KPIEntry> }) => kpiApi.createEntry(kpiId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['kpis'] }); toast.success('Entry saved'); setEntryModal(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Key Performance Indicators" subtitle="Track departmental KPIs per quarter" actions={
        <div className="flex items-center gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input w-44">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} className="input w-28">
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={() => { resetKPI({ direction: 'higher_is_better' }); setKpiModal(true) }} className="btn-primary"><Plus className="w-4 h-4" />New KPI</button>
        </div>
      } />
      <div className="p-6">
        <div className="card overflow-hidden">
          {kpis.length === 0 ? <EmptyState message="No KPIs defined." icon={<BarChart3 className="w-12 h-12" />} /> : (
            <table className="w-full">
              <thead><tr>
                <th className="table-th">KPI</th>
                <th className="table-th">Department</th>
                <th className="table-th">Direction</th>
                <th className="table-th text-center">Green</th>
                <th className="table-th text-center">Amber</th>
                <th className="table-th text-center">Value ({quarter})</th>
                <th className="table-th text-center">Status</th>
                <th className="table-th"></th>
              </tr></thead>
              <tbody>
                {kpis.map(kpi => {
                  const dept = departments.find(d => d.id === kpi.department_id)
                  const entry = kpi.entries.find(e => e.quarter === quarter)
                  return (
                    <tr key={kpi.id} className="hover:bg-slate-50">
                      <td className="table-td max-w-xs"><p className="text-sm font-medium truncate">{kpi.description}</p></td>
                      <td className="table-td text-xs text-slate-500">{dept?.name || '-'}</td>
                      <td className="table-td text-xs text-slate-500">{kpi.direction === 'higher_is_better' ? 'Higher is better' : 'Lower is better'}</td>
                      <td className="table-td text-center text-green-700 font-mono">{kpi.green_threshold}</td>
                      <td className="table-td text-center text-yellow-700 font-mono">{kpi.amber_threshold}</td>
                      <td className="table-td text-center font-mono">{entry?.entry_value ?? '-'}</td>
                      <td className="table-td text-center"><KRIBadge status={entry?.status} /></td>
                      <td className="table-td"><button onClick={() => { setEntryModal(kpi); resetEntry({ quarter }) }} className="text-blue-600 text-xs hover:underline">+ Entry</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={kpiModal} onClose={() => setKpiModal(false)} title="New KPI">
        <form onSubmit={hKPI(data => createMut.mutate(data))} className="space-y-4">
          <div>
            <label className="label">Department *</label>
            <select {...rKPI('department_id', { required: true })} className="input">
              <option value="">Select department</option>
              {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...rKPI('description', { required: true })} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Green Threshold *</label><input type="number" step="0.01" {...rKPI('green_threshold', { required: true, valueAsNumber: true })} className="input" /></div>
            <div><label className="label">Amber Threshold *</label><input type="number" step="0.01" {...rKPI('amber_threshold', { required: true, valueAsNumber: true })} className="input" /></div>
            <div><label className="label">Frequency</label><select {...rKPI('frequency')} className="input"><option value="Quarterly">Quarterly</option><option value="Monthly">Monthly</option><option value="Annually">Annually</option></select></div>
          </div>
          <div><label className="label">Direction</label><select {...rKPI('direction')} className="input"><option value="higher_is_better">Higher is better</option><option value="lower_is_better">Lower is better</option></select></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setKpiModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={createMut.isPending}>Create KPI</button></div>
        </form>
      </Modal>

      <Modal open={!!entryModal} onClose={() => setEntryModal(null)} title="Submit KPI Entry" size="sm">
        <form onSubmit={hEntry(data => entryModal && entryMut.mutate({ kpiId: entryModal.id, data }))} className="space-y-4">
          <div><label className="label">Quarter *</label><select {...rEntry('quarter', { required: true })} className="input">{QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}</select></div>
          <div><label className="label">Value *</label><input type="number" step="0.01" {...rEntry('entry_value', { required: true, valueAsNumber: true })} className="input" /></div>
          <div><label className="label">Comments</label><textarea {...rEntry('comments')} className="input" /></div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setEntryModal(null)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={entryMut.isPending}>Save Entry</button></div>
        </form>
      </Modal>
    </div>
  )
}