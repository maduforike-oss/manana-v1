'use client';

import { useAuth } from '@/lib/auth-context';
import { useNavigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
}

export default function RequireAuth({ children, redirectTo }: RequireAuthProps) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      const currentPath = location.pathname + location.search;
      const authPath = redirectTo || '/auth';
      const separator = authPath.includes('?') ? '&' : '?';
      navigate(`${authPath}${separator}redirect=${encodeURIComponent(currentPath)}`);
    }
  }, [user, isLoading, navigate, redirectTo, location]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return user ? <>{children}</> : null;
}