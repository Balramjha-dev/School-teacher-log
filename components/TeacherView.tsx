import React, { useState, useEffect } from 'react';
import { User, LogEntry, PERIODS, ActivityType, ApprovalStatus, Role } from '../types';
import { getLogs, saveLog } from '../services/dataService';
import { Button } from './Button';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';
import { ClipboardList, CheckCircle, XCircle, Clock, AlertCircle, Menu, Zap, BarChart2, TrendingUp, PieChart as PieIcon } from 'lucide-react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';

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
      case ApprovalStatus.APPROVED: return <CheckCircle className="w-5 h-5 text-fuchsia-400 drop-shadow-[0_0_8px_rgba(232,121,249,0.5)]" />;
      case ApprovalStatus.REJECTED: return <XCircle className="w-5 h-5 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.5)]" />;
      default: return <Clock className="w-5 h-5 text-violet-400 drop-shadow-[0_0_8px_rgba(167,139,250,0.5)]" />;
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

  // --- CHART DATA PREPARATION ---
  
  // 1. Activity Distribution (Pie Chart)
  const activityStats = logs.reduce((acc, log) => {
    acc[log.activityType] = (acc[log.activityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const pieData = Object.keys(activityStats).map(key => ({
    name: key,
    value: activityStats[key]
  }));

  // 2. Weekly Progress (Area Chart)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };
  
  const weeklyData = getLast7Days().map(day => {
    // This is a rough approximation as we'd need actual dates in the logs for 100% accuracy
    // Assuming logs are recent for demo purposes
    const count = logs.filter(l => new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'short' }) === day).length;
    return { name: day, logs: count };
  });

  // 3. Period Workload (Bar Chart)
  const periodStats = logs.reduce((acc, log) => {
    const shortPeriod = log.period.split(' ')[0] + ' ' + log.period.split(' ')[1]; // "Period 1"
    acc[shortPeriod] = (acc[shortPeriod] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.keys(periodStats).map(key => ({
    name: key,
    count: periodStats[key]
  }));

  const PIE_COLORS = ['#d946ef', '#a855f7', '#8b5cf6', '#6366f1', '#ec4899'];

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950 animate-boot overflow-x-hidden selection:bg-fuchsia-500 selection:text-white">
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

      {/* Cyber-Space Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-violet-900/40 via-slate-950 to-black z-0"></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(192,132,252,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(192,132,252,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none z-0"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-fuchsia-600/20 blur-[100px] rounded-full animate-pulse"></div>

      <nav className="bg-slate-900/60 backdrop-blur-xl border-b border-fuchsia-500/30 px-6 py-4 flex justify-between items-center sticky top-0 z-50 rounded-b-3xl mx-2 mt-2 shadow-[0_4px_30px_rgba(192,38,211,0.15)] animate-gradient-warm bg-[length:200%_200%]">
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setSidebarOpen(true)} 
            className="transition-colors p-2 hover:bg-fuchsia-900/30 rounded-xl text-white hover:text-white hover:scale-110 active:scale-95 duration-200"
          >
            <Menu className="w-6 h-6" />
          </button>

          <div>
            <h1 className="text-xl font-bold text-white font-scifi tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-fuchsia-200 to-white drop-shadow-[0_0_5px_rgba(232,121,249,0.5)]">
              {getDashboardTitle()}
            </h1>
            <p className="text-[10px] font-mono uppercase opacity-80 text-white/70">{user.role}: {user.name}</p>
          </div>
        </div>

        {/* Profile Avatar Trigger */}
        <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setProfileOpen(true)}>
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500 to-violet-600 rounded-full blur opacity-75 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
            {user.avatar ? (
              <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="font-scifi font-bold text-fuchsia-400">{user.name.charAt(0)}</span>
            )}
          </div>
        </div>
      </nav>

      <main className="flex-1 max-w-7xl mx-auto w-full p-6 space-y-8 relative z-10">
        
        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* 1. Weekly Progress (Area) */}
            <div className="relative p-[2px] rounded-3xl animate-float">
                <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-fuchsia-600 rounded-3xl opacity-20 blur-md"></div>
                <div className="bg-slate-950/80 p-5 rounded-[22px] backdrop-blur-md h-64 border border-fuchsia-500/20 relative overflow-hidden">
                    <h3 className="text-fuchsia-300 font-scifi uppercase text-xs mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> Weekly Activity
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <AreaChart data={weeklyData}>
                            <defs>
                                <linearGradient id="colorLogs" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#d946ef" stopOpacity={0.8}/>
                                    <stop offset="95%" stopColor="#d946ef" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#d946ef', color: '#fff'}}
                                itemStyle={{color: '#d946ef'}} 
                            />
                            <Area type="monotone" dataKey="logs" stroke="#d946ef" fillOpacity={1} fill="url(#colorLogs)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 2. Activity Breakdown (Pie) */}
            <div className="relative p-[2px] rounded-3xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-pink-600 rounded-3xl opacity-20 blur-md"></div>
                <div className="bg-slate-950/80 p-5 rounded-[22px] backdrop-blur-md h-64 border border-fuchsia-500/20 relative overflow-hidden">
                     <h3 className="text-fuchsia-300 font-scifi uppercase text-xs mb-4 flex items-center gap-2">
                        <PieIcon className="w-4 h-4" /> Distribution
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <PieChart>
                            <Pie
                                data={pieData}
                                innerRadius={40}
                                outerRadius={60}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} stroke="rgba(0,0,0,0.5)" />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#d946ef', color: '#fff'}}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* 3. Period Workload (Bar) */}
            <div className="relative p-[2px] rounded-3xl animate-float" style={{ animationDelay: '2s' }}>
                 <div className="absolute inset-0 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl opacity-20 blur-md"></div>
                 <div className="bg-slate-950/80 p-5 rounded-[22px] backdrop-blur-md h-64 border border-fuchsia-500/20 relative overflow-hidden">
                    <h3 className="text-fuchsia-300 font-scifi uppercase text-xs mb-4 flex items-center gap-2">
                        <BarChart2 className="w-4 h-4" /> Period Load
                    </h3>
                    <ResponsiveContainer width="100%" height="80%">
                        <BarChart data={barData}>
                            <XAxis dataKey="name" tick={{fontSize: 10, fill: '#a78bfa'}} stroke="#4c1d95" />
                            <Tooltip 
                                cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
                                contentStyle={{backgroundColor: '#0f172a', borderColor: '#8b5cf6', color: '#fff'}}
                            />
                            <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form Section */}
            <div className="lg:col-span-1 space-y-6">
            <div className="p-[3px] rounded-3xl animate-gradient-warm shadow-[0_0_30px_rgba(192,38,211,0.2)]">
                <div className="bg-slate-950/90 p-6 rounded-[21px] backdrop-blur-md h-full relative overflow-hidden">
                {/* Background Glow inside card */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/10 blur-[50px] rounded-full pointer-events-none"></div>

                <div className="flex items-center gap-2 mb-6 pb-2 border-b border-fuchsia-500/20 relative z-10">
                    <Zap className="w-5 h-5 text-fuchsia-400 animate-pulse" />
                    <h2 className="text-lg font-bold text-fuchsia-100 font-scifi uppercase tracking-wider">New Activity Log</h2>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-5 relative z-10">
                    <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">Period / Time</label>
                    <select 
                        className="w-full p-3 bg-slate-900/80 border border-fuchsia-500/30 text-fuchsia-100 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 outline-none appearance-none font-mono text-sm rounded-xl transition-all hover:border-fuchsia-500/60 hover:shadow-[0_0_15px_rgba(192,38,211,0.15)]"
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                    >
                        {PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    </div>

                    <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">Activity Type</label>
                    <select 
                        className="w-full p-3 bg-slate-900/80 border border-fuchsia-500/30 text-fuchsia-100 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 outline-none appearance-none font-mono text-sm rounded-xl transition-all hover:border-fuchsia-500/60 hover:shadow-[0_0_15px_rgba(192,38,211,0.15)]"
                        value={activity}
                        onChange={(e) => setActivity(e.target.value as ActivityType)}
                    >
                        {Object.values(ActivityType).map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                    </div>

                    <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-fuchsia-400 group-hover:text-fuchsia-300 transition-colors">
                        {activity === ActivityType.FREE_PERIOD ? "Reason / Task Details" : "Activity Details"}
                    </label>
                    <textarea 
                        className="w-full p-4 bg-slate-900/80 border border-fuchsia-500/30 text-fuchsia-100 focus:border-fuchsia-400 focus:ring-1 focus:ring-fuchsia-400 outline-none h-32 resize-none font-mono text-sm placeholder:text-fuchsia-900/50 rounded-xl transition-all hover:border-fuchsia-500/60 hover:shadow-[0_0_15px_rgba(192,38,211,0.15)]"
                        placeholder={getPlaceholder()}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                    />
                    </div>

                    <Button type="submit" isLoading={isSubmitting} className="w-full shadow-[0_0_20px_rgba(192,38,211,0.25)] rounded-xl bg-gradient-to-r from-violet-600/80 to-fuchsia-600/80 text-white border-none hover:from-violet-500 hover:to-fuchsia-500 transform hover:scale-[1.02] transition-all duration-300 font-scifi tracking-widest">
                    Submit Log
                    </Button>
                </form>
                
                {showSuccess && (
                    <div className="mt-4 p-3 bg-fuchsia-950/40 border border-fuchsia-500/30 text-fuchsia-300 text-xs flex items-center gap-2 font-mono uppercase animate-pulse rounded-xl shadow-[0_0_10px_rgba(232,121,249,0.2)]">
                    <CheckCircle className="w-4 h-4" /> 
                    <span>Log Submitted Successfully</span>
                    </div>
                )}
                </div>
            </div>
            </div>

            {/* History Section */}
            <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-fuchsia-500/30">
                <h2 className="text-lg font-bold text-white font-scifi uppercase flex items-center gap-2">
                <span className="w-2 h-2 rounded-full animate-ping bg-fuchsia-400"></span>
                <span className="w-2 h-2 rounded-full bg-fuchsia-400 -ml-4"></span>
                My Logs
                </h2>
                <div className="text-[10px] text-violet-400 font-mono uppercase tracking-widest">Live Sync Active</div>
            </div>
            
            {logs.length === 0 ? (
                <div className="bg-slate-900/30 p-12 border border-fuchsia-900/30 text-center text-fuchsia-700 border-dashed rounded-3xl animate-pulse">
                <ClipboardList className="w-16 h-16 mx-auto mb-4 opacity-30" />
                <p className="font-mono text-sm">No logs found. Initialize first entry.</p>
                </div>
            ) : (
                <div className="space-y-4">
                {logs.map((log, index) => (
                    <div 
                    key={log.id} 
                    className="relative p-[1px] bg-slate-800 hover:bg-gradient-to-r hover:from-fuchsia-500 hover:to-violet-500 rounded-2xl group transition-all duration-500 animate-slide-up-fade opacity-0 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.3)]"
                    style={{ animationDelay: `${index * 100}ms` }}
                    >
                    <div className="bg-slate-950/90 p-5 rounded-[15px] hover:bg-slate-950/95 transition-all relative overflow-hidden backdrop-blur-sm h-full">
                        {/* Status Indicator Dot */}
                        <div className={`absolute top-4 right-4 w-2 h-2 rounded-full animate-pulse ${
                        log.status === ApprovalStatus.APPROVED ? 'bg-fuchsia-500 shadow-[0_0_10px_#d946ef]' :
                        log.status === ApprovalStatus.REJECTED ? 'bg-red-500 shadow-[0_0_10px_#ef4444]' :
                        'bg-violet-500 shadow-[0_0_10px_#8b5cf6]'
                        }`}></div>

                        <div className="flex justify-between items-start mb-3">
                        <div className="flex flex-col gap-1">
                            <span className="font-bold text-fuchsia-100 text-sm tracking-wide font-scifi">{log.period}</span>
                            <span className="text-[10px] text-violet-400/70 font-mono">{new Date(log.timestamp).toLocaleDateString()} // {new Date(log.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <div className="pr-6">
                            <span className={`flex items-center gap-2 text-[10px] px-3 py-1 font-bold uppercase tracking-wider rounded-full shadow-lg ${
                            log.status === ApprovalStatus.APPROVED ? 'bg-fuchsia-950/50 text-fuchsia-300 border border-fuchsia-500/30' :
                            log.status === ApprovalStatus.REJECTED ? 'bg-red-950/50 text-red-300 border border-red-500/30' :
                            'bg-violet-950/50 text-violet-300 border border-violet-500/30'
                            }`}>
                            {getStatusIcon(log.status)}
                            <span>{log.status}</span>
                            </span>
                        </div>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                        <span className="text-[10px] font-bold uppercase px-2 py-1 border rounded-md text-fuchsia-300 bg-fuchsia-950/30 border-fuchsia-500/20 shadow-[0_0_10px_rgba(192,38,211,0.1)]">
                            Type: {log.activityType}
                        </span>
                        </div>
                        
                        <p className="text-slate-300 text-sm leading-relaxed font-light font-mono">
                        {log.description}
                        </p>
                        
                        {log.feedback && (
                        <div className="mt-4 p-3 bg-red-950/20 border border-red-500/30 rounded-xl relative overflow-hidden">
                            <div className="absolute inset-0 bg-red-500/5 animate-pulse"></div>
                            <div className="relative z-10">
                            <div className="flex items-center gap-2 text-red-400 text-xs font-bold uppercase mb-1">
                                <AlertCircle className="w-4 h-4" />
                                Admin Feedback:
                            </div>
                            <p className="text-slate-400 text-xs font-mono">{log.feedback}</p>
                            </div>
                        </div>
                        )}
                    </div>
                    </div>
                ))}
                </div>
            )}
            </div>
        </div>
      </main>
    </div>
  );
};