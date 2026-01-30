import React, { useState, useMemo, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  ShieldAlert, Users, Landmark, User, ChevronRight,
  RefreshCcw, Search, ShieldCheck, Lock, Unlock,
  Settings, Download, Activity,
  Server, Database, Cpu, Trash2, Globe,
  ShieldQuestion, Smartphone, Monitor, AlertTriangle, X, Check,
  CircleDashed, Award
} from 'lucide-react';
import { useHRMS } from '../context/HRMSContext';
 
// --- 1. INITIAL MOCK DATA ---
const mockAuditLogs = [
  { id: 1, timestamp: '2026-01-23 10:15:22', user: 'Admin Sarah', action: 'Update', module: 'Payroll', ipAddress: '192.168.1.45', severity: 'low' },
  { id: 2, timestamp: '2026-01-23 09:45:10', user: 'System', action: 'Login', module: 'Auth', ipAddress: '10.0.0.12', severity: 'info' },
  { id: 3, timestamp: '2026-01-22 18:30:05', user: 'HR John', action: 'Create', module: 'Employees', ipAddress: '172.16.254.1', severity: 'medium' },
  { id: 4, timestamp: '2026-01-22 14:20:11', user: 'Admin Sarah', action: 'Delete', module: 'Roles', ipAddress: '192.168.1.45', severity: 'high' },
];
 
const initialRoles = [
  { id: 'role-1', name: 'Super Admin', count: 2, icon: 'ShieldAlert', color: 'text-rose-500', bg: 'bg-rose-50', permissions: ['Full Access', 'System Logs', 'DB Management'], description: 'Unrestricted access to all system modules and infrastructure settings.', isSystemRole: true },
  { id: 'role-2', name: 'HR Manager', count: 5, icon: 'Users', color: 'text-blue-500', bg: 'bg-blue-50', permissions: ['Employee CRUD', 'Leave Approval', 'Reports'], description: 'Manage employee lifecycle, approve leaves, and generate organizational reports.', isSystemRole: true },
  { id: 'role-3', name: 'Payroll Admin', count: 3, icon: 'Landmark', color: 'text-emerald-500', bg: 'bg-emerald-50', permissions: ['Payroll Run', 'Payslip Gen', 'Tax Config'], description: 'Handle compensation cycles, compliance filings, and financial data.', isSystemRole: true },
];
 
const initialActiveSessions = [
  { id: 1, user: 'Admin Sarah', device: 'Chrome / MacOS', location: 'Bangalore, IN', time: 'Active now', icon: Monitor },
  { id: 2, user: 'HR John', device: 'Safari / iPhone 15', location: 'Mumbai, IN', time: '2h ago', icon: Smartphone },
];
 
const ALL_PERMISSIONS = [
  'Full Access', 'System Logs', 'DB Management', 'Employee CRUD',
  'Leave Approval', 'Reports', 'Payroll Run', 'Payslip Gen', 'Tax Config',
  'Audit View', 'IAM Config', 'Network Settings'
];
 
// --- 2. HELPER COMPONENTS ---
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : <Settings className={className} />;
};
 
const HealthStat = ({ label, value, icon: IconComp, trend, color, disabled }: any) => (
  <div className={`bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4 transition-all ${disabled ? 'opacity-40 grayscale' : ''}`}>
    <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
      <IconComp className={`w-5 h-5 ${color.replace('bg-', 'text-')}`} />
    </div>
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
      <div className="flex items-baseline gap-2">
        <p className="text-xl font-black text-slate-900">{value}</p>
        <span className="text-[9px] font-bold text-emerald-500">{trend}</span>
      </div>
    </div>
  </div>
);
 
const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className="bg-white rounded-[32px] w-full max-w-lg relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-8 border-b flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-50 rounded-xl transition-colors"><X size={24} /></button>
        </div>
        <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">{children}</div>
      </div>
    </div>
  );
};
 
