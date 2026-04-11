import { useState } from 'react';
import { Check, X, Circle, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, Select, Badge } from '@/components/ui';
import { formatDate, cn } from '@/lib/utils';

import { PHASE_STATUS_COLORS, TEAM_NAMES } from '@/lib/constants';
import type { IProjectPhase, PhaseStatus } from '@/lib/types';

export interface PhaseTrackerProps {
  phases: IProjectPhase[];
  isOwner?: boolean;
  isTeamLead?: boolean;
  onPhaseUpdate?: (phaseId: string, updates: Partial<IProjectPhase>) => Promise<void>;
}

export function PhaseTracker({ phases, isOwner = false, isTeamLead = false, onPhaseUpdate }: PhaseTrackerProps) {
  const [expandedPhaseId, setExpandedPhaseId] = useState<string | null>(null);
  const [updatingPhaseId, setUpdatingPhaseId] = useState<string | null>(null);

  const sortedPhases = [...phases].sort((a, b) => (a.phase_order || 0) - (b.phase_order || 0));

  const canEdit = isOwner || isTeamLead;

  const handleStatusChange = async (phaseId: string, newStatus: PhaseStatus) => {
    if (!onPhaseUpdate) return;
    
    setUpdatingPhaseId(phaseId);
    try {
      const updates: Partial<IProjectPhase> = { status: newStatus };
      
      // Auto-set actual_start when transitioning to in_progress
      if (newStatus === 'in_progress') {
        const phase = phases.find(p => p.id === phaseId);
        if (phase && !phase.actual_start) {
          updates.actual_start = new Date().toISOString().split('T')[0];
        }
      }
      
      // Auto-set actual_end when transitioning to completed
      if (newStatus === 'completed') {
        updates.actual_end = new Date().toISOString().split('T')[0];
      }

      
      await onPhaseUpdate(phaseId, updates);
    } finally {
      setUpdatingPhaseId(null);
    }
  };

  const handleExpand = (phaseId: string) => {
    setExpandedPhaseId(prev => prev === phaseId ? null : phaseId);
  };

  return (
    <div className="space-y-6">
      {/* Desktop Stepper */}
      <div className="hidden md:block">
        <HorizontalStepper
          phases={sortedPhases}
          expandedPhaseId={expandedPhaseId}
          canEdit={canEdit}
          onExpand={handleExpand}
          onStatusChange={handleStatusChange}
          updatingPhaseId={updatingPhaseId}
        />
      </div>

      {/* Mobile Stepper */}
      <div className="md:hidden">
        <VerticalStepper
          phases={sortedPhases}
          expandedPhaseId={expandedPhaseId}
          canEdit={canEdit}
          onExpand={handleExpand}
          onStatusChange={handleStatusChange}
          updatingPhaseId={updatingPhaseId}
        />
      </div>

      {/* Expanded Phase Detail */}
      {expandedPhaseId && (
        <PhaseDetail
          phase={sortedPhases.find(p => p.id === expandedPhaseId)!}
          canEdit={canEdit}
          onStatusChange={handleStatusChange}
          isUpdating={updatingPhaseId === expandedPhaseId}
        />
      )}
    </div>
  );
}

interface StepperProps {
  phases: IProjectPhase[];
  expandedPhaseId: string | null;
  canEdit: boolean;
  onExpand: (phaseId: string) => void;
  onStatusChange: (phaseId: string, status: PhaseStatus) => void;
  updatingPhaseId: string | null;
}

function HorizontalStepper({ phases, expandedPhaseId, canEdit, onExpand, onStatusChange, updatingPhaseId }: StepperProps) {
  return (
    <div className="flex items-start justify-between">
      {phases.map((phase, index) => (
        <div key={phase.id} className="flex items-center">
          {/* Step Circle + Label */}
          <div className="flex flex-col items-center">
            <button
              onClick={() => onExpand(phase.id)}
              className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center transition-all',
                'ring-4 ring-white',
                expandedPhaseId === phase.id && 'ring-4 ring-blue-200',
                canEdit && 'cursor-pointer hover:scale-110'
              )}
            >
              <PhaseCircle status={phase.status as any} />

            </button>
            <span className={cn(
              'mt-2 text-xs font-medium text-center max-w-[80px]',
              expandedPhaseId === phase.id ? 'text-white/90' : 'text-white/50'
            )}>
              {phase.phase_name}
            </span>
          </div>
          
          {/* Connector Line */}
          {index < phases.length - 1 && (
            <div className={cn(
              'w-8 h-0.5 mx-1 mt-[-20px]',
              phases[index + 1]?.status === 'completed' || phase.status === 'completed'
                ? 'bg-success'
                : 'bg-white/10'
            )} />
          )}
        </div>
      ))}
    </div>
  );
}

