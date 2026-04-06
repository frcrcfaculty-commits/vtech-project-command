import { useState } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { MobileNav } from './MobileNav';
import { useAuth } from '@/hooks/useAuth';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/projects': 'Projects',
  '/tasks': 'My Tasks',
  '/time': 'Time Entry',
  '/team': 'Team',
  '/settings': 'Settings',
};

export function AppShell() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  if (!user) return null;

  const pageTitle = PAGE_TITLES[location.pathname] ?? 'V-Tech';

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Desktop Sidebar */}
      <Sidebar
        user={user}
        onLogout={logout}
        collapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed((v) => !v)}
      />

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        >
          <div className="absolute left-0 top-0 bottom-0 w-[280px]">
            <Sidebar user={user} onLogout={logout} />
          </div>
        </div>
      )}

      {/* Mobile TopBar */}
      <TopBar
        title={pageTitle}
        onMenuClick={() => setSidebarOpen(true)}
        userName={user.name}
      />

      {/* Main content */}
      <main
        className="md:ml-[280px] pt-14 md:pt-0 pb-20 md:pb-0 min-h-screen transition-all duration-200"
        style={{ marginLeft: sidebarCollapsed ? '64px' : undefined }}
      >
        <div className="p-4 md:p-6 animate-page-enter">
          <Outlet />
        </div>
      </main>


      {/* Mobile Bottom Nav */}
      <MobileNav user={user} />
    </div>
  );
}
