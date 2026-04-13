import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, Clock, CheckCircle, AlertCircle, FileText } from 'lucide-react';
import { Button, Card, Badge, Select, Textarea, Spinner, EmptyState, Table } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { PhaseTracker } from '@/components/projects/PhaseTracker';
import { supabase } from '@/lib/supabase';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/AuthContext';
import { formatDate, calculateDaysElapsed, formatHours, cn } from '@/lib/utils';
import { PROJECT_TYPES, TEAM_NAMES } from '@/lib/constants';
import type { IProject, IProjectPhase, ProjectStatus } from '@/lib/types';

type TabType = 'overview' | 'phases' | 'team' | 'boq';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { fetchProject, updateProject, loading, error } = useProjects();
  const { user } = useAuth();

  const [project, setProject] = useState<IProject | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showEditModal, setShowEditModal] = useState(false);
  const [projectNotes, setProjectNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [boqItems, setBoqItems] = useState<any[]>([]);

  const userRole = user?.role || 'field_staff';
  const canViewFullBoq = ['owner', 'sales', 'accounts', 'procurement_manager'].includes(userRole);

  const isOwner = true;
  const isTeamLead = false;

  const loadProject = useCallback(async () => {
    if (!id) return;
    const data = await fetchProject(id);
    if (data) {
      setProject(data);
      setProjectNotes(data.notes || '');
    }
  }, [id, fetchProject]);

  const fetchBoqItems = useCallback(async () => {
    if (!id) return;
    try {
      const { data } = await supabase
        .from('boq_items')
        .select('*')
        .eq('project_id', id)
        .order('category', { ascending: true });
      setBoqItems(data || []);
    } catch (err) {
      console.error('Fetch BOQ error:', err);
    }
  }, [id]);

  useEffect(() => {
    loadProject();
  }, [loadProject]);

  useEffect(() => {
    if (activeTab === 'boq') {
      fetchBoqItems();
    }
  }, [activeTab, fetchBoqItems]);

  const handleProjectUpdate = async (updates: Partial<IProject>) => {
    if (!project) return;
    try {
      await updateProject(project.id, updates);
      await loadProject();
    } catch (err) {
      console.error('Error updating project:', err);
    }
  };

  const handlePhaseUpdate = async (phaseId: string, updates: Partial<IProjectPhase>): Promise<void> => {
    if (!project) return;
    const updatedPhases = project.project_phases?.map(p => 
      p.id === phaseId ? { ...p, ...updates } : p
    );
    setProject(prev => prev ? { ...prev, project_phases: updatedPhases } : null);
  };



  const handleStatusChange = async (newStatus: ProjectStatus) => {
    if (!project) return;
    const updates: Partial<IProject> = { status: newStatus };
    if (newStatus === 'completed' && project.status !== 'completed') {
      updates.actual_end_date = new Date().toISOString().split('T')[0];
    }
    await handleProjectUpdate(updates);
  };

  const handleNotesSave = async () => {
    if (!project) return;
    setSavingNotes(true);
    try {
      await handleProjectUpdate({ notes: projectNotes });
    } finally {
      setSavingNotes(false);
    }
  };

  const phases = project?.project_phases || [];
  const completedPhases = phases.filter(p => p.status === 'completed').length;
  const completionPercentage = Math.round((completedPhases / 10) * 100);
  const daysElapsed = project ? calculateDaysElapsed(project.start_date) : 0;
  const totalWorkHours = 156.5;
  const totalTravelHours = 42;

  if (loading && !project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-6">
        <EmptyState
          icon={AlertCircle}
          title="Project not found"
          description={error || 'The project you are looking for does not exist.'}
          action={{ label: 'Back to Projects', onClick: () => navigate('/projects') }}
        />
      </div>
    );
  }

  const allPhasesCompleted = completedPhases === 10;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <button
        onClick={() => navigate('/projects')}
        className="flex items-center gap-2 text-white/70 hover:text-white/90 mb-4"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back to Projects</span>
      </button>

      <div className="flex gap-1 border-b border-white/10 mb-6">
        {(['overview', 'phases', 'team', 'boq'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'px-4 py-2 text-sm font-medium border-b-2 -mb-px capitalize',
              activeTab === tab
                ? 'border-primary text-primary'
                : 'border-transparent text-white/70 hover:text-white/90'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <OverviewTab
          project={project}
          isOwner={isOwner}
          totalWorkHours={totalWorkHours}
          totalTravelHours={totalTravelHours}
          daysElapsed={daysElapsed}
          completionPercentage={completionPercentage}
          onEdit={() => setShowEditModal(true)}
          onStatusChange={handleStatusChange}
          projectNotes={projectNotes}
          setProjectNotes={setProjectNotes}
          onNotesSave={handleNotesSave}
          savingNotes={savingNotes}
          allPhasesCompleted={allPhasesCompleted}
        />
      )}

      {activeTab === 'phases' && (
        <PhasesTab
          project={project}
          phases={phases}
          isOwner={isOwner}
          isTeamLead={isTeamLead}
          onPhaseUpdate={handlePhaseUpdate}
        />
      )}

      {activeTab === 'team' && (
        <TeamTab
          project={project}
          phases={phases}
          isOwner={isOwner}
        />
      )}

      {activeTab === 'boq' && (
        <BoqTab
          items={boqItems}
          canViewFullBoq={canViewFullBoq}
          projectId={id || ''}
          setItems={setBoqItems}
        />
      )}

      {showEditModal && (
        <Modal
          isOpen={showEditModal}
          onClose={() => setShowEditModal(false)}
          title="Edit Project"
          size="lg"
        >
          <ProjectForm
            project={project}
            isModal
            onClose={() => {
              setShowEditModal(false);
              loadProject();
            }}
          />
        </Modal>
      )}
    </div>
  );
}


