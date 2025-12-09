import React, { useState, useEffect } from 'react';
import { User, Role } from '../types';
import { Button } from './Button';
import { X, Save, User as UserIcon, BookOpen, Clock, Users, FileSignature, Upload, Camera } from 'lucide-react';
import { updateUser } from '../services/dataService';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, user, onUpdate }) => {
  const [formData, setFormData] = useState({
    avatar: '',
    subjects: '',
    classes: '',
    experience: 0,
    bio: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({
        avatar: user.avatar || '',
        subjects: user.subjects || '',
        classes: user.classes || '',
        experience: user.experience || 0,
        bio: user.bio || ''
      });
    }
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, avatar: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const updatedUser: User = {
      ...user,
      ...formData
    };
    await updateUser(updatedUser);
    onUpdate(updatedUser);
    setIsSaving(false);
    onClose();
  };

  const isTeacher = user.role === Role.TEACHER || user.role === Role.OFFICIAL || user.role === Role.OTHER;
  // Fuchsia for Teacher, Rose for Principal
  const themeColor = isTeacher ? 'text-fuchsia-500' : 'text-rose-500';

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={onClose}></div>

      {/* Animated Border Container */}
      <div className="relative w-full max-w-lg p-[3px] rounded-3xl animate-gradient z-50">
        {/* Modal Content */}
        <div className={`bg-slate-950 w-full h-full rounded-[21px] animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col`}>
          
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-slate-800 bg-black/60">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-xl bg-slate-900`}>
                <FileSignature className={`w-5 h-5 ${themeColor}`} />
              </div>
              <div>
                  <h2 className="text-lg font-bold text-white font-scifi uppercase">Profile Settings</h2>
                  <p className="text-[10px] text-slate-500 font-mono uppercase">Edit Details</p>
              </div>
            </div>
            <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors p-2 hover:bg-slate-800 rounded-full">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            <div className="flex items-center gap-6 mb-8 p-4 bg-slate-900/50 border border-slate-800 rounded-2xl relative group-avatar">
                <div className="relative group cursor-pointer">
                    <div className={`w-20 h-20 rounded-full border-2 border-slate-800 overflow-hidden bg-black flex items-center justify-center shadow-lg transition-transform group-hover:scale-105`}>
                      {formData.avatar ? (
                        <img src={formData.avatar} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        <span className={`text-3xl font-bold font-scifi ${themeColor}`}>{user.name.charAt(0)}</span>
                      )}
                    </div>
                    {/* Overlay for upload hint */}
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                        <Camera className="w-6 h-6 text-white" />
                    </div>
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" title="Change Photo" />
                </div>
                
                <div>
                  <h3 className="text-lg font-bold text-white uppercase">{user.name}</h3>
                  <p className="text-xs text-slate-500 font-mono uppercase mb-2">{user.role} // ID: {user.id.slice(0, 8)}</p>
                  <label className={`text-[10px] font-mono uppercase cursor-pointer flex items-center gap-1 hover:text-white transition-colors ${themeColor.replace('text-', 'text-opacity-80 text-')}`}>
                      <Upload className="w-3 h-3" /> Change Photo
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  </label>
                </div>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <BookOpen className="w-3 h-3 inline mr-1" /> Subject(s) Taught
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-black border border-slate-700 text-slate-300 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-xs font-mono rounded-xl"
                      placeholder="e.g. Physics, Math"
                      value={formData.subjects}
                      onChange={e => setFormData({...formData, subjects: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      <Users className="w-3 h-3 inline mr-1" /> Class(es) Taught
                    </label>
                    <input 
                      type="text" 
                      className="w-full p-3 bg-black border border-slate-700 text-slate-300 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-xs font-mono rounded-xl"
                      placeholder="e.g. 10A, 12B"
                      value={formData.classes}
                      onChange={e => setFormData({...formData, classes: e.target.value})}
                    />
                </div>
              </div>

              <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    <Clock className="w-3 h-3 inline mr-1" /> Years of Service
                  </label>
                  <input 
                    type="number" 
                    className="w-full p-3 bg-black border border-slate-700 text-slate-300 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-xs font-mono rounded-xl"
                    placeholder="0"
                    value={formData.experience}
                    onChange={e => setFormData({...formData, experience: parseInt(e.target.value) || 0})}
                  />
              </div>

              <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                    Additional Bio / Notes
                  </label>
                  <textarea 
                    className="w-full p-3 bg-black border border-slate-700 text-slate-300 focus:border-white focus:ring-1 focus:ring-white/20 outline-none text-xs font-mono resize-none h-24 rounded-xl"
                    placeholder="Enter details..."
                    value={formData.bio}
                    onChange={e => setFormData({...formData, bio: e.target.value})}
                  />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <Button type="submit" isLoading={isSaving} className="w-full shadow-lg" variant={isTeacher ? 'primary' : 'secondary'}>
                <Save className="w-4 h-4 mr-2" /> Save Changes
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};