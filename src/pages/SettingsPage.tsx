import { useState, type FormEvent } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TEAMS } from '@/lib/constants';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { AlertCircle, CheckCircle } from 'lucide-react';

export function SettingsPage() {
  const { user, logout } = useAuth();
  const [name, setName] = useState(user?.full_name ?? '');
  const [phone, setPhone] = useState(user?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change
  const [currPwd, setCurrPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [confirmPwd, setConfirmPwd] = useState('');
  const [pwdError, setPwdError] = useState<string | null>(null);

  if (!user) return <Spinner size="lg" />;

  const teamName = TEAMS.find((t) => t.id === user.team_id)?.name ?? user.team?.name ?? '—';

  const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      const { error: err } = await supabase
        .from('users')
        .update({ full_name: name, phone, updated_at: new Date().toISOString() })
        .eq('id', user.id);
      if (err) throw err;
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    } catch (e) {
      setMessage({ type: 'error', text: (e as Error).message });
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwdError(null);
    if (newPwd !== confirmPwd) { setPwdError('New passwords do not match.'); return; }
    if (newPwd.length < 8) { setPwdError('Password must be at least 8 characters.'); return; }
    setSaving(true);
    try {
      const { error: err } = await supabase.auth.updateUser({ password: newPwd });
      if (err) throw err;
      setCurrPwd(''); setNewPwd(''); setConfirmPwd('');
      setMessage({ type: 'success', text: 'Password changed successfully.' });
    } catch (e) {
      setPwdError((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-[var(--color-text)]">Settings</h1>

      {/* Profile */}
      <Card header="Profile">
        <form onSubmit={handleSaveProfile} className="flex flex-col gap-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" value={user.email} disabled />
          <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} type="tel" />
          <Input label="Team" value={teamName} disabled />
          <div className="flex items-center gap-2">
            <Input label="Role" value={user.role.replace('_', ' ')} disabled className="flex-1" />
            <Badge status={user.role === 'owner' ? 'completed' : 'in_progress'} label={user.role.replace('_', ' ')} className="mt-5" />
          </div>
          {message?.type === 'success' && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-success)]">
              <CheckCircle size={14} /> {message.text}
            </div>
          )}
          <Button type="submit" variant="primary" loading={saving}>Save Changes</Button>
        </form>
      </Card>

      {/* Change Password */}
      <Card header="Change Password">
        <form onSubmit={handleChangePassword} className="flex flex-col gap-4">
          <Input label="Current Password" type="password" value={currPwd} onChange={(e) => setCurrPwd(e.target.value)} required />
          <Input label="New Password" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} required />
          <Input label="Confirm New Password" type="password" value={confirmPwd} onChange={(e) => setConfirmPwd(e.target.value)} required />
          {pwdError && (
            <div className="flex items-center gap-2 text-sm text-[var(--color-danger)]">
              <AlertCircle size={14} /> {pwdError}
            </div>
          )}
          <Button type="submit" variant="outline" loading={saving}>Update Password</Button>
        </form>
      </Card>

      {/* Logout */}
      <Card>
        <Button variant="danger" size="lg" fullWidth onClick={logout}>
          Logout
        </Button>
      </Card>
    </div>
  );
}
