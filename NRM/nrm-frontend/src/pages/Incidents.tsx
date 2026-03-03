import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, AlertOctagon, Trash2, Pencil } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { incidentApi, riskApi, deptApi } from '@/api'
import type { Incident, Quarter } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']

export default function Incidents() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Incident | null>(null)
  const [deptFilter, setDeptFilter] = useState('')
  const [quarterFilter, setQuarterFilter] = useState('')
  const { register, handleSubmit, reset } = useForm<Partial<Incident>>()

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: risks = [] } = useQuery({ queryKey: ['risks', deptFilter], queryFn: () => riskApi.list(deptFilter || undefined) })
  const { data: incidents = [], isLoading } = useQuery({
    queryKey: ['incidents', deptFilter, quarterFilter],
    queryFn: () => incidentApi.list({ department: deptFilter || undefined, quarter: quarterFilter as Quarter || undefined }),
  })

  const createMut = useMutation({ mutationFn: incidentApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Incident logged'); setModalOpen(false) }, onError: (e: Error) => toast.error(e.message) })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Incident> }) => incidentApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Updated'); setModalOpen(false) }, onError: (e: Error) => toast.error(e.message) })
  const deleteMut = useMutation({ mutationFn: incidentApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['incidents'] }); toast.success('Deleted') }, onError: (e: Error) => toast.error(e.message) })

  function openNew() { setEditing(null); reset({}); setModalOpen(true) }
  function openEdit(i: Incident) { setEditing(i); reset(i); setModalOpen(true) }
  function onSubmit(data: Partial<Incident>) {
    if (editing) updateMut.mutate({ id: editing.id, data })
    else createMut.mutate(data)
  }

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Incidents Management" subtitle="Log and track risk incidents" actions={
        <div className="flex items-center gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input w-44">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={quarterFilter} onChange={e => setQuarterFilter(e.target.value)} className="input w-28">
            <option value="">All Quarters</option>
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" />Log Incident</button>
        </div>
      } />
      <div className="p-6">
        <div className="card overflow-hidden">
          {incidents.length === 0 ? <EmptyState message="No incidents logged." icon={<AlertOctagon className="w-12 h-12" />} /> : (
            <table className="w-full">
              <thead><tr>
                <th className="table-th">#</th>
                <th className="table-th">Details</th>
                <th className="table-th">Date</th>
                <th className="table-th">Quarter</th>
                <th className="table-th">Location</th>
                <th className="table-th">Financial Impact</th>
                <th className="table-th">Case Summary</th>
                <th className="table-th"></th>
              </tr></thead>
              <tbody>
                {incidents.map(inc => (
                  <tr key={inc.id} className="hover:bg-slate-50">
                    <td className="table-td text-slate-500">{inc.serial_no || '-'}</td>
                    <td className="table-td max-w-sm"><p className="text-sm truncate font-medium">{inc.details || '-'}</p></td>
                    <td className="table-td text-xs text-slate-500 whitespace-nowrap">{inc.incident_date || '-'}</td>
                    <td className="table-td"><span className="badge bg-slate-100 text-slate-600 border-slate-200">{inc.quarter || '-'}</span></td>
                    <td className="table-td text-xs text-slate-500">{inc.location || '-'}</td>
                    <td className="table-td text-center">{inc.direct_financial_impact ? <span className="badge bg-red-100 text-red-800 border-red-200">Yes</span> : <span className="text-slate-400 text-xs">No</span>}</td>
                    <td className="table-td text-center">{inc.case_summary_done ? <span className="badge bg-green-100 text-green-800 border-green-200">Done</span> : <span className="text-slate-400 text-xs">Pending</span>}</td>
                    <td className="table-td">
                      <div className="flex items-center gap-1">
                        <button onClick={() => openEdit(inc)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                        <button onClick={() => { if (confirm('Delete?')) deleteMut.mutate(inc.id) }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Incident' : 'Log Incident'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-2 gap-4">
          <div><label className="label">Department *</label><select {...register('department_id', { required: true })} className="input"><option value="">Select</option>{departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
          <div><label className="label">Related Risk</label><select {...register('risk_id')} className="input"><option value="">None</option>{risks.map(r => <option key={r.id} value={r.id}>{r.risk_event.slice(0,60)}</option>)}</select></div>
          <div><label className="label">Serial No</label><input type="number" {...register('serial_no', { valueAsNumber: true })} className="input" /></div>
          <div><label className="label">Quarter</label><select {...register('quarter')} className="input"><option value="">Select</option>{QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}</select></div>
          <div className="col-span-2"><label className="label">Details</label><textarea {...register('details')} className="input min-h-[60px]" /></div>
          <div><label className="label">Incident Date</label><input type="date" {...register('incident_date')} className="input" /></div>
          <div><label className="label">Location</label><input {...register('location')} className="input" /></div>
          <div className="col-span-2"><label className="label">Risk Causes</label><textarea {...register('risk_causes')} className="input" /></div>
          <div className="col-span-2"><label className="label">Risk Effects</label><textarea {...register('risk_effects')} className="input" /></div>
          <div className="col-span-2"><label className="label">Control That Failed</label><textarea {...register('control_failed')} className="input" /></div>
          <div className="col-span-2"><label className="label">Corrective Action</label><textarea {...register('corrective_action')} className="input" /></div>
          <div className="col-span-2"><label className="label">Further Corrective Action</label><textarea {...register('further_corrective_action')} className="input" /></div>
          <div className="col-span-2 flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('direct_financial_impact')} className="rounded" />
              <span>Direct Financial Impact</span>
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" {...register('case_summary_done')} className="rounded" />
              <span>Case Summary Done</span>
            </label>
          </div>
          <div className="col-span-2 flex justify-end gap-3 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>{editing ? 'Save Changes' : 'Log Incident'}</button>
          </div>
        </form>
      </Modal>
    </div>
  )
}