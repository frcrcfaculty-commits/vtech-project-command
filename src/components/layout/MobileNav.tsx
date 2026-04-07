import { useLocation, useNavigate } from 'react-router-dom';
import { NAV_ITEMS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { IUser } from '@/lib/types';

interface MobileNavProps {
  user: IUser;
}

export function MobileNav({ user }: MobileNavProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const navItems = NAV_ITEMS[user.role] ?? [];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 safe-bottom" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
      <div className="flex items-center h-16">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 min-h-[48px] py-1.5 text-xs font-medium transition-colors active:scale-95',
                isActive ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-secondary)]'
              )}
            >
              <item.icon size={22} />
              <span className="truncate max-w-[64px] text-[11px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
