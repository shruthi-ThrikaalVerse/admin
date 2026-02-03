import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../context/HRMSContext';
import { Task, AssigneeType, TaskPriority, CustomTeam } from '../types';
import { DEPARTMENTS } from '../constants';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full max-w-xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button aria-label="Close dialog" onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

const Tasks: React.FC = () => {
  const { tasks, addTask, updateTaskStatus, deleteTask, customTeams, addCustomTeam, updateCustomTeam, deleteCustomTeam, employees, notify } = useHRMS();
  const [activeTab, setActiveTab] = useState<'tasks' | 'teams'>('tasks');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // New/Edit Team Form State
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [newTeam, setNewTeam] = useState<{ name: string, memberIds: string[] }>({
    name: '',
    memberIds: []
  });

  const [newTask, setNewTask] = useState<Partial<Task>>({
    title: '',
    description: '',
    assigneeType: 'employee',
    assignedTo: '',
    priority: 'medium',
    dueDate: new Date().toISOString().split('T')[0]
  });

  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.assigneeName.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
      return matchesSearch && matchesPriority;
    });
  }, [tasks, searchTerm, filterPriority]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.assignedTo) {
      notify('Please select an assignee.', 'warning');
      return;
    }

    let assigneeName = '';
    if (newTask.assigneeType === 'employee') {
      assigneeName = employees.find(e => e.id === newTask.assignedTo)?.fullName || 'Unknown';
    } else if (newTask.assigneeType === 'team') {
      assigneeName = customTeams.find(t => t.id === newTask.assignedTo)?.name || 'Unknown Team';
    } else {
      assigneeName = newTask.assignedTo || 'Unknown';
    }

    const today = new Date().toISOString().split('T')[0];
    if (!newTask.dueDate || newTask.dueDate < today) {
      notify('Please select today or a future date for the deadline.', 'warning');
      return;
    }

    addTask({ ...newTask, assigneeName });
    setIsModalOpen(false);
    setNewTask({
      title: '',
      description: '',
      assigneeType: 'employee',
      assignedTo: '',
      priority: 'medium',
      dueDate: today
    });
  };

  const handleCreateOrUpdateTeam = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTeam.name || newTeam.memberIds.length === 0) {
      notify('Team name and at least one member are required.', 'warning');
      return;
    }

    const memberNames = newTeam.memberIds.map(id => employees.find(e => e.id === id)?.fullName || '');

    if (editingTeamId) {
      updateCustomTeam(editingTeamId, { ...newTeam, memberNames });
    } else {
      addCustomTeam({ ...newTeam, memberNames });
    }

    setIsTeamModalOpen(false);
    setEditingTeamId(null);
    setNewTeam({ name: '', memberIds: [] });
  };

  const handleEditTeam = (team: CustomTeam) => {
    setEditingTeamId(team.id);
    setNewTeam({
      name: team.name,
      memberIds: team.memberIds
    });
    setIsTeamModalOpen(true);
  };

  const handleOpenTeamModal = () => {
    setEditingTeamId(null);
    setNewTeam({ name: '', memberIds: [] });
    setIsTeamModalOpen(true);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Task Assignment</h1>
          <p className="text-slate-500 text-sm font-medium">Delegate operational objectives to Personnel, teams and units.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mr-2">
            {['tasks', 'teams'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === tab ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'
                  }`}
              >
                {tab === 'tasks' ? 'Objectives' : 'Team Builder'}
              </button>
            ))}
          </div>
          {activeTab === 'tasks' ? (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Icon name="Plus" className="w-5 h-5" /> Create Task
            </button>
          ) : (
            <button
              onClick={handleOpenTeamModal}
              className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
            >
              <Icon name="Users" className="w-5 h-5" /> New Team
            </button>
          )}
        </div>
      </div>

      {activeTab === 'tasks' ? (
        <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="relative flex-1 group w-full">
              <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
              <input aria-label="Search tasks" type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter tasks by title or assignee..."
                className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-inner"
              />
            </div>
            <select
              aria-label="Filter by priority"
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="px-6 py-4 bg-slate-50 border-none rounded-2xl outline-none focus:ring-2 focus:ring-indigo-500 font-black text-xs uppercase tracking-widest text-slate-500 shadow-inner"
            >
              <option value="All">All Priorities</option>
              <option value="high">High Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="low">Low Priority</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredTasks.length > 0 ? filteredTasks.map(task => (
              <div key={task.id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${task.priority === 'high' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                      task.priority === 'medium' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                        'bg-indigo-50 text-indigo-600 border-indigo-100'
                      }`}>
                      {task.priority} Priority
                    </span>
                    <button aria-label={`Delete task ${task.title}`} onClick={() => deleteTask(task.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                      <Icon name="Trash2" className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="text-lg font-black text-slate-900 leading-tight mb-2">{task.title}</h3>
                  <p className="text-sm text-slate-500 font-medium mb-6 line-clamp-2">{task.description}</p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    <div className={`p-2 rounded-xl bg-white shadow-sm ${task.assigneeType === 'employee' ? 'text-indigo-600' : task.assigneeType === 'team' ? 'text-blue-600' : 'text-emerald-600'}`}>
                      <Icon name={task.assigneeType === 'employee' ? 'User' : 'Users'} className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{task.assigneeType}</p>
                      <p className="text-sm font-bold text-slate-700 truncate">{task.assigneeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Icon name="Calendar" className="w-4 h-4 text-slate-300" />
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Due: {task.dueDate}</span>
                    </div>
                    <select
                      aria-label={`Change status for ${task.title}`}
                      value={task.status}
                      onChange={(e) => updateTaskStatus(task.id, e.target.value as any)}
                      className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${task.status === 'completed' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        task.status === 'in-progress' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-white text-slate-400 border-slate-100'
                        }`}>
                      <option value="pending">Pending</option>
                      <option value="in-progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-24 text-center">
                <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                  <Icon name="CheckSquare" className="w-10 h-10 text-slate-200" />
                </div>
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No matching tasks found.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {customTeams.length > 0 ? customTeams.map(team => (
            <div key={team.id} className="bg-white border border-slate-100 rounded-[32px] p-8 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex flex-col">
              <div className="flex items-center justify-between mb-6">
                <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl shadow-sm border border-indigo-100">
                  {team.name.charAt(0)}
                </div>
                <div className="flex gap-1">
                  <button aria-label={`Edit team ${team.name}`} onClick={() => handleEditTeam(team)} className="p-2 text-slate-200 hover:text-indigo-600 transition-colors">
                    <Icon name="Edit3" className="w-5 h-5" />
                  </button>
                  <button aria-label={`Delete team ${team.name}`} onClick={() => deleteCustomTeam(team.id)} className="p-2 text-slate-200 hover:text-rose-500 transition-colors">
                    <Icon name="Trash2" className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-2">{team.name}</h3>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">Created {team.createdAt}</p>

              <div className="space-y-3 flex-1">
                <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Team Members ({team.memberIds.length})</p>
                <div className="flex flex-wrap gap-2">
                  {team.memberNames.map((name, i) => (
                    <span key={i} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-bold border border-slate-100">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  setActiveTab('tasks');
                  setIsModalOpen(true);
                  setNewTask({ ...newTask, assigneeType: 'team', assignedTo: team.id });
                }}
                className="mt-8 w-full py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all border border-indigo-100"
              >
                Assign Task to Team
              </button>
            </div>
          )) : (
            <div className="col-span-full py-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-[28px] flex items-center justify-center mx-auto mb-6">
                <Icon name="Users" className="w-10 h-10 text-slate-200" />
              </div>
              <p className="text-gray-400 font-black uppercase text-xs tracking-widest">No prepared teams created yet.</p>
              <button
                onClick={handleOpenTeamModal}
                className="mt-6 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100"
              >
                Build First Team
              </button>
            </div>
          )}
        </div>
      )}

      {/* CREATE TASK MODAL */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Assignment">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Task Title</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700"
              placeholder="Brief summary of the objective"
              value={newTask.title}
              onChange={e => setNewTask({ ...newTask, title: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Objective Description</label>
            <textarea
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[100px]"
              placeholder="Provide specific details, success criteria, and context..."
              value={newTask.description}
              onChange={e => setNewTask({ ...newTask, description: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assignee Selection</label>
            <div className="flex gap-2">
              {(['employee', 'team', 'department'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setNewTask({ ...newTask, assigneeType: type, assignedTo: '' })}
                  className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newTask.assigneeType === type ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                    }`}
                >
                  {type}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Entity</label>
              <select
                required
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                value={newTask.assignedTo}
                onChange={e => setNewTask({ ...newTask, assignedTo: e.target.value })}
                title="Select target entity"
              >
                <option value="">Select {newTask.assigneeType}</option>
                {newTask.assigneeType === 'employee' && (
                  employees.map(emp => <option key={emp.id} value={emp.id}>{emp.fullName} ({emp.employeeId})</option>)
                )}
                {newTask.assigneeType === 'team' && (
                  customTeams.map(team => <option key={team.id} value={team.id}>{team.name} ({team.memberIds.length} members)</option>)
                )}
                {newTask.assigneeType === 'department' && (
                  DEPARTMENTS.map(dept => <option key={dept} value={dept}>{dept}</option>)
                )}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority Level</label>
              <div className="flex gap-2">
                {(['low', 'medium', 'high'] as const).map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setNewTask({ ...newTask, priority: p })}
                    className={`flex-1 py-3 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${newTask.priority === p ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white border-slate-100 text-slate-400 hover:bg-slate-50'
                      }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deadline</label>
              <input
                aria-label="Deadline"
                type="date"
                required
                min={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-bold text-slate-600 shadow-inner"
                value={newTask.dueDate || new Date().toISOString().split('T')[0]}
                onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
              />
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Confirm Assignment</button>
          </div>
        </form>
      </Modal>

      {/* TEAM BUILDER MODAL */}
      <Modal isOpen={isTeamModalOpen} onClose={() => { setIsTeamModalOpen(false); setEditingTeamId(null); }} title={editingTeamId ? "Update Prepared Team" : "Assemble New Team"}>
        <form onSubmit={handleCreateOrUpdateTeam} className="space-y-8">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Team Identity Name</label>
            <input
              required
              className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
              placeholder="e.g. Q4 Cloud Migration Squad"
              value={newTeam.name}
              onChange={e => setNewTeam({ ...newTeam, name: e.target.value })}
            />
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Persons</label>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">{newTeam.memberIds.length} Selected</span>
            </div>
            <div className="bg-slate-50 rounded-[28px] border border-slate-100 overflow-hidden shadow-inner">
              <div className="max-h-[300px] overflow-y-auto custom-scrollbar divide-y divide-slate-100">
                {employees.map(emp => {
                  const isSelected = newTeam.memberIds.includes(emp.id);
                  return (
                    <div
                      key={emp.id}
                      onClick={() => {
                        const current = [...newTeam.memberIds];
                        if (isSelected) {
                          setNewTeam({ ...newTeam, memberIds: current.filter(id => id !== emp.id) });
                        } else {
                          setNewTeam({ ...newTeam, memberIds: [...current, emp.id] });
                        }
                      }}
                      className="p-4 flex items-center justify-between cursor-pointer hover:bg-indigo-50 transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <img src={emp.avatar} className="w-10 h-10 rounded-xl shadow-sm border border-slate-100" alt={`${emp.fullName} avatar`} />
                        <div>
                          <p className="text-sm font-black text-slate-800 leading-tight">{emp.fullName}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{emp.designation}</p>
                        </div>
                      </div>
                      <div className={`p-1.5 rounded-lg border-2 transition-all ${isSelected ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                        <Icon name="Check" className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-slate-100 flex gap-4">
            <button type="button" onClick={() => { setIsTeamModalOpen(false); setEditingTeamId(null); }} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Abort</button>
            <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">
              {editingTeamId ? "Update Team" : "Commit Prepared Team"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
