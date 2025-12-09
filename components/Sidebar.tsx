import React from 'react';
import { User, Role } from '../types';
import { LogOut, Home, Calendar, Settings, FileText, X, User as UserIcon, Shield } from 'lucide-react';
import { Button } from './Button';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onLogout: () => void;
  onOpenProfile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose, user, onLogout, onOpenProfile }) => {
  const isTeacher = user.role === Role.TEACHER || user.role === Role.OFFICIAL || user.role === Role.OTHER;
  // Emerald for Teacher/Staff, Orange for Principal
  const themeColor = isTeacher ? 'text-emerald-500' : 'text-orange-500';
  const borderColor = isTeacher ? 'border-emerald-500/30' : 'border-orange-500/30';
  const hoverBg = isTeacher ? 'hover:bg-emerald-900/20' : 'hover:bg-orange-900/20';

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/80 backdrop-blur-sm z-[90] transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />

      {/* Sidebar Panel */}
      <div 
        className={`fixed top-0 left-0 h-[100dvh] w-80 max-w-[85vw] bg-slate-950 border-r ${borderColor} z-[100] transform transition-transform duration-300 ease-out shadow-[20px_0_50px_rgba(0,0,0,0.5)] flex flex-col rounded-r-3xl ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Header with Close Button */}
        <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-black/40 flex-shrink-0 rounded-tr-3xl">
          <div className="flex items-center gap-2">
             {isTeacher ? <UserIcon className="w-5 h-5 text-emerald-500" /> : <Shield className="w-5 h-5 text-orange-500" />}
             <div>
               <h2 className={`text-lg font-bold font-scifi uppercase ${themeColor}`}>Main Menu</h2>
               <p className="text-[10px] text-slate-500 font-mono tracking-widest">Navigation</p>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-slate-500 hover:text-red-500 transition-colors p-2 hover:bg-red-950/20 rounded-full"
            aria-label="Close Sidebar"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Navigation Options - Pushed to top, Footer pushed to bottom */}
        <div className="flex-1 overflow-y-auto py-6 px-4 space-y-2">
          {[
            { icon: Home, label: 'Dashboard' },
            { icon: Calendar, label: 'Timetable' },
            { icon: FileText, label: 'Activity Logs' },
            { icon: Settings, label: 'Settings' },
          ].map((item, idx) => (
            <button 
              key={idx}
              className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all duration-200 group border border-transparent hover:border-slate-800 ${hoverBg}`}
            >
              <item.icon className={`w-5 h-5 text-slate-400 group-hover:${isTeacher ? 'text-emerald-400' : 'text-orange-400'} transition-colors`} />
              <span className="font-scifi text-sm uppercase tracking-wider text-slate-300 group-hover:text-white">{item.label}</span>
            </button>
          ))}
        </div>

        {/* Footer Area: Profile & Logout */}
        <div className="p-4 bg-black/60 border-t border-slate-800 space-y-4 flex-shrink-0 rounded-br-3xl">
          
          {/* Clickable Profile Card */}
          <div 
            onClick={onOpenProfile}
            className={`group flex items-center gap-4 p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer transition-all hover:border-slate-600 ${isTeacher ? 'hover:shadow-[0_0_15px_rgba(16,185,129,0.15)]' : 'hover:shadow-[0_0_15px_rgba(249,115,22,0.15)]'}`}
          >
            {/* Avatar */}
            <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${borderColor} bg-black flex items-center justify-center relative flex-shrink-0`}>
               {user.avatar ? (
                 <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
               ) : (
                 <span className={`font-scifi font-bold text-lg ${themeColor}`}>{user.name.charAt(0)}</span>
               )}
               {/* Edit indicator on hover */}
               <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                 <Settings className="w-4 h-4 text-white" />
               </div>
            </div>
            
            {/* User Details */}
            <div className="flex-1 min-w-0">
               <p className="text-sm font-bold text-white truncate group-hover:text-emerald-200 transition-colors">{user.name}</p>
               <p className="text-[10px] text-slate-500 truncate font-mono uppercase tracking-wider">Edit Profile</p>
            </div>
          </div>
          
          {/* Logout Button */}
          <Button 
            variant="danger" 
            className="w-full justify-center py-4 border-t-2 border-red-900/50 rounded-xl" 
            onClick={onLogout}
          >
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </div>
      </div>
    </>
  );
};