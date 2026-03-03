import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, ListChecks } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { TreatmentBadge } from '@/components/ui/Badge'
import { treatmentApi, riskApi, deptApi } from '@/api'
import type { Quarter, TreatmentPlan } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']
const STATUSES = ['Not Started','WIP','Completed','Overdue']

export default function TreatmentPlans() {
  const qc = useQueryClient()
  const [quarter, setQuarter] = useState<Quarter>('Q2')
  const [deptFilter, setDeptFilter] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<TreatmentPlan | null>(null)
  const { register, handleSubmit, reset } = useForm<Partial<TreatmentPlan>>()

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { data: risks = [] } = useQuery({ queryKey: ['risks', deptFilter], queryFn: () => riskApi.list(deptFilter || undefined) })
  const { data: plans = [], isLoading } = useQuery({ queryKey: ['treatment-plans', quarter], queryFn: () => treatmentApi.list(undefined, quarter) })

  const createMut = useMutation({ mutationFn: treatmentApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['treatment-plans'] }); toast.success('Action created'); closeModal() }, onError: (e: Error) => toast.error(e.message) })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<TreatmentPlan> }) => treatmentApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['treatment-plans'] }); toast.success('Updated'); closeModal() }, onError: (e: Error) => toast.error(e.message) })

  function openNew() { setEditingPlan(null); reset({}); setModalOpen(true) }
  function openEdit(p: TreatmentPlan) { setEditingPlan(p); reset(p); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditingPlan(null) }
  function onSubmit(data: Partial<TreatmentPlan>) {
    if (editingPlan) updateMut.mutate({ id: editingPlan.id, data })
    else createMut.mutate(data)
  }

  const q = quarter.toLowerCase() as 'q1'|'q2'|'q3'|'q4'

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Treatment Plans" subtitle="Quarterly improvement actions per risk" actions={
        <div className="flex items-center gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input w-44">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <select value={quarter} onChange={e => setQuarter(e.target.value as Quarter)} className="input w-28">
            {QUARTERS.map(q => <option key={q} value={q}>{q}</option>)}
          </select>
          <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" />Add Action</button>
        </div>
      } />
      <div className="p-6">
        <div className="card overflow-hidden">
          {plans.length === 0 ? <EmptyState message="No treatment plans yet." icon={<ListChecks className="w-12 h-12" />} /> : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Risk</th>
                  <th className="table-th">Improvement Action</th>
                  <th className="table-th">Due Date</th>
                  <th className="table-th">Responsibility</th>
                  <th className="table-th">Status ({quarter})</th>
                  <th className="table-th">Comments</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {plans.map(plan => {
                  const risk = risks.find(r => r.id === plan.risk_id)
                  const status = plan[(q + '_status') as keyof TreatmentPlan] as string
                  const comments = plan[(q + '_comments') as keyof TreatmentPlan] as string
                  return (
                    <tr key={plan.id} className="hover:bg-slate-50">
                      <td className="table-td max-w-xs"><p className="text-xs text-slate-500 truncate">{risk?.risk_event || plan.risk_id.slice(0,8)}</p></td>
                      <td className="table-td max-w-sm"><p className="text-sm truncate">{plan.improvement_action}</p></td>
                      <td className="table-td text-slate-500 text-xs whitespace-nowrap">{plan.due_date || '-'}</td>
                      <td className="table-td text-slate-500 text-xs">{plan.responsibility || '-'}</td>
                      <td className="table-td"><TreatmentBadge status={plan.effective_status || status} /></td>
                      <td className="table-td max-w-xs"><p className="text-xs text-slate-500 truncate">{comments || '-'}</p></td>
                      <td className="table-td">
                        <button onClick={() => openEdit(plan)} className="text-blue-600 text-xs hover:underline">Edit</button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editingPlan ? 'Edit Treatment Plan' : 'New Treatment Plan'} size="lg">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {!editingPlan && (
            <div>
              <label className="label">Risk *</label>
              <select {...register('risk_id', { required: true })} className="input">
                <option value="">Select risk</option>
                {risks.map(r => <option key={r.id} value={r.id}>{r.risk_event.slice(0,80)}</option>)}
              </select>
            </div>
          )}
          <div>
            <label className="label">Improvement Action *</label>
            <textarea {...register('improvement_action', { required: true })} className="input min-h-[60px]" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Due Date</label>
              <input type="date" {...register('due_date')} className="input" />
            </div>
            <div>
              <label className="label">Responsibility</label>
              <input {...register('responsibility')} className="input" />
            </div>
          </div>
          <div className="border-t pt-4">
            <p className="text-sm font-semibold text-slate-700 mb-3">Quarter Status</p>
            {QUARTERS.map(qtr => {
              const ql = qtr.toLowerCase() as 'q1'|'q2'|'q3'|'q4'
              return (
                <div key={qtr} className="mb-3">
                  <p className="text-xs font-medium text-slate-500 mb-1">{qtr}</p>
                  <div className="grid grid-cols-3 gap-2">
                    <select {...register((ql + '_status') as keyof TreatmentPlan)} className="input text-xs">
                      <option value="">Select</option>
                      {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <input {...register((ql + '_comments') as keyof TreatmentPlan)} className="input text-xs" placeholder="Comments" />
                    <input {...register((ql + '_further_action') as keyof TreatmentPlan)} className="input text-xs" placeholder="Further action" />
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {editingPlan ? 'Save Changes' : 'Create Action'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}