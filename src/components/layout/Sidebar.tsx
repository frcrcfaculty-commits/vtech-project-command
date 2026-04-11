import { useNavigate, useLocation } from 'react-router-dom';
import { LogOut, ChevronLeft, ChevronRight } from 'lucide-react';
import { NAV_ITEMS } from '@/lib/constants';
import { initials, cn } from '@/lib/utils';
import type { IUser } from '@/lib/types';
import { Badge } from '@/components/ui/Badge';

interface SidebarProps {
  user: IUser;
  onLogout: () => void;
  collapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function Sidebar({ user, onLogout, collapsed = false, onToggleCollapse }: SidebarProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = NAV_ITEMS[user.role] ?? [];

  return (
    <aside
      className={cn(
        'hidden md:flex flex-col fixed left-0 top-0 h-full z-30 transition-all duration-300',
        'glass-strong border-r border-white/10',
        collapsed ? 'w-16' : 'w-[280px]'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center h-16 border-b border-white/8', collapsed ? 'justify-center px-2' : 'px-6')}>
        <div className="flex items-center gap-3 min-w-0">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #723B8F, #DA2E8F)' }}
          >
            <span className="text-white text-sm font-bold">VT</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">V-Tech</p>
              <p className="text-white/40 text-xs truncate">Project Command</p>
            </div>
          )}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 text-white/40 hover:text-white/80 rounded-lg hover:bg-white/8 transition-all"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto px-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 py-2.5 text-sm font-medium transition-all duration-200 rounded-[var(--radius-sm)] mb-0.5',
                collapsed ? 'justify-center px-2' : 'px-4',
                isActive
                  ? 'bg-white/12 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/6',
              )}
            >
              <item.icon size={20} className={cn('flex-shrink-0', isActive && 'text-[var(--color-secondary)]')} />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-white/8 p-4', collapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, #723B8F, #DA2E8F)' }}
          >
            <span className="text-white text-xs font-semibold">{initials(user.full_name)}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.full_name}</p>
              <Badge status={user.role === 'owner' ? 'completed' : 'in_progress'} label={user.role.replace('_', ' ')} className="mt-0.5" />
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2.5 text-sm text-white/40 hover:text-white hover:bg-white/8 rounded-[var(--radius-sm)] transition-all"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