interface OverviewTabProps {
  project: IProject;
  isOwner: boolean;
  totalWorkHours: number;
  totalTravelHours: number;
  daysElapsed: number;
  completionPercentage: number;
  onEdit: () => void;
  onStatusChange: (status: ProjectStatus) => void;
  projectNotes: string;
  setProjectNotes: (notes: string) => void;
  onNotesSave: () => void;
  savingNotes: boolean;
  allPhasesCompleted: boolean;
}

function OverviewTab({
  project,
  isOwner,
  totalWorkHours,
  totalTravelHours,
  daysElapsed,
  completionPercentage,
  onEdit,
  onStatusChange,
  projectNotes,
  setProjectNotes,
  onNotesSave,
  savingNotes,
  allPhasesCompleted,
}: OverviewTabProps) {
  const projectType = PROJECT_TYPES.find(t => t.value === project.project_type);

  const statusOptions = [
    { value: 'planning', label: 'Planning' },
    { value: 'active', label: 'Active' },
    { value: 'on_hold', label: 'On Hold' },
    { value: 'completed', label: 'Completed' },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white/90 mb-1">{project.name}</h1>
            <p className="text-white/70">{project.client_name}</p>
          </div>
          <Badge
            variant={
              project.status === 'active' ? 'active' :
              project.status === 'planning' ? 'pending' :
              project.status === 'on_hold' ? 'on_hold' :
              project.status === 'completed' ? 'completed' : 'cancelled'
            }
          >
            {project.status.replace('_', ' ')}
          </Badge>

        </div>

        <div className="flex flex-wrap gap-4 text-sm text-white/70 mb-4">
          <div className="flex items-center gap-1">
            <span className="text-base">{getProjectTypeIcon(project.project_type)}</span>
            <span>{projectType?.label || project.project_type}</span>
          </div>
          <div className="flex items-center gap-1">
            <span>📍</span>
            <span>{project.city}</span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar className="h-4 w-4" />
            <span>{formatDate(project.start_date || '')} - {formatDate(project.target_end_date || '')}</span>
          </div>
        </div>

        {isOwner && (
          <div className="flex flex-wrap gap-3 pt-4 border-t">
            <Button variant="outline" size="sm" onClick={onEdit}>
              <Edit className="h-4 w-4 mr-1" />
              Edit
            </Button>
            
            <Select
              options={statusOptions}
              value={project.status}
              onChange={(val) => onStatusChange(val as ProjectStatus)}
              className="w-40"
            />

            {allPhasesCompleted && project.status !== 'completed' && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onStatusChange('completed')}
              >
                <CheckCircle className="h-4 w-4 mr-1" />
                Mark Project Complete
              </Button>
            )}

            {project.status === 'on_hold' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange('active')}
              >
                Resume Project
              </Button>
            )}

            {project.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStatusChange('on_hold')}
              >
                Put On Hold
              </Button>
            )}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <Clock className="h-6 w-6 mx-auto text-secondary mb-2" />
          <p className="text-2xl font-bold text-white/90">{formatHours(totalWorkHours)}</p>
          <p className="text-xs text-white/70">Work Hours</p>
        </Card>
        <Card className="text-center">
          <Clock className="h-6 w-6 mx-auto text-accent mb-2" />
          <p className="text-2xl font-bold text-white/90">{formatHours(totalTravelHours)}</p>
          <p className="text-xs text-white/70">Travel Hours</p>
        </Card>
        <Card className="text-center">
          <Calendar className="h-6 w-6 mx-auto text-success mb-2" />
          <p className="text-2xl font-bold text-white/90">{daysElapsed}</p>
          <p className="text-xs text-white/70">Days Elapsed</p>
        </Card>
        <Card className="text-center">
          <CheckCircle className="h-6 w-6 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold text-white/90">{completionPercentage}%</p>
          <p className="text-xs text-white/70">Completion</p>
        </Card>
      </div>

      <Card>
        <h3 className="font-semibold text-white/90 mb-3">Notes</h3>
        <Textarea
          value={projectNotes}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProjectNotes(e.target.value)}
          placeholder="Add notes about this project..."
          rows={4}
          className="mb-3"
        />
        <div className="flex justify-end">
          <Button
            size="sm"
            onClick={onNotesSave}
            loading={savingNotes}
            disabled={projectNotes === project.notes}
          >
            Save Notes
          </Button>
        </div>
      </Card>
    </div>
  );
}

