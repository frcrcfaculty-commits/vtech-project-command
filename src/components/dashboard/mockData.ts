export const mockPhaseData = [
  { phase: 'Site Survey', avgDays: 3.2, plannedDays: 2 },
  { phase: 'Design', avgDays: 5.1, plannedDays: 5 },
  { phase: 'BOQ & Quotation', avgDays: 4.0, plannedDays: 3 },
  { phase: 'Client Approval', avgDays: 8.5, plannedDays: 5 },
  { phase: 'Procurement', avgDays: 10.2, plannedDays: 7 },
  { phase: 'Installation', avgDays: 14.8, plannedDays: 10 },
  { phase: 'Programming', avgDays: 6.3, plannedDays: 5 },
  { phase: 'Testing', avgDays: 3.1, plannedDays: 3 },
  { phase: 'Handover', avgDays: 2.0, plannedDays: 2 },
  { phase: 'AMC/Support', avgDays: 1.5, plannedDays: 1 },
];

export const mockTeamData = [
  { team: 'Sales/BD', hours: 120, tasksCompleted: 28, overdue: 3 },
  { team: 'Design', hours: 185, tasksCompleted: 22, overdue: 1 },
  { team: 'Procurement', hours: 95, tasksCompleted: 15, overdue: 5 },
  { team: 'Installation', hours: 310, tasksCompleted: 45, overdue: 8 },
  { team: 'Programming', hours: 220, tasksCompleted: 35, overdue: 2 },
  { team: 'Service/AMC', hours: 75, tasksCompleted: 18, overdue: 0 },
  { team: 'Admin', hours: 60, tasksCompleted: 12, overdue: 1 },
];

export const mockTravelData = [
  { name: 'Reliance Boardroom', workHours: 120, travelHours: 28 },
  { name: 'Tata Experience', workHours: 85, travelHours: 35 },
  { name: 'Ambani Residence', workHours: 200, travelHours: 45 },
  { name: 'HDFC Training', workHours: 60, travelHours: 8 },
  { name: 'Wipro Auditorium', workHours: 150, travelHours: 55 },
];

export const mockProjectHealth = [
  { id: '1', name: 'Reliance Jio HQ', client: 'Reliance', type: 'boardroom', status: 'active', phase: 'Installation', daysLeft: 15, hours: 148, health: 'green' },
  { id: '2', name: 'Tata Experience Centre', client: 'Tata Group', type: 'experience_centre', status: 'active', phase: 'Procurement', daysLeft: 30, hours: 85, health: 'yellow' },
  { id: '3', name: 'Ambani Residence AV', client: 'Ambani Family', type: 'residential', status: 'active', phase: 'Programming', daysLeft: -3, hours: 245, health: 'red' },
  { id: '4', name: 'HDFC Training Rooms', client: 'HDFC Bank', type: 'conference_room', status: 'planning', phase: 'Design', daysLeft: 45, hours: 20, health: 'green' },
  { id: '5', name: 'Wipro Auditorium', client: 'Wipro Ltd', type: 'auditorium', status: 'active', phase: 'Installation', daysLeft: 8, hours: 205, health: 'yellow' },
];

export const mockActivity = [
  { user: 'Rahul Sharma', action: 'logged 4h on Reliance Jio HQ — Installation', time: '2h ago', type: 'time' },
  { user: 'Priya Patel', action: 'completed: Install ceiling speakers in Room 3A', time: '1h ago', type: 'task' },
  { user: 'Vishal Shah', action: 'created project: Tata Experience Centre', time: '3h ago', type: 'project' },
  { user: 'Amit Kumar', action: 'marked Procurement complete on HDFC Training', time: '5h ago', type: 'phase' },
  { user: 'Deepak Singh', action: 'logged 2.5h travel to Wipro Auditorium — Delhi', time: '6h ago', type: 'time' },
];
