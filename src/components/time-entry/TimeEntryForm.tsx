import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, MapPin, Check, AlertCircle, Plus, Minus, Send, ChevronRight } from 'lucide-react';
import { useTimeEntries } from '@/hooks/useTimeEntries';
import { INDIAN_CITIES, PHASE_CONFIG, HOUR_INCREMENT } from '@/lib/constants';
import { cn } from '@/lib/utils';

// --- Custom Internal Components ---

const Label = ({ children, className }: { children: React.ReactNode, className?: string }) => (
  <label className={cn("block text-sm font-medium text-slate-700 mb-1.5", className)}>
    {children}
  </label>
);

const Select = ({ value, onChange, options, placeholder, error }: { 
  value: string, 
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void, 
  options: { value: string, label: string }[], 
  placeholder: string,
  error?: string
}) => (
  <div className="relative">
    <select
      value={value}
      onChange={onChange}
      className={cn(
        "w-full bg-white border rounded-md px-3 min-h-[44px] py-2.5 text-sm outline-none transition-all appearance-none",
        error ? "border-red-300 ring-1 ring-red-100" : "border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-100",
        !value && "text-slate-400"
      )}
    >
      <option value="" disabled>{placeholder}</option>
      {options.map(opt => (
        <option key={opt.value} value={opt.value} className="text-slate-900">{opt.label}</option>
      ))}
    </select>
    <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
      <ChevronRight className="w-4 h-4 text-slate-400 rotate-90" />
    </div>
  </div>
);

