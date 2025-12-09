import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  isLoading = false,
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none rounded-xl tracking-wider uppercase font-scifi";
  
  const variants = {
    primary: "bg-cyan-950/50 text-cyan-400 border border-cyan-500/50 hover:bg-cyan-900/50 hover:text-cyan-200 hover:shadow-[0_0_15px_rgba(6,182,212,0.5)] active:scale-95",
    secondary: "bg-slate-800/50 text-slate-300 border border-slate-600 hover:bg-slate-700 hover:border-slate-400 hover:text-white",
    danger: "bg-red-950/50 text-red-400 border border-red-500/50 hover:bg-red-900/50 hover:text-red-200 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]",
    success: "bg-green-950/50 text-green-400 border border-green-500/50 hover:bg-green-900/50 hover:text-green-200 hover:shadow-[0_0_15px_rgba(34,197,94,0.5)]",
    outline: "bg-transparent text-cyan-400 border border-cyan-500/30 hover:bg-cyan-950/30 hover:border-cyan-400"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-xs",
    lg: "px-8 py-3.5 text-sm"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className} ${disabled || isLoading ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      ) : null}
      {children}
    </button>
  );
};