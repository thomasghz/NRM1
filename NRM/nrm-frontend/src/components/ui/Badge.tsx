import { cn } from '@/utils'

export function ZoneBadge({ zone }: { zone?: string | null }) {
  const map: Record<string, string> = {
    Low:      'bg-green-100 text-green-800 border-green-200',
    Medium:   'bg-yellow-100 text-yellow-800 border-yellow-200',
    High:     'bg-orange-100 text-orange-800 border-orange-200',
    Critical: 'bg-red-100 text-red-800 border-red-200',
  }
  if (!zone) return <span className="text-slate-400 text-xs">-</span>
  return <span className={cn('badge', map[zone] || 'bg-slate-100 text-slate-600 border-slate-200')}>{zone}</span>
}

export function KRIBadge({ status }: { status?: string | null }) {
  const map: Record<string, string> = {
    Green: 'bg-green-100 text-green-800 border-green-200',
    Amber: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    Red:   'bg-red-100 text-red-800 border-red-200',
  }
  if (!status) return <span className="text-slate-400 text-xs">-</span>
  const dot = status === 'Green' ? 'bg-green-500' : status === 'Amber' ? 'bg-yellow-500' : 'bg-red-500'
  return (
    <span className={cn('badge', map[status] || 'bg-slate-100 text-slate-600 border-slate-200')}>
      <span className={'w-1.5 h-1.5 rounded-full mr-1.5 inline-block ' + dot} />
      {status}
    </span>
  )
}

export function TreatmentBadge({ status }: { status?: string | null }) {
  const map: Record<string, string> = {
    Completed:     'bg-green-100 text-green-800 border-green-200',
    WIP:           'bg-blue-100 text-blue-800 border-blue-200',
    Overdue:       'bg-red-100 text-red-800 border-red-200',
    'Not Started': 'bg-slate-100 text-slate-600 border-slate-200',
  }
  if (!status || status === 'Select one') return <span className="text-slate-400 text-xs">-</span>
  return <span className={cn('badge', map[status] || 'bg-slate-100 text-slate-600 border-slate-200')}>{status}</span>
}

export default function Badge({ children, className, variant = 'default' }: {
  children: React.ReactNode; className?: string; variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger:  'bg-red-100 text-red-800 border-red-200',
    info:    'bg-blue-100 text-blue-800 border-blue-200',
  }
  return <span className={cn('badge', variants[variant], className)}>{children}</span>
}