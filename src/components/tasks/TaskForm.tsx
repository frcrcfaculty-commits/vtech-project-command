import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useTasks } from '@/hooks/useTasks';
import { supabase } from '@/lib/supabase';
import { TASK_PRIORITIES } from '@/lib/constants';
import type { ITask, IUser } from '@/lib/types';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  milestoneId: string;
  phaseId: string;
  projectId: string;
  task?: ITask;
  currentUserId?: string;
}

export function TaskForm({ open, onClose, onSaved, milestoneId, phaseId, projectId, task, currentUserId }: TaskFormProps) {
  const { createTask, updateTask, loading } = useTasks();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState('');
  const [priority, setPriority] = useState('medium');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [users, setUsers] = useState<Array<{ id: string; full_name: string }>>([]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description ?? '');
      setAssignedTo(task.assigned_to);
      setPriority(task.priority);
      setDueDate(task.due_date ?? '');
    } else {
      setTitle('');
      setDescription('');
      setAssignedTo('');
      setPriority('medium');
      setDueDate('');
    }
    setErrors({});
  }, [task, open]);

  // Fetch users for the phase's team
  useEffect(() => {
    if (!open) return;
    supabase
      .from('project_phases')
      .select('assigned_team_id')
      .eq('id', phaseId)
      .single()
      .then(async ({ data, error: phaseErr }) => {
        if (phaseErr || !data?.assigned_team_id) { setUsers([]); return; }
        const { data: udata } = await supabase
          .from('users')
          .select('id, full_name')
          .eq('team_id', data.assigned_team_id)
          .eq('is_active', true);
        setUsers(udata ?? []);
      });
  }, [open, phaseId]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      e.title = 'Title must be at least 3 characters';
    }
    if (!assignedTo) {
      e.assignedTo = 'Please assign this task';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    try {
      if (task) {
        await updateTask(task.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          assigned_to: assignedTo,
          priority,
          due_date: dueDate || undefined,
        });
      } else {
        await createTask({
          milestone_id: milestoneId,
          phase_id: phaseId,
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          assigned_to: assignedTo,
          assigned_by: currentUserId ?? '',
          priority,
          due_date: dueDate || undefined,
        });
      }
      onSaved();
      onClose();
    } catch {
      // handled in hook
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={task ? 'Edit Task' : 'Add Task'}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Install ceiling speakers in Room 3A"
          error={errors.title}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional details..."
        />
        <Select
          label="Assign To"
          value={assignedTo}
          onChange={(e) => setAssignedTo(e.target.value)}
          options={users.map((u) => ({ value: u.id, label: u.full_name }))}
          placeholder="Select team member"
          error={errors.assignedTo}
        />
        <Select
          label="Priority"
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          options={[...TASK_PRIORITIES]}
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex gap-2 pt-2">
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Saving...' : 'Save'}
          </Button>
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </form>
    </Modal>
  );
}