const HourStepper = ({ value, onChange, label, max }: { 
  value: number, 
  onChange: (val: number) => void, 
  label: string,
  max: number
}) => {
  const handleVibrate = () => {
    if (window.navigator?.vibrate) window.navigator.vibrate(10);
  };

  const increment = () => {
    if (value < max) {
      onChange(value + HOUR_INCREMENT);
      handleVibrate();
    }
  };

  const decrement = () => {
    if (value > 0) {
      onChange(value - HOUR_INCREMENT);
      handleVibrate();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <div className="text-sm font-medium text-slate-600">{label}</div>
      <div className="flex items-center gap-4 bg-slate-50 rounded-xl p-2 border border-slate-100">
        <button
          type="button"
          onClick={decrement}
          disabled={value <= 0}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 active:scale-95 disabled:opacity-50 transition-all font-bold text-xl"
        >
          <Minus className="w-5 h-5" />
        </button>
        <div className="flex-1 text-center font-bold text-3xl text-slate-900 font-mono tracking-tight">
          {value.toFixed(1)}
          <span className="text-sm font-medium text-slate-400 ml-1">h</span>
        </div>
        <button
          type="button"
          onClick={increment}
          disabled={value >= max}
          className="w-14 h-14 flex items-center justify-center rounded-xl bg-white shadow-sm border border-slate-200 text-slate-600 active:scale-95 disabled:opacity-50 transition-all font-bold text-xl"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

// --- Main Form Component ---

export function TimeEntryForm({ userId, onTotalChange }: { userId: string, onTotalChange?: (totals: { work: number, travel: number }) => void }) {
  const [searchParams] = useSearchParams();
  const { createEntry, fetchProjects, fetchPhases, fetchTasks } = useTimeEntries();

  // State
  const [projects, setProjects] = useState<{ id: string, name: string, client_name: string }[]>([]);
  const [phases, setPhases] = useState<{ id: string, phase_name: string }[]>([]);
  const [tasks, setTasks] = useState<{ id: string, title: string }[]>([]);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Form Data
  const [formData, setFormData] = useState({
    projectId: '',
    phaseId: '',
    taskId: '',
    workHours: 0,
    travelHours: 0,
    city: localStorage.getItem('vtech_last_city') || 'Mumbai',
    entryDate: new Date().toISOString().split('T')[0],
    notes: ''
  });

  // Initial loads & URL params
  useEffect(() => {
    loadProjects();
    const urlProj = searchParams.get('project');
    const urlPhase = searchParams.get('phase');
    const urlTask = searchParams.get('task');
    
    if (urlProj) handleProjectChange(urlProj);
    if (urlPhase) handlePhaseChange(urlPhase);
    if (urlTask) setFormData(prev => ({ ...prev, taskId: urlTask }));
  }, []);

  const loadProjects = async () => {
    const { data } = await fetchProjects();
    if (data) setProjects(data as any);
  };

  const handleProjectChange = async (projId: string) => {
    setFormData(prev => ({ ...prev, projectId: projId, phaseId: '', taskId: '' }));
    setPhases([]);
    setTasks([]);
    const { data } = await fetchPhases(projId);
    if (data) {
      setPhases(data as any);
      // Auto-select in_progress phase if there is one
      const inProg = data.find(p => p.status === 'in_progress');
      if (inProg) handlePhaseChange(inProg.id);
    }
  };

  const handlePhaseChange = async (phaseId: string) => {
    setFormData(prev => ({ ...prev, phaseId, taskId: '' }));
    setTasks([]);
    const { data } = await fetchTasks(phaseId, userId);
    if (data) setTasks(data as any);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.projectId || !formData.phaseId) {
      setErrorMsg("Please select a project and phase.");
      return;
    }
    if (formData.workHours + formData.travelHours === 0) {
      setErrorMsg("Hours cannot be zero.");
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    const { error } = await createEntry({
      user_id: userId,
      project_id: formData.projectId,
      phase_id: formData.phaseId,
      task_id: formData.taskId || null,
      entry_date: formData.entryDate,
      work_hours: formData.workHours,
      travel_hours: formData.travelHours,
      city: formData.city,
      notes: formData.notes
    });

    if (error) {
      setErrorMsg(typeof error === 'string' ? error : (error as any).message);
      setLoading(false);
    } else {
      localStorage.setItem('vtech_last_city', formData.city);
      setSuccess(true);
      // Notify parent of updated totals
      if (onTotalChange) {
        onTotalChange({ work: formData.workHours, travel: formData.travelHours });
      }
      setTimeout(() => {
        setSuccess(false);
        setFormData(prev => ({
          ...prev,
          workHours: 0,
          travelHours: 0,
          taskId: '',
          notes: ''
        }));
        setLoading(false);
      }, 1500);
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Log Your Time</h2>
            <p className="text-sm text-slate-500">Fast and simple daily tracking</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Project & Phase */}
          <div className="space-y-4">
            <div>
              <Label>Project</Label>
              <Select
                value={formData.projectId}
                onChange={(e) => handleProjectChange(e.target.value)}
                options={projects.map(p => ({ value: p.id, label: `${p.name} (${p.client_name})` }))}
                placeholder="Select Project"
              />
            </div>

            <div className={cn("transition-all duration-300", !formData.projectId ? "opacity-30 pointer-events-none" : "opacity-100")}>
              <Label>Current Phase</Label>
              <Select
                value={formData.phaseId}
                onChange={(e) => handlePhaseChange(e.target.value)}
                options={phases.map(p => {
                  const config = PHASE_CONFIG.find(c => c.name === p.phase_name);
                  return { value: p.id, label: config?.label || p.phase_name };
                })}
                placeholder="Select Phase"
              />
            </div>

            <div className={cn("transition-all duration-300", !formData.phaseId ? "opacity-30 pointer-events-none" : "opacity-100")}>
              <Label>Task (Optional)</Label>
              <Select
                value={formData.taskId}
                onChange={(e) => setFormData(prev => ({ ...prev, taskId: e.target.value }))}
                options={tasks.map(t => ({ value: t.id, label: t.title }))}
                placeholder="Select Task"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-6">
            <div className="flex-1">
              <HourStepper
                label="Work Hours"
                value={formData.workHours}
                onChange={(val) => setFormData(prev => ({ ...prev, workHours: val }))}
                max={16}
              />
            </div>
            <div className="flex-1">
              <HourStepper
                label="Travel Hours"
                value={formData.travelHours}
                onChange={(val) => setFormData(prev => ({ ...prev, travelHours: val }))}
                max={8}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>City</Label>
              <Select
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                options={INDIAN_CITIES.map(c => ({ value: c, label: c }))}
                placeholder="Select City"
              />
            </div>
            <div>
              <Label>Date</Label>
              <input
                type="date"
                value={formData.entryDate}
                max={new Date().toISOString().split('T')[0]}
                min={(() => {
                  const d = new Date();
                  d.setDate(d.getDate() - 7);
                  return d.toISOString().split('T')[0];
                })()}
                onChange={(e) => setFormData(prev => ({ ...prev, entryDate: e.target.value }))}
                className="w-full bg-white border border-slate-200 rounded-md px-3 min-h-[44px] py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
              />
            </div>
          </div>

          <div>
            <Label>Notes (Optional)</Label>
            <input
              type="text"
              placeholder="What did you work on?"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-white border border-slate-200 rounded-md px-3 min-h-[44px] py-2.5 text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-100"
            />
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 text-red-600 bg-red-50 p-4 rounded-xl border border-red-100 text-sm animate-shake">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading || success}
            className={cn(
              "w-full min-h-[52px] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-[0.98]",
              success 
                ? "bg-green-600 text-white shadow-green-200" 
                : "bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200"
            )}
          >
            {success ? (
              <>
                <Check className="w-6 h-6 animate-scale-in" />
                <span>Entry Saved!</span>
              </>
            ) : loading ? (
              <>
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Log Time</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
