import React, { useState, useEffect } from 'react';
import { User, LogEntry, ApprovalStatus } from '../types';
import { getLogs, updateLogStatus, exportToCSV } from '../services/dataService';
import { generateDailySummary } from '../services/geminiService';
import { Button } from './Button';
import { Sidebar } from './Sidebar';
import { ProfileModal } from './ProfileModal';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { 
  Download, Check, X, FileText, Sparkles, Terminal, BarChart2, Menu, Sun
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

  const filteredLogs = filter === 'ALL' ? logs : logs.filter(l => l.status === ApprovalStatus.PENDING);

  // Stats for Charts
  const activityStats = logs.reduce((acc, log) => {
    acc[log.activityType] = (acc[log.activityType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.keys(activityStats).map(key => ({
    name: key,
    value: activityStats[key]
  }));

  // Refreshing Warm Palette
  const COLORS = ['#f97316', '#f59e0b', '#eab308', '#84cc16', '#10b981'];

  return (
    <div className="min-h-screen flex flex-col relative bg-slate-950 animate-boot overflow-x-hidden selection:bg-orange-500 selection:text-white">
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

       {/* Warm Background Elements */}
       <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-orange-900/30 via-slate-950 to-black"></div>
       <div className="absolute inset-0 bg-[linear-gradient(rgba(249,115,22,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(249,115,22,0.05)_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-30 pointer-events-none z-0"></div>
       
      <nav className="bg-slate-900/70 backdrop-blur-xl border-b border-orange-500/20 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-[0_4px_30px_rgba(0,0,0,0.3)] rounded-b-3xl mx-2 mt-2">
        <div className="flex items-center gap-4">
           <button 
             onClick={() => setSidebarOpen(true)} 
             className="text-orange-400 hover:text-white transition-colors p-2 hover:bg-orange-900/20 rounded-xl"
           >
             <Menu className="w-6 h-6" />
           </button>

          <div>
            <h1 className="text-xl font-bold text-white font-scifi tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-500">PRINCIPAL DASHBOARD</h1>
            <p className="text-[10px] text-orange-400/70 font-mono uppercase">Principal: {user.name}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Button variant="outline" className="hidden md:flex border-orange-500/30 text-orange-400 hover:bg-orange-950/50 rounded-xl" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export CSV
          </Button>

          {/* Profile Avatar Trigger */}
          <div className="relative group cursor-pointer" onClick={() => setProfileOpen(true)}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-50 group-hover:opacity-100 transition duration-200"></div>
            <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-slate-900 bg-slate-800 flex items-center justify-center">
              {user.avatar ? (
                <img src={user.avatar} alt="User Avatar" className="w-full h-full object-cover" />
              ) : (
                <span className="font-scifi font-bold text-orange-400">{user.name.charAt(0)}</span>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 p-6 max-w-[1400px] mx-auto w-full space-y-6 relative z-10">
        
        {/* Analytics Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-orange-500/30 to-amber-600/30 shadow-xl col-span-1 md:col-span-2 animate-float">
            <div className="bg-slate-900/80 h-full p-6 rounded-[21px] backdrop-blur-md relative overflow-hidden group">
              <div className="flex justify-between items-center mb-6">
                  <h2 className="text-lg font-bold text-orange-400 flex items-center gap-2 font-scifi uppercase">
                    <BarChart2 className="w-5 h-5" />
                    Activity Overview
                  </h2>
              </div>
              <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={pieData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} opacity={0.3} />
                      <XAxis dataKey="name" tick={{fontSize: 10, fill: '#cbd5e1'}} stroke="#475569" />
                      <YAxis allowDecimals={false} tick={{fill: '#cbd5e1'}} stroke="#475569" />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#1e293b', borderColor: '#f97316', color: '#f8fafc', borderRadius: '12px'}}
                        itemStyle={{color: '#fdba74'}}
                        cursor={{fill: 'rgba(249,115,22,0.1)'}}
                      />
                      <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]}>
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="relative p-[2px] rounded-3xl bg-gradient-to-br from-amber-500/30 to-orange-600/30 shadow-xl col-span-1 animate-float" style={{ animationDelay: '1s' }}>
            <div className="bg-gradient-to-br from-orange-900/30 to-slate-900/90 h-full p-6 rounded-[21px] text-white relative overflow-hidden flex flex-col backdrop-blur-md">
              
              <div className="flex items-start justify-between mb-4 relative z-10">
                <h2 className="text-lg font-bold flex items-center gap-2 font-scifi uppercase text-amber-300">
                  <Sparkles className="w-5 h-5 text-amber-400" />
                  AI Summary
                </h2>
              </div>
              
              <div className="relative z-10 flex-1 flex flex-col">
                {aiSummary ? (
                  <div className="bg-orange-950/40 p-4 border border-orange-500/30 text-sm leading-relaxed text-orange-100 font-mono shadow-inner h-full overflow-y-auto rounded-xl">
                    <p className="text-[10px] text-orange-400 mb-2 uppercase">&gt;&gt; Summary Generated</p>
                    {aiSummary}
                  </div>
                ) : (
                  <div className="text-center py-8 flex-1 flex flex-col justify-center">
                    <p className="text-orange-200/60 text-xs font-mono mb-6 uppercase tracking-wide">
                      No summary generated yet.
                    </p>
                    <Button 
                        onClick={handleGenerateSummary} 
                        isLoading={isGeneratingAi}
                        className="w-full border-orange-400/50 text-orange-300 hover:bg-orange-900/50 hover:shadow-[0_0_15px_rgba(249,115,22,0.4)] rounded-xl"
                        variant="outline"
                      >
                        Generate Summary
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Action Table Section */}
        <div className="relative p-[2px] rounded-3xl bg-gradient-to-r from-orange-500/20 to-amber-500/20 shadow-xl">
          <div className="bg-slate-900/80 rounded-[21px] overflow-hidden backdrop-blur-md">
            <div className="p-6 border-b border-orange-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2 font-scifi uppercase">
                <FileText className="w-5 h-5 text-orange-500" />
                Staff Logs
              </h2>
              
              <div className="flex gap-2">
                <button 
                  onClick={() => setFilter('ALL')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border rounded-xl ${filter === 'ALL' ? 'bg-orange-950/50 text-orange-400 border-orange-500/50 shadow-[0_0_10px_rgba(249,115,22,0.3)]' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                >
                  All Logs
                </button>
                <button 
                  onClick={() => setFilter('PENDING')}
                  className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all border rounded-xl ${filter === 'PENDING' ? 'bg-amber-950/50 text-amber-400 border-amber-500/50 shadow-[0_0_10px_rgba(245,158,11,0.3)]' : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'}`}
                >
                  Pending Approval
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/30 text-slate-500 text-[10px] uppercase tracking-[0.1em] border-b border-orange-500/10 font-mono">
                    <th className="p-4 font-normal">Teacher Name</th>
                    <th className="p-4 font-normal">Timestamp</th>
                    <th className="p-4 font-normal">Activity</th>
                    <th className="p-4 font-normal w-1/3">Description</th>
                    <th className="p-4 font-normal">Status</th>
                    <th className="p-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-orange-500/10">
                  {filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-16 text-center">
                        <p className="text-slate-600 font-mono text-xs uppercase tracking-widest">No logs found.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-orange-900/5 transition-colors group">
                        <td className="p-4 font-medium text-orange-300 font-mono text-sm">{log.teacherName}</td>
                        <td className="p-4 text-slate-500 text-xs font-mono">
                          <div className="text-slate-400">{log.period}</div>
                          <div className="opacity-50">{new Date(log.timestamp).toLocaleDateString()}</div>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center px-2 py-1 text-[10px] font-bold uppercase tracking-wide border bg-slate-900/50 text-slate-300 border-slate-700 rounded-md`}>
                            {log.activityType}
                          </span>
                        </td>
                        <td className="p-4 text-slate-400 text-sm font-light border-l border-orange-500/5 border-r">{log.description}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold uppercase tracking-wider border rounded-full ${
                            log.status === ApprovalStatus.APPROVED ? 'bg-emerald-950/30 text-emerald-400 border-emerald-500/30' :
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