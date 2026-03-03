import axios from 'axios'
import type {
  Department, Risk, TreatmentPlan, KRI, KRIEntry,
  KPI, KPIEntry, ComplianceControl, ComplianceEntry,
  Incident, AggregationOut, Quarter,
} from '@/types'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'API error'
    return Promise.reject(new Error(Array.isArray(msg) ? msg[0]?.msg : msg))
  }
)

export const deptApi = {
  list: () => api.get<Department[]>('/departments').then(r => r.data),
  get: (id: string) => api.get<Department>(`/departments/${id}`).then(r => r.data),
  create: (data: Partial<Department> & { csfs?: { pillar: string; characteristics?: string }[] }) =>
    api.post<Department>('/departments', data).then(r => r.data),
  update: (id: string, data: Partial<Department>) =>
    api.put<Department>(`/departments/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/departments/${id}`),
  addCSF: (id: string, data: { pillar: string; characteristics?: string }) =>
    api.post(`/departments/${id}/csfs`, data).then(r => r.data),
}

export const riskApi = {
  list: (departmentId?: string) =>
    api.get<Risk[]>('/risks', { params: { department: departmentId } }).then(r => r.data),
  get: (id: string) => api.get<Risk>(`/risks/${id}`).then(r => r.data),
  create: (data: Partial<Risk>) => api.post<Risk>('/risks', data).then(r => r.data),
  update: (id: string, data: Partial<Risk>) =>
    api.put<Risk>(`/risks/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/risks/${id}`),
  getIRLRRL: (id: string) => api.get(`/risks/${id}/irl-rrl`).then(r => r.data),
}

export const treatmentApi = {
  list: (riskId?: string, quarter?: Quarter) =>
    api.get<TreatmentPlan[]>('/treatment-plans', { params: { risk: riskId, quarter } }).then(r => r.data),
  create: (data: Partial<TreatmentPlan>) =>
    api.post<TreatmentPlan>('/treatment-plans', data).then(r => r.data),
  update: (id: string, data: Partial<TreatmentPlan>) =>
    api.put<TreatmentPlan>(`/treatment-plans/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/treatment-plans/${id}`),
}

export const kriApi = {
  list: (riskId?: string) =>
    api.get<KRI[]>('/kris', { params: { risk: riskId } }).then(r => r.data),
  get: (id: string) => api.get<KRI>(`/kris/${id}`).then(r => r.data),
  create: (data: Partial<KRI>) => api.post<KRI>('/kris', data).then(r => r.data),
  update: (id: string, data: Partial<KRI>) => api.put<KRI>(`/kris/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/kris/${id}`),
  createEntry: (kriId: string, data: Partial<KRIEntry>) =>
    api.post<KRIEntry>(`/kris/${kriId}/entries`, data).then(r => r.data),
  updateEntry: (kriId: string, entryId: string, data: Partial<KRIEntry>) =>
    api.put<KRIEntry>(`/kris/${kriId}/entries/${entryId}`, data).then(r => r.data),
  getEntries: (kriId: string) =>
    api.get<KRIEntry[]>(`/kris/${kriId}/entries`).then(r => r.data),
}

export const kpiApi = {
  list: (departmentId?: string) =>
    api.get<KPI[]>('/kpis', { params: { department: departmentId } }).then(r => r.data),
  get: (id: string) => api.get<KPI>(`/kpis/${id}`).then(r => r.data),
  create: (data: Partial<KPI>) => api.post<KPI>('/kpis', data).then(r => r.data),
  update: (id: string, data: Partial<KPI>) => api.put<KPI>(`/kpis/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/kpis/${id}`),
  createEntry: (kpiId: string, data: Partial<KPIEntry>) =>
    api.post<KPIEntry>(`/kpis/${kpiId}/entries`, data).then(r => r.data),
  updateEntry: (kpiId: string, entryId: string, data: Partial<KPIEntry>) =>
    api.put<KPIEntry>(`/kpis/${kpiId}/entries/${entryId}`, data).then(r => r.data),
}

export const complianceApi = {
  list: (riskId?: string) =>
    api.get<ComplianceControl[]>('/compliance', { params: { risk: riskId } }).then(r => r.data),
  create: (data: Partial<ComplianceControl>) =>
    api.post<ComplianceControl>('/compliance', data).then(r => r.data),
  delete: (id: string) => api.delete(`/compliance/${id}`),
  createEntry: (ctrlId: string, data: Partial<ComplianceEntry>) =>
    api.post<ComplianceEntry>(`/compliance/${ctrlId}/entries`, data).then(r => r.data),
  updateEntry: (ctrlId: string, entryId: string, data: Partial<ComplianceEntry>) =>
    api.put<ComplianceEntry>(`/compliance/${ctrlId}/entries/${entryId}`, data).then(r => r.data),
  getEntries: (ctrlId: string, quarter?: Quarter) =>
    api.get<ComplianceEntry[]>(`/compliance/${ctrlId}/entries`, { params: { quarter } }).then(r => r.data),
}

export const incidentApi = {
  list: (params?: { risk?: string; department?: string; quarter?: Quarter }) =>
    api.get<Incident[]>('/incidents', { params }).then(r => r.data),
  get: (id: string) => api.get<Incident>(`/incidents/${id}`).then(r => r.data),
  create: (data: Partial<Incident>) => api.post<Incident>('/incidents', data).then(r => r.data),
  update: (id: string, data: Partial<Incident>) =>
    api.put<Incident>(`/incidents/${id}`, data).then(r => r.data),
  delete: (id: string) => api.delete(`/incidents/${id}`),
}

export const aggregationApi = {
  get: (departmentId: string, quarter: Quarter) =>
    api.get<AggregationOut>('/aggregation', { params: { department: departmentId, quarter } }).then(r => r.data),
  updateRank: (riskId: string, quarter: Quarter, ranking: number) =>
    api.put(`/aggregation/${riskId}/rank`, { aggregate_ranking: ranking }, { params: { quarter } }).then(r => r.data),
  updateComments: (riskId: string, quarter: Quarter, data: Record<string, string>) =>
    api.put(`/aggregation/${riskId}/comments`, data, { params: { quarter } }).then(r => r.data),
}

export const exportApi = {
  downloadTemplate: async (departmentId: string, quarter: Quarter) => {
    const res = await api.get('/export/template', {
      params: { department: departmentId, quarter },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(new Blob([res.data]))
    const a = document.createElement('a')
    a.href = url
    a.download = `NRM_${quarter}.xlsx`
    a.click()
    URL.revokeObjectURL(url)
  },
}

export default api