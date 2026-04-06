// Dashboard Mock Data with Interfaces

export interface ActivityItem {
  user: string;
  action: string;
  type: 'time' | 'task' | 'project' | 'phase';
  time: string;
}

export interface PhaseData {
  phase: string;
  avgDays: number;
}

export interface TeamPerformance {
  name: string;
  tasksCompleted: number;
  efficiency: number;
  overdue: number;
  hours: number;
}

export interface TravelData {
  month: string;
  workHours: number;
  travelHours: number;
}

export const mockActivity: ActivityItem[] = [
  { user: 'Rahul Sharma', action: 'completed site survey for Reliance Jio', type: 'phase', time: '2h ago' },
  { user: 'Deepak Singh', action: 'logged 4.5h for cable routing', type: 'time', time: '4h ago' },
  { user: 'Sachin More', action: 'assigned to Wipro Auditorium project', type: 'project', time: '1d ago' },
  { user: 'Neha Gupta', action: 'added 5 tasks to procurement phase', type: 'task', time: '1d ago' },
];

export const mockPhaseData: PhaseData[] = [
  { phase: 'Survey', avgDays: 3 },
  { phase: 'Design', avgDays: 12 },
  { phase: 'Approval', avgDays: 18 },
  { phase: 'Procurement', avgDays: 25 },
  { phase: 'Install', avgDays: 45 },
];

export const mockTeamData: TeamPerformance[] = [
  { name: 'Rahul S.', tasksCompleted: 12, efficiency: 95, overdue: 1, hours: 145 },
  { name: 'Deepak S.', tasksCompleted: 10, efficiency: 88, overdue: 2, hours: 130 },
  { name: 'Sachin M.', tasksCompleted: 6, efficiency: 72, overdue: 5, hours: 90 },
  { name: 'Neha G.', tasksCompleted: 15, efficiency: 98, overdue: 0, hours: 160 },
  { name: 'Karan P.', tasksCompleted: 4, efficiency: 65, overdue: 8, hours: 60 },
];

export const mockTravelData: TravelData[] = [
  { month: 'Jan', workHours: 120, travelHours: 35 },
  { month: 'Feb', workHours: 140, travelHours: 25 },
  { month: 'Mar', workHours: 160, travelHours: 40 },
  { month: 'Apr', workHours: 130, travelHours: 45 },
];

export const mockProjectHealth = [
  { id: '1', name: 'Reliance Jio HQ', client: 'Reliance', status: 'active', type: 'boardroom', health: 90, daysLeft: 12, phase: 'Installation', hours: 240 },
  { id: '2', name: 'Wipro Auditorium', client: 'Wipro', status: 'on_hold', type: 'auditorium', health: 65, daysLeft: -5, phase: 'Design', hours: 85 },
  { id: '3', name: 'Tata Experience Centre', client: 'Tata', status: 'active', type: 'experience_centre', health: 85, daysLeft: 45, phase: 'Procurement', hours: 120 },
];

