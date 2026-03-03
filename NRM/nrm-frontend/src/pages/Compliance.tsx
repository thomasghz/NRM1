import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ShieldCheck } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { complianceApi, riskApi, deptApi } from '@/api'
import type { ComplianceControl, ComplianceEntry, Quarter } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']

export default function Compliance() {
  const qc = useQueryClient()
  const [quarter, setQuarter] = useState<Quarter>('Q2')
  const [deptFilter, setDeptFilter] = useState('')
  const [ctrlModal, setCtrlModal] = useState(false)
  const [entryModal, setEntryModal] = useState<ComplianceControl | null>(null)
  const { register: rCtrl, handleSubmit: hCtrl, reset: resetCtrl } = useForm<Partial<ComplianceControl>>()
  const { register: rEntry, handleSubmit: hEntry, reset: resetEntry, watch } = useForm<Partial<ComplianceEntry>>()
  const responseWatch = watch('response')

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: risks = [] } = useQuery({ queryKey: ['risks', deptFilter], queryFn: () => riskApi.list(deptFilter || undefined) })
  const { data: controls = [], isLoading } = useQuery({ queryKey: ['compliance', deptFilter], queryFn: () => complianceApi.list() })

  const createCtrlMut = useMutation({ mutationFn: complianceApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['compliance'] }); toast.success('Control created'); setCtrlModal(false) }, onError: (e: Error) => toast.error(e.message) })
  const createEntryMut = useMutation({
    mutationFn: ({ ctrlId, data }: { ctrlId: string; data: Partial<ComplianceEntry> }) => complianceApi.createEntry(ctrlId, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['compliance'] }); toast.success('Response saved'); setEntryModal(null) },
    onError: (e: Error) => toast.error(e.message),
  })

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Compliance" subtitle="Track compliance controls and quarterly responses" actions={
        <div className="flex items-center gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input w-44">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} className="input w-28">
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={() => { resetCtrl({}); setCtrlModal(true) }} className="btn-primary"><Plus className="w-4 h-4" />New Control</button>
        </div>
      } />
      <div className="p-6">
        <div className="card overflow-hidden">
          {controls.length === 0 ? <EmptyState message="No compliance controls defined." icon={<ShieldCheck className="w-12 h-12" />} /> : (
            <table className="w-full">
              <thead><tr>
                <th className="table-th">Key Control</th>
                <th className="table-th">Risk</th>
                <th className="table-th">Compliance Question</th>
                <th className="table-th text-center">Response ({quarter})</th>
                <th className="table-th text-center">Status</th>
                <th className="table-th"></th>
              </tr></thead>
              <tbody>
                {controls.map(ctrl => {
                  const risk = risks.find(r => r.id === ctrl.risk_id)
                  const entry = ctrl.entries.find(e => e.quarter === quarter)
                  const respColor = entry?.response === 'Yes' ? 'bg-green-100 text-green-800 border-green-200' : entry?.response === 'No' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-slate-100 text-slate-500 border-slate-200'
                  return (
                    <tr key={ctrl.id} className="hover:bg-slate-50">
                      <td className="table-td max-w-xs"><p className="text-sm font-medium truncate">{ctrl.key_control}</p></td>
                      <td className="table-td text-xs text-slate-500 max-w-xs"><p className="truncate">{risk?.risk_event || '-'}</p></td>
                      <td className="table-td text-xs text-slate-500 max-w-xs"><p className="truncate">{ctrl.compliance_question || '-'}</p></td>
                      <td className="table-td text-center">
                        {entry?.response ? <span className={'badge ' + respColor}>{entry.response}</span> : <span className="text-slate-400 text-xs">Not set</span>}
                      </td>
                      <td className="table-td text-center text-xs text-slate-500">{entry?.status || '-'}</td>
                      <td className="table-td"><button onClick={() => { setEntryModal(ctrl); resetEntry({ quarter, response: entry?.response }) }} className="text-blue-600 text-xs hover:underline">Respond</button></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={ctrlModal} onClose={() => setCtrlModal(false)} title="New Compliance Control">
        <form onSubmit={hCtrl(data => createCtrlMut.mutate(data))} className="space-y-4">
          <div><label className="label">Risk *</label><select {...rCtrl('risk_id', { required: true })} className="input"><option value="">Select risk</option>{risks.map(r => <option key={r.id} value={r.id}>{r.risk_event.slice(0,80)}</option>)}</select></div>
          <div><label className="label">Key Control *</label><textarea {...rCtrl('key_control', { required: true })} className="input" /></div>
          <div><label className="label">Compliance Question</label><textarea {...rCtrl('compliance_question')} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Frequency</label><select {...rCtrl('frequency')} className="input"><option value="Quarterly">Quarterly</option><option value="Monthly">Monthly</option><option value="Annually">Annually</option></select></div>
            <div><label className="label">Responsibility</label><input {...rCtrl('responsibility')} className="input" /></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setCtrlModal(false)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={createCtrlMut.isPending}>Create Control</button></div>
        </form>
      </Modal>

      <Modal open={!!entryModal} onClose={() => setEntryModal(null)} title="Compliance Response" size="sm">
        <form onSubmit={hEntry(data => entryModal && createEntryMut.mutate({ ctrlId: entryModal.id, data }))} className="space-y-4">
          <div><label className="label">Quarter *</label><select {...rEntry('quarter', { required: true })} className="input">{QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}</select></div>
          <div><label className="label">Response *</label><select {...rEntry('response', { required: true })} className="input"><option value="">Select</option><option value="Yes">Yes</option><option value="No">No</option></select></div>
          {responseWatch === 'No' && <div><label className="label">Comments (required for No) *</label><textarea {...rEntry('comments_for_no', { required: true })} className="input" /></div>}
          <div><label className="label">Action Taken</label><textarea {...rEntry('action_taken')} className="input" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Due Date</label><input type="date" {...rEntry('due_date')} className="input" /></div>
            <div><label className="label">Status</label><select {...rEntry('status')} className="input"><option value="">Select</option><option value="WIP">WIP</option><option value="Completed">Completed</option></select></div>
          </div>
          <div className="flex justify-end gap-3"><button type="button" onClick={() => setEntryModal(null)} className="btn-secondary">Cancel</button><button type="submit" className="btn-primary" disabled={createEntryMut.isPending}>Save Response</button></div>
        </form>
      </Modal>
    </div>
  )
}