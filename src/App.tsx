import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { RoleGate } from '@/components/auth/RoleGate';
import { AppShell } from '@/components/layout/AppShell';
import { Spinner } from '@/components/ui/Spinner';

const LoginPage         = lazy(() => import('@/pages/LoginPage').then(m => ({ default: m.LoginPage })));
const DashboardPage     = lazy(() => import('@/pages/DashboardPage').then(m => ({ default: m.DashboardPage })));
const ProjectsPage      = lazy(() => import('@/pages/ProjectsPage').then(m => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then(m => ({ default: m.ProjectDetailPage })));
const MyTasksPage       = lazy(() => import('@/pages/MyTasksPage').then(m => ({ default: m.MyTasksPage })));
const TimeEntryPage     = lazy(() => import('@/pages/TimeEntryPage').then(m => ({ default: m.TimeEntryPage })));
const TeamPage          = lazy(() => import('@/pages/TeamPage').then(m => ({ default: m.TeamPage })));
const SettingsPage      = lazy(() => import('@/pages/SettingsPage').then(m => ({ default: m.SettingsPage })));
const NotFoundPage      = lazy(() => import('@/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })));

const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-[var(--color-bg)]">
    <Spinner size="lg" />
  </div>
);

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route path="/" element={<DashboardPage />} />
              <Route path="/projects" element={<ProjectsPage />} />
              <Route path="/projects/:id" element={<ProjectDetailPage />} />
              <Route path="/tasks" element={<MyTasksPage />} />
              <Route path="/time" element={<TimeEntryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route
                path="/team"
                element={
                  <RoleGate allowedRoles={['owner']}>
                    <TeamPage />
                  </RoleGate>
                }
              />
            </Route>
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  );
}
