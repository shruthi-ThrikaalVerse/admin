import React from 'react';
import { Navigate } from 'react-router-dom';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <LucideIcons.Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verifying Identity...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return <>{children}</>;
};

export const PublicRoute = ({ children }: { children?: React.ReactNode }) => {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export const AdminRoute = ({ children }: { children?: React.ReactNode }) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8fafc]">
      <div className="flex flex-col items-center gap-4">
        <LucideIcons.Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Verifying Permissions...</p>
      </div>
    </div>
  );

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!user || (user.role !== 'admin' && user.role !== 'auditor')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-full max-w-2xl mx-auto p-8 bg-white border rounded-xl text-center">
          <LucideIcons.ShieldOff className="w-12 h-12 text-rose-500 mx-auto" />
          <h3 className="mt-4 text-lg font-bold">Access Denied</h3>
          <p className="text-sm text-slate-500 mt-2">This area is restricted to users with administrative or auditing privileges.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;
