import React, { useState, useMemo, useRef, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useHRMS } from '../context/HRMSContext';

// Avatar component with fallback
const Avatar = ({ src, name, size = 'lg', onClick }: { 
  src?: string; 
  name: string; 
  size?: 'sm' | 'md' | 'lg' | 'xl';
  onClick?: () => void;
}) => {
  const sizes = {
    sm: 'w-10 h-10 text-sm',
    md: 'w-14 h-14 text-lg',
    lg: 'w-24 h-24 text-2xl',
    xl: 'w-32 h-32 text-3xl',
  };

  const initials = name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  if (src) {
    return (
      <div 
        className={`${sizes[size]} rounded-2xl overflow-hidden border-2 border-white shadow-lg cursor-pointer relative group`}
        onClick={onClick}
      >
        <img 
          src={src} 
          alt={name} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <LucideIcons.Camera className="w-6 h-6 text-white" />
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`${sizes[size]} bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold shadow-lg cursor-pointer hover:opacity-90 transition-opacity`}
      onClick={onClick}
    >
      {initials}
    </div>
  );
};

// Profile picture upload modal
const ProfilePictureModal = ({ isOpen, onClose, onUpload, onRemove, currentImage }: {
  isOpen: boolean;
  onClose: () => void;
  onUpload: (file: File) => void;
  onRemove: () => void;
  currentImage?: string;
}) => {
  const [preview, setPreview] = useState<string>(currentImage || '');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileSelect(file);
  };

  const handleUpload = () => {
    if (fileInputRef.current?.files?.[0]) {
      onUpload(fileInputRef.current.files[0]);
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-8 animate-in fade-in zoom-in-95">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-black text-slate-900">Profile Picture</h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-xl"
          >
            <LucideIcons.X className="w-5 h-5" />
          </button>
        </div>

        <div 
          className={`border-2 border-dashed rounded-2xl p-8 text-center mb-6 transition-all ${
            isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          {preview ? (
            <div className="space-y-4">
              <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-4 border-white shadow-lg">
                <img 
                  src={preview} 
                  alt="Preview" 
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-sm text-slate-600">Click to change photo</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-slate-100 rounded-full flex items-center justify-center">
                <LucideIcons.Camera className="w-10 h-10 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900">Drop your image here</p>
                <p className="text-xs text-slate-500 mt-1">or click to browse</p>
              </div>
              <p className="text-xs text-slate-400">Supports JPG, PNG, WebP • Max 5MB</p>
            </div>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleUpload}
            disabled={!preview || preview === currentImage}
            className="flex-1 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Upload Photo
          </button>
          
          {currentImage && (
            <button
              onClick={() => {
                onRemove();
                onClose();
              }}
              className="px-6 py-3 bg-rose-50 text-rose-600 rounded-xl font-bold text-sm hover:bg-rose-100"
            >
              Remove
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

const Profile: React.FC = () => {
  const { user } = useAuth();
  const { logs, notify } = useHRMS();
  
  const [activeTab, setActiveTab] = useState<'details' | 'security' | 'activity'>('details');
  const [isMfaEnabled, setIsMfaEnabled] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load profile image from localStorage or user data
  useEffect(() => {
    if (user?.id) {
      const savedImage = localStorage.getItem(`profile_image_${user.id}`);
      if (savedImage) {
        setProfileImage(savedImage);
      }
      // Note: user.profilePicture might not exist yet, so we don't use it here
    }
  }, [user]);

  // Filter logs for current user
  const userLogs = useMemo(() => {
    return logs.filter(log => log.user === user?.fullName || log.user === 'Super Admin').slice(0, 10);
  }, [logs, user]);

  const handlePasswordUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    notify('Administrative password updated successfully.', 'success');
  };

  // Mock implementation for updateProfilePicture
  const handleProfilePictureUpload = async (file: File) => {
    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 20) {
        setTimeout(() => setUploadProgress(i), i * 10);
      }

      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageUrl = reader.result as string;
        setProfileImage(imageUrl);
        
        if (user?.id) {
          localStorage.setItem(`profile_image_${user.id}`, imageUrl);
        }
        
        // In a real app, you would:
        // 1. Upload to your server
        // 2. Get back a URL
        // 3. Update user context with the new URL
        
        notify('Profile picture updated successfully!', 'success');
        setUploadProgress(0);
      };
      reader.readAsDataURL(file);
    } catch (error) {
      notify('Failed to upload profile picture', 'error');
      setUploadProgress(0);
    }
  };

  const handleRemoveProfilePicture = () => {
    setProfileImage(null);
    if (user?.id) {
      localStorage.removeItem(`profile_image_${user.id}`);
    }
    notify('Profile picture removed', 'info');
  };

  const renderProfileHeader = () => (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
      <div className="flex-1">
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div className="relative group">
            <Avatar 
              src={profileImage || undefined}
              name={user?.fullName || 'Admin'}
              size="lg"
              onClick={() => setShowProfileModal(true)}
            />
            
            {uploadProgress > 0 && uploadProgress < 100 && (
              <div className="absolute inset-0 bg-black/50 rounded-2xl flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-t-indigo-500 border-white/30 rounded-full animate-spin"></div>
              </div>
            )}
            
            <button
              onClick={() => setShowProfileModal(true)}
              className="absolute bottom-0 right-0 w-10 h-10 bg-white rounded-full shadow-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 transition-colors group-hover:scale-110"
            >
              <LucideIcons.Camera className="w-4 h-4 text-slate-700" />
            </button>
          </div>
          
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-black text-slate-900">{user?.fullName}</h1>
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-black rounded-full uppercase tracking-widest">
                Verified
              </span>
            </div>
            <p className="text-sm text-slate-600 mb-3">{user?.email}</p>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LucideIcons.BadgeCheck className="w-4 h-4 text-indigo-500" />
                <span className="font-bold">{user?.role} Account</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LucideIcons.Globe className="w-4 h-4 text-slate-400" />
                <span>India (GMT+5:30)</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <LucideIcons.Calendar className="w-4 h-4 text-slate-400" />
                <span>Member since Jan 2024</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="flex gap-3">
        <button 
          onClick={() => notify('Profile settings saved.', 'success')} 
          className="px-6 py-3 bg-white rounded-2xl border border-slate-100 text-slate-700 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center gap-2"
        >
          <LucideIcons.Save size={14} />
          Save
        </button>
        <button 
          onClick={() => {
            // Export functionality
            notify('Profile exported.', 'info');
          }} 
          className="px-6 py-3 bg-indigo-50 text-indigo-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-indigo-100 transition-all flex items-center gap-2"
        >
          <LucideIcons.Download size={14} />
          Export
        </button>
      </div>
    </div>
  );

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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Picture Card */}
        <div className="lg:col-span-1">
          <div className="bg-gradient-to-br from-slate-50 to-white p-6 rounded-3xl border border-slate-100 h-full">
            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Profile Media</h3>
            <div className="space-y-4">
              <div className="flex justify-center">
                <Avatar 
                  src={profileImage || undefined}
                  name={user?.fullName || 'Admin'}
                  size="xl"
                  onClick={() => setShowProfileModal(true)}
                />
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => setShowProfileModal(true)}
                  className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
                >
                  <LucideIcons.Upload className="w-4 h-4" />
                  Change Photo
                </button>
                
                {profileImage && (
                  <button
                    onClick={handleRemoveProfilePicture}
                    className="w-full py-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <LucideIcons.Trash2 className="w-4 h-4" />
                    Remove Photo
                  </button>
                )}
                
                <p className="text-xs text-slate-500 text-center pt-2">
                  JPG, PNG or WebP • Max 5MB
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* User Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">System Role</label>
              <p className="text-lg font-black text-slate-800 mt-1 capitalize">{user?.role} Account</p>
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
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm space-y-10 animate-in fade-in slide-in-from-left-4 duration-300">
      <div>
        <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-3">
          <LucideIcons.ShieldCheck className="text-indigo-600" />
           Update Password
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
              <div className="text-xs text-slate-500 font-medium mt-1 leading-relaxed whitespace-pre-wrap">
                {typeof log.details === 'string' ? log.details : JSON.stringify(log.details || {}, null, 2)}
              </div>
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
    <>
      <div className="space-y-8 animate-in fade-in duration-300">
        {renderProfileHeader()}

        <div>
          <div className="mb-6">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setActiveTab('details')} 
                className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'details' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab('security')} 
                className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'security' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Security
              </button>
              <button 
                onClick={() => setActiveTab('activity')} 
                className={`px-4 py-2 rounded-xl text-sm font-black ${activeTab === 'activity' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Activity
              </button>
            </div>
          </div>

          {activeTab === 'details' && renderDetails()}
          {activeTab === 'security' && renderSecurity()}
          {activeTab === 'activity' && renderActivity()}
        </div>
      </div>

      <ProfilePictureModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onUpload={handleProfilePictureUpload}
        onRemove={handleRemoveProfilePicture}
        currentImage={profileImage || undefined}
      />
    </>
  );
};

export default Profile;