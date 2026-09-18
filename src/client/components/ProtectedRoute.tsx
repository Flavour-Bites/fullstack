import { Navigate, useLocation } from 'react-router-dom';
import { User } from '../../types';

interface ProtectedRouteProps {
  currentUser: User | null;
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export function ProtectedRoute({ currentUser, children, requireAdmin }: ProtectedRouteProps) {
  const location = useLocation();

  if (!currentUser) {
    // Redirect to login page but save the location they were trying to go to
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireAdmin && currentUser.role !== 'admin' && currentUser.role !== 'staff') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
