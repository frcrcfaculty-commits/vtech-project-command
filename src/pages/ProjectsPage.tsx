import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Filter, X } from 'lucide-react';
import { Button, Input, Select, EmptyState, Spinner } from '@/components/ui';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { ProjectForm } from '@/components/projects/ProjectForm';
import { useProjects } from '@/hooks/useProjects';
import { PROJECT_TYPES, INDIAN_CITIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import type { ProjectStatus } from '@/lib/types';

type SortOption = 'newest' | 'deadline_soon' | 'name_az';

const STATUS_FILTERS: { label: string; value: ProjectStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Planning', value: 'planning' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Completed', value: 'completed' },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const { projects, loading, error, fetchProjects } = useProjects();
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');
  const [projectTypeFilter, setProjectTypeFilter] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch projects on mount and filter changes
  useEffect(() => {
    fetchProjects({
      status: statusFilter === 'all' ? undefined : statusFilter,
      project_type: (projectTypeFilter as any) || undefined,
      city: cityFilter || undefined,
      search: debouncedSearch || undefined,
    });
  }, [fetchProjects, statusFilter, projectTypeFilter, cityFilter, debouncedSearch]);

  // Sort projects
  const sortedProjects = useMemo(() => {
    const filtered = [...projects];
    
    switch (sortBy) {
      case 'deadline_soon':
        return filtered.sort((a, b) => 
          new Date(a.target_end_date || 0).getTime() - new Date(b.target_end_date || 0).getTime()
        );
      case 'name_az':
        return filtered.sort((a, b) => a.name.localeCompare(b.name));
      case 'newest':
      default:
        return filtered.sort((a, b) => 
          new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
        );
    }
  }, [projects, sortBy]);


  const hasActiveFilters = statusFilter !== 'all' || projectTypeFilter || cityFilter || debouncedSearch;

  const clearFilters = () => {
    setStatusFilter('all');
    setProjectTypeFilter('');
    setCityFilter('');
    setSearchQuery('');
    setDebouncedSearch('');
  };

  const projectTypeOptions = [
    { value: '', label: 'All Types' },
    ...PROJECT_TYPES.map(t => ({ value: t.value, label: t.label })),
  ];

  const cityOptions = [
    { value: '', label: 'All Cities' },
    ...INDIAN_CITIES.map(c => ({ value: c, label: c })),
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'deadline_soon', label: 'Deadline Soon' },
    { value: 'name_az', label: 'Name A-Z' },
  ];

  if (showCreateForm) {
    return (
      <div className="p-4 md:p-6">
        <ProjectForm />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1A1A2E]">Projects</h1>
          <p className="text-sm text-[#6B7280] mt-1">
            {projects.length} project{projects.length !== 1 ? 's' : ''}
          </p>
        </div>
        
        {/* Sort Dropdown - Desktop */}
        <div className="hidden md:block">
          <Select
            options={sortOptions}
            value={sortBy}
            onChange={(val) => setSortBy(val as SortOption)}
            className="w-48"
          />
        </div>
      </div>

      {/* Filter Bar - Sticky on mobile */}
      <div className="sticky top-0 z-10 bg-[#F5F7FA] pb-4 -mx-4 px-4 md:mx-0 md:px-0">
        {/* Status Pills - Horizontal scroll on mobile */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          {STATUS_FILTERS.map(filter => (
            <button
              key={filter.value}
              onClick={() => setStatusFilter(filter.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors',
                statusFilter === filter.value
                  ? 'bg-[#0B1F3F] text-white'
                  : 'bg-white text-[#6B7280] hover:bg-gray-100'
              )}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Dropdowns + Search */}
        <div className="flex items-center gap-2 mt-3 md:mt-3">
          <div className="flex-1 md:flex-none md:w-48">
            <Select
              options={projectTypeOptions}
              value={projectTypeFilter}
              onChange={setProjectTypeFilter}
              className="w-full"
            />
          </div>
          <div className="flex-1 md:flex-none md:w-40">
            <Select
              options={cityOptions}
              value={cityFilter}
              onChange={setCityFilter}
              className="w-full"
            />
          </div>
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#1E88E5]"
            />
          </div>
          
          {/* Clear filters button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="p-2 rounded-md hover:bg-gray-100"
              title="Clear filters"
            >
              <X className="h-4 w-4 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Sort - Mobile */}
      <div className="md:hidden mb-4">
        <Select
          options={sortOptions}
          value={sortBy}
          onChange={(val) => setSortBy(val as SortOption)}
          className="w-full"
        />
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg border border-gray-100 p-4 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-3" />
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-4" />
              <div className="h-3 bg-gray-200 rounded w-full mb-4" />
              <div className="h-2 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600">{error}</p>
          <Button onClick={() => fetchProjects()} variant="outline" className="mt-4">
            Retry
          </Button>
        </div>
      ) : sortedProjects.length === 0 ? (
        <EmptyState
          icon={Filter}
          title={hasActiveFilters ? 'No projects match your filters' : 'No projects yet'}
          description={
            hasActiveFilters
              ? 'Try adjusting your filters or clear them to see all projects.'
              : 'Create your first project to get started.'
          }
          action={
            hasActiveFilters
              ? { label: 'Clear Filters', onClick: clearFilters }
              : { label: 'Create Project', onClick: () => setShowCreateForm(true) }
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}

      {/* FAB - Floating Action Button */}
      <button
        onClick={() => setShowCreateForm(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#FF6F00] text-white rounded-full shadow-lg flex items-center justify-center hover:bg-[#e65100] transition-colors md:hidden"
        style={{ boxShadow: '0 4px 12px rgba(255, 111, 0, 0.4)' }}
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* FAB - Desktop (top-right) */}
      <Button
        onClick={() => setShowCreateForm(true)}
        className="hidden md:flex fixed top-24 right-6"
      >
        <Plus className="h-4 w-4 mr-2" />
        New Project
      </Button>
    </div>
  );
}
