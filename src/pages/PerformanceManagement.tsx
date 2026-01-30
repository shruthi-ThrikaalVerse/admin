import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import {
  Search, ChevronRight, Star, Target,
  CheckCircle, UserMinus, AlertCircle, X, Check, Calendar, PlusCircle,
  Users, BarChart3, PieChart, ArrowUpRight, Download,
  SearchX
} from 'lucide-react';
import { useHRMS } from '../context/HRMSContext';
import { PerformanceCycle } from '../types';
 
// --- 1. MOCK DATA & TYPES ---
interface Goal {
  id: number;
  name: string;
  dept: string;
  goal: string;
  progress: number;
  deadline: string;
  status: 'On Track' | 'At Risk' | 'Behind';
  kpiMetrics: { label: string; current: number; target: number; unit: string };
}
 
const localMockGoals: Goal[] = [
  {
    id: 1, name: 'Rajesh Kumar', dept: 'Engineering',
    goal: 'Cloud Infrastructure Migration', progress: 85,
    deadline: '2026-05-15', status: 'On Track',
    kpiMetrics: { label: 'Uptime', current: 99.4, target: 99.9, unit: '%' }
  },
  {
    id: 2, name: 'Priya Sharma', dept: 'Marketing',
    goal: 'Brand Rejuvenation Campaign', progress: 40,
    deadline: '2026-06-01', status: 'At Risk',
    kpiMetrics: { label: 'Leads', current: 1200, target: 5000, unit: 'users' }
  },
  {
    id: 3, name: 'Amit Patel', dept: 'Operations',
    goal: 'Logistics Optimization', progress: 95,
    deadline: '2026-04-30', status: 'On Track',
    kpiMetrics: { label: 'Efficiency', current: 12, target: 15, unit: '%' }
  },
  {
    id: 4, name: 'Sarah Jones', dept: 'Engineering',
    goal: 'Security Audit Compliance', progress: 15,
    deadline: '2026-08-20', status: 'Behind',
    kpiMetrics: { label: 'Vulns Fixed', current: 5, target: 45, unit: 'issues' }
  },
];
 
// --- 2. HELPER COMPONENTS ---
const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : <AlertCircle className={className} />;
};
 