interface PhasesTabProps {
  project: IProject;
  phases: IProjectPhase[];
  isOwner: boolean;
  isTeamLead: boolean;
  onPhaseUpdate: (phaseId: string, updates: Partial<IProjectPhase>) => void;
}

function PhasesTab({ project, phases, isOwner, isTeamLead, onPhaseUpdate }: PhasesTabProps) {
  return (
    <div>
      <PhaseTracker
        phases={phases}
        isOwner={isOwner}
        isTeamLead={isTeamLead}
        onPhaseUpdate={onPhaseUpdate as any}


      />
    </div>
  );
}

interface TeamTabProps {
  project: IProject;
  phases: IProjectPhase[];
  isOwner: boolean;
}

function TeamTab({ project, phases, isOwner }: TeamTabProps) {
  const teamHoursData = [
    { teamName: 'Sales/BD', hours: 24, phaseNumber: 1 },
    { teamName: 'Design/Engineering', hours: 56, phaseNumber: 2 },
    { teamName: 'Design/Engineering', hours: 32, phaseNumber: 3 },
    { teamName: 'Programming', hours: 44.5, phaseNumber: 7 },
  ];

  const usersData = [
    { name: 'Rajesh Kumar', team: 'Design/Engineering', workHours: 88, travelHours: 12 },
    { name: 'Priya Sharma', team: 'Programming', workHours: 68.5, travelHours: 30 },
    { name: 'Amit Patel', team: 'Sales/BD', workHours: 24, travelHours: 8 },
    { name: 'Sneha Gupta', team: 'Design/Engineering', workHours: 42, travelHours: 15 },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="font-semibold text-white/90 mb-4">Phase Assignments</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-white/70">Phase</th>
                <th className="pb-2 font-medium text-white/70">Team</th>
                <th className="pb-2 font-medium text-white/70">Hours</th>
              </tr>
            </thead>
            <tbody>
              {phases.sort((a, b) => (a.phase_order || 0) - (b.phase_order || 0)).map(phase => (
                <tr key={phase.id} className="border-b last:border-0">
                  <td className="py-3">
                    <span className="font-medium">{phase.phase_order}. {phase.phase_name}</span>
                  </td>
                  <td className="py-3">
                    {isOwner ? (
                      <Select
                        options={TEAM_NAMES.map(t => ({ value: t, label: t }))}
                        value={phase.assigned_team?.name || ''}
                        onChange={() => {}}
                        className="w-40 text-sm"
                      />
                    ) : (
                      <Badge variant="pending">{phase.assigned_team?.name || 'Unassigned'}</Badge>
                    )}
                  </td>
                  <td className="py-3 text-white/70">
                    {teamHoursData.find(t => t.phaseNumber === (phase.phase_order || 0))?.hours || 0}h
                  </td>
                </tr>
              ))}

            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-white/90 mb-4">Team Members</h3>
        <div className="space-y-3">
          {usersData.map((user, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-xs font-medium">
                  {user.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="font-medium text-sm">{user.name}</p>
                  <p className="text-xs text-white/70">{user.team}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium">{user.workHours}h work</p>
                <p className="text-xs text-white/70">{user.travelHours}h travel</p>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function getProjectTypeIcon(type: string): string {
  const icons: Record<string, string> = {
    boardroom: '🖥️',
    conference_room: '📹',
    residential_hni: '🏠',
    experience_centre: '✨',
    auditorium: '🏛️',
    lighting_hvac: '💡',
  };
  return icons[type] || '📁';
}

interface BoqTabProps {
  items: any[];
  canViewFullBoq: boolean;
  projectId: string;
  setItems: (items: any[]) => void;
}

function BoqTab({ items, canViewFullBoq, projectId, setItems }: BoqTabProps) {
  const [loading, setLoading] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', category: '', quantity: 1, unit: '', estimated_price: 0, in_stock: true });

  const handleAddItem = async () => {
    if (!newItem.name || !projectId) return;
    setLoading(true);
    try {
      await supabase.from('boq_items').insert({ ...newItem, project_id: projectId });
      setNewItem({ name: '', category: '', quantity: 1, unit: '', estimated_price: 0, in_stock: true });
      const { data } = await supabase.from('boq_items').select('*').eq('project_id', projectId).order('category');
      if (data) setItems(data);
    } catch (err) {
      console.error('Add BOQ item error:', err);
    } finally {
      setLoading(false);
    }
  };

  const boqColumns = [
    { key: 'category', label: 'Category' },
    { key: 'name', label: 'Item Name' },
    { key: 'quantity', label: 'Qty' },
    { key: 'unit', label: 'Unit' },
    ...(canViewFullBoq ? [{ key: 'estimated_price', label: 'Est. Price (₹)', render: (row: any) => row.estimated_price ? `₹${row.estimated_price.toLocaleString()}` : '-' }] : []),
    { key: 'in_stock', label: 'In Stock', render: (row: any) => row.in_stock ? <Badge status="completed" label="Yes" /> : <Badge status="pending" label="No" /> },
  ];

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      <Card>
        <div className="flex items-center gap-2 mb-4">
          <FileText size={20} className="text-secondary" />
          <h3 className="text-lg font-semibold">Bill of Quantities (BOQ)</h3>
        </div>

        {!canViewFullBoq && (
          <div className="p-3 bg-white/5 rounded-lg mb-4 text-sm text-white/70">
            💡 You can view this section to see what products will be used in this project. Contact the owner or procurement for pricing details.
          </div>
        )}

        {canViewFullBoq && (
          <div className="grid grid-cols-1 md:grid-cols-6 gap-3 mb-4">
            <input
              placeholder="Item name"
              value={newItem.name}
              onChange={e => setNewItem({ ...newItem, name: e.target.value })}
              className="md:col-span-2 h-10 rounded-lg px-3 bg-white/5 border border-white/10 text-sm"
            />
            <input
              placeholder="Category"
              value={newItem.category}
              onChange={e => setNewItem({ ...newItem, category: e.target.value })}
              className="h-10 rounded-lg px-3 bg-white/5 border border-white/10 text-sm"
            />
            <input
              type="number"
              placeholder="Qty"
              value={newItem.quantity}
              onChange={e => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })}
              className="h-10 rounded-lg px-3 bg-white/5 border border-white/10 text-sm"
            />
            <input
              placeholder="Unit"
              value={newItem.unit}
              onChange={e => setNewItem({ ...newItem, unit: e.target.value })}
              className="h-10 rounded-lg px-3 bg-white/5 border border-white/10 text-sm"
            />
            <input
              type="number"
              placeholder="Price"
              value={newItem.estimated_price}
              onChange={e => setNewItem({ ...newItem, estimated_price: parseFloat(e.target.value) || 0 })}
              className="h-10 rounded-lg px-3 bg-white/5 border border-white/10 text-sm"
            />
            <Button onClick={handleAddItem} loading={loading} size="md">Add</Button>
          </div>
        )}

        {items.length === 0 ? (
          <EmptyState icon={FileText} title="No BOQ Items" description="No items have been added to the project BOQ yet." />
        ) : (
          categories.map(cat => (
            <div key={cat} className="mb-4">
              <h4 className="font-medium text-sm text-white/70 mb-2 uppercase tracking-wide">{cat}</h4>
              <Table
                columns={boqColumns}
                data={items.filter(i => i.category === cat)}
              />
            </div>
          ))
        )}

        {canViewFullBoq && items.length > 0 && (
          <div className="mt-4 pt-4 border-t border-white/10 flex justify-between">
            <span className="text-sm text-white/70">Total Items: {items.length}</span>
            <span className="text-sm font-medium">
              Total Estimated: ₹{items.reduce((sum, i) => sum + (i.estimated_price || 0) * i.quantity, 0).toLocaleString()}
            </span>
          </div>
        )}
      </Card>
    </div>
  );
}
