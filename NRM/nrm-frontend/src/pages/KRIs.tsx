import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Activity } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { KRIBadge } from '@/components/ui/Badge'
import { kriApi, riskApi, deptApi } from '@/api'
import type { KRI, KRIEntry, Quarter } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']

export default function KRIs() {
  const qc = useQueryClient()
  const [quarter, setQuarter] = useState<Quarter>('Q2')
  const [deptFilter, setDeptFilter] = useState('')
  const [kriModal, setKriModal] = useState(false)
  const [entryModal, setEntryModal] = useState<KRI | null>(null)
  const { register: rKRI, handleSubmit: hKRI, reset: resetKRI } = useForm<Partial<KRI>>({ defaultValues: { direction: 'lower_is_better' } })
  const { register: rEntry, handleSubmit: hEntry, reset: resetEntry } = useForm<Partial<KRIEntry>>()

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: risks = [] } = useQuery({ queryKey: ['risks', deptFilter], queryFn: () => riskApi.list(deptFilter || undefined) })
  const { data: kris = [], isLoading } = useQuery({ queryKey: ['kris', deptFilter], queryFn: () => kriApi.list() })

  const createKRIMut = useMutation({ mutationFn: kriApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['kris'] }); toast.success('KRI created'); setKriModal(false) }, onError: (e: Error) => toast.error(e.message) })
  const createEntryMut = useMutation({
    mutationFn: ({ kriId, data }: { kriId: string; data: Partial<KRIEntry> }) => kriApi.createEntry(kriId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['kris'] }); toast.success('Entry saved'); setEntryModal(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Key Risk Indicators" subtitle="Track KRI values and status per quarter" actions={
        <div className="flex items-center gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input w-44">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} className="input w-28">
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={() => { resetKRI({ direction: 'lower_is_better' }); setKriModal(true) }} className="btn-primary"><Plus className="w-4 h-4" />New KRI</button>
        </div>
      } />
      <div className="p-6">
        <div className="card overflow-hidden">
          {kris.length === 0 ? <EmptyState message="No KRIs defined." icon={<Activity className="w-12 h-12" />} /> : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">KRI Description</th>
                  <th className="table-th">Risk</th>
                  <th className="table-th">Direction</th>
                  <th className="table-th text-center">Green</th>
                  <th className="table-th text-center">Amber</th>
                  <th className="table-th text-center">Value ({quarter})</th>
                  <th className="table-th text-center">Status</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {kris.map(kri => {
                  const risk = risks.find(r => r.id === kri.risk_id)
                  const entry = kri.entries.find(e => e.quarter === quarter)
                  return (
                    <tr key={kri.id} className="hover:bg-slate-50">
                      <td className="table-td max-w-xs"><p className="text-sm font-medium truncate">{kri.description}</p></td>
                      <td className="table-td text-xs text-slate-500 max-w-xs"><p className="truncate">{risk?.risk_event || '-'}</p></td>
                      <td className="table-td text-xs text-slate-500">{kri.direction === 'lower_is_better' ? 'Lower is better' : 'Higher is better'}</td>
                      <td className="table-td text-center text-green-700 font-mono">{kri.green_threshold}</td>
                      <td className="table-td text-center text-yellow-700 font-mono">{kri.amber_threshold}</td>
                      <td className="table-td text-center font-mono">{entry?.entry_value ?? '-'}</td>
                      <td className="table-td text-center"><KRIBadge status={entry?.status} /></td>
                      <td className="table-td">
                        <button onClick={() => { setEntryModal(kri); resetEntry({ quarter }) }} className="text-blue-600 text-xs hover:underline">+ Entry</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={kriModal} onClose={() => setKriModal(false)} title="New KRI">
        <form onSubmit={hKRI(data => createKRIMut.mutate(data))} className="space-y-4">
          <div>
            <label className="label">Risk *</label>
            <select {...rKRI('risk_id', { required: true })} className="input">
              <option value="">Select risk</option>
              {risks.map(r => <option key={r.id} value={r.id}>{r.risk_event.slice(0,80)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Description *</label>
            <textarea {...rKRI('description', { required: true })} className="input" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="label">Green Threshold *</label>
              <input type="number" step="0.01" {...rKRI('green_threshold', { required: true, valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label className="label">Amber Threshold *</label>
              <input type="number" step="0.01" {...rKRI('amber_threshold', { required: true, valueAsNumber: true })} className="input" />
            </div>
            <div>
              <label className="label">Frequency</label>
              <select {...rKRI('frequency')} className="input">
                <option value="Quarterly">Quarterly</option>
                <option value="Monthly">Monthly</option>
                <option value="Annually">Annually</option>
              </select>
            </div>
          </div>
          <div>
            <label className="label">Direction</label>
            <select {...rKRI('direction')} className="input">
              <option value="lower_is_better">Lower is better</option>
              <option value="higher_is_better">Higher is better</option>
            </select>
          </div>
          <div>
            <label className="label">Responsibility</label>
            <input {...rKRI('responsibility')} className="input" />
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setKriModal(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createKRIMut.isPending}>Create KRI</button>
          </div>
        </form>
      </Modal>

      <Modal open={!!entryModal} onClose={() => setEntryModal(null)} title="Submit KRI Entry" size="sm">
        <form onSubmit={hEntry(data => entryModal && createEntryMut.mutate({ kriId: entryModal.id, data }))} className="space-y-4">
          <div>
            <label className="label">Quarter *</label>
            <select {...rEntry('quarter', { required: true })} className="input">
              {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Value *</label>
            <input type="number" step="0.01" {...rEntry('entry_value', { required: true, valueAsNumber: true })} className="input" />
          </div>
          <div>
            <label className="label">Comments</label>
            <textarea {...rEntry('comments')} className="input" />
          </div>
          <div>
            <label className="label">Action Taken</label>
            <textarea {...rEntry('action_taken')} className="input" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Due Date</label>
              <input type="date" {...rEntry('due_date')} className="input" />
            </div>
            <div>
              <label className="label">Responsibility</label>
              <input {...rEntry('responsibility')} className="input" />
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <button type="button" onClick={() => setEntryModal(null)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createEntryMut.isPending}>Save Entry</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}