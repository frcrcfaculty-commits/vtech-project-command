import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Button, Input, Select, Textarea } from '@/components/ui';
import { Modal } from '@/components/ui/Modal';
import { useProjects } from '@/hooks/useProjects';
import { PROJECT_TYPES, INDIAN_CITIES } from '@/lib/constants';
import type { IProject, CreateProjectData } from '@/lib/types';

export interface ProjectFormProps {
  project?: IProject | null;
  isModal?: boolean;
  onClose?: () => void;
}

export function ProjectForm({ project, isModal = false, onClose }: ProjectFormProps) {
  const navigate = useNavigate();
  const { createProject, updateProject, loading, error } = useProjects();
  const isEditing = !!project;

  const [formData, setFormData] = useState<CreateProjectData>({
    name: '',
    client_name: '',
    project_type: '',
    city: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    target_end_date: '',
    notes: '',
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (project) {
      setFormData({
        name: project.name,
        client_name: project.client_name,
        project_type: project.project_type,
        city: project.city,
        start_date: project.start_date,
        target_end_date: project.target_end_date,
        notes: project.notes || '',
      });
    }
  }, [project]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear validation error when user types
    if (validationErrors[name]) {
      setValidationErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validate = (): boolean => {
    const errors: Record<string, string> = {};

    if (!formData.name.trim()) {
      errors.name = 'Project name is required';
    }
    if (!formData.client_name.trim()) {
      errors.client_name = 'Client name is required';
    }
    if (!formData.project_type) {
      errors.project_type = 'Project type is required';
    }
    if (!formData.city) {
      errors.city = 'City is required';
    }
    if (!formData.start_date) {
      errors.start_date = 'Start date is required';
    }
    if (!formData.target_end_date) {
      errors.target_end_date = 'Target end date is required';
    }
    if (formData.start_date && formData.target_end_date && formData.target_end_date <= formData.start_date) {
      errors.target_end_date = 'Target end date must be after start date';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      if (isEditing && project) {
        await updateProject(project.id, formData);
        if (onClose) onClose();
      } else {
        const created = await createProject(formData);
        if (created) {
          navigate(`/projects/${created.id}`);
        }
      }
    } catch (err) {
      console.error('Error saving project:', err);
    }
  };

  const projectTypeOptions = PROJECT_TYPES.map(t => ({ value: t.value, label: t.label }));
  const cityOptions = INDIAN_CITIES.map(c => ({ value: c, label: c }));

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
          {error}
        </div>
      )}

      <Input
        id="name"
        name="name"
        label="Project Name"
        placeholder="e.g., Reliance Jio HQ Boardroom"
        value={formData.name}
        onChange={handleChange}
        error={validationErrors.name}
        required
      />

      <Input
        id="client_name"
        name="client_name"
        label="Client Name"
        placeholder="e.g., Reliance Industries"
        value={formData.client_name}
        onChange={handleChange}
        error={validationErrors.client_name}
        required
      />

      <Select
        id="project_type"
        name="project_type"
        label="Project Type"
        placeholder="Select project type"
        options={projectTypeOptions}
        value={formData.project_type}
        onChange={handleChange}
        error={validationErrors.project_type}
        required
      />

      <Select
        id="city"
        name="city"
        label="City"
        placeholder="Select city"
        options={cityOptions}
        value={formData.city}
        onChange={handleChange}
        error={validationErrors.city}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="start_date"
          name="start_date"
          type="date"
          label="Start Date"
          value={formData.start_date}
          onChange={handleChange}
          error={validationErrors.start_date}
          required
        />

        <Input
          id="target_end_date"
          name="target_end_date"
          type="date"
          label="Target End Date"
          value={formData.target_end_date}
          onChange={handleChange}
          error={validationErrors.target_end_date}
          required
        />
      </div>

      <Textarea
        id="notes"
        name="notes"
        label="Notes"
        placeholder="Optional notes about this project..."
        rows={3}
        value={formData.notes}
        onChange={handleChange}
      />

      <div className="flex justify-end gap-3 pt-4">
        {isModal && onClose && (
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
        )}
        <Button type="submit" loading={loading} disabled={loading}>
          {isEditing ? 'Update Project' : 'Create Project'}
        </Button>
      </div>
    </form>
  );

  if (isModal) {
    return (
      <Modal
        isOpen={true}
        onClose={onClose || (() => {})}
        title={isEditing ? 'Edit Project' : 'Create New Project'}
        size="lg"
      >
        {formContent}
      </Modal>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-[#1A1A2E] mb-6">
        {isEditing ? 'Edit Project' : 'Create New Project'}
      </h1>
      {formContent}
    </div>
  );
}
