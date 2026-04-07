import { useState, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { IProject, IProjectPhase, ProjectStatus } from '@/lib/types';

// Local interfaces for hook-specific input shapes
interface ProjectFilters {
  status?: ProjectStatus;
  project_type?: string;
  city?: string;
  search?: string;
}

interface CreateProjectData {
  name: string;
  client_name: string;
  project_type: string;
  city: string;
  start_date: string;
  target_end_date: string;
  notes?: string;
}

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
          project_phases (
            id, project_id, phase_name, phase_order, status,
            assigned_team_id, planned_start, planned_end,
            actual_start, actual_end, notes, created_at,
            assigned_team:teams(id, name)
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
          project_phases (
            id, project_id, phase_name, phase_order, status,
            assigned_team_id, planned_start, planned_end,
            actual_start, actual_end, notes, created_at,
            assigned_team:teams(id, name)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data as IProject;
    } catch (err) {
      console.error('Error fetching project:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch project');
      return null;
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
      return null;
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
