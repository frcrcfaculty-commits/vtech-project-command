import { useState } from 'react';
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
        'hidden md:flex flex-col fixed left-0 top-0 h-full bg-[var(--color-primary)] z-30 transition-all duration-200',
        collapsed ? 'w-16' : 'w-[280px]'
      )}
    >
      {/* Header */}
      <div className={cn('flex items-center h-16 border-b border-white/10', collapsed ? 'justify-center px-2' : 'px-6')}>
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">VT</span>
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">V-Tech</p>
              <p className="text-white/60 text-xs truncate">Project Command</p>
            </div>
          )}
        </div>
        {onToggleCollapse && (
          <button
            onClick={onToggleCollapse}
            className="ml-auto p-1.5 text-white/60 hover:text-white rounded-md transition-colors"
          >
            {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'w-full flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors',
                'hover:bg-white/5',
                isActive
                  ? 'bg-[var(--color-secondary)] text-white'
                  : 'text-white/70 hover:text-white',
                collapsed && 'justify-center px-2'
              )}
            >
              <item.icon size={20} className="flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={cn('border-t border-white/10 p-4', collapsed && 'px-2')}>
        <div className={cn('flex items-center gap-3', collapsed && 'justify-center')}>
          <div className="w-9 h-9 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
            <span className="text-white text-xs font-semibold">{initials(user.name)}</span>
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
              <Badge status={user.role === 'owner' ? 'completed' : 'in_progress'} label={user.role.replace('_', ' ')} className="mt-0.5" />
            </div>
          )}
        </div>
        {!collapsed && (
          <button
            onClick={onLogout}
            className="mt-3 w-full flex items-center justify-center gap-2 px-3 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-md transition-colors"
          >
            <LogOut size={16} />
            Logout
          </button>
        )}
      </div>
    </aside>
  );
}
