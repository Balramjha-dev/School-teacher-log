import React from 'react';
import { Mail, ArrowRight } from 'lucide-react';
import { Button } from './Button';

interface VerifyEmailScreenProps {
  email: string;
  onNavigateToLogin: () => void;
}

export const VerifyEmailScreen: React.FC<VerifyEmailScreenProps> = ({ email, onNavigateToLogin }) => {
  return (
    <div className="animate-in fade-in zoom-in duration-500 p-8 text-center">
      <div className="w-16 h-16 bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
        <Mail className="w-8 h-8 text-emerald-400 animate-pulse" />
      </div>
      <h2 className="text-xl font-bold text-white mb-4 font-scifi uppercase">Verify Email</h2>
      <p className="text-slate-400 text-sm mb-8 leading-relaxed">
        We have sent you a verification email to <br/>
        <span className="text-emerald-400 font-bold">{email}</span>.
        <br/><br/>
        Verify it and log in.
      </p>
      
      <Button 
        onClick={onNavigateToLogin}
        className="w-full bg-emerald-900/30 border-emerald-500/50 text-emerald-400 hover:bg-emerald-800/50 rounded-xl uppercase font-scifi"
      >
        Login <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );
};
