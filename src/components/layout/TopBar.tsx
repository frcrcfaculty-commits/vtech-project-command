import { Menu, User } from 'lucide-react';
import { initials } from '@/lib/utils';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
  userName?: string;
}

export function TopBar({ title, onMenuClick, userName }: TopBarProps) {
  return (
    <header className="md:hidden fixed top-0 left-0 right-0 z-30 h-14 glass-strong flex items-center px-4 safe-top border-b border-white/10">
      <button onClick={onMenuClick} className="min-w-[44px] min-h-[44px] -ml-2 flex items-center justify-center text-[var(--color-text-secondary)] hover:text-[var(--color-text)] active:bg-white/10 rounded-xl transition-all">
        <Menu size={22} />
      </button>
      <h1 className="flex-1 text-center text-base font-semibold text-[var(--color-text)]">{title}</h1>
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center"
        style={{ background: 'linear-gradient(135deg, #723B8F, #DA2E8F)' }}
      >
        <span className="text-white text-xs font-semibold">{userName ? initials(userName) : <User size={16} className="text-white" />}</span>
      </div>
    </header>
  );
}
