import React from 'react';
import * as LucideIcons from 'lucide-react';

const Icon = ({ name, className, onClick }: { name: string; className?: string; onClick?: () => void }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} onClick={onClick} /> : null;
};

const SystemAdmin: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900">System Administration</h1>
          <p className="text-sm text-slate-500">Manage global settings, roles, and integrations.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors flex items-center gap-2">
            <Icon name="Settings" className="w-4 h-4" /> Settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800">Roles & Permissions</h3>
          <p className="text-xs text-slate-500 mt-2">Create and manage system roles and their permissions.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800">Integrations</h3>
          <p className="text-xs text-slate-500 mt-2">Configure third-party integrations and webhooks.</p>
        </div>
        <div className="p-6 bg-white rounded-2xl border border-slate-100 shadow-sm">
          <h3 className="text-sm font-black text-slate-800">Audit & Logs</h3>
          <p className="text-xs text-slate-500 mt-2">View system-wide audit logs and export reports.</p>
        </div>
      </div>
    </div>
  );
};

export default SystemAdmin;