const StatusBadge = ({ status }: { status: string }) => {
  const colors: Record<string, string> = {
    'On Track': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'At Risk': 'bg-amber-50 text-amber-700 border-amber-100',
    'Behind': 'bg-rose-50 text-rose-700 border-rose-100',
    'active': 'bg-indigo-50 text-indigo-700 border-indigo-100',
    'completed': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'draft': 'bg-slate-50 text-slate-700 border-slate-100',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border ${colors[status] || 'bg-gray-50'}`}>
      {status.toUpperCase()}
    </span>
  );
};
 
const Modal = ({ isOpen, onClose, title, children, maxWidth = "max-w-xl" }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full ${maxWidth} relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};
 
// --- 3. MAIN COMPONENT ---
const PerformanceManagement: React.FC = () => {
  const { performanceCycles, addPerformanceCycle, employees, notify } = useHRMS();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isNewCycleModalOpen, setIsNewCycleModalOpen] = useState(false);
 
  // New Cycle Management States
  const [selectedCycle, setSelectedCycle] = useState<PerformanceCycle | null>(null);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [participantSearch, setParticipantSearch] = useState('');
 
  // Track enrolled participants locally for the modal
  const [enrolledIds, setEnrolledIds] = useState<Set<string>>(new Set());
 
  // New Cycle Form State
  const [newCycle, setNewCycle] = useState({
    name: '',
    period: '',
    status: 'draft' as PerformanceCycle['status']
  });
 
  // Filtering Logic for Goals - Fixed and ensured it's reactive
  const filteredGoals = useMemo(() => {
    return localMockGoals.filter(goal => {
      const search = searchTerm.trim().toLowerCase();
      const matchesSearch =
        goal.name.toLowerCase().includes(search) ||
        goal.dept.toLowerCase().includes(search) ||
        goal.goal.toLowerCase().includes(search);
      const matchesFilter = filterStatus === 'All' || goal.status === filterStatus;
      return matchesSearch && matchesFilter;
    });
  }, [searchTerm, filterStatus]);
 
  // Filtering Logic for Participants
  const filteredEmployees = useMemo(() => {
    return employees.filter(emp =>
      emp.fullName.toLowerCase().includes(participantSearch.toLowerCase()) ||
      emp.department.toLowerCase().includes(participantSearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(participantSearch.toLowerCase())
    );
  }, [employees, participantSearch]);
 
  const handleOpenReview = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsReviewModalOpen(true);
  };
 
  const handleCreateCycle = (e: React.FormEvent) => {
    e.preventDefault();
    addPerformanceCycle({
      ...newCycle,
      participants: employees.length,
      completed: 0
    });
    setIsNewCycleModalOpen(false);
    setNewCycle({ name: '', period: '', status: 'draft' });
  };
 
  const openParticipantsModal = (cycle: PerformanceCycle) => {
    setSelectedCycle(cycle);
    // Initialize with all employees enrolled by default for simulation
    setEnrolledIds(new Set(employees.map(e => e.id)));
    setIsParticipantsModalOpen(true);
  };
 
  const openReportModal = (cycle: PerformanceCycle) => {
    setSelectedCycle(cycle);
    setIsReportModalOpen(true);
  };
 
  const toggleEnrollment = (id: string) => {
    setEnrolledIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
 
  const enrollAll = () => {
    setEnrolledIds(new Set(employees.map(e => e.id)));
    notify("All active personnel have been queued for enrollment.");
  };
 
  const handleDownloadReport = () => {
    if (!selectedCycle) return;
    notify(`Preparing ${selectedCycle.name} performance metrics...`, 'info');
    setTimeout(() => {
      notify(`Cycle report for ${selectedCycle.period} downloaded!`, 'success');
    }, 1500);
  };
 
  const resetFilters = () => {
    setSearchTerm('');
    setFilterStatus('All');
  };
 
  return (
    <div className="min-h-screen bg-[#f8fafc] space-y-8 font-sans animate-in fade-in duration-500">
     
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Performance Hub</h1>
          <p className="text-gray-500 mt-1">Track, review, and approve employee growth cycles.</p>
        </div>
        <button
          onClick={() => setIsNewCycleModalOpen(true)}
          className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 active:scale-95"
        >
          <PlusCircle size={18} />
          <span>New Review Cycle</span>
        </button>
      </div>
 
      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Rating', val: '4.2/5', icon: 'Star', color: 'text-yellow-500', bg: 'bg-yellow-50' },
          { label: 'Goals Met', val: '88%', icon: 'Target', color: 'text-blue-500', bg: 'bg-blue-50' },
          { label: 'Completion', val: '92%', icon: 'CheckCircle', color: 'text-emerald-500', bg: 'bg-emerald-50' },
          { label: 'Turnover', val: '2.4%', icon: 'UserMinus', color: 'text-rose-500', bg: 'bg-rose-50' },
        ].map((kpi, i) => (
          <div key={i} className="p-5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-10 h-10 ${kpi.bg} rounded-xl flex items-center justify-center mb-3`}>
              <Icon name={kpi.icon} className={`w-5 h-5 ${kpi.color}`} />
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{kpi.label}</p>
            <p className="text-2xl font-black text-gray-900 mt-1">{kpi.val}</p>
          </div>
        ))}
      </div>
 
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
       
        {/* Goals List Main Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-gray-50 bg-gray-50/20 flex flex-col md:flex-row justify-between gap-4">
              <h2 className="text-xl font-black text-gray-900">Active Goals</h2>
              <div className="flex gap-2">
                <div className="relative group flex-1 md:flex-none">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors" size={16} />
                  <input
                    type="text"
                    placeholder="Search name, dept, or objective..."
                    value={searchTerm}
                    className="pl-11 pr-10 py-3 text-sm border-none bg-gray-100 rounded-2xl focus:ring-2 focus:ring-indigo-500 w-full md:w-64 transition-all font-medium"
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <select
                  value={filterStatus}
                  className="text-[10px] font-black uppercase tracking-widest bg-gray-100 border-none rounded-2xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 text-gray-500"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <option value="All">All Status</option>
                  <option value="On Track">On Track</option>
                  <option value="At Risk">At Risk</option>
                  <option value="Behind">Behind</option>
                </select>
              </div>
            </div>
 
            <div className="divide-y divide-gray-50 min-h-[300px]">
              {filteredGoals.map((goal) => (
                <div
                  key={goal.id}
                  onClick={() => handleOpenReview(goal)}
                  className="p-8 hover:bg-slate-50 transition-all cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-indigo-100 group-hover:scale-105 transition-transform">
                      {goal.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h4 className="font-black text-lg text-gray-900">{goal.name}</h4>
                        <StatusBadge status={goal.status} />
                      </div>
                      <p className="text-xs text-gray-400 font-bold uppercase tracking-widest">{goal.dept} • {goal.goal}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-10">
                    <div className="text-right hidden sm:block">
                      <div className="w-40 bg-gray-100 h-2 rounded-full mb-2 overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${goal.progress}%` }}></div>
                      </div>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{goal.progress}% COMPLETE</p>
                    </div>
                    <ChevronRight className="text-gray-300 group-hover:text-indigo-600 transform group-hover:translate-x-2 transition-all" size={20} />
                  </div>
                </div>
              ))}
              {filteredGoals.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in zoom-in-95 duration-300">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <SearchX size={40} className="text-slate-300" />
                  </div>
                  <h3 className="text-lg font-black text-slate-800">No matching goals found</h3>
                  <p className="text-sm text-slate-400 max-w-xs mx-auto mt-2">Adjust your filters or search terms to find what you're looking for.</p>
                  <button
                    onClick={resetFilters}
                    className="mt-6 px-6 py-2 bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-100 transition-all"
                  >
                    Reset All Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
 
        {/* Sidebar Cards */}
        <div className="space-y-6">
          {performanceCycles.map((cycle) => (
            <div
              key={cycle.id}
              className={`p-8 rounded-[32px] shadow-xl text-white relative overflow-hidden transition-all hover:-translate-y-1 ${
                cycle.status === 'active' ? 'bg-gradient-to-br from-indigo-600 to-violet-700' :
                cycle.status === 'completed' ? 'bg-gradient-to-br from-emerald-600 to-teal-700' : 'bg-slate-800'
              }`}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] opacity-70">{cycle.period}</p>
                  <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg uppercase tracking-widest ${
                    cycle.status === 'active' ? 'bg-white/20' :
                    cycle.status === 'completed' ? 'bg-white/20' : 'bg-slate-700'
                  }`}>
                    {cycle.status}
                  </span>
                </div>
                <h3 className="text-2xl font-black mb-6 leading-tight">{cycle.name}</h3>
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest mb-2 opacity-80">
                  <span>Progress: {cycle.completed}/{cycle.participants}</span>
                  <span>{Math.round((cycle.completed / (cycle.participants || 1)) * 100)}%</span>
                </div>
                <div className="w-full bg-white/10 h-2.5 rounded-full overflow-hidden mb-8 shadow-inner">
                  <div className="bg-white h-full rounded-full shadow-lg transition-all duration-1000" style={{ width: `${(cycle.completed / (cycle.participants || 1)) * 100}%` }}></div>
                </div>
                <button
                  onClick={() => cycle.status === 'active' ? openParticipantsModal(cycle) : openReportModal(cycle)}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg active:scale-95 ${
                    cycle.status === 'active' ? 'bg-white text-indigo-600 hover:bg-indigo-50' :
                    cycle.status === 'completed' ? 'bg-white text-emerald-600 hover:bg-emerald-50' :
                    'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  }`}
                >
                  {cycle.status === 'active' ? 'Manage Participants' : 'View Report'}
                </button>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-10">
                {cycle.status === 'active' ? <Users size={140} /> : <BarChart3 size={140} />}
              </div>
            </div>
          ))}
 
          <div className="bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <h3 className="font-black text-gray-900 mb-6 flex items-center gap-3">
              <Star className="text-yellow-500 fill-current" size={20} />
              Top Performers
            </h3>
            <div className="space-y-4">
              {localMockGoals.slice(0, 3).map((g, i) => (
                <div key={i} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-2xl transition-all group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase">
                       {g.name.charAt(0)}
                    </div>
                    <span className="text-sm font-black text-gray-700">{g.name}</span>
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-xl border border-yellow-100 group-hover:scale-105 transition-transform">
                    <span className="text-xs font-black text-yellow-700">4.{9-i}</span>
                    <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
 
      {/* --- NEW REVIEW CYCLE MODAL --- */}
      <Modal
        isOpen={isNewCycleModalOpen}
        onClose={() => setIsNewCycleModalOpen(false)}
        title="Initialize Review Cycle"
      >
        <form onSubmit={handleCreateCycle} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Cycle Title</label>
            <input
              required
              placeholder="e.g., Q3 2024 Engineering Sync"
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
              value={newCycle.name}
              onChange={e => setNewCycle({...newCycle, name: e.target.value})}
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Review Period</label>
              <input
                required
                placeholder="July - Sept 2024"
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700"
                value={newCycle.period}
                onChange={e => setNewCycle({...newCycle, period: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Initial Status</label>
              <select
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-[10px] uppercase tracking-widest text-slate-500"
                value={newCycle.status}
                onChange={e => setNewCycle({...newCycle, status: e.target.value as any})}
              >
                <option value="draft">Draft (Setup)</option>
                <option value="active">Active (Live)</option>
              </select>
            </div>
          </div>
         
          <div className="p-6 bg-indigo-50 rounded-[24px] border border-indigo-100">
             <div className="flex items-center gap-3 mb-3 text-indigo-600">
                <Target size={20} />
                <h4 className="text-xs font-black uppercase tracking-widest">Target Demographic</h4>
             </div>
             <p className="text-sm text-indigo-700/70 font-medium leading-relaxed">
               This cycle will automatically include all <strong>{employees.length} active personnel</strong>. You can fine-tune participant lists in the "Manage Participants" section after creation.
             </p>
          </div>
 
          <div className="pt-6 border-t border-slate-100 flex gap-4">
             <button type="button" onClick={() => setIsNewCycleModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Abort</button>
             <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all">Commit Cycle</button>
          </div>
        </form>
      </Modal>
 
      {/* --- MANAGE PARTICIPANTS MODAL --- */}
      <Modal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        title={`Cycle Roster: ${selectedCycle?.name}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-6">
          <div className="flex items-center justify-between gap-4">
             <div className="relative flex-1 group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-600 transition-colors" size={16} />
                <input
                   type="text"
                   placeholder="Search employees by name, ID or cluster..."
                   className="w-full pl-12 pr-10 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-medium text-slate-700 shadow-inner"
                   value={participantSearch}
                   onChange={e => setParticipantSearch(e.target.value)}
                />
                {participantSearch && (
                  <button
                    onClick={() => setParticipantSearch('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-500 p-1"
                  >
                    <X size={16} />
                  </button>
                )}
             </div>
             <button
                onClick={enrollAll}
                className="px-6 py-4 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-100 transition-all"
             >
                Enroll All
             </button>
          </div>
 
          <div className="bg-white rounded-[24px] border border-slate-100 overflow-hidden">
             <div className="max-h-[400px] overflow-y-auto custom-scrollbar divide-y divide-slate-50">
                {filteredEmployees.map(emp => {
                   const isEnrolled = enrolledIds.has(emp.id);
                   return (
                     <div key={emp.id} className="p-4 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                        <div className="flex items-center gap-4">
                           <img src={emp.avatar} className="w-10 h-10 rounded-xl border-2 border-slate-100 group-hover:scale-105 transition-transform" alt="" />
                           <div>
                              <p className="font-black text-slate-800 text-sm leading-tight">{emp.fullName}</p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{emp.employeeId} • {emp.department}</p>
                           </div>
                        </div>
                        <div className="flex items-center gap-3">
                           <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-lg border transition-colors ${
                              isEnrolled ? 'text-emerald-500 bg-emerald-50 border-emerald-100' : 'text-slate-400 bg-slate-50 border-slate-100'
                           }`}>
                              {isEnrolled ? 'Enrolled' : 'Available'}
                           </span>
                           <button
                              onClick={() => toggleEnrollment(emp.id)}
                              className={`w-10 h-6 rounded-full relative p-1 transition-all duration-200 hover:shadow-md ${
                                 isEnrolled ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                           >
                              <div className={`w-4 h-4 bg-white rounded-full absolute transition-all duration-200 ${
                                 isEnrolled ? 'right-1' : 'left-1'
                              }`}></div>
                           </button>
                        </div>
                     </div>
                   );
                })}
                {filteredEmployees.length === 0 && (
                  <div className="p-20 text-center">
                    <p className="text-sm font-black text-slate-300 uppercase tracking-widest">No matching personnel</p>
                  </div>
                )}
             </div>
          </div>
 
          <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
             <p className="text-xs font-bold text-slate-400 italic">Showing {filteredEmployees.length} of {employees.length} personnel • {enrolledIds.size} Enrolled</p>
             <button
                onClick={() => {
                   notify(`Cycle roster (${enrolledIds.size} members) synchronized successfully.`);
                   setIsParticipantsModalOpen(false);
                }}
                className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95"
             >
                Commit Roster
             </button>
          </div>
        </div>
      </Modal>
 
      {/* --- VIEW REPORT MODAL --- */}
      <Modal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
        title={`Insights: ${selectedCycle?.name}`}
        maxWidth="max-w-3xl"
      >
        <div className="space-y-8 pb-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avg Cycle Score</p>
                <p className="text-3xl font-black text-indigo-600">4.4/5</p>
                <div className="flex justify-center gap-1">
                   {[1,2,3,4,5].map(i => <Star key={i} size={10} className={i <= 4 ? "text-yellow-400 fill-current" : "text-slate-200"} />)}
                </div>
             </div>
             <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Participation Rate</p>
                <p className="text-3xl font-black text-emerald-600">
                   {selectedCycle ? Math.round((selectedCycle.completed / selectedCycle.participants) * 100) : 0}%
                </p>
                <p className="text-[10px] font-bold text-emerald-600/60 uppercase">High Compliance</p>
             </div>
             <div className="p-6 bg-slate-50 rounded-[24px] border border-slate-100 text-center space-y-2">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Exceeding Exp.</p>
                <p className="text-3xl font-black text-blue-600">24</p>
                <p className="text-[10px] font-bold text-blue-600/60 uppercase">Personnel</p>
             </div>
          </div>
 
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <Star size={14} className="text-yellow-500 fill-current" /> High Performers
                </h4>
                <div className="space-y-3">
                   {localMockGoals.slice(0, 4).map((emp, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-50 rounded-[20px] shadow-sm hover:shadow-md transition-all">
                         <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-black text-xs uppercase">{emp.name.charAt(0)}</div>
                            <p className="text-sm font-black text-slate-700">{emp.name}</p>
                         </div>
                         <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 rounded-lg text-yellow-700 font-black text-[10px]">
                            4.{9-i} <Star size={10} className="fill-current" />
                         </div>
                      </div>
                   ))}
                </div>
             </div>
 
             <div className="space-y-4">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] flex items-center gap-2">
                   <ArrowUpRight size={14} className="text-indigo-500" /> Dept Distribution
                </h4>
                <div className="space-y-4 pt-2">
                   {[
                      { label: 'Engineering', val: 92, color: 'bg-indigo-500' },
                      { label: 'Marketing', val: 78, color: 'bg-pink-500' },
                      { label: 'Sales', val: 88, color: 'bg-emerald-500' },
                      { label: 'Operations', val: 65, color: 'bg-amber-500' },
                   ].map((dept, i) => (
                      <div key={i} className="space-y-1.5">
                         <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500">
                            <span>{dept.label}</span>
                            <span>{dept.val}%</span>
                         </div>
                         <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div className={`h-full ${dept.color} rounded-full transition-all duration-1000`} style={{ width: `${dept.val}%` }}></div>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
          </div>
 
          <div className="p-6 bg-indigo-600 rounded-[24px] text-white flex items-center justify-between shadow-xl shadow-indigo-100 relative overflow-hidden group">
             <div className="relative z-10">
                <h5 className="text-lg font-black mb-1">Detailed Analytics Export</h5>
                <p className="text-xs text-white/70 font-medium">Download the full CSV report for deeper personnel analysis.</p>
             </div>
             <button
                onClick={handleDownloadReport}
                className="relative z-10 p-3 bg-white/20 hover:bg-white/30 rounded-xl transition-all active:scale-95 flex items-center justify-center"
             >
                <Download className="w-6 h-6 text-white" />
             </button>
             <PieChart className="absolute -right-4 -bottom-4 opacity-10" size={100} />
          </div>
        </div>
      </Modal>
 
      {/* --- REVIEW SLIDE-OVER MODAL --- */}
      {isReviewModalOpen && selectedGoal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-end bg-slate-900/40 backdrop-blur-sm">
          <div
            className="h-full w-full max-w-md bg-white shadow-2xl animate-in slide-in-from-right duration-300 flex flex-col"
          >
            {/* Modal Header */}
            <div className="p-8 border-b flex justify-between items-center bg-white sticky top-0">
              <h2 className="text-2xl font-black text-gray-900">Performance Audit</h2>
              <button onClick={() => setIsReviewModalOpen(false)} className="p-3 hover:bg-gray-100 rounded-2xl transition-colors">
                <X size={24} />
              </button>
            </div>
 
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-10 space-y-10 custom-scrollbar">
              <div className="flex items-center gap-6 p-6 bg-indigo-50 rounded-[32px] border border-indigo-100">
                <div className="w-16 h-16 rounded-[24px] bg-indigo-600 text-white flex items-center justify-center text-2xl font-black shadow-lg">
                  {selectedGoal.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-black text-2xl text-gray-900">{selectedGoal.name}</h3>
                  <p className="text-xs text-indigo-600 font-black uppercase tracking-widest mt-1">{selectedGoal.dept}</p>
                </div>
              </div>
 
              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Current Objective</label>
                  <p className="text-xl font-black text-gray-800 mt-2 leading-tight">{selectedGoal.goal}</p>
                </div>
 
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Real-time Metric</p>
                    <p className="text-2xl font-black text-gray-900">
                      {selectedGoal.kpiMetrics.current}{selectedGoal.kpiMetrics.unit}
                    </p>
                  </div>
                  <div className="p-5 bg-slate-50 rounded-[24px] border border-slate-100">
                    <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Threshold</p>
                    <p className="text-2xl font-black text-gray-900">
                      {selectedGoal.kpiMetrics.target}{selectedGoal.kpiMetrics.unit}
                    </p>
                  </div>
                </div>
 
                <div className="p-6 bg-white border border-slate-100 rounded-[32px] shadow-sm space-y-4">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                    <span>Cumulative Progress</span>
                    <span className="text-indigo-600 font-black">{selectedGoal.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-3.5 rounded-full overflow-hidden shadow-inner">
                    <div className="bg-indigo-600 h-full rounded-full transition-all duration-700" style={{ width: `${selectedGoal.progress}%` }}></div>
                  </div>
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                    <Calendar size={14} className="text-slate-300" />
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                      Hard Deadline: {selectedGoal.deadline}
                    </p>
                  </div>
                </div>
              </div>
 
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Administrative Assessment</label>
                <textarea
                  className="w-full p-6 bg-slate-50 border-none rounded-[24px] text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-300"
                  rows={4}
                  placeholder="Insert review notes, blockers, or specific performance feedback..."
                ></textarea>
              </div>
            </div>
 
            {/* Modal Footer */}
            <div className="p-8 border-t bg-gray-50/50 flex gap-4">
              <button
                onClick={() => setIsReviewModalOpen(false)}
                className="flex-1 py-4 font-black text-xs uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                Defer
              </button>
              <button
                onClick={() => {
                  alert(`Performance assessment for ${selectedGoal.name} has been synchronized.`);
                  setIsReviewModalOpen(false);
                }}
                className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Check size={18} />
                Validate Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
 
export default PerformanceManagement;