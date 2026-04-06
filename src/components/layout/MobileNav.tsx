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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 h-16 bg-white border-t border-gray-200 safe-bottom">
      <div className="flex items-center h-full">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-1 h-full text-xs font-medium transition-colors',
                isActive ? 'text-[var(--color-secondary)]' : 'text-[var(--color-text-secondary)]'
              )}
            >
              <item.icon size={20} />
              <span className="truncate max-w-[60px]">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
