import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Building2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import Modal from '@/components/ui/Modal'
import { PageSpinner, EmptyState } from '@/components/ui/Spinner'
import { deptApi } from '@/api'
import type { Department } from '@/types'

interface DeptForm { name: string; assessed_unit: string; objective: string; fiscal_year: string }

export default function Departments() {
  const qc = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<Department | null>(null)
  const [expanded, setExpanded] = useState<string[]>([])

  const { data: departments = [], isLoading } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })
  const { register, handleSubmit, reset, formState: { errors } } = useForm<DeptForm>({
    defaultValues: { fiscal_year: '2025/2026' }
  })

  const createMut = useMutation({
    mutationFn: deptApi.create,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Department created'); closeModal() },
    onError: (e: Error) => toast.error(e.message),
  })
  const updateMut = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Department> }) => deptApi.update(id, data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Updated'); closeModal() },
    onError: (e: Error) => toast.error(e.message),
  })
  const deleteMut = useMutation({
    mutationFn: deptApi.delete,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['departments'] }); toast.success('Deleted') },
    onError: (e: Error) => toast.error(e.message),
  })

  function openNew() { setEditing(null); reset({ name: '', assessed_unit: '', objective: '', fiscal_year: '2025/2026' }); setModalOpen(true) }
  function openEdit(d: Department) { setEditing(d); reset({ name: d.name, assessed_unit: d.assessed_unit || '', objective: d.objective || '', fiscal_year: d.fiscal_year }); setModalOpen(true) }
  function closeModal() { setModalOpen(false); setEditing(null) }
  function onSubmit(data: DeptForm) {
    if (editing) updateMut.mutate({ id: editing.id, data })
    else createMut.mutate(data)
  }
  function toggleExpand(id: string) {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  if (isLoading) return <PageSpinner />

  return (
    <div>
      <Header title="Departments" subtitle="Manage departments and critical success factors" actions={
        <button onClick={openNew} className="btn-primary"><Plus className="w-4 h-4" />New Department</button>
      } />
      <div className="p-6">
        {departments.length === 0 ? (
          <div className="card"><EmptyState message="No departments yet. Create one to get started." icon={<Building2 className="w-12 h-12" />} /></div>
        ) : (
          <div className="space-y-3">
            {departments.map(dept => (
              <div key={dept.id} className="card overflow-hidden">
                <div className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50" onClick={() => toggleExpand(dept.id)}>
                  <div className="flex items-center gap-3">
                    {expanded.includes(dept.id) ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-800">{dept.name}</p>
                      <p className="text-xs text-slate-500">{dept.assessed_unit || 'No unit'} · FY {dept.fiscal_year} · {dept.csfs.length} CSFs</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={e => { e.stopPropagation(); openEdit(dept) }} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
                      <Pencil className="w-4 h-4 text-slate-500" />
                    </button>
                    <button onClick={e => { e.stopPropagation(); if (confirm('Delete this department?')) deleteMut.mutate(dept.id) }} className="p-2 hover:bg-red-50 rounded-lg transition-colors">
                      <Trash2 className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                </div>
                {expanded.includes(dept.id) && (
                  <div className="px-5 pb-4 border-t border-slate-100 pt-4 bg-slate-50/50">
                    {dept.objective && <p className="text-sm text-slate-600 mb-3"><span className="font-medium">Objective:</span> {dept.objective}</p>}
                    {dept.csfs.length > 0 ? (
                      <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Critical Success Factors</p>
                        <div className="grid grid-cols-2 gap-2">
                          {dept.csfs.map(csf => (
                            <div key={csf.id} className="bg-white rounded-lg border border-slate-200 p-3">
                              <p className="text-sm font-medium text-slate-700">{csf.pillar}</p>
                              {csf.characteristics && <p className="text-xs text-slate-500 mt-1">{csf.characteristics}</p>}
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : <p className="text-sm text-slate-400">No CSFs defined.</p>}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={closeModal} title={editing ? 'Edit Department' : 'New Department'}>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="label">Department Name *</label>
            <input {...register('name', { required: 'Required' })} className="input" placeholder="e.g. Risk Management Function" />
            {errors.name && <p className="field-error">{errors.name.message}</p>}
          </div>
          <div>
            <label className="label">Assessed Unit</label>
            <input {...register('assessed_unit')} className="input" placeholder="e.g. Risk Management" />
          </div>
          <div>
            <label className="label">Fiscal Year</label>
            <input {...register('fiscal_year')} className="input" placeholder="2025/2026" />
          </div>
          <div>
            <label className="label">Objective</label>
            <textarea {...register('objective')} className="input min-h-[80px]" placeholder="Department objective..." />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={closeModal} className="btn-secondary">Cancel</button>
            <button type="submit" className="btn-primary" disabled={createMut.isPending || updateMut.isPending}>
              {editing ? 'Save Changes' : 'Create Department'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}