import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { logs, notify } = useHRMS();
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'activity'>('details');

  // Security States
  const [isMfaEnabled, setIsMfaEnabled] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Filter logs for current user
  const userLogs = useMemo(() => {
    return logs.filter(log => log.user === user?.fullName || log.user === 'Super Admin').slice(0, 10);
  }, [logs, user]);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    notify('Administrative password updated successfully.', 'success');
  };

  const renderDetails = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <div className="flex items-center gap-4 mb-2">
        <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl">
          <LucideIcons.Info className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Administrative Identity</h2>
          <p className="text-xs text-slate-400 font-medium tracking-wide">Detailed account metadata and personal records.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Legal Name</label>
            <p className="text-lg font-black text-slate-800 mt-1">{user?.fullName}</p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Work Email</label>
            <p className="text-lg font-black text-slate-800 mt-1">{user?.email}</p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unique User ID</label>
            <p className="text-lg font-black text-indigo-600 mt-1 font-mono">UID-{user?.id?.split('-')[1]?.toUpperCase() || 'ROOT'}</p>
          </div>
        </div>
        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
            <p className="text-lg font-black text-slate-800 mt-1 capitalize">{user?.role} Account</p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Access Level</label>
            <p className="text-lg font-black text-emerald-600 mt-1 uppercase tracking-widest text-sm bg-emerald-50 px-3 py-1 rounded-lg inline-block border border-emerald-100">Tier 1: Root Access</p>
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Session Region</label>
            <p className="text-lg font-black text-slate-800 mt-1">Global Cluster 01 (India)</p>
          </div>
        </div>
      </div>
      
      <div className="pt-8 border-t border-slate-50">
         <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-4">Account Metadata</h3>
         <div className="grid grid-cols-3 gap-4">
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Joined Date</p>
              <p className="text-xs font-black text-slate-700">12 Jan 2024</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Last Sync</p>
              <p className="text-xs font-black text-slate-700">Today, 09:45 AM</p>
            </div>
            <div className="p-4 bg-slate-50 rounded-2xl text-center">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Auth Type</p>
              <p className="text-xs font-black text-slate-700">MFA Enforced</p>
            </div>
         </div>
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <LucideIcons.ShieldCheck className="text-indigo-600" />
          Security Hardening
        </h2>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">Manage credentials and administrative access protocols.</p>
      </div>

      <form onSubmit={handlePasswordUpdate} className="space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <LucideIcons.Key size={14} /> Update Access Credentials
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Password</label>
            <input 
              type="password" 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              placeholder="••••••••"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">New Secure Password</label>
            <input 
              type="password" 
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              placeholder="••••••••"
            />
          </div>
        </div>
        <button type="submit" className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
          Commit Password Change
        </button>
      </form>

      <div className="pt-8 border-t border-slate-50 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <LucideIcons.Lock size={14} /> Two-Factor Authentication
        </h3>
        <div className="flex items-center justify-between p-6 bg-slate-50 rounded-3xl border border-slate-100">
          <div>
            <p className="text-sm font-black text-slate-900">MFA via Authenticator App</p>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">High-security protocol for Tier-1 logins.</p>
          </div>
          <button 
            onClick={() => {
              setIsMfaEnabled(!isMfaEnabled);
              notify(`MFA Protocol ${!isMfaEnabled ? 'Enabled' : 'Disabled'}`, !isMfaEnabled ? 'success' : 'warning');
            }}
            className={`w-14 h-8 rounded-full transition-all relative p-1.5 ${isMfaEnabled ? 'bg-emerald-500' : 'bg-slate-300'}`}
          >
            <div className={`w-5 h-5 bg-white rounded-full transition-all shadow-md ${isMfaEnabled ? 'translate-x-6' : 'translate-x-0'}`}></div>
          </button>
        </div>
      </div>

      <div className="pt-8 border-t border-slate-50 space-y-6">
        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
          <LucideIcons.Globe size={14} /> Global API Keys
        </h3>
        <div className="p-6 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
          <LucideIcons.Zap className="absolute -right-4 -bottom-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <p className="text-[10px] font-black text-indigo-300 uppercase tracking-widest">Active System Key</p>
              <p className="text-sm font-mono mt-2 text-white/90">ak_live_51P...f6x9</p>
            </div>
            <div className="flex gap-2">
               <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Copy</button>
               <button className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-rose-500/30">Rotate</button>
            </div>
          </div>
        </div>
      </div>
    </div>

  );

  const renderActivity = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <LucideIcons.History className="text-indigo-600" />
          Your Audit Timeline
        </h2>
        <p className="text-xs text-slate-400 font-medium tracking-wide mt-1">Chronological history of your administrative operations.</p>
      </div>

      <div className="relative space-y-8 before:absolute before:left-6 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-100">
        {userLogs.length > 0 ? userLogs.map((log, i) => (
          <div key={log.id} className="relative pl-16 group">
            <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-4 border-white shadow-sm ring-4 ring-slate-50 transition-all group-hover:scale-125 z-10 ${
              log.action === 'Delete' ? 'bg-rose-500' :
              log.action === 'Update' ? 'bg-amber-500' :
              log.action === 'Create' ? 'bg-emerald-500' : 'bg-indigo-500'
            }`}></div>
            <div className="bg-slate-50/50 p-6 rounded-[32px] border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-indigo-500/5 transition-all group-hover:-translate-y-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">{log.module} Audit</span>
                <span className="text-[10px] font-bold text-slate-400">{log.timestamp}</span>
              </div>
              <p className="text-sm font-black text-slate-800">{log.action}</p>
              <p className="text-xs text-slate-500 font-medium mt-1 leading-relaxed">
                {log.details}
              </p>
              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                <LucideIcons.Monitor size={12} className="text-slate-300" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{log.timestamp}</p>
              </div>
            </div>
          </div>
        )) : (
          <div className="p-8 text-center">
            <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No recent operations</p>
          </div>
        )}
      </div>
      <button 
        onClick={() => setActiveTab('activity')}
        className="w-full mt-8 py-3 text-indigo-600 bg-indigo-50 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
      >
         View Full Audit
      </button>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div className="flex items-center justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 font-black text-xl">{user?.fullName?.charAt(0) || 'A'}</div>
            <div>
              <h1 className="text-2xl font-black text-slate-900">{user?.fullName}</h1>
              <p className="text-xs text-slate-400 font-medium mt-1">{user?.email}</p>
            </div>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => notify('Profile settings saved.', 'success')} className="px-6 py-3 bg-white rounded-2xl border border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all">Save</button>
          <button onClick={() => notify('Profile exported.', 'info')} className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all">Export</button>
        </div>
      </div>

      <div>
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => setActiveTab('details')} className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'details' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Details</button>
            <button onClick={() => setActiveTab('security')} className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Security</button>
            <button onClick={() => setActiveTab('activity')} className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'activity' ? 'bg-indigo-600 text-white' : 'text-slate-500'}`}>Activity</button>
          </div>
        </div>

        {activeTab === 'details' && renderDetails()}
        {activeTab === 'security' && renderSecurity()}
        {activeTab === 'activity' && renderActivity()}
      </div>
    </div>
  );
};

export default Profile;
