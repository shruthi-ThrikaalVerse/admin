import React, { useState, useMemo } from 'react';
import * as LucideIcons from 'lucide-react';
import { useHRMS } from '../context/HRMSContext';
import { AppEvent, EventType, EventStatus, EventPriority, EventAudience } from '../types';
import { DEPARTMENTS } from '../constants';

const Icon = ({ name, className }: { name: string; className?: string }) => {
  const LucideIcon = (LucideIcons as any)[name];
  return LucideIcon ? <LucideIcon className={className} /> : null;
};

const Modal = ({ isOpen, onClose, title, children }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md" onClick={onClose}></div>
      <div className={`bg-white rounded-[32px] w-full max-w-2xl relative shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[90vh]`}>
        <div className="p-8 border-b flex items-center justify-between bg-white sticky top-0 z-10">
          <h2 className="text-2xl font-black text-slate-900">{title}</h2>
          <button onClick={onClose} className="p-3 hover:bg-slate-50 rounded-2xl transition-colors">
            <Icon name="X" className="w-6 h-6" />
          </button>
        </div>
        <div className="p-8 overflow-y-auto custom-scrollbar flex-1">{children}</div>
      </div>
    </div>
  );
};

const EventsAdmin: React.FC = () => {
  const { events, addEvent, updateEvent, deleteEvent, employees, notify } = useHRMS();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [empSearch, setEmpSearch] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'board' | 'list'>('board');

  const [formData, setFormData] = useState<Partial<AppEvent>>({
    title: '',
    description: '',
    type: 'company',
    startDate: '',
    endDate: '',
    startTime: '09:00 AM',
    endTime: '10:00 AM',
    isOnline: false,
    location: '',
    audience: 'all',
    targetEmployeeIds: [],
    targetDepartment: '',
    status: 'upcoming',
    priority: 'normal',
    isPublished: true,
  });

  const filteredEvents = useMemo(() => {
    return events.filter(e => 
      e.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      e.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [events, searchTerm]);

  const filteredEmployees = useMemo(() => {
    return employees.filter(e => 
      e.fullName.toLowerCase().includes(empSearch.toLowerCase()) ||
      e.employeeId.toLowerCase().includes(empSearch.toLowerCase())
    );
  }, [employees, empSearch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.startDate) {
      notify('Title and start date are required.', 'warning');
      return;
    }

    if (formData.audience === 'selected' && (!formData.targetEmployeeIds || formData.targetEmployeeIds.length === 0)) {
      notify('Please select at least one employee for targeted events.', 'warning');
      return;
    }

    if (editingId) {
      updateEvent(editingId, formData);
    } else {
      addEvent(formData);
    }

    setIsModalOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      type: 'company',
      startDate: '',
      endDate: '',
      startTime: '09:00 AM',
      endTime: '10:00 AM',
      isOnline: false,
      location: '',
      audience: 'all',
      targetEmployeeIds: [],
      targetDepartment: '',
      status: 'upcoming',
      priority: 'normal',
      isPublished: true,
    });
  };

  const handleEdit = (evt: AppEvent) => {
    setEditingId(evt.id);
    setFormData(evt);
    setIsModalOpen(true);
  };

  const toggleEmployeeSelection = (id: string) => {
    setFormData(prev => {
      const current = prev.targetEmployeeIds || [];
      const next = current.includes(id) 
        ? current.filter(cid => cid !== id)
        : [...current, id];
      return { ...prev, targetEmployeeIds: next };
    });
  };

  const getTypeStyle = (type: EventType) => {
    switch(type) {
      case 'holiday': return 'bg-rose-50 text-rose-600 border-rose-100';
      case 'training': return 'bg-indigo-50 text-indigo-600 border-indigo-100';
      case 'meeting': return 'bg-blue-50 text-blue-600 border-blue-100';
      case 'company': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
      default: return 'bg-slate-50 text-slate-600 border-slate-100';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Organization Events</h1>
          <p className="text-slate-500 text-sm font-medium">Coordinate corporate milestones, training cycles and team meetups.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white p-1 rounded-2xl border border-slate-100 shadow-sm mr-2">
            <button 
              onClick={() => setViewTab('board')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewTab === 'board' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >Board</button>
            <button 
              onClick={() => setViewTab('list')}
              className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${viewTab === 'list' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-slate-600'}`}
            >Audit</button>
          </div>
          <button
            onClick={() => { resetForm(); setIsModalOpen(true); }}
            className="flex items-center gap-2 px-6 py-3.5 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-700 font-black text-xs uppercase tracking-widest shadow-xl shadow-indigo-100 transition-all active:scale-95"
          >
            <Icon name="Plus" className="w-5 h-5" /> Schedule Event
          </button>
        </div>
      </div>

      <div className="bg-white p-6 rounded-[32px] border border-slate-100 shadow-sm space-y-6">
        <div className="relative group w-full">
          <Icon name="Search" className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-indigo-500 transition-colors" />
          <input 
            type="text" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Lookup by event title or description..." 
            className="w-full pl-12 pr-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium text-slate-600 shadow-inner" 
          />
        </div>

        {viewTab === 'board' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredEvents.length > 0 ? filteredEvents.map(evt => (
              <div key={evt.id} className="bg-white border border-slate-100 rounded-[32px] p-6 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all group flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${getTypeStyle(evt.type)}`}>
                    {evt.type}
                  </span>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(evt)} className="p-2 text-slate-300 hover:text-indigo-600 transition-colors"><Icon name="Edit3" className="w-4 h-4" /></button>
                    <button onClick={() => deleteEvent(evt.id)} className="p-2 text-slate-300 hover:text-rose-500 transition-colors"><Icon name="Trash2" className="w-4 h-4" /></button>
                  </div>
                </div>
                
                <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 truncate">{evt.title}</h3>
                <p className="text-xs text-slate-400 font-medium mb-6 line-clamp-2">{evt.description}</p>
                
                <div className="space-y-4 mt-auto">
                   <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Schedule</p>
                         <p className="text-[10px] font-black text-slate-700">{evt.startDate}</p>
                      </div>
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                         <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Time</p>
                         <p className="text-[10px] font-black text-slate-700">{evt.startTime}</p>
                      </div>
                   </div>
                   
                   <div className="flex items-center gap-2 p-3 bg-indigo-50/50 border border-indigo-100 rounded-2xl">
                      <Icon name={evt.isOnline ? "Video" : "MapPin"} className="w-4 h-4 text-indigo-600" />
                      <p className="text-[10px] font-bold text-indigo-900 truncate">{evt.location}</p>
                   </div>

                   <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                      <div className="flex -space-x-2">
                        {[1,2,3].map(i => (
                           <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-black text-slate-400">
                              {i}
                           </div>
                        ))}
                        <div className="w-6 h-6 rounded-full border-2 border-white bg-indigo-600 flex items-center justify-center text-[8px] font-black text-white">
                           +{evt.participations.length}
                        </div>
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${evt.status === 'upcoming' ? 'text-emerald-500' : 'text-slate-400'}`}>
                        {evt.status}
                      </span>
                   </div>
                </div>
              </div>
            )) : (
              <div className="col-span-full py-24 text-center">
                <Icon name="CalendarOff" className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-gray-400 font-black uppercase text-xs tracking-widest">Zero scheduled events found.</p>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-[24px] border border-slate-50">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50">
                <tr className="border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Event</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Target</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredEvents.map(evt => (
                  <tr key={evt.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-800">{evt.title}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{evt.startDate} • {evt.startTime}</p>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black uppercase tracking-widest px-3 py-1 bg-slate-100 rounded-lg">{evt.audience}</span>
                    </td>
                    <td className="px-8 py-6">
                       <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">{evt.status}</span>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <button onClick={() => handleEdit(evt)} className="p-2 text-slate-300 hover:text-indigo-600"><Icon name="Settings" className="w-4 h-4" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Modify Schedule" : "New Organization Event"}>
        <form onSubmit={handleSubmit} className="space-y-6">
           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Event Title</label>
              <input 
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 shadow-inner"
                placeholder="e.g. Q4 Townhall Meeting"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
              />
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Description</label>
              <textarea 
                required
                className="w-full px-6 py-4 bg-slate-50 border-none rounded-2xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-slate-700 min-h-[100px] shadow-inner"
                placeholder="Details about the agenda, speakers, or objective..."
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
              />
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Category</label>
                 <select 
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value as any})}
                 >
                    {['company', 'team', 'training', 'meeting', 'holiday'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Criticality</label>
                 <div className="flex gap-2">
                    {(['normal', 'important'] as EventPriority[]).map(p => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setFormData({...formData, priority: p})}
                        className={`flex-1 py-2.5 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.priority === p ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white text-slate-400 border-slate-100'}`}
                      >{p}</button>
                    ))}
                 </div>
              </div>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Date</label>
                 <input 
                    type="date" required
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600"
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Start Time</label>
                 <input 
                    type="text" required
                    placeholder="09:00 AM"
                    className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600"
                    value={formData.startTime}
                    onChange={e => setFormData({...formData, startTime: e.target.value})}
                 />
              </div>
           </div>

           <div className="p-6 bg-slate-50 rounded-[28px] border border-slate-100 space-y-4">
              <div className="flex items-center justify-between">
                 <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Mode & Location</label>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase text-slate-400">Virtual Event</span>
                    <button 
                      type="button"
                      onClick={() => setFormData({...formData, isOnline: !formData.isOnline})}
                      className={`w-10 h-5 rounded-full relative transition-colors ${formData.isOnline ? 'bg-indigo-600' : 'bg-slate-300'}`}
                    >
                      <div className={`absolute top-1 w-3 h-3 rounded-full bg-white transition-all ${formData.isOnline ? 'left-6' : 'left-1'}`}></div>
                    </button>
                 </div>
              </div>
              <input 
                required
                className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-700"
                placeholder={formData.isOnline ? "Meeting Link (Zoom/Google Meet)" : "Physical Address / Room No."}
                value={formData.location}
                onChange={e => setFormData({...formData, location: e.target.value})}
              />
           </div>

           <div className="space-y-4">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Audience Scope</label>
              <div className="flex gap-2">
                 {(['all', 'selected', 'department'] as EventAudience[]).map(a => (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setFormData({...formData, audience: a, targetEmployeeIds: [], targetDepartment: ''})}
                      className={`flex-1 py-3 rounded-xl border text-[9px] font-black uppercase tracking-widest transition-all ${formData.audience === a ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg' : 'bg-white text-slate-400 border-slate-100'}`}
                    >{a}</button>
                 ))}
              </div>

              {formData.audience === 'selected' && (
                <div className="space-y-3 animate-in slide-in-from-top-2">
                   <div className="relative">
                      <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                      <input 
                        type="text" placeholder="Filter employees..." 
                        className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none"
                        value={empSearch}
                        onChange={e => setEmpSearch(e.target.value)}
                      />
                   </div>
                   <div className="max-h-[150px] overflow-y-auto custom-scrollbar divide-y divide-slate-50 bg-slate-50 rounded-xl border border-slate-100">
                      {filteredEmployees.map(emp => (
                         <div key={emp.id} onClick={() => toggleEmployeeSelection(emp.id)} className="p-2.5 flex items-center justify-between cursor-pointer hover:bg-white transition-colors group">
                            <span className="text-[10px] font-bold text-slate-700">{emp.fullName} ({emp.employeeId})</span>
                            <div className={`w-4 h-4 rounded-md border-2 transition-all flex items-center justify-center ${formData.targetEmployeeIds?.includes(emp.id) ? 'bg-indigo-600 border-indigo-600 text-white' : 'bg-white border-slate-200 text-transparent group-hover:border-indigo-200'}`}>
                               <Icon name="Check" className="w-2.5 h-2.5" />
                            </div>
                         </div>
                      ))}
                   </div>
                </div>
              )}

              {formData.audience === 'department' && (
                <select 
                   className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-xs font-bold text-slate-600 shadow-inner"
                   value={formData.targetDepartment}
                   onChange={e => setFormData({...formData, targetDepartment: e.target.value})}
                >
                   <option value="">Select Target Unit</option>
                   {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              )}
           </div>

           <div className="pt-6 border-t border-slate-100 flex gap-4">
              <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-slate-400 font-black text-xs uppercase tracking-widest hover:bg-slate-50 rounded-2xl transition-all">Discard</button>
              <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all active:scale-95">Commit To Calendar</button>
           </div>
        </form>
      </Modal>
    </div>
  );
};

export default EventsAdmin;
