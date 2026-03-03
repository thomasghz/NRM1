export type Quarter = 'Q1' | 'Q2' | 'Q3' | 'Q4'
export type RiskZone = 'Low' | 'Medium' | 'High' | 'Critical'
export type KRIStatus = 'Green' | 'Amber' | 'Red'
export type TreatmentStatus = 'Not Started' | 'WIP' | 'Completed' | 'Overdue' | 'Select one'
export type Frequency = 'Monthly' | 'Quarterly' | 'Annually'
export type Direction = 'lower_is_better' | 'higher_is_better'
export type Evaluation = 'Accept' | 'Treat'

export const QUARTER_LABELS: Record<Quarter, string> = {
  Q1: 'Q1 — Sept',
  Q2: 'Q2 — Dec',
  Q3: 'Q3 — Mar',
  Q4: 'Q4 — Jun',
}

export interface CSF {
  id: string
  department_id: string
  pillar: string
  characteristics?: string
}

export interface Department {
  id: string
  name: string
  assessed_unit?: string
  objective?: string
  fiscal_year: string
  csfs: CSF[]
}

export interface Risk {
  id: string
  department_id: string
  csf_id?: string
  risk_event: string
  risk_source?: string
  risk_effect?: string
  likelihood_i?: number
  financial_i?: number
  reputation_i?: number
  human_capital_i?: number
  service_delivery_i?: number
  regulatory_i?: number
  projects_i?: number
  info_systems_i?: number
  overall_inherent_consequence?: number
  irl?: number
  irl_zone?: RiskZone
  current_controls?: string
  likelihood_r?: number
  financial_r?: number
  reputation_r?: number
  human_capital_r?: number
  service_delivery_r?: number
  regulatory_r?: number
  projects_r?: number
  info_systems_r?: number
  overall_residual_consequence?: number
  rrl?: number
  rrl_zone?: RiskZone
  evaluation?: Evaluation
}

export interface TreatmentPlan {
  id: string
  risk_id: string
  improvement_action: string
  due_date?: string
  responsibility?: string
  q1_status?: TreatmentStatus; q1_comments?: string; q1_further_action?: string
  q2_status?: TreatmentStatus; q2_comments?: string; q2_further_action?: string
  q3_status?: TreatmentStatus; q3_comments?: string; q3_further_action?: string
  q4_status?: TreatmentStatus; q4_comments?: string; q4_further_action?: string
  effective_status?: TreatmentStatus
}

export interface KRIEntry {
  id: string
  kri_id: string
  quarter: Quarter
  entry_value?: number
  status?: KRIStatus
  comments?: string
  action_taken?: string
  due_date?: string
  responsibility?: string
  previous_action_status?: string
}

export interface KRI {
  id: string
  risk_id: string
  description: string
  frequency?: Frequency
  green_threshold: number
  amber_threshold: number
  direction: Direction
  responsibility?: string
  entries: KRIEntry[]
}

export interface KPIEntry {
  id: string
  kpi_id: string
  quarter: Quarter
  entry_value?: number
  status?: KRIStatus
  comments?: string
  action_taken?: string
  due_date?: string
  responsibility?: string
}

export interface KPI {
  id: string
  department_id: string
  description: string
  frequency?: Frequency
  green_threshold: number
  amber_threshold: number
  direction: Direction
  responsibility?: string
  entries: KPIEntry[]
}

export interface ComplianceEntry {
  id: string
  compliance_id: string
  quarter: Quarter
  response?: 'Yes' | 'No'
  comments_for_no?: string
  action_taken?: string
  due_date?: string
  responsibility?: string
  status?: string
}

export interface ComplianceControl {
  id: string
  risk_id: string
  key_control: string
  compliance_question?: string
  frequency?: Frequency
  responsibility?: string
  entries: ComplianceEntry[]
}

export interface Incident {
  id: string
  department_id: string
  risk_id?: string
  serial_no?: number
  quarter?: Quarter
  details?: string
  incident_date?: string
  location?: string
  direct_financial_impact: boolean
  non_financial_impact?: string
  action_taken?: string
  risk_causes?: string
  risk_effects?: string
  control_failed?: string
  corrective_action?: string
  case_summary_done: boolean
  managers_comments?: string
  further_corrective_action?: string
  due_date?: string
}

export interface AggregationRow {
  risk_id: string
  risk_event: string
  aggregate_ranking?: number
  movement?: string
  irl?: number
  irl_zone?: RiskZone
  rrl?: number
  rrl_zone?: RiskZone
  latest_kri_value?: number
  latest_kri_status?: KRIStatus
  kri_corrective_action_status?: string
  compliance_response?: 'Yes' | 'No'
  compliance_corrective_action_status?: string
  incident_count: number
  treatment_status?: TreatmentStatus
  risk_owner_comments?: string
  action_being_taken?: string
  due_date?: string
  responsible_person?: string
}

export interface AggregationOut {
  department_id: string
  quarter: Quarter
  risks: AggregationRow[]
}
