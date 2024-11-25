import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { pb } from '../lib/pocketbase';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  useEffect(() => {
    // Check if we have auth data in localStorage
    const authData = localStorage.getItem('pocketbase_auth');
    if (authData) {
      try {
        const { token, model } = JSON.parse(authData);
        if (token && model && !pb.authStore.isValid) {
          pb.authStore.save(token, model);
        }
      } catch (error) {
        console.error('Error restoring auth state:', error);
        localStorage.removeItem('pocketbase_auth');
      }
    }
  }, []);

  if (!pb.authStore.isValid) {
    // Redirect to login but save the attempted location
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
