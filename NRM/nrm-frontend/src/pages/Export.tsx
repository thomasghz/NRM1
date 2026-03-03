import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { Download, FileSpreadsheet } from 'lucide-react'
import toast from 'react-hot-toast'
import Header from '@/components/layout/Header'
import { deptApi, exportApi } from '@/api'
import type { Quarter } from '@/types'

const QUARTERS: Quarter[] = ['Q1','Q2','Q3','Q4']
const QUARTER_LABELS: Record<Quarter, string> = { Q1:'Q1 — July to Sept', Q2:'Q2 — Oct to Dec', Q3:'Q3 — Jan to Mar', Q4:'Q4 — Apr to Jun' }

export default function Export() {
  const [deptId, setDeptId] = useState('')
  const [quarter, setQuarter] = useState<Quarter>('Q2')

  const { data: departments = [] } = useQuery({ queryKey: ['departments'], queryFn: deptApi.list })

  const exportMut = useMutation({
    mutationFn: () => exportApi.downloadTemplate(deptId, quarter),
    onSuccess: () => toast.success('Excel file downloaded'),
    onError: (e: Error) => toast.error(e.message),
  })

  return (
    <div>
      <Header title="Export" subtitle="Generate filled Excel workbooks for any department and quarter" />
      <div className="p-6">
        <div className="card p-6 max-w-xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-green-700" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-800">NRM Excel Template Export</h2>
              <p className="text-sm text-slate-500">Generates a fully populated .xlsx with all 7 NRM sheets</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Department *</label>
              <select value={deptId} onChange={e => setDeptId(e.target.value)} className="input">
                <option value="">Select a department</option>
                {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Quarter *</label>
              <div className="grid grid-cols-2 gap-3">
                {QUARTERS.map(q => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => setQuarter(q)}
                    className={'p-3 rounded-xl border-2 text-left transition-colors ' + (quarter === q ? 'border-blue-600 bg-blue-50' : 'border-slate-200 hover:border-slate-300')}
                  >
                    <p className={'text-sm font-semibold ' + (quarter === q ? 'text-blue-700' : 'text-slate-700')}>{q}</p>
                    <p className="text-xs text-slate-500">{QUARTER_LABELS[q]}</p>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-600 space-y-1">
              <p className="font-medium text-slate-700 mb-2">The export includes:</p>
              {['Register — risk scores, IRL/RRL, zones', '1. Risk Treatment Plan — quarterly statuses', '2. KRIs — values and Green/Amber/Red status', '3. KPIs — departmental performance', '4. Compliance — Yes/No responses', '5. Incidents Management — full incident log', 'Risk Aggregation — consolidated dashboard'].map(item => (
                <p key={item} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                  {item}
                </p>
              ))}
            </div>

            <button
              onClick={() => exportMut.mutate()}
              disabled={!deptId || exportMut.isPending}
              className="btn-primary w-full justify-center py-3"
            >
              <Download className="w-4 h-4" />
              {exportMut.isPending ? 'Generating...' : 'Download Excel Workbook'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}