const SystemAdmin: React.FC = () => {
  const { notify, addLog } = useHRMS();
 
  // Manage roles with Persistence
  const [roles, setRoles] = useState(() => {
    const saved = localStorage.getItem('HRMS_SYSTEM_ROLES');
    return saved ? JSON.parse(saved) : initialRoles;
  });
 
  useEffect(() => {
    localStorage.setItem('HRMS_SYSTEM_ROLES', JSON.stringify(roles));
  }, [roles]);
 
  const [is2FAEnabled, setIs2FAEnabled] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNewRoleModal, setShowNewRoleModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const [isLockdownActive, setIsLockdownActive] = useState(false);
  const [activeSessions, setActiveSessions] = useState(initialActiveSessions);
 
  // Auditor States
  const [isAuditing, setIsAuditing] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditResults, setAuditResults] = useState<any>(null);
 
  // New Role Form State
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePerms, setNewRolePerms] = useState<string[]>([]);
 
  const filteredLogs = useMemo(() => {
    return mockAuditLogs.filter(log =>
      log.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.module.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);
 
  const handleRefresh = () => {
    if (isLockdownActive) return;
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      notify("Security feeds synchronized.");
    }, 800);
  };
 
  const handleMaintenance = (task: string) => {
    if (isLockdownActive) {
        notify("System write-access blocked during lockdown.", "error");
        return;
    }
    notify(`Starting maintenance: ${task}...`, 'info');
    setTimeout(() => notify(`${task} completed successfully.`, 'success'), 2000);
  };
 
  const handleExportAudit = () => {
    if (isLockdownActive) {
        notify("Data egress blocked during security lockdown.", "error");
        return;
    }
    if (filteredLogs.length === 0) {
      notify("No logs available to export.", "warning");
      return;
    }
 
    notify("Preparing audit logs export...", "info");
 
    setTimeout(() => {
      const headers = ["Timestamp", "Operator", "Activity", "Resource", "Node IP", "Severity"];
      const csvContent = [
        headers.join(","),
        ...filteredLogs.map(log =>
          `"${log.timestamp}","${log.user}","${log.action}","${log.module}","${log.ipAddress}","${log.severity}"`
        )
      ].join("\n");
 
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `audit_logs_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
     
      notify("Audit logs exported successfully.", "success");
    }, 1000);
  };
 
  const handleEmergencyLock = () => {
    if (isLockdownActive) {
        if (window.confirm("Enter administrative credentials to release lockdown? (Simulated)")) {
            setIsLockdownActive(false);
            notify("System lockdown released. Resuming normal operations.", "success");
            addLog("Security", "Infrastructure", "Lockdown Released by Super Admin");
        }
        return;
    }
 
    if (window.confirm("WARNING: This will freeze all system modifications and terminate non-admin sessions. Proceed with Emergency Lock?")) {
        setIsLockdownActive(true);
        notify("CRITICAL: System in lockdown mode.", "error");
        addLog("Security", "Infrastructure", "EMERGENCY LOCKDOWN INITIATED");
    }
  };
 
  const handleRevokeSession = (sessionId: number, userName: string) => {
    if (isLockdownActive) return;
   
    if (window.confirm(`Are you sure you want to revoke the active session for ${userName}? This will force a logout.`)) {
      setActiveSessions(prev => prev.filter(s => s.id !== sessionId));
      notify(`Session for ${userName} has been revoked.`, 'warning');
      addLog("Revoke", "Session", `Administrator revoked session for ${userName}`);
    }
  };
 
  const handleRunAudit = () => {
    setIsAuditing(true);
    notify("Initiating comprehensive session policy scan...", "info");
   
    setTimeout(() => {
      // Calculate a mock score based on current states
      let score = 75;
      const findings = [];
     
      if (is2FAEnabled) {
        score += 15;
        findings.push({ type: 'pass', text: 'Hardware MFA is strictly enforced for Tier-1 nodes.' });
      } else {
        findings.push({ type: 'risk', text: 'MFA is currently optional. Risk of unauthorized entry.' });
      }
     
      if (isLockdownActive) {
        score = 100;
        findings.push({ type: 'pass', text: 'Maximum security lockdown active. All external write ops blocked.' });
      }
 
      const superAdmins = roles.find((r: any) => r.name === 'Super Admin')?.count || 0;
      if (superAdmins > 3) {
        score -= 10;
        findings.push({ type: 'risk', text: `High Super Admin density (${superAdmins} accounts). Reduce to improve integrity.` });
      } else {
        findings.push({ type: 'pass', text: 'Administrative privilege distribution is within safe bounds.' });
      }
 
      if (activeSessions.length > 10) {
        score -= 5;
        findings.push({ type: 'warning', text: 'Elevated number of active concurrent sessions detected.' });
      }
 
      setAuditResults({ score: Math.min(score, 100), findings });
      setIsAuditing(false);
      setShowAuditModal(true);
      notify("Session audit completed.", "success");
      addLog("Audit", "Security", "Ran Session Policy Auditor");
    }, 1500);
  };
 
  const handleUpdateRole = (e: React.FormEvent) => {
    e.preventDefault();
    setRoles((prev: any[]) => prev.map(r => r.id === selectedRole.id ? selectedRole : r));
    notify(`IAM Policy for ${selectedRole.name} updated successfully.`);
    addLog("Update", "IAM", `Modified permissions for ${selectedRole.name}`);
    setSelectedRole(null);
  };
 
  const handleCreateRole = (e: React.FormEvent) => {
    e.preventDefault();
    const newRoleObj = {
      id: `role-${Date.now()}`,
      name: newRoleName,
      count: 0,
      icon: 'User',
      color: 'text-indigo-500',
      bg: 'bg-indigo-50',
      permissions: newRolePerms,
      description: `Custom policy for ${newRoleName} created by Admin.`,
      isSystemRole: false
    };
    setRoles((prev: any[]) => [...prev, newRoleObj]);
    notify(`Custom IAM Policy '${newRoleName}' has been defined and activated.`, 'success');
    addLog("Create", "IAM", `Defined new role: ${newRoleName}`);
    setShowNewRoleModal(false);
    setNewRoleName('');
    setNewRolePerms([]);
  };
 
  const handleDeleteRole = (e: React.MouseEvent | null, roleId: string, roleName: string) => {
    if (e) e.stopPropagation();
   
    if (window.confirm(`Are you sure you want to delete the "${roleName}" IAM policy? This action cannot be undone.`)) {
      setRoles((prev: any[]) => prev.filter(r => r.id !== roleId));
      notify("IAM Policy deleted successfully.", "warning");
      addLog("Delete", "IAM", `Deleted custom role: ${roleName}`);
      if (selectedRole?.id === roleId) setSelectedRole(null);
    }
  };
 
  const togglePermission = (permission: string) => {
    setSelectedRole((prev: any) => {
      const current = prev.permissions.includes(permission)
        ? prev.permissions.filter((p: string) => p !== permission)
        : [...prev.permissions, permission];
      return { ...prev, permissions: current };
    });
  };
 
  const toggleNewRolePermission = (permission: string) => {
    setNewRolePerms(prev =>
      prev.includes(permission)
        ? prev.filter(p => p !== permission)
        : [...prev, permission]
    );
  };
 
  return (
    <div className={`min-h-screen space-y-8 font-sans animate-in fade-in duration-500 transition-colors ${isLockdownActive ? 'bg-rose-50/30' : 'bg-[#f8fafc]'}`}>
     
      {/* Lockdown Alert Banner */}
      {isLockdownActive && (
        <div className="bg-rose-600 text-white p-4 rounded-2xl flex items-center justify-center gap-4 animate-pulse shadow-2xl shadow-rose-200">
           <AlertTriangle size={24} />
           <p className="font-black uppercase tracking-[0.2em] text-xs">Emergency Protocol Active: System Access Restricted</p>
        </div>
      )}
 
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Infrastructure</h1>
          <p className="text-slate-500 mt-1 flex items-center gap-2 font-medium">
            <ShieldCheck size={16} className={isLockdownActive ? "text-rose-500" : "text-emerald-500"} />
            Security Shield: <span className={`${isLockdownActive ? "text-rose-600" : "text-emerald-600"} font-black uppercase text-[10px] tracking-widest`}>
                {isLockdownActive ? "LOCKDOWN ACTIVE" : "Active & Secure"}
            </span>
          </p>
        </div>
        <div className="flex gap-3">
          <button
            disabled={isLockdownActive}
            onClick={handleExportAudit}
            className={`flex items-center gap-2 px-6 py-3.5 bg-white border border-slate-200 rounded-2xl text-xs font-black text-slate-700 hover:bg-slate-50 transition-all shadow-sm uppercase tracking-widest active:scale-95 ${isLockdownActive ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <Download size={16} />
            Export Audit
          </button>
          <button
            onClick={handleEmergencyLock}
            className={`flex items-center gap-2 px-6 py-3.5 rounded-2xl text-xs font-black transition-all shadow-xl uppercase tracking-widest active:scale-95 ${
                isLockdownActive
                ? 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100'
                : 'bg-rose-600 text-white hover:bg-rose-700 shadow-rose-100'
            }`}
          >
            {isLockdownActive ? <Unlock size={16} /> : <Lock size={16} />}
            {isLockdownActive ? "Release Lockdown" : "Emergency Lock"}
          </button>
        </div>
      </div>
 
      {/* Health Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <HealthStat label="Uptime" value="99.98%" trend="+0.01%" icon={Server} color="bg-indigo-500" disabled={isLockdownActive} />
        <HealthStat label="API Latency" value="42ms" trend="-4ms" icon={Activity} color="bg-emerald-500" disabled={isLockdownActive} />
        <HealthStat label="DB Storage" value="1.2 / 5 TB" trend="12%" icon={Database} color="bg-blue-500" disabled={isLockdownActive} />
        <HealthStat label="CPU Load" value="14.5%" trend="-2.1%" icon={Cpu} color="bg-amber-500" disabled={isLockdownActive} />
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
        {/* Audit Log Central */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/30">
              <h2 className="text-xl font-black text-slate-900">Global Audit Trail</h2>
              <div className="flex items-center gap-3">
                <div className="relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search events..."
                    className="pl-11 pr-4 py-3 text-sm border-none bg-white rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none w-56 shadow-sm transition-all font-medium"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button
                  onClick={handleRefresh}
                  disabled={isLockdownActive}
                  className={`p-3 bg-white rounded-2xl shadow-sm border border-slate-100 hover:bg-slate-50 transition-all ${isRefreshing ? 'animate-spin' : ''} ${isLockdownActive ? 'opacity-30 cursor-not-allowed' : ''}`}
                >
                  <RefreshCcw size={18} className="text-slate-500" />
                </button>
              </div>
            </div>
 
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] border-b">
                  <tr>
                    <th className="px-8 py-5">Occurred At</th>
                    <th className="px-8 py-5">Operator</th>
                    <th className="px-8 py-5">Activity</th>
                    <th className="px-8 py-5">Resource</th>
                    <th className="px-8 py-5 text-right">Node IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-8 py-5 text-[10px] font-mono text-slate-400">{log.timestamp}</td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase">{log.user.charAt(0)}</div>
                          <span className="text-sm font-black text-slate-800">{log.user}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                          log.severity === 'high' ? 'bg-rose-50 text-rose-700 border-rose-100' :
                          log.severity === 'medium' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          'bg-indigo-50 text-indigo-700 border-indigo-100'
                        }`}>
                          {log.action}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {roles.map(role => (
               <div key={role.id} className="bg-white p-6 rounded-[28px] border border-slate-100 shadow-sm group transition-all">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                       <div className={`p-3 rounded-2xl ${role.bg}`}>
                         <Icon name={role.icon} className={`w-6 h-6 ${role.color}`} />
                       </div>
                       <div>
                         <p className="text-sm font-black text-slate-700">{role.name}</p>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{role.count} Active</p>
                       </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {!role.isSystemRole && (
                        <button onClick={(e) => handleDeleteRole(e, role.id, role.name)} className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all opacity-0 group-hover:opacity-100">
                          <Trash2 size={14} />
                        </button>
                      )}
                      <ChevronRight size={16} className={`text-slate-300 transition-all ${isLockdownActive ? '' : 'group-hover:text-indigo-500'}`} />
                    </div>
                 </div>
                 <div className="flex flex-wrap gap-1.5 mt-2">
                    {role.permissions.slice(0, 3).map((p: string, idx: number) => (
                      <span key={idx} className="text-[8px] font-black text-slate-400 uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md border border-slate-100">{p}</span>
                    ))}
                    {role.permissions.length > 3 && (
                      <span className="text-[8px] font-black text-indigo-400 uppercase tracking-tighter bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">+{role.permissions.length - 3}</span>
                    )}
                 </div>
               </div>
            ))}

            <button
              disabled={isLockdownActive}
              onClick={() => setShowNewRoleModal(true)}
              className="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-[20px] text-xs font-black text-slate-400 hover:border-indigo-200 hover:text-indigo-600 hover:bg-indigo-50/30 transition-all uppercase tracking-[0.15em] disabled:opacity-30 disabled:cursor-not-allowed"
            >
              + Define Custom Policy
            </button>
          </div>
        </div>
 
      </div>

      {/* --- SESSION AUDIT MODAL --- */}
      <Modal
        isOpen={showAuditModal}
        onClose={() => setShowAuditModal(false)}
        title="Infrastructure Integrity Report"
      >
        {auditResults && (
          <div className="space-y-8 pb-4">
            <div className="flex flex-col items-center text-center py-6 bg-slate-50 rounded-[32px] border border-slate-100 relative overflow-hidden group">
               <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-transparent"></div>
               <div className="relative mb-6">
                  {/* Score Ring Simulation */}
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                    <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent"
                      strokeDasharray={364}
                      strokeDashoffset={364 - (364 * auditResults.score) / 100}
                      className={`${auditResults.score > 80 ? 'text-emerald-500' : 'text-amber-500'} transition-all duration-1000 ease-out`}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-slate-900">{auditResults.score}</span>
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Trust Index</span>
                  </div>
               </div>
               <div className="relative">
                  <h3 className="text-xl font-black text-slate-900 mb-1 flex items-center justify-center gap-2">
                    {auditResults.score >= 90 ? <Award className="text-indigo-500" /> : <ShieldAlert className="text-amber-500" />}
                    {auditResults.score >= 90 ? 'Compliance Verified' : 'Actionable Risks Found'}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium px-8">System health analysis based on current session and IAM configurations.</p>
               </div>
            </div>

            <div className="space-y-4">
               <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scan Findings ({auditResults.findings.length})</h4>
               <div className="space-y-2">
                  {auditResults.findings.map((f: any, i: number) => (
                    <div key={i} className={`p-4 rounded-2xl border flex gap-4 items-start ${
                      f.type === 'pass' ? 'bg-emerald-50/50 border-emerald-100 text-emerald-800' :
                      f.type === 'risk' ? 'bg-rose-50/50 border-rose-100 text-rose-800' :
                      'bg-amber-50/50 border-amber-100 text-amber-800'
                    }`}>
                       <div className={`p-1.5 rounded-lg shrink-0 ${
                         f.type === 'pass' ? 'bg-emerald-100 text-emerald-600' :
                         f.type === 'risk' ? 'bg-rose-100 text-rose-600' :
                         'bg-amber-100 text-amber-600'
                       }`}>
                          {f.type === 'pass' ? <ShieldCheck size={16} /> : <AlertTriangle size={16} />}
                       </div>
                       <p className="text-xs font-bold leading-relaxed">{f.text}</p>
                    </div>
                  ))}
               </div>
            </div>

            <div className="p-6 bg-slate-900 rounded-[28px] text-white flex items-center justify-between shadow-xl">
               <div>
                  <p className="text-sm font-black mb-1">Infrastructure Hardening</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Automated patch cycle is pending</p>
               </div>
               <button className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                  Patch Now
               </button>
            </div>
          </div>
        )}
      </Modal>

      {/* --- ROLE DETAIL / EDIT MODAL --- */}
      <Modal
        isOpen={!!selectedRole}
        onClose={() => setSelectedRole(null)}
        title={`IAM Policy: ${selectedRole?.name}`}
      >
        {selectedRole && (
          <form onSubmit={handleUpdateRole} className="space-y-8">
            <div className="flex items-center gap-6 p-6 bg-slate-50 rounded-[24px] border border-slate-100">
               <div className={`p-4 rounded-2xl ${selectedRole.bg}`}>
                 <Icon name={selectedRole.icon} className={`w-8 h-8 ${selectedRole.color}`} />
               </div>
               <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Role Impact</p>
                 <p className="text-lg font-black text-slate-800">{selectedRole.count} Active Users</p>
               </div>
            </div>
 
            <div className="space-y-3">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Scope Description</label>
               <p className="text-sm font-medium text-slate-600 leading-relaxed italic border-l-4 border-indigo-100 pl-4">
                 "{selectedRole.description}"
               </p>
            </div>
 
            <div className="space-y-4">
               <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permission Matrix</label>
               <div className="grid grid-cols-2 gap-3">
                 {ALL_PERMISSIONS.map(p => {
                   const isActive = selectedRole.permissions.includes(p);
                   return (
                     <label
                        key={p}
                        className={`flex items-center justify-between p-4 rounded-2xl cursor-pointer transition-all border ${
                          isActive ? 'bg-indigo-50 border-indigo-100' : 'bg-white border-slate-100'
                        }`}
                      >
                        <span className={`text-xs font-black uppercase tracking-tight ${isActive ? 'text-indigo-600' : 'text-slate-400'}`}>{p}</span>
                        <input
                          type="checkbox"
                          checked={isActive}
                          onChange={() => togglePermission(p)}
                          className="w-4 h-4 rounded text-indigo-600 border-slate-300 focus:ring-indigo-500"
                        />
                     </label>
                   );
                 })}
               </div>
            </div>
 
            <div className="pt-6 flex gap-4 border-t border-slate-50">
               {!selectedRole.isSystemRole && (
                 <button
                  type="button"
                  onClick={() => handleDeleteRole(null, selectedRole.id, selectedRole.name)}
                  className="flex-1 py-4 bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-rose-100 transition-all flex items-center justify-center gap-2"
                 >
                   <Trash2 size={16} /> Delete Policy
                 </button>
               )}
               <button
                type="button"
                onClick={() => setSelectedRole(null)}
                className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all"
               >
                 Close
               </button>
               <button
                type="submit"
                className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all flex items-center justify-center gap-2"
               >
                 <Check size={16} /> Update Policy
               </button>
            </div>
          </form>
        )}
      </Modal>
 
      {/* --- NEW ROLE MODAL --- */}
      <Modal isOpen={showNewRoleModal} onClose={() => setShowNewRoleModal(false)} title="Define IAM Policy">
        <form className="space-y-6" onSubmit={handleCreateRole}>
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Role Name</label>
              <input
                required
                placeholder="e.g., Compliance Officer"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 placeholder:text-slate-300"
                value={newRoleName}
                onChange={(e) => setNewRoleName(e.target.value)}
              />
           </div>
           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Permissions Scope</label>
              <div className="grid grid-cols-2 gap-3">
                 {ALL_PERMISSIONS.map(p => (
                   <label key={p} className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors border ${newRolePerms.includes(p) ? 'bg-indigo-50 border-indigo-100 text-indigo-700' : 'bg-slate-50 border-transparent text-slate-700'} hover:bg-slate-100`}>
                      <input
                        type="checkbox"
                        className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
                        checked={newRolePerms.includes(p)}
                        onChange={() => toggleNewRolePermission(p)}
                      />
                      <span className="text-xs font-bold">{p}</span>
                   </label>
                 ))}
              </div>
           </div>
           <div className="pt-6 flex gap-4">
              <button type="button" onClick={() => setShowNewRoleModal(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-slate-50 transition-all">Abort</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Create Policy</button>
           </div>
        </form>
      </Modal>
    </div>
  );
};
 
export default SystemAdmin;

