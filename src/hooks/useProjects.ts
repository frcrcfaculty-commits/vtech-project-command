import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IProject, IProjectPhase, ProjectFilters, CreateProjectData, ProjectStatus } from '@/lib/types';

export function useProjects() {
  const [projects, setProjects] = useState<IProject[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async (filters?: ProjectFilters) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('projects')
        .select(`
          *,
          project_phases(
            id,
            phase_number,
            phase_name,
            status,
            planned_start_date,
            planned_end_date,
            actual_start_date,
            actual_end_date,
            team_id,
            team_name
          )
        `)
        .order('created_at', { ascending: false });

      if (filters?.status) {
        query = query.eq('status', filters.status);
      }
      if (filters?.project_type) {
        query = query.eq('project_type', filters.project_type);
      }
      if (filters?.city) {
        query = query.eq('city', filters.city);
      }
      if (filters?.search) {
        query = query.or(`name.ilike.%${filters.search}%,client_name.ilike.%${filters.search}%`);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setProjects((data as IProject[]) || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch projects');
      // Return mock data for development
      setProjects(getMockProjects());
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchProject = useCallback(async (id: string): Promise<IProject | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          project_phases(
            *,
            milestones(
              *,
              tasks(*)
            )
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data as IProject;
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
      // Return mock data for development
      return getMockProject(id);
    } finally {
      setLoading(false);
    }
  }, []);

  const createProject = useCallback(async (projectData: CreateProjectData): Promise<IProject | null> => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: insertError } = await supabase
        .from('projects')
        .insert({
          ...projectData,
          status: 'planning',
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Fetch the created project with phases (trigger auto-creates 10 phases)
      const createdProject = await fetchProject(data.id);
      return createdProject;
    } catch (err) {
      console.error('Error creating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      // Return mock project for development
      return getMockProject('new-id');
    } finally {
      setLoading(false);
    }
  }, [fetchProject]);

  const updateProject = useCallback(async (id: string, updates: Partial<IProject>): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('projects')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
      );
    } catch (err) {
      console.error('Error updating project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteProject = useCallback(async (id: string): Promise<void> => {
    setLoading(true);
    setError(null);
    try {
      // Soft delete - set status to cancelled
      const { error: deleteError } = await supabase
        .from('projects')
        .update({ status: 'cancelled' as ProjectStatus })
        .eq('id', id);

      if (deleteError) throw deleteError;

      // Update local state
      setProjects((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: 'cancelled' as ProjectStatus } : p))
      );
    } catch (err) {
      console.error('Error deleting project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    projects,
    loading,
    error,
    fetchProjects,
    fetchProject,
    createProject,
    updateProject,
    deleteProject,
  };
}

// Mock data for development
function getMockProjects(): IProject[] {
  return [
    {
      id: '1',
      name: 'Reliance Jio HQ Boardroom',
      client_name: 'Reliance Industries',
      project_type: 'boardroom',
      city: 'Mumbai',
      status: 'active',
      start_date: '2024-01-15',
      target_end_date: '2024-06-30',
      notes: 'High priority project for Mumbai office',
      created_by: '1',
      created_at: '2024-01-10T10:00:00Z',
      updated_at: '2024-01-15T10:00:00Z',
      project_phases: getMockPhases('1', 'active'),
    },
    {
      id: '2',
      name: 'Tata Conference Center',
      client_name: 'Tata Group',
      project_type: 'conference_room',
      city: 'Pune',
      status: 'planning',
      start_date: '2024-03-01',
      target_end_date: '2024-08-15',
      notes: 'Multi-hall conference facility',
      created_by: '1',
      created_at: '2024-02-20T10:00:00Z',
      updated_at: '2024-02-20T10:00:00Z',
      project_phases: getMockPhases('2', 'planning'),
    },
    {
      id: '3',
      name: 'Adani Residence',
      client_name: 'Adani Group',
      project_type: 'residential_hni',
      city: 'Ahmedabad',
      status: 'on_hold',
      start_date: '2024-02-01',
      target_end_date: '2024-07-30',
      notes: 'Luxury home automation project',
      created_by: '1',
      created_at: '2024-01-25T10:00:00Z',
      updated_at: '2024-03-01T10:00:00Z',
      project_phases: getMockPhases('3', 'on_hold'),
    },
  ];
}

function getMockPhases(projectId: string, status: string): IProjectPhase[] {
  const phaseStatuses = ['completed', 'completed', 'in_progress', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started', 'not_started'];
  if (status === 'on_hold') {
    phaseStatuses[2] = 'blocked';
  }

  return [
    { id: `${projectId}-p1`, project_id: projectId, phase_number: 1, phase_name: 'Site Survey', status: phaseStatuses[0] as any, planned_start_date: '2024-01-15', planned_end_date: '2024-01-22', team_id: '1', team_name: 'Sales/BD', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p2`, project_id: projectId, phase_number: 2, phase_name: 'Design/Engineering', status: phaseStatuses[1] as any, planned_start_date: '2024-01-23', planned_end_date: '2024-02-10', team_id: '2', team_name: 'Design/Engineering', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p3`, project_id: projectId, phase_number: 3, phase_name: 'BOQ & Quotation', status: phaseStatuses[2] as any, planned_start_date: '2024-02-11', planned_end_date: '2024-02-25', team_id: '2', team_name: 'Design/Engineering', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p4`, project_id: projectId, phase_number: 4, phase_name: 'Client Approval', status: phaseStatuses[3] as any, planned_start_date: '2024-02-26', planned_end_date: '2024-03-10', team_id: '1', team_name: 'Sales/BD', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p5`, project_id: projectId, phase_number: 5, phase_name: 'Procurement', status: phaseStatuses[4] as any, planned_start_date: '2024-03-11', planned_end_date: '2024-04-15', team_id: '3', team_name: 'Procurement', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p6`, project_id: projectId, phase_number: 6, phase_name: 'Installation/Wiring', status: phaseStatuses[5] as any, planned_start_date: '2024-04-16', planned_end_date: '2024-05-15', team_id: '4', team_name: 'Installation', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p7`, project_id: projectId, phase_number: 7, phase_name: 'Programming/Commissioning', status: phaseStatuses[6] as any, planned_start_date: '2024-05-16', planned_end_date: '2024-05-31', team_id: '5', team_name: 'Programming', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p8`, project_id: projectId, phase_number: 8, phase_name: 'Testing/QA', status: phaseStatuses[7] as any, planned_start_date: '2024-06-01', planned_end_date: '2024-06-15', team_id: '5', team_name: 'Programming', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p9`, project_id: projectId, phase_number: 9, phase_name: 'Handover', status: phaseStatuses[8] as any, planned_start_date: '2024-06-16', planned_end_date: '2024-06-25', team_id: '1', team_name: 'Sales/BD', created_at: '2024-01-10T10:00:00Z', milestones: [] },
    { id: `${projectId}-p10`, project_id: projectId, phase_number: 10, phase_name: 'AMC/Support', status: phaseStatuses[9] as any, planned_start_date: '2024-06-26', planned_end_date: '2024-06-30', team_id: '6', team_name: 'Service/AMC', created_at: '2024-01-10T10:00:00Z', milestones: [] },
  ];
}

function getMockProject(id: string): IProject {
  const projects = getMockProjects();
  return projects.find(p => p.id === id) || projects[0];
}
