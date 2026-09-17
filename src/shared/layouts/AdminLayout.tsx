import { Outlet } from 'react-router-dom';
import { ProtectedRoute } from '../ui/ProtectedRoute';
import ErrorBoundary from '../ui/ErrorBoundary';
import type { User } from '../../types';

interface AdminLayoutProps {
  currentUser: User | null;
}

export default function AdminLayout({ currentUser }: Readonly<AdminLayoutProps>) {
  return (
    <ProtectedRoute currentUser={currentUser} requireAdmin>
      <main className="flex-grow">
        <ErrorBoundary>
          <Outlet />
        </ErrorBoundary>
      </main>
    </ProtectedRoute>
  );
}
