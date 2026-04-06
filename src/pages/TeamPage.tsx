import { useState, useEffect } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { TEAMS } from '@/lib/constants';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';
import { Table } from '@/components/ui/Table';
import { Users, ChevronDown, ChevronRight, Plus, Search } from 'lucide-react';
import type { IUser } from '@/lib/types';

export function TeamPage() {
  const { teams, members, loading, error, fetchAllMembers, addMember, toggleActive } = useTeams();
  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add member form
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<'team_lead' | 'field_staff'>('field_staff');
  const [newTeamId, setNewTeamId] = useState(TEAMS[0]?.id ?? '');

  useEffect(() => { fetchAllMembers(); }, [fetchAllMembers]);

  const roleOptions = [
    { value: 'team_lead', label: 'Team Lead' },
    { value: 'field_staff', label: 'Field Staff' },
  ];

  const teamOptions = TEAMS.map((t) => ({ value: t.id, label: t.name }));

  const filteredMembers = members.filter((m) => {
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole && m.role !== filterRole) return false;
    if (filterTeam && m.team_id !== filterTeam) return false;
    if (filterActive === 'active' && !m.is_active) return false;
    if (filterActive === 'inactive' && m.is_active) return false;
    return true;
  });

  const handleAddMember = async () => {
    if (!newName || !newEmail) return;
    await addMember({ name: newName, email: newEmail, phone: newPhone, role: newRole, team_id: newTeamId, is_active: true });
    setShowAddModal(false);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewRole('field_staff');
  };

  const teamMemberColumns = [
    { key: 'name', label: 'Name', render: (r: IUser) => <span className="font-medium">{r.name}</span> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'role', label: 'Role', render: (r: IUser) => <Badge status={r.role === 'team_lead' ? 'in_progress' : 'pending'} label={r.role.replace('_', ' ')} /> },
    { key: 'status', label: 'Status', render: (r: IUser) => (
      <button onClick={(e) => { e.stopPropagation(); toggleActive(r.id, !r.is_active); }} className="text-xs font-medium">
        <Badge status={r.is_active ? 'completed' : 'cancelled'} label={r.is_active ? 'Active' : 'Inactive'} />
      </button>
    )},
  ];

  const allMembersColumns = [
    { key: 'name', label: 'Name', render: (r: IUser) => <span className="font-medium">{r.name}</span> },
    { key: 'team', label: 'Team', render: (r: IUser) => TEAMS.find((t) => t.id === r.team_id)?.name ?? '—' },
    { key: 'role', label: 'Role', render: (r: IUser) => <Badge status={r.role === 'team_lead' ? 'in_progress' : 'pending'} label={r.role.replace('_', ' ')} /> },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Phone' },
    { key: 'status', label: 'Status', render: (r: IUser) => (
      <button onClick={(e) => { e.stopPropagation(); toggleActive(r.id, !r.is_active); }} className="text-xs font-medium">
        <Badge status={r.is_active ? 'completed' : 'cancelled'} label={r.is_active ? 'Active' : 'Inactive'} />
      </button>
    )},
  ];

  if (loading && members.length === 0) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Team</h1>
        <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>Add Member</Button>
      </div>

      {error && <p className="text-sm text-[var(--color-danger)]">{error}</p>}

      {/* Team Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TEAMS.map((team) => {
          const count = members.filter((m) => m.team_id === team.id).length;
          return (
            <Card
              key={team.id}
              padding="md"
              onClick={() => setExpandedTeam(expandedTeam === team.id ? null : team.id)}
              className="cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[var(--color-secondary)]/10 flex items-center justify-center">
                    <Users size={20} className="text-[var(--color-secondary)]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[var(--color-text)]">{team.name}</p>
                    <p className="text-xs text-[var(--color-text-secondary)]">{count} member{count !== 1 ? 's' : ''}</p>
                  </div>
                </div>
                {expandedTeam === team.id ? <ChevronDown size={16} className="text-[var(--color-text-secondary)]" /> : <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />}
              </div>
            </Card>
          );
        })}
      </div>

      {/* Expanded Team Members */}
      {expandedTeam && (
        <Card header={`${TEAMS.find((t) => t.id === expandedTeam)?.name} — Members`} padding="md">
          <Table columns={teamMemberColumns} data={members.filter((m) => m.team_id === expandedTeam)} />
        </Card>
      )}

      {/* All Members — Search + Filter + Table */}
      <Card header="All Members" padding="md">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]" />
            <Input placeholder="Search by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
          </div>
          <Select options={[{ value: '', label: 'All Roles' }, ...roleOptions]} value={filterRole} onChange={setFilterRole} className="w-full sm:w-40" />
          <Select options={[{ value: '', label: 'All Teams' }, ...teamOptions]} value={filterTeam} onChange={setFilterTeam} className="w-full sm:w-48" />
          <Select options={[{ value: '', label: 'All Status' }, { value: 'active', label: 'Active' }, { value: 'inactive', label: 'Inactive' }]} value={filterActive} onChange={setFilterActive} className="w-full sm:w-36" />
        </div>
        {filteredMembers.length === 0 ? (
          <EmptyState icon={Users} title="No members found" subtitle="Try adjusting your search or filters." />
        ) : (
          <Table columns={allMembersColumns} data={filteredMembers} />
        )}
      </Card>

      {/* Add Member Modal */}
      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Team Member" size="md">
        <div className="flex flex-col gap-4">
          <Input label="Full Name" value={newName} onChange={(e) => setNewName(e.target.value)} required placeholder="Rahul Sharma" />
          <Input label="Email" type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} required placeholder="rahul@vtech.com" />
          <Input label="Phone" type="tel" value={newPhone} onChange={(e) => setNewPhone(e.target.value)} placeholder="+91 98765 43210" />
          <Select label="Role" options={roleOptions} value={newRole} onChange={(v) => setNewRole(v as 'team_lead' | 'field_staff')} required />
          <Select label="Team" options={teamOptions} value={newTeamId} onChange={setNewTeamId} required />
          <p className="text-xs text-[var(--color-text-secondary)]">Default password: <code className="bg-gray-100 px-1 rounded">Welcome@123</code></p>
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setShowAddModal(false)}>Cancel</Button>
            <Button variant="primary" fullWidth onClick={handleAddMember} loading={loading}>Add Member</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
