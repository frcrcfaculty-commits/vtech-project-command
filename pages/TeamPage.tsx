import { useState, useEffect } from 'react';
import { useTeams } from '@/hooks/useTeams';
import { useAuth } from '@/contexts/AuthContext';
import { TEAMS, ROLE_LABELS } from '@/lib/constants';
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
import type { IUser, UserRole } from '@/lib/types';

// All roles HR / Owner can assign when creating a new member
const ASSIGNABLE_ROLES: { value: UserRole; label: string }[] = [
  { value: 'team_lead', label: 'Team Lead' },
  { value: 'field_staff', label: 'Field Staff' },
  { value: 'hr', label: 'HR' },
  { value: 'project_manager', label: 'Project Manager' },
  { value: 'procurement_manager', label: 'Procurement Manager' },
  { value: 'accounts', label: 'Accounts' },
  { value: 'sales', label: 'Sales' },
];

// For filter dropdown — all possible roles
const ROLE_FILTER_OPTIONS = [
  { value: '', label: 'All Roles' },
  ...ASSIGNABLE_ROLES,
  { value: 'owner', label: 'Owner' },
];

const TEAM_OPTIONS = TEAMS.map((t) => ({ value: t.id, label: t.name }));

export function TeamPage() {
  const { user: currentUser } = useAuth();
  const { members, loading, error, fetchAllMembers, addMember, toggleActive } = useTeams();

  const [expandedTeam, setExpandedTeam] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterTeam, setFilterTeam] = useState('');
  const [filterActive, setFilterActive] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Add member form state
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('field_staff');
  const [newTeamId, setNewTeamId] = useState<string>(TEAMS[0]?.id ?? '');

  // Only owner and HR can add members
  const canAddMembers = currentUser?.role === 'owner' || currentUser?.role === 'hr';
  // Team leads can only see their own team members — filter enforced below
  const isTeamLead = currentUser?.role === 'team_lead';

  useEffect(() => {
    fetchAllMembers();
  }, [fetchAllMembers]);

  const filteredMembers = members.filter((m) => {
    // Team leads only see their team
    if (isTeamLead && m.team_id !== currentUser?.team_id) return false;
    if (search && !m.full_name.toLowerCase().includes(search.toLowerCase())) return false;
    if (filterRole && m.role !== filterRole) return false;
    if (filterTeam && m.team_id !== filterTeam) return false;
    if (filterActive === 'active' && !m.is_active) return false;
    if (filterActive === 'inactive' && m.is_active) return false;
    return true;
  });

  const handleAddMember = async () => {
    if (!newName.trim() || !newEmail.trim()) return;
    await addMember({
      full_name: newName.trim(),
      email: newEmail.trim(),
      phone: newPhone.trim() || null,
      role: newRole,
      team_id: newTeamId,
      is_active: true,
      avatar_url: null,
    });
    setShowAddModal(false);
    setNewName(''); setNewEmail(''); setNewPhone(''); setNewRole('field_staff');
  };

  // FIX: Every column now has an explicit render — no bare col.key accessor that could
  // cause the Table component to access a non-existent DB column name.
  const teamMemberColumns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (r: IUser) => <span className="font-medium text-[var(--color-text)]">{r.full_name}</span>,
    },
    {
      key: 'email',
      label: 'Email',
      render: (r: IUser) => <span className="text-[var(--color-text-secondary)]">{r.email}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (r: IUser) => <span className="text-[var(--color-text-secondary)]">{r.phone ?? '—'}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (r: IUser) => (
        <Badge
          status={r.role === 'team_lead' ? 'in_progress' : 'pending'}
          label={ROLE_LABELS[r.role] ?? r.role}
        />
      ),
    },
    {
      key: 'status',
      label: 'Status',
      render: (r: IUser) => (
        <button
          onClick={(e) => { e.stopPropagation(); if (canAddMembers) toggleActive(r.id, !r.is_active); }}
          className={canAddMembers ? 'cursor-pointer' : 'cursor-default'}
        >
          <Badge
            status={r.is_active ? 'completed' : 'cancelled'}
            label={r.is_active ? 'Active' : 'Inactive'}
          />
        </button>
      ),
    },
  ];

  const allMembersColumns = [
    {
      key: 'full_name',
      label: 'Name',
      render: (r: IUser) => <span className="font-medium text-[var(--color-text)]">{r.full_name}</span>,
    },
    {
      key: 'team_id',
      label: 'Team',
      render: (r: IUser) => (
        <span className="text-[var(--color-text-secondary)]">
          {TEAMS.find((t) => t.id === r.team_id)?.name ?? '—'}
        </span>
      ),
    },
    {
      key: 'role',
      label: 'Role',
      render: (r: IUser) => (
        <Badge
          status={r.role === 'owner' ? 'completed' : r.role === 'team_lead' ? 'in_progress' : 'pending'}
          label={ROLE_LABELS[r.role] ?? r.role}
        />
      ),
    },
    {
      key: 'email',
      label: 'Email',
      render: (r: IUser) => <span className="text-[var(--color-text-secondary)]">{r.email}</span>,
    },
    {
      key: 'phone',
      label: 'Phone',
      render: (r: IUser) => <span className="text-[var(--color-text-secondary)]">{r.phone ?? '—'}</span>,
    },
    {
      key: 'status',
      label: 'Status',
      render: (r: IUser) => (
        <button
          onClick={(e) => { e.stopPropagation(); if (canAddMembers) toggleActive(r.id, !r.is_active); }}
          className={canAddMembers ? 'cursor-pointer' : 'cursor-default'}
        >
          <Badge
            status={r.is_active ? 'completed' : 'cancelled'}
            label={r.is_active ? 'Active' : 'Inactive'}
          />
        </button>
      ),
    },
  ];

  if (loading && members.length === 0) {
    return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[var(--color-text)]">Team</h1>
        {canAddMembers && (
          <Button icon={<Plus size={16} />} onClick={() => setShowAddModal(true)}>
            Add Member
          </Button>
        )}
      </div>

      {error && (
        <p className="text-sm text-[var(--color-danger)] bg-red-500/10 rounded-lg px-4 py-2">
          {error}
        </p>
      )}

      {/* Team Cards — hidden for team leads (they only see their team in the table) */}
      {!isTeamLead && (
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
                      <p className="text-xs text-[var(--color-text-secondary)]">
                        {count} member{count !== 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  {expandedTeam === team.id
                    ? <ChevronDown size={16} className="text-[var(--color-text-secondary)]" />
                    : <ChevronRight size={16} className="text-[var(--color-text-secondary)]" />
                  }
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Expanded Team Members */}
      {expandedTeam && !isTeamLead && (
        <Card
          header={
            <span className="text-[var(--color-text)] font-semibold">
              {TEAMS.find((t) => t.id === expandedTeam)?.name} — Members
            </span>
          }
          padding="md"
        >
          <Table
            columns={teamMemberColumns}
            data={members.filter((m) => m.team_id === expandedTeam)}
          />
        </Card>
      )}

      {/* All Members — Search + Filter + Table */}
      <Card
        header={
          <span className="text-[var(--color-text)] font-semibold">
            {isTeamLead ? 'My Team Members' : 'All Members'}
          </span>
        }
        padding="md"
      >
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-secondary)]"
            />
            <Input
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          {!isTeamLead && (
            <>
              <Select
                options={ROLE_FILTER_OPTIONS}
                value={filterRole}
                onChange={setFilterRole}
                className="w-full sm:w-44"
              />
              <Select
                options={[{ value: '', label: 'All Teams' }, ...TEAM_OPTIONS]}
                value={filterTeam}
                onChange={setFilterTeam}
                className="w-full sm:w-48"
              />
            </>
          )}
          <Select
            options={[
              { value: '', label: 'All Status' },
              { value: 'active', label: 'Active' },
              { value: 'inactive', label: 'Inactive' },
            ]}
            value={filterActive}
            onChange={setFilterActive}
            className="w-full sm:w-36"
          />
        </div>

        {filteredMembers.length === 0 ? (
          <EmptyState icon={Users} title="No members found" subtitle="Try adjusting your search or filters." />
        ) : (
          <Table columns={allMembersColumns} data={filteredMembers} />
        )}
      </Card>

      {/* Add Member Modal — owner and HR only */}
      <Modal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Team Member"
        size="md"
      >
        <div className="flex flex-col gap-4">
          <Input
            label="Full Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            required
            placeholder="Rahul Sharma"
          />
          <Input
            label="Email"
            type="email"
            value={newEmail}
            onChange={(e) => setNewEmail(e.target.value)}
            required
            placeholder="rahul@vtech.com"
          />
          <Input
            label="Phone"
            type="tel"
            value={newPhone}
            onChange={(e) => setNewPhone(e.target.value)}
            placeholder="+91 98765 43210"
          />
          <Select
            label="Role"
            options={ASSIGNABLE_ROLES}
            value={newRole}
            onChange={(v) => setNewRole(v as UserRole)}
            required
          />
          <Select
            label="Team"
            options={TEAM_OPTIONS}
            value={newTeamId}
            onChange={(v) => setNewTeamId(v)}
            required
          />
          <p className="text-xs text-[var(--color-text-secondary)]">
            Default password: <code className="bg-white/8 px-1 rounded">Welcome@123</code>
            {' '}— user must change this on first login.
          </p>
          {error && (
            <p className="text-xs text-red-400 bg-red-500/10 rounded px-3 py-2">{error}</p>
          )}
          <div className="flex gap-3 pt-2">
            <Button variant="outline" fullWidth onClick={() => setShowAddModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              fullWidth
              onClick={handleAddMember}
              loading={loading}
              disabled={!newName.trim() || !newEmail.trim()}
            >
              Add Member
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
