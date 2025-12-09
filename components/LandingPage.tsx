import React from 'react';
import { ShieldAlert, Fingerprint, Cpu, AlertTriangle } from 'lucide-react';

interface LandingPageProps {
  onNavigate: (view: 'LOGIN' | 'REGISTER') => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black flex flex-col relative overflow-hidden">
      {/* Background Video/Effect */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-black to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-scanline opacity-20 z-10 pointer-events-none"></div>
        {/* Animated Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(220,38,38,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.1)_1px,transparent_1px)] bg-[size:40px_40px] opacity-20 perspective-[500px] transform-gpu"></div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center relative z-20 p-6">
        
        {/* Logo / Warning */}
        <div className="mb-12 text-center relative group">
          <div className="absolute -inset-4 bg-red-600/20 blur-xl rounded-full group-hover:bg-red-600/30 transition-all duration-500 animate-pulse"></div>
          <ShieldAlert className="w-24 h-24 text-red-600 mx-auto mb-4 animate-glitch" />
          <h1 className="text-5xl md:text-7xl font-bold text-white font-scifi tracking-[0.2em] mb-2 drop-shadow-[0_0_10px_rgba(220,38,38,0.8)]">
            EDULOG SYSTEM
          </h1>
          <p className="text-red-400 font-mono text-xs md:text-sm uppercase tracking-[0.5em] animate-pulse">
            School Management System
          </p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col md:flex-row gap-8 w-full max-w-2xl">
          
          <button 
            onClick={() => onNavigate('LOGIN')}
            className="flex-1 group relative p-[2px] rounded-3xl hover:scale-105 transition-transform duration-300"
          >
            <div className="absolute inset-0 bg-red-900/50 rounded-3xl blur opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-black relative rounded-[22px] border border-red-900/50 p-8 h-full flex flex-col items-center gap-4 group-hover:border-red-500 transition-colors">
              <Fingerprint className="w-10 h-10 text-red-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-center">
                <h3 className="text-xl font-bold text-white font-scifi uppercase mb-1">Login</h3>
                <p className="text-[10px] text-red-400/70 font-mono uppercase">Access Dashboard</p>
              </div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('REGISTER')}
            className="flex-1 group relative p-[2px] rounded-3xl hover:scale-105 transition-transform duration-300"
          >
            <div className="absolute inset-0 bg-cyan-900/50 rounded-3xl blur opacity-20 group-hover:opacity-100 transition-opacity"></div>
            <div className="bg-black relative rounded-[22px] border border-cyan-900/50 p-8 h-full flex flex-col items-center gap-4 group-hover:border-cyan-500 transition-colors">
              <Cpu className="w-10 h-10 text-cyan-500 group-hover:scale-110 transition-transform duration-300" />
              <div className="text-center">
                <h3 className="text-xl font-bold text-white font-scifi uppercase mb-1">Register</h3>
                <p className="text-[10px] text-cyan-400/70 font-mono uppercase">Create Account</p>
              </div>
            </div>
          </button>

        </div>

        {/* Footer Warning */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <div className="flex items-center justify-center gap-2 text-red-600/60 font-mono text-[10px] uppercase blink">
            <AlertTriangle className="w-3 h-3" />
            <span>Authorized Personnel Only</span>
            <AlertTriangle className="w-3 h-3" />
          </div>
        </div>
      </div>
    </div>
  );
};