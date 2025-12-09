import React from 'react';
import { GraduationCap, LogIn, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-slate-950 flex flex-col relative overflow-hidden selection:bg-cyan-500 selection:text-white">
      {/* Fresh Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-float"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-violet-600/20 rounded-full blur-[120px] animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 p-6">
        
        {/* Logo / Header */}
        <div className="mb-12 text-center relative">
          <div className="inline-flex p-4 rounded-3xl bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-500/20 mb-6 shadow-[0_0_30px_rgba(6,182,212,0.15)] animate-float">
            <GraduationCap className="w-16 h-16 text-cyan-400 drop-shadow-lg" />
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-white font-scifi tracking-tight mb-4 text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-white to-blue-300">
            EduLog
          </h1>
          <p className="text-slate-400 font-medium text-sm md:text-base tracking-widest uppercase mb-8 max-w-md mx-auto leading-relaxed">
            Next-Gen School Management Workspace
          </p>
          
          <div className="flex items-center justify-center gap-6 text-xs text-slate-500 font-mono">
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Smart Logs</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> AI Insights</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-3 h-3 text-emerald-400" /> Real-time</span>
          </div>
        </div>

        {/* Action Cards */}
        <div className="flex flex-col md:flex-row gap-6 w-full max-w-2xl">
          
          {/* Register Button (Now First) */}
          <button 
            onClick={() => onNavigate('REGISTER')}
            className="flex-1 group relative p-[1px] rounded-3xl transition-all duration-300 hover:scale-[1.02]"
          >
             <div className="absolute inset-0 bg-gradient-to-br from-violet-500 to-fuchsia-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
            <div className="bg-slate-900/80 backdrop-blur-xl relative rounded-[23px] border border-white/10 p-8 h-full flex flex-col items-center gap-4 group-hover:bg-slate-900/90 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-violet-950/50 flex items-center justify-center group-hover:bg-violet-500/20 transition-colors">
                <Sparkles className="w-6 h-6 text-violet-400 group-hover:text-violet-200" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white font-scifi mb-1 group-hover:text-violet-300 transition-colors">Register</h3>
                <p className="text-xs text-slate-400 font-medium">Create a new account</p>
              </div>
            </div>
          </button>

          {/* Login Button (Now Second) */}
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="flex-1 group relative p-[1px] rounded-3xl transition-all duration-300 hover:scale-[1.02]"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-3xl opacity-0 group-hover:opacity-100 blur-md transition-opacity duration-500"></div>
            <div className="bg-slate-900/80 backdrop-blur-xl relative rounded-[23px] border border-white/10 p-8 h-full flex flex-col items-center gap-4 group-hover:bg-slate-900/90 transition-colors">
              <div className="w-12 h-12 rounded-2xl bg-cyan-950/50 flex items-center justify-center group-hover:bg-cyan-500/20 transition-colors">
                <LogIn className="w-6 h-6 text-cyan-400 group-hover:text-cyan-200" />
              </div>
              <div className="text-center">
                <h3 className="text-lg font-bold text-white font-scifi mb-1 group-hover:text-cyan-300 transition-colors">Login</h3>
                <p className="text-xs text-slate-400 font-medium">Access your dashboard</p>
              </div>
            </div>
          </button>

        </div>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-slate-600 text-[10px] font-medium tracking-wider uppercase flex items-center justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
            <BookOpen className="w-3 h-3" />
            Empowering Education
          </p>
        </div>
      </div>
    </div>
  );
};