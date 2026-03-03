import { NavLink } from 'react-router-dom'
import { LayoutDashboard, Building2, AlertTriangle, ListChecks, Activity, BarChart3, ShieldCheck, AlertOctagon, PieChart, Download, ShieldAlert } from 'lucide-react'
import { cn } from '@/utils'

const navItems = [
  { to: '/dashboard',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/departments',     icon: Building2,       label: 'Departments' },
  { to: '/risks',           icon: AlertTriangle,   label: 'Risk Register' },
  { to: '/treatment-plans', icon: ListChecks,      label: 'Treatment Plans' },
  { to: '/kris',            icon: Activity,        label: 'KRIs' },
  { to: '/kpis',            icon: BarChart3,       label: 'KPIs' },
  { to: '/compliance',      icon: ShieldCheck,     label: 'Compliance' },
  { to: '/incidents',       icon: AlertOctagon,    label: 'Incidents' },
  { to: '/aggregation',     icon: PieChart,        label: 'Risk Aggregation' },
  { to: '/export',          icon: Download,        label: 'Export' },
]

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-800 flex flex-col h-screen flex-shrink-0">
      <div className="p-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-white text-sm font-bold leading-tight">NRM System</p>
            <p className="text-slate-400 text-xs">Risk Management</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => (
          <NavLink key={to} to={to} className={({ isActive }) => cn('nav-item', isActive ? 'nav-active' : 'nav-inactive')}>
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-700">
        <p className="text-slate-500 text-xs text-center">FY 2025/2026</p>
      </div>
    </aside>
  )
}