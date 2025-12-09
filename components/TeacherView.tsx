import React, { useState, useEffect } from 'react';
import { User, LogEntry, PERIODS, ActivityType, ApprovalStatus, Role } from '../types';
import { getLogs, saveLog } from '../services/dataService';
import { Button } from './Button';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';
import { ClipboardList, CheckCircle, XCircle, Clock, AlertCircle, Menu, Leaf } from 'lucide-react';

interface TeacherViewProps {
  user: User;
  onLogout: () => void;
}

export const TeacherView: React.FC<TeacherViewProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState(PERIODS[0]);
  const [activity, setActivity] = useState<ActivityType>(ActivityType.CLASS);
  const [description, setDescription] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // Load logs for this teacher asynchronously
    const fetchMyLogs = async () => {
        const allLogs = await getLogs();
        const myLogs = allLogs.filter(l => l.teacherId === user.id).sort((a, b) => b.timestamp - a.timestamp);
        setLogs(myLogs);
    };
    fetchMyLogs();
  }, [user.id]);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const newLog: LogEntry = {
      id: crypto.randomUUID(),
      teacherId: user.id,
      teacherName: user.name,
      date: new Date().toISOString(),
      period: selectedPeriod,
      activityType: activity,
      description: description,
      status: ApprovalStatus.PENDING,
      timestamp: Date.now()
    };

    await saveLog(newLog);
    setLogs(prev => [newLog, ...prev]);
    setDescription('');
    setShowSuccess(true);
    setIsSubmitting(false);
    setTimeout(() => setShowSuccess(false), 3000);
  };

  const getStatusIcon = (status: ApprovalStatus) => {
    switch (status) {
      case ApprovalStatus.APPROVED: return <CheckCircle className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]" />;
      case ApprovalStatus.REJECTED: return <XCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />;
      default: return <Clock className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.5)]" />;
    }
  };

  const getPlaceholder = () => {
    switch (activity) {
      case ActivityType.CLASS: return "E.g., Taught Chapter 4, Algebra basics. Students were engaged.";
      case ActivityType.OFFICE_WORK: return "E.g., Graded exam papers for Class 10B.";
      case ActivityType.FREE_PERIOD: return "E.g., Since I didn't take a class, I prepared lesson plans for tomorrow.";
      case ActivityType.OTHER: return "E.g., Organized the science fair committee meeting.";
      default: return "Describe your activity...";
    }
  };

  const getDashboardTitle = () => {
    switch (user.role) {
      case Role.OFFICIAL: return 'OFFICIAL DASHBOARD';
      case Role.OTHER: return 'STAFF DASHBOARD';
      default: return 'TEACHER DASHBOARD';
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950 animate-boot overflow-x-hidden selection:bg-emerald-500 selection:text-white">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={user} 
        onLogout={onLogout}
        onOpenProfile={() => {
          setSidebarOpen(false);
          setProfileOpen(true);
        }}
      />
      
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setProfileOpen(false)} 
        user={user} 
        onUpdate={setUser}
      />

      {/* Refreshing Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/30 via-slate-950 to-black z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none z-0"></div>

      <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-emerald-500/20 px-6 py-4 flex justify-between items-center sticky top-0 z-50 rounded-b-3xl mx-2 mt-2 shadow-[0_4px_30px_rgba(0,0,0,0.3)]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="transition-colors p-2 hover:bg-emerald-900/20 rounded-xl text-emerald-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-white font-scifi tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-500">
              {getDashboardTitle()}
            </h1>
            <p className="text-[10px] font-mono uppercase opacity-70 text-emerald-400">{user.role}: {user.name}</p>
          </div>
        </div>

        {/* Profile Avatar Trigger */}
        <div className="relative group cursor-pointer" onClick={() => setProfileOpen(true)}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-scifi font-bold text-emerald-400">{user.name.charAt(0)}</span>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-6xl mx-auto w-full p-6 grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        {/* Form Section */}
        <div className="lg:col-span-1 space-y-6 animate-float">
          <div className="p-[2px] rounded-3xl bg-gradient-to-br from-emerald-500/50 to-teal-600/50 shadow-2xl">
            <div className="bg-slate-900/95 p-6 rounded-[21px] backdrop-blur-md h-full">
              <div className="flex items-center gap-2 mb-6 pb-2 border-b border-emerald-500/20">
                <Leaf className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-emerald-100 font-scifi uppercase">New Activity Log</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-emerald-400">Period / Time</label>
                  <select 
                    className="w-full p-3 bg-slate-950/50 border border-emerald-500/30 text-emerald-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none appearance-none font-mono text-sm rounded-xl transition-all hover:border-emerald-500/50"
                    value={selectedPeriod}
                    onChange={(e) => setSelectedPeriod(e.target.value)}
                  >
                    {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-emerald-400">Activity Type</label>
                  <select 
                    className="w-full p-3 bg-slate-950/50 border border-emerald-500/30 text-emerald-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none appearance-none font-mono text-sm rounded-xl transition-all hover:border-emerald-500/50"
                    value={activity}
                    onChange={(e) => setActivity(e.target.value as ActivityType)}
                  >
                    {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-emerald-400">
                    {activity === ActivityType.FREE_PERIOD ? "Reason / Task Details" : "Activity Details"}
                  </label>
                  <textarea 
                    className="w-full p-4 bg-slate-950/50 border border-emerald-500/30 text-emerald-100 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none h-32 resize-none font-mono text-sm placeholder:text-emerald-900/50 rounded-xl transition-all hover:border-emerald-500/50"
                    placeholder={getPlaceholder()}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    required
                  />
                </div>

                <Button type="submit" isLoading={isSubmitting} className="w-full shadow-[0_0_15px_rgba(16,185,129,0.3)] rounded-xl bg-emerald-900/40 text-emerald-400 border-emerald-500/50 hover:bg-emerald-800/60 hover:text-white">
                  Submit Log
                </Button>
              </form>
              
              {showSuccess && (
                <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2 font-mono uppercase animate-pulse rounded-xl">
                  <CheckCircle className="w-4 h-4" /> 
                  <span>Log Submitted Successfully</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* History Section */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-emerald-900/50">
            <h2 className="text-lg font-bold text-white font-scifi uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full animate-pulse bg-emerald-400"></span>
              My Logs
            </h2>
            <div className="text-[10px] text-emerald-600 font-mono uppercase">Synced</div>
          </div>
          
          {logs.length === 0 ? (
            <div className="bg-slate-900/30 p-12 border border-emerald-900/30 text-center text-emerald-700 border-dashed rounded-3xl">
              <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="font-mono text-sm">No logs found. Please submit your first entry.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div 
                  key={log.id} 
                  className="relative p-[1px] bg-slate-800 hover:bg-gradient-to-r hover:from-emerald-500 hover:to-teal-500 rounded-2xl group transition-all duration-300 animate-in slide-in-from-bottom-2 fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="bg-slate-900/80 p-5 rounded-[15px] hover:bg-slate-900/90 transition-all relative overflow-hidden backdrop-blur-sm">
                    {/* Status Indicator Dot */}
                    <div className={`absolute top-4 right-4 w-2 h-2 rounded-full ${
                       log.status === ApprovalStatus.APPROVED ? 'bg-emerald-500 shadow-[0_0_10px_#10b981]' :
                       log.status === ApprovalStatus.REJECTED ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                       'bg-amber-500 shadow-[0_0_10px_#f59e0b]'
                    }`}></div>

                    <div className="flex justify-between items-start mb-3">
                      <div className="flex flex-col gap-1">
                        <span className="font-bold text-white text-sm tracking-wide">{log.period}</span>
                        <span className="text-[10px] text-emerald-500/70 font-mono">{new Date(log.timestamp).toLocaleDateString()} // {new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                      <div className="pr-6">
                         <span className={`flex items-center gap-2 text-[10px] px-3 py-1 font-bold uppercase tracking-wider rounded-full ${
                          log.status === ApprovalStatus.APPROVED ? 'bg-emerald-950/30 text-emerald-400 border border-emerald-500/20' :
                          log.status === ApprovalStatus.REJECTED ? 'bg-red-950/30 text-red-400 border border-red-500/20' :
                          'bg-amber-950/30 text-amber-400 border border-amber-500/20'
                        }`}>
                          {getStatusIcon(log.status)}
                          <span>{log.status}</span>
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-1 border rounded-md text-teal-400 bg-teal-950/30 border-teal-500/20">
                        Type: {log.activityType}
                      </span>
                    </div>
                    
                    <p className="text-slate-300 text-sm leading-relaxed font-light">
                      {log.description}
                    </p>
                    
                    {log.feedback && (
                      <div className="mt-4 p-3 bg-slate-950/80 border border-slate-700 rounded-xl">
                        <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-1">
                          <AlertCircle className="w-4 h-4" />
                          Principal Feedback:
                        </div>
                        <p className="text-slate-400 text-xs font-mono">{log.feedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};