function VerticalStepper({ phases, expandedPhaseId, canEdit, onExpand, onStatusChange, updatingPhaseId }: StepperProps) {
  return (
    <div className="space-y-2">
      {phases.map((phase) => (
        <div key={phase.id}>
          <button
            onClick={() => onExpand(phase.id)}
            className={cn(
              'w-full flex items-center gap-3 p-3 rounded-lg transition-colors',
              expandedPhaseId === phase.id ? 'bg-blue-500/10' : 'bg-white/5 hover:bg-white/8',
              canEdit && 'cursor-pointer'
            )}
          >
            <PhaseCircle status={phase.status as any} />

            <span className="flex-1 text-left font-medium text-sm">{phase.phase_name}</span>
            <Badge status={phase.status as any} label={phase.status.replace('_', ' ')} />

            {expandedPhaseId === phase.id ? (
              <ChevronUp className="h-4 w-4 text-white/40" />
            ) : (
              <ChevronDown className="h-4 w-4 text-white/40" />
            )}
          </button>
        </div>
      ))}
    </div>
  );
}

function PhaseCircle({ status }: { status: PhaseStatus }) {
  const config = PHASE_STATUS_COLORS[status];

  const iconClass = cn(
    'w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold',
    config.bg,
    config.text
  );

  switch (status) {
    case 'completed':
      return <div className={iconClass}><Check className="h-4 w-4" /></div>;
    case 'blocked':
      return <div className={iconClass}><X className="h-4 w-4" /></div>;
    case 'in_progress':
      return (
        <div className={cn(iconClass, 'animate-pulse')}>
          <Circle className="h-4 w-4 fill-current" />
        </div>
      );
    default:
      return <div className={iconClass}><Circle className="h-4 w-4" /></div>;
  }
}

interface PhaseDetailProps {
  phase: IProjectPhase;
  canEdit: boolean;
  onStatusChange: (phaseId: string, status: PhaseStatus) => void;
  isUpdating: boolean;
}

function PhaseDetail({ phase, canEdit, onStatusChange, isUpdating }: PhaseDetailProps) {
  const milestonesCount = phase.milestones?.length || 0;
  const completedMilestones = phase.milestones?.filter(m => m.status === 'completed').length || 0;

  const statusOptions = [
    { value: 'not_started', label: 'Not Started' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'blocked', label: 'Blocked' },
  ];

  return (
    <Card className="mt-4 border-l-4 border-l-[#DA2E8F]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white/90">{phase.phase_name}</h3>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="info">{phase.assigned_team?.name || 'Unassigned'}</Badge>
            </div>
          </div>
          {canEdit && (
            <Select
              options={statusOptions}
              value={phase.status}
              onChange={(val) => onStatusChange(phase.id, val as PhaseStatus)}
              disabled={isUpdating}
              className="w-40"
            />
          )}
        </div>

        {/* Dates Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-white/50">Planned Start</span>
            <p className="font-medium">{formatDate(phase.planned_start || '')}</p>
          </div>
          <div>
            <span className="text-white/50">Planned End</span>
            <p className="font-medium">{formatDate(phase.planned_end || '')}</p>
          </div>
          <div>
            <span className="text-white/50">Actual Start</span>
            <p className="font-medium">{formatDate(phase.actual_start || '') || '-'}</p>
          </div>
          <div>
            <span className="text-white/50">Actual End</span>
            <p className="font-medium">{formatDate(phase.actual_end || '') || '-'}</p>
          </div>

        </div>

        {/* Milestones & Hours */}
        <div className="flex items-center gap-6 text-sm">
          <div>
            <span className="text-white/50">Milestones: </span>
            <span className="font-medium">
              {milestonesCount > 0 ? `${completedMilestones}/${milestonesCount} complete` : 'No milestones'}
            </span>
          </div>
          <div>
            <span className="text-white/50">Hours: </span>
            <span className="font-medium">0 work hours + 0 travel hours</span>
          </div>
        </div>

        {/* Notes */}
        {phase.notes && (
          <div className="pt-2 border-t">
            <span className="text-sm text-white/50">Notes</span>
            <p className="text-sm mt-1">{phase.notes}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
