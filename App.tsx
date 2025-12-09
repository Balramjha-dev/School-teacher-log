import React, { useState, useEffect } from 'react';
import { registerUserLocal, getUserByEmail } from './services/dataService';
import { User, Role } from './types';
import { TeacherView } from './components/TeacherView';
import { PrincipalView } from './components/PrincipalView';
import { LandingPage } from './components/LandingPage';
import { VerifyEmailScreen } from './components/VerifyEmailScreen';
import { Button } from './components/Button';
import { GraduationCap, ShieldCheck, Mail, Lock, User as UserIcon, ArrowRight, Upload, Camera, Users, Briefcase, KeyRound, CheckCircle } from 'lucide-react';
import { auth } from './services/firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<'LANDING' | 'LOGIN' | 'REGISTER' | 'VERIFY_EMAIL' | 'FORGOT_PASSWORD'>('LANDING');
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  
  // Login State
  const [loginRole, setLoginRole] = useState<Role>(Role.TEACHER);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');

  // Register State
  const [registerRole, setRegisterRole] = useState<Role>(Role.TEACHER);
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regError, setRegError] = useState('');
  const [regAvatar, setRegAvatar] = useState<string>('');

  // Forgot Password State
  const [resetEmail, setResetEmail] = useState('');
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Captcha State
  const [captchaQ, setCaptchaQ] = useState('');
  const [captchaA, setCaptchaA] = useState<number>(0);
  const [userCaptcha, setUserCaptcha] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  // Generate Captcha on View Change
  useEffect(() => {
    if (view === 'LOGIN' || view === 'REGISTER') {
      generateCaptcha();
      setLoginError('');
      setRegError('');
      setCaptchaError('');
      setUserCaptcha('');
    }
    if (view === 'FORGOT_PASSWORD') {
      setResetEmail(loginEmail); // Pre-fill email from login form
      setResetError('');
      setResetSuccess(false);
    }
  }, [view]);

  const generateCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const operators = ['+', '-', '*'];
    const operator = operators[Math.floor(Math.random() * operators.length)];
    
    let answer = 0;
    switch(operator) {
      case '+': answer = num1 + num2; break;
      case '-': answer = num1 - num2; break;
      case '*': answer = num1 * num2; break;
    }
    
    setCaptchaQ(`${num1} ${operator} ${num2}`);
    setCaptchaA(answer);
  };

  const switchView = (newView: 'LANDING' | 'LOGIN' | 'REGISTER' | 'VERIFY_EMAIL' | 'FORGOT_PASSWORD') => {
    setIsLoading(true);
    setTimeout(() => {
      setView(newView);
      setIsLoading(false);
    }, 1000);
  };

  // Handle Image Upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRegAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoginError('');
    setRegError('');
    setIsLoading(true);

    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Determine Role based on current view (Login tab selection or Register selection)
      const targetRole = view === 'REGISTER' ? registerRole : loginRole;

      // Check if user exists locally (in Supabase)
      let localUser = await getUserByEmail(user.email || '');

      if (!localUser) {
        // Create new local user from Google Profile
        localUser = await registerUserLocal({
          name: user.displayName || 'Google User',
          email: user.email || '',
          password: '', // Managed by Google
          role: targetRole,
          avatar: user.photoURL || ''
        });
      }

      // Simulate boot and log in
      setTimeout(() => {
        setCurrentUser(localUser);
        setIsLoading(false);
      }, 1500);

    } catch (error: any) {
      console.error("Google Sign In Error", error);
      setIsLoading(false);
      const msg = error.message || "Google Sign-In Failed";
      if (view === 'LOGIN') setLoginError(msg);
      else setRegError(msg);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setLoginSuccess('');

    if (parseInt(userCaptcha) !== captchaA) {
      setCaptchaError('Incorrect math answer. Please try again.');
      generateCaptcha();
      setUserCaptcha('');
      return;
    }
    
    try {
      // Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, loginEmail, loginPassword);
      
      // Check for Email Verification
      if (!userCredential.user.emailVerified) {
        await auth.signOut();
        setPendingEmail(loginEmail);
        switchView('VERIFY_EMAIL');
        return;
      }
      
      setIsLoading(true);

      // We need to fetch the User profile (role, name) to render the dashboard
      let user = await getUserByEmail(loginEmail);
      
      if (!user) {
         // Fallback if user registered via Firebase but local DB (Supabase) is empty for this user
         // We create a temporary session user profile
         user = await registerUserLocal({
            name: loginEmail.split('@')[0],
            role: loginRole, // Fallback to selected role
            email: loginEmail,
            password: '',
         });
      } else {
        // Enforce role check from UI against stored profile
        if (user.role !== loginRole) {
            setLoginError('Incorrect role selected for this account.');
            setIsLoading(false);
            // Sign out if role mismatch to be safe
            await auth.signOut();
            return;
        }
      }

      // Simulate system boot-up sequence
      setTimeout(() => {
        setCurrentUser(user);
        setIsLoading(false);
      }, 1500);

    } catch (error: any) {
        console.error("Login Error", error.code);
        generateCaptcha();
        setUserCaptcha('');
        if (error.code === 'auth/invalid-credential' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
            setLoginError('Password or Email Incorrect');
        } else {
            setLoginError(error.message || 'Login failed.');
        }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (parseInt(userCaptcha) !== captchaA) {
      setCaptchaError('Incorrect math answer. Please try again.');
      generateCaptcha();
      setUserCaptcha('');
      return;
    }

    try {
      // Firebase Registration
      const userCredential = await createUserWithEmailAndPassword(auth, regEmail, regPassword);

      // Send Verification Email
      await sendEmailVerification(userCredential.user);

      // Save user metadata to Supabase so the dashboard works when they eventually log in
      await registerUserLocal({
        name: regName,
        email: regEmail,
        password: '', // Don't save password locally
        role: registerRole,
        avatar: regAvatar
      });

      // Do NOT sign them in. Sign out immediately.
      await auth.signOut();

      // Redirect to Verify Screen
      setPendingEmail(regEmail);
      switchView('VERIFY_EMAIL');
      
    } catch (err: any) {
      generateCaptcha();
      setUserCaptcha('');
      console.error("Register Error", err.code);
      if (err.code === 'auth/email-already-in-use') {
          setRegError('User already exists. Sign in ?');
      } else {
          setRegError(err.message || 'Registration failed');
      }
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetError('');
    
    if (!resetEmail) {
      setResetError('Please enter your email address.');
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setResetSuccess(true);
    } catch (error: any) {
      console.error("Forgot Password Error", error);
      if (error.code === 'auth/user-not-found') {
        setResetError('No user found with this email address.');
      } else if (error.code === 'auth/invalid-email') {
        setResetError('Invalid email format.');
      } else {
        setResetError('Failed to send reset email. Try again.');
      }
    }
  };

  const handleLogout = () => {
    setIsLoading(true);
    setTimeout(() => {
      auth.signOut();
      setCurrentUser(null);
      setView('LANDING'); 
      setLoginEmail('');
      setLoginPassword('');
      setIsLoading(false);
    }, 1000);
  };

  const getRoleIcon = (role: Role) => {
    switch(role) {
      case Role.TEACHER: return <GraduationCap className="w-5 h-5" />;
      case Role.PRINCIPAL: return <ShieldCheck className="w-5 h-5" />;
      case Role.OFFICIAL: return <Briefcase className="w-5 h-5" />;
      case Role.OTHER: return <Users className="w-5 h-5" />;
    }
  };

  const getRoleColor = (role: Role) => {
    switch(role) {
      case Role.TEACHER: return 'emerald';
      case Role.PRINCIPAL: return 'orange';
      case Role.OFFICIAL: return 'green';
      case Role.OTHER: return 'amber';
    }
  };

  // Google Icon Component
  const GoogleIcon = () => (
    <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M23.52 12.29C23.52 11.43 23.44 10.6 23.3 9.8H12V14.51H18.47C18.18 15.99 17.34 17.25 16.08 18.1L19.95 21.1C22.2 19.01 23.52 15.92 23.52 12.29Z" fill="#4285F4"/>
      <path d="M12 24C15.24 24 17.96 22.92 19.95 21.09L16.08 18.09C15 18.81 13.62 19.25 12 19.25C8.87 19.25 6.22 17.14 5.28 14.29L1.27 17.39C3.25 21.32 7.31 24 12 24Z" fill="#34A853"/>
      <path d="M5.28 14.29C5.04 13.43 4.91 12.52 4.91 11.6C4.91 10.68 5.04 9.77 5.28 8.91L1.27 5.81C0.46 7.54 0 9.51 0 11.6C0 13.69 0.46 15.66 1.27 17.39L5.28 14.29Z" fill="#FBBC05"/>
      <path d="M12 3.95C13.76 3.95 15.34 4.56 16.58 5.75L20.04 2.29C17.96 0.35 15.24 0 12 0C7.31 0 3.25 2.68 1.27 6.61L5.28 9.71C6.22 6.86 8.87 3.95 12 3.95Z" fill="#EA4335"/>
    </svg>
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
        {/* System Boot Loader */}
        <div className="absolute inset-0 bg-scanline opacity-10 pointer-events-none"></div>
        <div className="text-center space-y-4 relative z-10">
          <div className="inline-block relative">
            <div className="absolute inset-0 bg-red-600 blur-xl opacity-20 animate-pulse"></div>
            <ShieldCheck className="w-16 h-16 text-red-600 animate-pulse mx-auto" />
          </div>
          <h2 className="text-2xl text-red-500 font-scifi tracking-[0.3em] uppercase animate-pulse">System Processing</h2>
          <div className="w-64 h-1 bg-red-900/30 mx-auto overflow-hidden rounded-full">
             <div className="h-full bg-red-600 w-1/2 animate-[spin_1s_linear_infinite_reverse]" style={{ width: '100%', transformOrigin: '0% 50%' }}></div>
          </div>
          <div className="font-mono text-[10px] text-red-500/70 space-y-1">
             <p>&gt;&gt; SECURE CONNECTION...</p>
             <p className="delay-100">&gt;&gt; REDIRECTING...</p>
          </div>
        </div>
      </div>
    );
  }

  if (currentUser) {
    return (
      <>
        {currentUser.role === Role.PRINCIPAL ? (
          <PrincipalView user={currentUser} onLogout={handleLogout} />
        ) : (
          <TeacherView user={currentUser} onLogout={handleLogout} />
        )}
      </>
    );
  }

  if (view === 'LANDING') {
    return <LandingPage onNavigate={switchView} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-black">
      {/* Deadly Background FX */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/10 via-black to-black"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[linear-gradient(rgba(220,38,38,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(220,38,38,0.05)_1px,transparent_1px)] bg-[size:2rem_2rem] opacity-20"></div>
      </div>

      {/* Main Container with Animated Gradient Border */}
      <div className="relative p-[3px] rounded-3xl animate-gradient shadow-2xl z-10 w-full max-w-lg my-8">
        
        <div className="bg-black/90 backdrop-blur-xl w-full rounded-[21px] overflow-hidden">
          
          {view === 'VERIFY_EMAIL' ? (
            <VerifyEmailScreen 
              email={pendingEmail} 
              onNavigateToLogin={() => switchView('LOGIN')} 
            />
          ) : view === 'FORGOT_PASSWORD' ? (
            /* FORGOT PASSWORD SCREEN */
            <div className="animate-in fade-in slide-in-from-right-8 duration-500 p-8">
               <button 
                  onClick={() => switchView('LOGIN')}
                  className="absolute top-4 left-4 text-red-500/50 hover:text-red-500 uppercase text-[10px] font-mono flex items-center gap-1"
              >
                &lt; BACK TO LOGIN
              </button>

              <div className="text-center mb-8 mt-4">
                <div className="w-16 h-16 bg-red-950/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                  <KeyRound className="w-8 h-8 text-red-500 animate-pulse" />
                </div>
                <h1 className="text-xl font-bold text-white mb-2 font-scifi uppercase text-shadow-red">
                  {resetSuccess ? 'Email Sent' : 'Reset Password'}
                </h1>
                <p className="text-xs text-red-400/60 font-mono">
                  {resetSuccess ? 'Check your inbox for instructions' : 'Enter your registered email address'}
                </p>
              </div>

              {resetSuccess ? (
                <div className="space-y-6">
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-xl flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                    <p className="text-emerald-400 text-xs leading-relaxed">
                      We sent you a password change link to <span className="font-bold text-white">{resetEmail}</span>.
                    </p>
                  </div>
                  <Button 
                    onClick={() => switchView('LOGIN')}
                    className="w-full bg-emerald-900/30 border-emerald-500/50 text-emerald-400 hover:bg-emerald-800/50 rounded-xl uppercase font-scifi"
                  >
                    Log In Now
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleForgotPassword} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Email Address</label>
                    <div className="relative group">
                      <Mail className="w-4 h-4 absolute left-3 top-3.5 text-red-900 group-focus-within:text-red-500 transition-colors" />
                      <input 
                        type="email" 
                        className="w-full pl-10 pr-4 py-3 bg-black border border-red-900/50 text-red-100 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-red-900/50 rounded-xl text-sm"
                        placeholder="user@school.edu"
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {resetError && (
                    <div className="p-3 bg-red-950/30 border border-red-500 text-red-500 text-xs text-center uppercase tracking-wide font-bold rounded-lg">
                      {resetError}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    className="w-full py-4 bg-red-900/20 border border-red-600 text-red-500 font-scifi uppercase hover:bg-red-600 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)] rounded-xl"
                  >
                    Get Reset Link
                  </button>
                </form>
              )}
            </div>
          ) : view === 'LOGIN' ? (
            /* LOGIN SCREEN */
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="p-8 pb-4 text-center border-b border-red-900/30 relative">
                <button 
                    onClick={() => switchView('LANDING')}
                    className="absolute top-4 left-4 text-red-500/50 hover:text-red-500 uppercase text-[10px] font-mono"
                >
                  &lt; BACK
                </button>
                <div className="w-16 h-16 bg-black rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-red-600/50 shadow-[0_0_20px_rgba(220,38,38,0.3)]">
                  <ShieldCheck className="w-8 h-8 text-red-500" />
                </div>
                <h1 className="text-2xl font-bold text-white mb-2 font-scifi tracking-widest text-shadow-red">LOGIN</h1>
              </div>

              {/* Role Tabs for Login */}
              <div className="flex border-b border-slate-800 bg-black/50 overflow-x-auto">
                 {Object.values(Role).map((role) => (
                   <button 
                      key={role}
                      onClick={() => setLoginRole(role)}
                      className={`flex-1 py-3 px-2 text-[10px] font-bold uppercase tracking-wider transition-all border-b-2 flex flex-col items-center gap-1 ${loginRole === role ? `text-${getRoleColor(role)}-400 border-${getRoleColor(role)}-500 bg-${getRoleColor(role)}-900/10` : 'text-slate-600 border-transparent hover:text-slate-400'}`}
                   >
                     {getRoleIcon(role)}
                     {role}
                   </button>
                 ))}
              </div>
              
              <div className="p-8 pt-6">
                {loginSuccess && (
                  <div className="mb-6 p-3 bg-green-950/30 border border-green-500/30 text-green-400 text-xs text-center uppercase tracking-wide rounded-lg">
                    {loginSuccess}
                  </div>
                )}

                <div className="space-y-4">
                  {/* Google Sign In Button */}
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 bg-white text-slate-900 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg"
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>

                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-red-900/30"></div>
                    <span className="flex-shrink-0 mx-4 text-red-900/50 text-[10px] uppercase font-mono">Or Login with Email</span>
                    <div className="flex-grow border-t border-red-900/30"></div>
                  </div>

                  <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Email</label>
                      <div className="relative group">
                        <Mail className="w-4 h-4 absolute left-3 top-3.5 text-red-900 group-focus-within:text-red-500 transition-colors" />
                        <input 
                          type="email" 
                          className="w-full pl-10 pr-4 py-3 bg-black border border-red-900/50 text-red-100 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-red-900/50 rounded-xl text-sm"
                          placeholder="user@school.edu"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Password</label>
                      <div className="relative group">
                        <Lock className="w-4 h-4 absolute left-3 top-3.5 text-red-900 group-focus-within:text-red-500 transition-colors" />
                        <input 
                          type="password" 
                          className="w-full pl-10 pr-4 py-3 bg-black border border-red-900/50 text-red-100 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-red-900/50 rounded-xl text-sm"
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          required
                        />
                      </div>
                      {/* Forgot Password Link */}
                      <div className="flex justify-end mt-1">
                        <button 
                          type="button" 
                          onClick={() => switchView('FORGOT_PASSWORD')}
                          className="text-[10px] text-red-500 hover:text-red-300 font-mono uppercase tracking-wide"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    {/* Math Captcha */}
                    <div>
                      <label className="block text-xs font-bold text-red-500 uppercase tracking-wider mb-2">Security Check</label>
                      <div className="flex gap-4">
                        <div className="flex-none w-24 flex items-center justify-center bg-red-900/20 border border-red-900/50 rounded-xl font-mono text-red-400 font-bold tracking-widest">
                           {captchaQ} = ?
                        </div>
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-3 bg-black border border-red-900/50 text-red-100 focus:ring-1 focus:ring-red-600 focus:border-red-600 outline-none transition-all placeholder:text-red-900/50 rounded-xl text-sm"
                          placeholder="Answer"
                          value={userCaptcha}
                          onChange={(e) => setUserCaptcha(e.target.value)}
                          required
                        />
                      </div>
                      {captchaError && <p className="text-red-500 text-[10px] mt-1 uppercase font-bold">{captchaError}</p>}
                    </div>

                    {loginError && (
                      <div className="p-3 bg-red-950/30 border border-red-500 text-red-500 text-xs text-center uppercase tracking-wide font-bold rounded-lg">
                        {loginError}
                      </div>
                    )}

                    <button type="submit" className="w-full py-4 bg-red-900/20 border border-red-600 text-red-500 font-scifi uppercase hover:bg-red-600 hover:text-black transition-all duration-300 shadow-[0_0_20px_rgba(220,38,38,0.2)] rounded-xl mt-4">
                      Login
                    </button>
                  </form>
                </div>

                <div className="mt-6 text-center">
                  <p className="text-xs text-red-900/70">
                    NO ACCOUNT?{' '}
                    <button onClick={() => switchView('REGISTER')} className="text-red-500 font-bold hover:text-red-400 hover:underline uppercase">
                      Register New Account
                    </button>
                  </p>
                </div>
              </div>
            </div>
          ) : (
            /* REGISTER SCREEN */
            <div className="animate-in fade-in slide-in-from-right-8 duration-500">
              <div className="p-6 pb-2 relative border-b border-emerald-900/30">
                <button 
                    onClick={() => switchView('LANDING')}
                    className="absolute top-4 left-4 text-emerald-500/50 hover:text-emerald-500 uppercase text-[10px] font-mono"
                >
                  &lt; BACK
                </button>
                <div className="text-center mb-6 mt-2">
                  <h1 className="text-xl font-bold text-white mb-1 font-scifi uppercase text-shadow-cyan">
                    New Registration
                  </h1>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {Object.values(Role).map((role) => (
                    <button 
                      key={role}
                      onClick={() => setRegisterRole(role)}
                      className={`p-2 border transition-all duration-300 rounded-xl flex flex-col items-center gap-1 ${
                        registerRole === role 
                        ? `bg-${getRoleColor(role)}-950/40 border-${getRoleColor(role)}-500 shadow-[0_0_10px_rgba(255,255,255,0.1)]` 
                        : 'bg-transparent border-slate-800 hover:border-slate-600'
                      }`}
                    >
                      <div className={registerRole === role ? `text-${getRoleColor(role)}-400` : 'text-slate-600'}>
                         {getRoleIcon(role)}
                      </div>
                      <span className={`text-[9px] font-bold uppercase tracking-wider ${registerRole === role ? 'text-white' : 'text-slate-600'}`}>
                        {role}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
              
              <div className="p-6 pt-4">
                <div className="space-y-3">
                   {/* Google Register Button */}
                   <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    className="w-full py-3 bg-white text-slate-900 font-bold uppercase tracking-wider rounded-xl hover:bg-slate-200 transition-colors flex items-center justify-center shadow-lg"
                  >
                    <GoogleIcon />
                    Sign up with Google
                  </button>

                  <div className="relative flex py-1 items-center">
                    <div className="flex-grow border-t border-emerald-900/30"></div>
                    <span className="flex-shrink-0 mx-4 text-emerald-900/50 text-[10px] uppercase font-mono">Or Register with Email</span>
                    <div className="flex-grow border-t border-emerald-900/30"></div>
                  </div>

                  <form onSubmit={handleRegister} className="space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Profile Photo</label>
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 border border-dashed border-slate-700 bg-black flex items-center justify-center overflow-hidden relative rounded-xl flex-shrink-0">
                          {regAvatar ? (
                            <img src={regAvatar} alt="Preview" className="w-full h-full object-cover" />
                          ) : (
                            <Camera className="w-5 h-5 text-slate-700" />
                          )}
                        </div>
                        <label className="flex-1 cursor-pointer">
                            <div className="w-full px-3 py-3 bg-slate-900 border border-slate-700 text-slate-400 text-[10px] uppercase hover:bg-slate-800 hover:text-white transition-colors flex items-center justify-center gap-2 rounded-xl">
                              <Upload className="w-3 h-3" /> Upload
                            </div>
                            <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Full Name</label>
                      <div className="relative group">
                        <UserIcon className="w-3 h-3 absolute left-3 top-3.5 text-slate-600" />
                        <input 
                          type="text" 
                          className="w-full pl-9 pr-4 py-2.5 bg-black border border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 rounded-xl text-xs"
                          placeholder="Full Name"
                          value={regName}
                          onChange={(e) => setRegName(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Email</label>
                      <div className="relative group">
                        <Mail className="w-3 h-3 absolute left-3 top-3.5 text-slate-600" />
                        <input 
                          type="email" 
                          className="w-full pl-9 pr-4 py-2.5 bg-black border border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 rounded-xl text-xs"
                          placeholder="email@school.edu"
                          value={regEmail}
                          onChange={(e) => setRegEmail(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
                      <div className="relative group">
                        <Lock className="w-3 h-3 absolute left-3 top-3.5 text-slate-600" />
                        <input 
                          type="password" 
                          className="w-full pl-9 pr-4 py-2.5 bg-black border border-slate-800 text-slate-200 focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all placeholder:text-slate-700 rounded-xl text-xs"
                          placeholder="Password"
                          value={regPassword}
                          onChange={(e) => setRegPassword(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Math Captcha */}
                    <div>
                      <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-wider mb-1">Security Check</label>
                      <div className="flex gap-3">
                        <div className="flex-none w-20 flex items-center justify-center bg-emerald-900/20 border border-emerald-900/50 rounded-xl font-mono text-emerald-400 font-bold tracking-widest text-xs">
                          {captchaQ} = ?
                        </div>
                        <input 
                          type="text" 
                          className="flex-1 px-4 py-2.5 bg-black border border-emerald-900/50 text-emerald-100 focus:ring-1 focus:ring-emerald-600 focus:border-emerald-600 outline-none transition-all placeholder:text-emerald-900/50 rounded-xl text-xs"
                          placeholder="Answer"
                          value={userCaptcha}
                          onChange={(e) => setUserCaptcha(e.target.value)}
                          required
                        />
                      </div>
                      {captchaError && <p className="text-red-500 text-[9px] mt-1 uppercase font-bold">{captchaError}</p>}
                    </div>

                    {regError && <p className="text-red-400 text-xs text-center bg-red-950/30 p-2 border border-red-500/30 rounded-lg">{regError}</p>}

                    <Button 
                      type="submit" 
                      className={`w-full mt-2 py-3 rounded-xl uppercase font-scifi ${
                          registerRole === Role.PRINCIPAL ? 'bg-orange-900/20 border-orange-500 text-orange-400' : 'bg-emerald-900/20 border-emerald-500 text-emerald-400'
                      }`}
                      variant="outline"
                    >
                      Register <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </form>
                </div>

                <div className="mt-4 text-center">
                  <p className="text-xs text-slate-600">
                    ALREADY REGISTERED?{' '}
                    <button 
                      onClick={() => switchView('LOGIN')} 
                      className="text-emerald-500 font-bold hover:underline uppercase"
                    >
                      Login
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default App;