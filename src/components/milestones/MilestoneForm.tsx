import { useState, useEffect } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { useMilestones } from '@/hooks/useMilestones';
import type { IMilestone } from '@/lib/types';

interface MilestoneFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  phaseId: string;
  projectId: string;
  milestone?: IMilestone;
}

export function MilestoneForm({ open, onClose, onSaved, phaseId, projectId, milestone }: MilestoneFormProps) {
  const { createMilestone, updateMilestone, loading } = useMilestones();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (milestone) {
      setTitle(milestone.title);
      setDescription(milestone.description ?? '');
      setDueDate(milestone.due_date);
    } else {
      setTitle('');
      setDescription('');
      setDueDate('');
    }
    setErrors({});
  }, [milestone, open]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!title.trim() || title.trim().length < 3) {
      e.title = 'Title must be at least 3 characters';
    }
    if (!dueDate) {
      e.dueDate = 'Due date is required';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (milestone) {
        await updateMilestone(milestone.id, {
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate,
        });
      } else {
        await createMilestone({
          phase_id: phaseId,
          project_id: projectId,
          title: title.trim(),
          description: description.trim() || undefined,
          due_date: dueDate,
        });
      }
      onSaved();
      onClose();
    } catch {
      // error handled in hook
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={milestone ? 'Edit Milestone' : 'Add Milestone'}
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g., Complete AV design drawings"
          error={errors.title}
          required
        />
        <Textarea
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Optional description..."
        />
        <Input
          label="Due Date"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          error={errors.dueDate}
          required
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
