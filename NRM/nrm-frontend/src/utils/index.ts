import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { RiskZone, KRIStatus, TreatmentStatus } from '@/types'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function zoneColor(zone?: RiskZone | null): string {
  switch (zone) {
    case 'Low':      return 'bg-green-100 text-green-800 border-green-200'
    case 'Medium':   return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'High':     return 'bg-orange-100 text-orange-800 border-orange-200'
    case 'Critical': return 'bg-red-100 text-red-800 border-red-200'
    default:         return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function zoneBg(zone?: RiskZone | null): string {
  switch (zone) {
    case 'Low':      return 'bg-green-500'
    case 'Medium':   return 'bg-yellow-500'
    case 'High':     return 'bg-orange-500'
    case 'Critical': return 'bg-red-600'
    default:         return 'bg-gray-400'
  }
}

export function kriColor(status?: KRIStatus | null): string {
  switch (status) {
    case 'Green': return 'bg-green-100 text-green-800 border-green-200'
    case 'Amber': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'Red':   return 'bg-red-100 text-red-800 border-red-200'
    default:      return 'bg-gray-100 text-gray-600 border-gray-200'
  }
}

export function kriDot(status?: KRIStatus | null): string {
  switch (status) {
    case 'Green': return 'bg-green-500'
    case 'Amber': return 'bg-yellow-500'
    case 'Red':   return 'bg-red-500'
    default:      return 'bg-gray-300'
  }
}

export function treatmentColor(status?: TreatmentStatus | null): string {
  switch (status) {
    case 'Completed':   return 'bg-green-100 text-green-800 border-green-200'
    case 'WIP':         return 'bg-blue-100 text-blue-800 border-blue-200'
    case 'Overdue':     return 'bg-red-100 text-red-800 border-red-200'
    case 'Not Started': return 'bg-gray-100 text-gray-600 border-gray-200'
    default:            return 'bg-gray-100 text-gray-500 border-gray-200'
  }
}

export function scoreToZone(score?: number | null): RiskZone | null {
  if (score == null) return null
  if (score <= 4)  return 'Low'
  if (score <= 9)  return 'Medium'
  if (score <= 19) return 'High'
  return 'Critical'
}

export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  return new Date(dateStr).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function truncate(str?: string | null, len = 60): string {
  if (!str) return '—'
  return str.length > len ? str.slice(0, len) + '…' : str
}