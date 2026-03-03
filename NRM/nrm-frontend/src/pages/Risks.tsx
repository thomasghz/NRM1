import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { ZoneBadge } from '@/components/ui/Badge'
import { riskApi, deptApi } from '@/api'
import type { Risk } from '@/types'

const DIMS = ['financial','reputation','human_capital','service_delivery','regulatory','projects','info_systems'] as const
const SCALE = [1,2,3,4,5]

export default function Risks() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Risk | null>(null)
  const [deptFilter, setDeptFilter] = useState('')

  const { data: risks = [], isLoading } = useQuery({ queryKey: ['risks', deptFilter], queryFn: () => riskApi.list(deptFilter || undefined) })
  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { register, handleSubmit, reset } = useForm<Partial<Risk>>()

  const createMut = useMutation({ mutationFn: riskApi.create, onSuccess: () => { qc.invalidateQueries({ queryKey: ['risks'] }); toast.success('Risk created'); closeModal() }, onError: (e: Error) => toast.error(e.message) })
  const updateMut = useMutation({ mutationFn: ({ id, data }: { id: string; data: Partial<Risk> }) => riskApi.update(id, data), onSuccess: () => { qc.invalidateQueries({ queryKey: ['risks'] }); toast.success('Updated'); closeModal() }, onError: (e: Error) => toast.error(e.message) })
  const deleteMut = useMutation({ mutationFn: riskApi.delete, onSuccess: () => { qc.invalidateQueries({ queryKey: ['risks'] }); toast.success('Deleted') }, onError: (e: Error) => toast.error(e.message) })

  function openNew() { setEditing(null); reset({}); setModalOpen(true) }
  function openEdit(r: Risk) { setEditing(r); reset(r); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }
  function onSubmit(data: Partial<Risk>) {
    if (editing) updateMut.mutate({ id: editing.id, data })
    else createMut.mutate(data)
  }

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Risk Register" subtitle="Manage all risks across departments" actions={
        <div className="flex items-center gap-3">
          <select value={deptFilter} onChange={e => setDeptFilter(e.target.value)} className="input w-48">
            <option value="">All Departments</option>
            {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </select>
          <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" />New Risk</button>
        </div>
      } />
      <div className="p-6">
        <div className="card overflow-hidden">
          {risks.length === 0 ? <EmptyState message="No risks found." icon={<AlertTriangle className="w-12 h-12" />} /> : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="table-th">Risk Event</th>
                  <th className="table-th">Department</th>
                  <th className="table-th text-center">IRL</th>
                  <th className="table-th text-center">IRL Zone</th>
                  <th className="table-th text-center">RRL</th>
                  <th className="table-th text-center">RRL Zone</th>
                  <th className="table-th text-center">Evaluation</th>
                  <th className="table-th"></th>
                </tr>
              </thead>
              <tbody>
                {risks.map(risk => {
                  const dept = departments.find(d => d.id === risk.department_id)
                  return (
                    <tr key={risk.id} className="hover:bg-slate-50">
                      <td className="table-td max-w-xs">
                        <p className="font-medium text-slate-800 truncate" title={risk.risk_event}>{risk.risk_event}</p>
                        {risk.risk_source && <p className="text-xs text-slate-400 truncate">{risk.risk_source}</p>}
                      </td>
                      <td className="table-td text-slate-500 text-xs">{dept?.name || '-'}</td>
                      <td className="table-td text-center font-mono font-semibold">{risk.irl ?? '-'}</td>
                      <td className="table-td text-center"><ZoneBadge zone={risk.irl_zone} /></td>
                      <td className="table-td text-center font-mono font-semibold">{risk.rrl ?? '-'}</td>
                      <td className="table-td text-center"><ZoneBadge zone={risk.rrl_zone} /></td>
                      <td className="table-td text-center">
                        {risk.evaluation ? <span className={'badge ' + (risk.evaluation === 'Treat' ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200')}>{risk.evaluation}</span> : '-'}
                      </td>
                      <td className="table-td">
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(risk)} className="p-1.5 hover:bg-slate-100 rounded-lg"><Pencil className="w-3.5 h-3.5 text-slate-500" /></button>
                          <button onClick={() => { if (confirm('Delete this risk?')) deleteMut.mutate(risk.id) }} className="p-1.5 hover:bg-red-50 rounded-lg"><Trash2 className="w-3.5 h-3.5 text-red-400" /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Risk' : 'New Risk'} size="xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="label">Risk Event *</label>
              <textarea {...register('risk_event', { required: true })} className="input min-h-[60px]" placeholder="What could go wrong..." />
            </div>
            <div>
              <label className="label">Department *</label>
              <select {...register('department_id', { required: true })} className="input">
                <option value="">Select department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Evaluation</label>
              <select {...register('evaluation')} className="input">
                <option value="">Auto-computed</option>
                <option value="Accept">Accept</option>
                <option value="Treat">Treat</option>
              </select>
            </div>
            <div className="col-span-2">
              <label className="label">Risk Source</label>
              <input {...register('risk_source')} className="input" placeholder="Why would it occur..." />
            </div>
            <div className="col-span-2">
              <label className="label">Risk Effect</label>
              <input {...register('risk_effect')} className="input" placeholder="What happens if it materialises..." />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Inherent Risk</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="label w-40 mb-0 flex-shrink-0">Likelihood</label>
                  <select {...register('likelihood_i', { valueAsNumber: true })} className="input">
                    <option value="">-</option>
                    {SCALE.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {DIMS.map(dim => (
                  <div key={dim} className="flex items-center gap-3">
                    <label className="label w-40 mb-0 flex-shrink-0 capitalize">{dim.replace('_', ' ')}</label>
                    <select {...register((dim + '_i') as keyof Risk, { valueAsNumber: true })} className="input">
                      <option value="">-</option>
                      {SCALE.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3 pb-2 border-b">Residual Risk</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <label className="label w-40 mb-0 flex-shrink-0">Likelihood</label>
                  <select {...register('likelihood_r', { valueAsNumber: true })} className="input">
                    <option value="">-</option>
                    {SCALE.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                </div>
                {DIMS.map(dim => (
                  <div key={dim} className="flex items-center gap-3">
                    <label className="label w-40 mb-0 flex-shrink-0 capitalize">{dim.replace('_', ' ')}</label>
                    <select {...register((dim + '_r') as keyof Risk, { valueAsNumber: true })} className="input">
                      <option value="">-</option>
                      {SCALE.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="label">Current Controls</label>
            <textarea {...register('current_controls')} className="input min-h-[60px]" placeholder="Existing controls in place..." />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {editing ? 'Save Changes' : 'Create Risk'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}