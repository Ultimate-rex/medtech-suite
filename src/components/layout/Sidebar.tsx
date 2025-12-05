import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Stethoscope,
  Receipt,
  FlaskConical,
  Pill,
  Settings,
  Building2,
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/patients', icon: Users, label: 'Patients' },
  { to: '/appointments', icon: Calendar, label: 'Appointments' },
  { to: '/consultations', icon: Stethoscope, label: 'Consultations' },
  { to: '/billing', icon: Receipt, label: 'Billing' },
  { to: '/labs', icon: FlaskConical, label: 'Labs' },
  { to: '/pharmacy', icon: Pill, label: 'Pharmacy' },
  { to: '/admin', icon: Settings, label: 'Admin Panel' },
];

export function Sidebar({ className }: SidebarProps) {
  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen w-56 bg-sidebar text-sidebar-foreground',
        className
      )}
    >
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
          <Building2 className="h-8 w-8 text-sidebar-primary" />
          <span className="text-lg font-bold">Hospital XYZ</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs text-sidebar-foreground/60">
            © 2024 Hospital XYZ
          </p>
        </div>
      </div>
    </aside>
  );
}
