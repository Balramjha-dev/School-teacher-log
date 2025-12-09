import React, { useState, useEffect } from 'react';
import { User, LogEntry, ApprovalStatus } from '../types';
import { getLogs, updateLogStatus, exportToCSV } from '../services/dataService';
import { generateDailySummary } from '../services/geminiService';
import { Button } from './Button';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, AreaChart, Area
} from 'recharts';
import { 
  Download, Check, X, FileText, Sparkles, Terminal, BarChart2, Menu, ShieldAlert, TrendingUp, Users, Filter, XCircle, Calendar
} from 'lucide-react';

interface PrincipalViewProps {
  user: User;
  onLogout: () => void;
}

export const PrincipalView: React.FC<PrincipalViewProps> = ({ user: initialUser, onLogout }) => {
  const [user, setUser] = useState(initialUser);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filter, setFilter] = useState<'ALL' | 'PENDING'>('ALL');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isProfileOpen, setProfileOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  // Date Filter State
  const [dateFilterStart, setDateFilterStart] = useState('');
  const [dateFilterEnd, setDateFilterEnd] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const fetchData = async () => {
    const allLogs = await getLogs();
    allLogs.sort((a, b) => b.timestamp - a.timestamp);
    setLogs(allLogs);
  };

  const handleStatusUpdate = async (id: string, status: ApprovalStatus) => {
    let feedback = undefined;
    if (status === ApprovalStatus.REJECTED) {
       const reason = prompt("Please provide a reason for rejection:");
       feedback = reason || "Insufficient data provided.";
    }
    setIsUpdating(true);
    await updateLogStatus(id, status, feedback);
    await fetchData();
    setIsUpdating(false);
  };

  const handleGenerateSummary = async () => {
    setIsGeneratingAi(true);
    const summary = await generateDailySummary(logs);
    setAiSummary(summary);
    setIsGeneratingAi(false);
  };

  const handleExport = async () => {
      await exportToCSV();
  }

  // Filter logs based on Status AND Date Range
  const filteredLogs = (filter === 'ALL' ? logs : logs.filter(l => l.status === ApprovalStatus.PENDING)).filter(log => {
      const logDate = new Date(log.timestamp).toISOString().split('T')[0];
      if (dateFilterStart && logDate < dateFilterStart) return false;
      if (dateFilterEnd && logDate > dateFilterEnd) return false;
      return true;
  });

  // --- ANALYTICS DATA ---

  // 1. Status Distribution (Pie Chart)
  const statusStats = logs.reduce((acc, log) => {
    acc[log.status] = (acc[log.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const statusData = Object.keys(statusStats).map(key => ({
    name: key,
    value: statusStats[key]
  }));

  // 2. Teacher Leaderboard (Bar Chart)
  const teacherStats = logs.reduce((acc, log) => {
    acc[log.teacherName] = (acc[log.teacherName] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  // Sort by count and take top 5
  const teacherData = Object.keys(teacherStats)
    .map(key => ({ name: key, count: teacherStats[key] }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // 3. Activity Trend (Area Chart - Last 7 Days)
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toLocaleDateString('en-US', { weekday: 'short' }));
    }
    return days;
  };

  const trendData = getLast7Days().map(day => {
    const count = logs.filter(l => new Date(l.timestamp).toLocaleDateString('en-US', { weekday: 'short' }) === day).length;
    return { name: day, count: count };
  });

  // Crimson/Rose Palette
  const STATUS_COLORS = {
    [ApprovalStatus.APPROVED]: '#f43f5e', // Rose
    [ApprovalStatus.REJECTED]: '#9f1239', // Dark Red
    [ApprovalStatus.PENDING]: '#fbbf24',  // Amber
  };

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950 animate-boot overflow-x-hidden selection:bg-rose-600 selection:text-white">
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

       {/* Crimson Background Elements */}
       <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-rose-900/40 via-slate-950 to-black"></div>
       <div className="absolute inset-0 bg-[linear-gradient(rgba(225,29,72,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(225,29,72,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none z-0"></div>
       <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/20 blur-[100px] rounded-full animate-pulse"></div>
       
      <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-rose-500/30 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(225,29,72,0.15)] rounded-b-3xl mx-2 mt-2 animate-gradient-warm bg-[length:200%_200%]">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setSidebarOpen(true)} 
             className="text-white hover:text-white transition-colors p-2 hover:bg-rose-900/30 rounded-xl hover:scale-110 active:scale-95 duration-200"
           >
             <Menu className="w-6 h-6" />
           </button>

          <div>
            <h1 className="text-xl font-bold text-white font-scifi tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-white via-rose-200 to-white drop-shadow-[0_0_5px_rgba(244,63,94,0.5)]">PRINCIPAL DASHBOARD</h1>
            <p className="text-[10px] text-white/70 font-mono uppercase">Principal: {user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden md:flex border-rose-500/30 text-rose-400 hover:bg-rose-950/50 rounded-xl hover:shadow-[0_0_15px_rgba(225,29,72,0.3)]" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          {/* Profile Avatar Trigger */}
          <div className="relative group cursor-pointer hover:scale-105 transition-transform duration-300" onClick={() => setProfileOpen(true)}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rose-500 to-red-600 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200 animate-pulse"></div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-scifi font-bold text-rose-400">{user.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6 relative z-10">
        
        {/* ANALYTICS SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* 1. Status Distribution (Pie) */}
            <div className="relative p-[2px] rounded-3xl animate-float md:col-span-1">
                <div className="absolute inset-0 bg-gradient-to-br from-rose-600 to-red-900 rounded-3xl opacity-20 blur-md"></div>
                <div className="bg-slate-950/80 p-5 rounded-[22px] backdrop-blur-md h-72 border border-rose-500/20 relative overflow-hidden flex flex-col">
                    <h3 className="text-rose-300 font-scifi uppercase text-xs mb-2 flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4" /> Log Status
                    </h3>
                    <div className="flex-1">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statusData}
                                    innerRadius={40}
                                    outerRadius={60}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name as ApprovalStatus] || '#8884d8'} stroke="rgba(0,0,0,0.5)" />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{backgroundColor: '#0f172a', borderColor: '#e11d48', color: '#fff'}} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* 2. School Trend (Area) */}
             <div className="relative p-[2px] rounded-3xl animate-float md:col-span-2" style={{ animationDelay: '0.5s' }}>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 rounded-3xl opacity-20 blur-md"></div>
                <div className="bg-slate-950/80 p-5 rounded-[22px] backdrop-blur-md h-72 border border-rose-500/20 relative overflow-hidden flex flex-col">
                    <h3 className="text-rose-300 font-scifi uppercase text-xs mb-4 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" /> School Activity Trend
                    </h3>
                    <div className="flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.8}/>
                                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                                    </linearGradient>
                                </defs>
                                <XAxis dataKey="name" tick={{fontSize: 10, fill: '#fb7185'}} stroke="#881337" />
                                <Tooltip 
                                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#e11d48', color: '#fff'}}
                                    itemStyle={{color: '#fb7185'}} 
                                />
                                <Area type="monotone" dataKey="count" stroke="#e11d48" fillOpacity={1} fill="url(#colorTrend)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

             {/* 3. Leaderboard (Bar) */}
            <div className="relative p-[2px] rounded-3xl animate-float md:col-span-1" style={{ animationDelay: '1s' }}>
                <div className="absolute inset-0 bg-gradient-to-bl from-rose-600 to-orange-600 rounded-3xl opacity-20 blur-md"></div>
                 <div className="bg-slate-950/80 p-5 rounded-[22px] backdrop-blur-md h-72 border border-rose-500/20 relative overflow-hidden flex flex-col">
                    <h3 className="text-rose-300 font-scifi uppercase text-xs mb-4 flex items-center gap-2">
                        <Users className="w-4 h-4" /> Top Staff
                    </h3>
                    <div className="flex-1">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={teacherData} layout="vertical">
                                <XAxis type="number" hide />
                                <YAxis dataKey="name" type="category" width={80} tick={{fontSize: 9, fill: '#fb7185'}} stroke="#881337" />
                                <Tooltip 
                                    cursor={{fill: 'rgba(225, 29, 72, 0.1)'}}
                                    contentStyle={{backgroundColor: '#0f172a', borderColor: '#e11d48', color: '#fff'}}
                                />
                                <Bar dataKey="count" fill="#e11d48" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        </div>

        {/* AI Summary Section */}
        <div className="relative p-[2px] rounded-3xl animate-float w-full" style={{ animationDelay: '1.5s' }}>
             <div className="bg-gradient-to-br from-red-950/80 to-slate-950/90 p-6 rounded-[21px] text-white relative overflow-hidden flex flex-col backdrop-blur-md border border-rose-500/30">
              <div className="flex items-start justify-between mb-4 relative z-10">
                <h2 className="text-lg font-bold flex items-center gap-2 font-scifi uppercase text-rose-300 tracking-wider">
                  <Sparkles className="w-5 h-5 text-rose-400 animate-spin-slow" />
                  AI Executive Summary
                </h2>
                {aiSummary && <span className="text-[10px] bg-rose-900/50 px-2 py-1 rounded text-rose-300 border border-rose-500/30 animate-pulse">UPDATED</span>}
              </div>
              
              <div className="relative z-10">
                {isGeneratingAi ? (
                  <div className="bg-rose-950/20 p-4 rounded-xl border border-rose-500/20 font-mono text-xs text-rose-400 space-y-2">
                     <p className="animate-pulse">&gt; ESTABLISHING NEURAL LINK...</p>
                     <p className="animate-pulse delay-100">&gt; PARSING LOG DATA...</p>
                     <p className="animate-pulse delay-200">&gt; GENERATING INSIGHTS...</p>
                     <div className="h-1 bg-rose-900/50 rounded-full overflow-hidden mt-2">
                       <div className="h-full bg-rose-500 animate-[width_2s_ease-in-out_infinite]" style={{width: '50%'}}></div>
                     </div>
                  </div>
                ) : aiSummary ? (
                  <div className="bg-rose-950/30 p-4 border border-rose-500/30 text-sm leading-relaxed text-rose-100 font-mono shadow-inner rounded-xl animate-slide-up-fade">
                    <p className="text-[10px] text-rose-400 mb-2 uppercase animate-pulse">&gt;&gt; Analysis Complete</p>
                    {aiSummary}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-rose-200/60 text-xs font-mono mb-4 uppercase tracking-wide">
                      Generate a smart summary of today's activities.
                    </p>
                    <Button 
                        onClick={handleGenerateSummary} 
                        isLoading={isGeneratingAi}
                        className="border-rose-400/50 text-rose-300 hover:bg-rose-900/50 hover:shadow-[0_0_15px_rgba(225,29,72,0.4)] rounded-xl font-scifi uppercase tracking-widest px-8"
                        variant="outline"
                      >
                        Generate Summary
                    </Button>
                  </div>
                )}
              </div>
            </div>
        </div>

        {/* Action Table Section */}
        <div className="relative p-[3px] rounded-3xl animate-gradient-warm shadow-xl animate-in slide-in-from-bottom-8 duration-700">
          <div className="bg-slate-950/80 rounded-[21px] overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-rose-500/10 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 font-scifi uppercase tracking-wider">
                <FileText className="w-5 h-5 text-rose-500" />
                Staff Logs
              </h2>
              
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                 {/* Date Filters */}
                <div className="flex items-center gap-2 bg-slate-900/50 p-1.5 rounded-xl border border-rose-500/20">
                    <div className="flex items-center gap-1.5 px-2">
                        <Filter className="w-3 h-3 text-rose-400" />
                        <span className="text-[10px] font-mono text-rose-300 uppercase hidden lg:inline">Filter:</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <input 
                            type="date" 
                            value={dateFilterStart}
                            onChange={(e) => setDateFilterStart(e.target.value)}
                            className="bg-black border border-rose-500/30 text-rose-100 text-[10px] rounded-lg px-2 py-1 outline-none focus:border-rose-400 font-mono w-24"
                        />
                        <span className="text-rose-500">-</span>
                         <input 
                            type="date" 
                            value={dateFilterEnd}
                            onChange={(e) => setDateFilterEnd(e.target.value)}
                            className="bg-black border border-rose-500/30 text-rose-100 text-[10px] rounded-lg px-2 py-1 outline-none focus:border-rose-400 font-mono w-24"
                        />
                        {(dateFilterStart || dateFilterEnd) && (
                            <button 
                                onClick={() => { setDateFilterStart(''); setDateFilterEnd(''); }}
                                className="ml-1 p-1 hover:bg-rose-900/50 rounded-full text-rose-400"
                            >
                                <XCircle className="w-3 h-3" />
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex gap-2">
                    <button 
                    onClick={() => setFilter('ALL')}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border rounded-xl ${filter === 'ALL' ? 'bg-rose-950/60 text-rose-400 border-rose-500/50 shadow-[0_0_10px_rgba(225,29,72,0.3)]' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                    >
                    All Logs
                    </button>
                    <button 
                    onClick={() => setFilter('PENDING')}
                    className={`px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-all border rounded-xl ${filter === 'PENDING' ? 'bg-amber-950/60 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                    >
                    Pending
                    </button>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-900/50 text-rose-300/60 text-[10px] uppercase tracking-[0.1em] border-b border-rose-500/10 font-mono">
                    <th className="p-4 font-normal">Teacher Name</th>
                    <th className="p-4 font-normal">Timestamp</th>
                    <th className="p-4 font-normal">Activity</th>
                    <th className="p-4 font-normal w-1/3">Description</th>
                    <th className="p-4 font-normal">Status</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-rose-500/10" key={`${filter}-${dateFilterStart}-${dateFilterEnd}-${filteredLogs.length}`}>
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">No logs found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <tr key={log.id} 
                          className="hover:bg-rose-900/10 transition-colors group animate-slide-up-fade opacity-0"
                          style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <td className="p-4 font-medium text-rose-300 font-mono text-sm">{log.teacherName}</td>
                        <td className="p-4 text-slate-500 text-xs font-mono">
                          <div className="text-slate-400">{log.period}</div>
                          <div className="opacity-50">{new Date(log.timestamp).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide border bg-slate-900/50 text-slate-300 border-slate-700 rounded-md`}>
                            {log.activityType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm font-light border-l border-rose-500/5 border-r">{log.description}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-full ${
                            log.status === ApprovalStatus.APPROVED ? 'bg-fuchsia-950/30 text-fuchsia-400 border-fuchsia-500/30' :
                            log.status === ApprovalStatus.REJECTED ? 'bg-red-950/30 text-red-400 border-red-500/30' :
                            'bg-amber-950/30 text-amber-400 border-amber-500/30'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          {log.status === ApprovalStatus.PENDING ? (
                            <div className="flex justify-end gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                              <button 
                                onClick={() => handleStatusUpdate(log.id, ApprovalStatus.APPROVED)}
                                disabled={isUpdating}
                                className="p-2 bg-emerald-950/40 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-900/60 hover:shadow-[0_0_15px_rgba(16,185,129,0.4)] transition-all rounded-full disabled:opacity-50"
                                title="Authorize"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(log.id, ApprovalStatus.REJECTED)}
                                disabled={isUpdating}
                                className="p-2 bg-red-950/40 text-red-400 border border-red-500/30 hover:bg-red-900/60 hover:shadow-[0_0_15px_rgba(239,68,68,0.4)] transition-all rounded-full disabled:opacity-50"
                                title="Deny"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          ) : (
                            <span className="text-[10px] text-slate-600 font-mono uppercase">Processed</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};