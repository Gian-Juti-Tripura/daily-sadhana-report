import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Eye, EyeOff, Globe, Download, Lock, Mail, User, ChevronDown, Loader2 
} from 'lucide-react';
import { Capacitor } from '@capacitor/core';
import { supabase } from '../../supabase/supabaseClient';
import { 
  addRegisteredCounselee, 
  getRegisteredCounselees, 
  PRIMARY_COUNSELOR 
} from '../../data/counseleesData';
import type { CounseleeProfile } from '../../types/sadhana';
import { toast } from 'react-hot-toast';

interface DevoteeLoginScreenProps {
  onLoginSuccess: (devotee: CounseleeProfile) => void;
}

export const DevoteeLoginScreen: React.FC<DevoteeLoginScreenProps> = ({
  onLoginSuccess
}) => {
  const { language, toggleLanguage } = useLanguage();
  const isBn = language === 'bn';
  const { styles } = useTheme();

  const [mode, setMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // Form Fields
  const [email, setEmail] = useState(() => localStorage.getItem('voice_remembered_username') || '');
  const [password, setPassword] = useState(() => localStorage.getItem('voice_remembered_password') || '');
  const [fullName, setFullName] = useState('');
  const [counselor, setCounselor] = useState('Prabhupad');
  const [customCounselor, setCustomCounselor] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // Single Discreet Install Option (Only on web browser, never in APK or installed PWA)
  const [canInstall, setCanInstall] = useState(false);
  useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    if (!isStandalone) {
      setCanInstall(true);
    }
  }, []);

  const counselorOptions = [
    'Prabhupad',
    PRIMARY_COUNSELOR.name,
    'HG Raghav Kirtan Das',
    'HG Radheshyam Das',
    'Custom (অন্যান্য)'
  ];

  const handleInstallClick = () => {
    window.dispatchEvent(new CustomEvent('open_pwa_install_modal'));
  };

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!trimmedEmail) {
      toast.error(isBn ? 'দয়া করে ইমেইল লিখুন' : 'Please enter your email');
      return;
    }
    if (!cleanPassword) {
      toast.error(isBn ? 'দয়া করে পাসওয়ার্ড লিখুন' : 'Please enter your password');
      return;
    }

    setIsSubmitting(true);
    try {
      // 1. Attempt Supabase Auth Sign In
      let supaUser: any = null;
      let authErrorMessage: string | null = null;

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: trimmedEmail,
          password: cleanPassword
        });
        if (error) {
          authErrorMessage = error.message;
        } else if (data?.user) {
          supaUser = data.user;
        }
      } catch (err: any) {
        authErrorMessage = err.message || 'Network error';
      }

      // 2. Resolve or create profile
      const counselees = getRegisteredCounselees();
      let matchedDevotee = counselees.find(c => c.email && c.email.toLowerCase() === trimmedEmail);

      // Check Supabase members table if not found locally
      if (!matchedDevotee && supaUser) {
        try {
          const { data: member } = await supabase
            .from('members')
            .select('*')
            .or(`user_id.eq.${supaUser.id},email.ilike.${trimmedEmail}`)
            .maybeSingle();

          if (member) {
            matchedDevotee = addRegisteredCounselee({
              id: member.id || supaUser.id,
              name: member.full_name || supaUser.user_metadata?.full_name || trimmedEmail.split('@')[0],
              spiritualName: member.spiritual_name || '',
              phone: member.phone || '',
              email: member.email || trimmedEmail,
              counselorName: member.counselor_name || supaUser.user_metadata?.counselor || PRIMARY_COUNSELOR.name,
              scaleId: member.scale_id || 2,
              spiritualTitle: member.service_type || 'Bhakti Aspirant'
            });
          }
        } catch (e) {
          console.warn('Supabase members lookup notice:', e);
        }
      }

      // If user authenticated in Supabase but no devotee record exists yet, auto-create one
      if (supaUser && !matchedDevotee) {
        const resolvedName = supaUser.user_metadata?.full_name || trimmedEmail.split('@')[0];
        const resolvedCounselor = supaUser.user_metadata?.counselor || PRIMARY_COUNSELOR.name;
        matchedDevotee = addRegisteredCounselee({
          id: supaUser.id,
          name: resolvedName,
          email: trimmedEmail,
          counselorName: resolvedCounselor,
          scaleId: 2,
          spiritualTitle: 'Bhakti Aspirant'
        });
      }

      // Fallback: If offline and matched local profile with matching password
      if (!supaUser && matchedDevotee) {
        const savedPass = localStorage.getItem(`devotee_pass_${matchedDevotee.id}`);
        if (savedPass && savedPass !== cleanPassword) {
          toast.error(isBn ? 'ভুল পাসওয়ার্ড' : 'Invalid password');
          setIsSubmitting(false);
          return;
        }
      }

      // If neither Supabase nor local found
      if (!supaUser && !matchedDevotee) {
        if (authErrorMessage) {
          toast.error(
            authErrorMessage.includes('Invalid login credentials')
              ? (isBn ? 'ভুল ইমেইল বা পাসওয়ার্ড' : 'Invalid email or password')
              : authErrorMessage
          );
        } else {
          toast.error(isBn ? 'অ্যাকাউন্ট পাওয়া যায়নি। অনুগ্রহ করে সাইন আপ করুন।' : 'Account not found. Please sign up.');
        }
        setIsSubmitting(false);
        return;
      }

      // Login success
      const finalProfile: CounseleeProfile = matchedDevotee || addRegisteredCounselee({
        id: supaUser?.id || `devotee_${Date.now()}`,
        name: supaUser?.user_metadata?.full_name || trimmedEmail.split('@')[0],
        email: trimmedEmail,
        counselorName: supaUser?.user_metadata?.counselor || PRIMARY_COUNSELOR.name,
        scaleId: 2,
        spiritualTitle: 'Bhakti Aspirant'
      });

      // Save credentials if Remember Me is checked
      if (rememberMe) {
        localStorage.setItem('voice_remembered_username', trimmedEmail);
        localStorage.setItem('voice_remembered_password', cleanPassword);
      } else {
        localStorage.removeItem('voice_remembered_username');
        localStorage.removeItem('voice_remembered_password');
      }

      localStorage.setItem('voice_logged_in_user_id', finalProfile.id);
      localStorage.setItem('voice_active_devotee_id', finalProfile.id);
      localStorage.setItem(`devotee_pass_${finalProfile.id}`, cleanPassword);

      toast.success(
        isBn 
          ? `স্বাগতম ${finalProfile.name}! সফলভাবে লগইন হয়েছে` 
          : `Welcome ${finalProfile.name}! Signed in successfully`
      );

      onLoginSuccess(finalProfile);
    } catch (err: any) {
      console.error('Login error:', err);
      toast.error(err.message || (isBn ? 'লগইন ব্যর্থ হয়েছে' : 'Sign in failed'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = fullName.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanName) {
      toast.error(isBn ? 'দয়া করে আপনার নাম লিখুন' : 'Please enter your full name');
      return;
    }
    if (!trimmedEmail) {
      toast.error(isBn ? 'দয়া করে ইমেইল লিখুন' : 'Please enter your email');
      return;
    }
    if (cleanPassword.length < 6) {
      toast.error(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    const effectiveCounselor = counselor === 'Custom (অন্যান্য)' 
      ? (customCounselor.trim() || PRIMARY_COUNSELOR.name) 
      : counselor;

    setIsSubmitting(true);
    try {
      // 1. Supabase Auth Sign Up
      let supaUserId = `devotee_${Date.now()}`;
      try {
        const { data, error } = await supabase.auth.signUp({
          email: trimmedEmail,
          password: cleanPassword,
          options: {
            data: {
              full_name: cleanName,
              counselor: effectiveCounselor
            }
          }
        });
        if (error) {
          console.warn('Supabase sign up warning:', error.message);
        }
        if (data?.user) {
          supaUserId = data.user.id;
        }
      } catch (err) {
        console.warn('Supabase sign up offline notice:', err);
      }

      // 2. Create devotee profile
      const newProfile = addRegisteredCounselee({
        id: supaUserId,
        name: cleanName,
        email: trimmedEmail,
        counselorName: effectiveCounselor,
        scaleId: 2,
        spiritualTitle: 'Bhakti Aspirant',
        completedCourses: [],
        completedCamps: []
      });

      // 3. Save session
      localStorage.setItem('voice_logged_in_user_id', newProfile.id);
      localStorage.setItem('voice_active_devotee_id', newProfile.id);
      localStorage.setItem(`devotee_pass_${newProfile.id}`, cleanPassword);

      if (rememberMe) {
        localStorage.setItem('voice_remembered_username', trimmedEmail);
        localStorage.setItem('voice_remembered_password', cleanPassword);
      }

      toast.success(
        isBn
          ? `অভিনন্দন ${newProfile.name}! অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে`
          : `Congratulations ${newProfile.name}! Account created successfully`
      );

      onLoginSuccess(newProfile);
    } catch (err: any) {
      console.error('Sign up error:', err);
      toast.error(err.message || (isBn ? 'অ্যাকাউন্ট তৈরি ব্যর্থ হয়েছে' : 'Failed to create account'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      toast.error(isBn ? 'দয়া করে নিবন্ধিত ইমেইল লিখুন' : 'Please enter your registered email');
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail);
      if (error) {
        toast.error(error.message);
      } else {
        toast.success(
          isBn 
            ? 'পাসওয়ার্ড রিসেট লিংক আপনার ইমেইলে পাঠানো হয়েছে' 
            : 'Password reset link sent to your email'
        );
        setIsForgotPassword(false);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to send reset link');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-gradient-to-br from-amber-50/50 via-slate-50 to-orange-50/40 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-800 dark:text-slate-100 transition-colors relative overflow-hidden">
      
      {/* Subtle Background Devotional Glow */}
      <div 
        aria-hidden="true" 
        className="pointer-events-none fixed -top-24 left-1/2 -translate-x-1/2 w-[700px] h-[340px] rounded-full blur-[120px] opacity-35 dark:opacity-20 z-0 transition-all"
        style={{ background: styles.bannerGradient ? 'linear-gradient(to right, #f59e0b, #ea580c)' : '#f97316' }}
      />

      {/* Top Header Bar */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-4 py-4 sm:py-6 flex items-center justify-between">
        
        {/* Brand Logo & Title */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-600 p-0.5 shadow-md flex items-center justify-center overflow-hidden ring-2 ring-amber-400/40">
            <img
              src="/logo.png"
              alt="Sadhana Portal Logo"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
            />
          </div>
          <div>
            <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-tight">
              {isBn ? 'সাধনা পোর্টাল' : 'Sadhana Portal'}
            </h1>
            <p className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold leading-none mt-0.5">
              {isBn ? 'সারাদেশের সকল ভক্তদের জন্য' : 'Nationwide Sadhana Tracking'}
            </p>
          </div>
        </div>

        {/* Right Header Controls: Single Discreet Install Button + Language Toggle */}
        <div className="flex items-center gap-2">
          
          {/* Single Discreet Install Button (Shown on Web Browser Only) */}
          {canInstall && (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl border border-amber-300 dark:border-amber-700/70 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all shadow-sm flex items-center gap-1.5 text-xs font-bold cursor-pointer active:scale-95"
              title={isBn ? 'অ্যাপ ইনস্টল করুন' : 'Install App'}
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isBn ? 'অ্যাপ ইনস্টল' : 'Install App'}</span>
            </button>
          )}

          {/* Language Toggle */}
          <button
            onClick={toggleLanguage}
            className="p-1.5 px-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm flex items-center gap-1 cursor-pointer"
            title={isBn ? 'Switch to English' : 'বাংলায় দেখুন'}
          >
            <Globe className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
              {isBn ? 'EN' : 'বাং'}
            </span>
          </button>
        </div>
      </header>

      {/* Main Centered Login / Sign Up Card */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-4 sm:py-8">
        <div className="w-full max-w-[440px]">

          {/* Card Container */}
          <div className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl shadow-orange-950/10 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 backdrop-blur-xl">

            {/* Mode Switcher Tabs */}
            {!isForgotPassword && (
              <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className={`flex-1 pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                    mode === 'LOGIN'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                  }`}
                >
                  {isBn ? 'লগইন (Sign In)' : 'Sign In'}
                  {mode === 'LOGIN' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setMode('SIGNUP')}
                  className={`flex-1 pb-3 text-sm font-bold transition-all relative cursor-pointer ${
                    mode === 'SIGNUP'
                      ? 'text-orange-600 dark:text-orange-400'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                  }`}
                >
                  {isBn ? 'নতুন অ্যাকাউন্ট (Sign Up)' : 'Create Account'}
                  {mode === 'SIGNUP' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange-600 dark:bg-orange-400 rounded-full" />
                  )}
                </button>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                1. SIGN IN MODE
            ══════════════════════════════════════════════════════ */}
            {!isForgotPassword && mode === 'LOGIN' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                    {isBn ? 'পুনরায় স্বাগতম!' : 'Welcome Back'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {isBn 
                      ? 'আপনার দৈনিক সাধনা রিপোর্ট দেখতে বা এন্ট্রি দিতে লগইন করুন।' 
                      : 'Sign in to log and track your daily sadhana.'}
                  </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'ইমেইল' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-4 py-3 sm:py-3.5 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'পাসওয়ার্ড' : 'Password'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 sm:py-3.5 pl-10 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between pt-1">
                    <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 dark:text-slate-400 font-medium">
                      <input
                        type="checkbox"
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                        className="w-3.5 h-3.5 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 cursor-pointer"
                      />
                      <span>{isBn ? 'আমাকে মনে রাখুন' : 'Remember me'}</span>
                    </label>

                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(true)}
                      className="text-xs text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer"
                    >
                      {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                    </button>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isBn ? 'লগইন হচ্ছে...' : 'Signing in...'}</span>
                      </>
                    ) : (
                      <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
                    )}
                  </button>
                </form>

                {/* Footer Switch */}
                <div className="mt-6 text-center text-xs text-slate-500 dark:text-slate-400">
                  <span>{isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account yet? "}</span>
                  <button
                    type="button"
                    onClick={() => setMode('SIGNUP')}
                    className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create an Account'}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                2. SIGN UP MODE
            ══════════════════════════════════════════════════════ */}
            {!isForgotPassword && mode === 'SIGNUP' && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight">
                    {isBn ? 'নতুন অ্যাকাউন্ট খুলুন' : 'Create Account'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {isBn 
                      ? 'সারাদেশের যেকোনো স্থান থেকে সাধনা ট্র্যাকিংয়ে যুক্ত হোন।' 
                      : 'Join devotees nationwide to track your spiritual sadhana.'}
                  </p>
                </div>

                <form onSubmit={handleSignUp} className="space-y-3.5">
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'আপনার পুরো নাম' : 'Full Name'}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isBn ? 'যেমন: সনাতন দাস' : 'e.g. Sanatan Das'}
                        className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40 transition-all"
                      />
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'ইমেইল' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40 transition-all"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'Password (min. 6 characters)'}
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-3 pl-10 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40 transition-all"
                      />
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                        aria-label="Toggle password visibility"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Counselor Selection */}
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'কাউন্সেলর নির্বাচন' : 'Assigned Counselor'}
                    </label>
                    <div className="relative">
                      <select
                        value={counselor}
                        onChange={(e) => setCounselor(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-xs sm:text-sm font-semibold text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40 transition-all cursor-pointer pr-10"
                      >
                        {counselorOptions.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>

                    {counselor === 'Custom (অন্যান্য)' && (
                      <input
                        type="text"
                        required
                        value={customCounselor}
                        onChange={(e) => setCustomCounselor(e.target.value)}
                        placeholder={isBn ? 'কাউন্সেলরের নাম লিখুন' : 'Enter Counselor Name'}
                        className="w-full mt-2 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500"
                      />
                    )}
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full mt-2 py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>{isBn ? 'অ্যাকাউন্ট তৈরি হচ্ছে...' : 'Creating Account...'}</span>
                      </>
                    ) : (
                      <span>{isBn ? 'নিবন্ধন সম্পন্ন করুন' : 'Create Account'}</span>
                    )}
                  </button>
                </form>

                {/* Footer Switch */}
                <div className="mt-5 text-center text-xs text-slate-500 dark:text-slate-400">
                  <span>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
                  <button
                    type="button"
                    onClick={() => setMode('LOGIN')}
                    className="text-orange-600 dark:text-orange-400 font-bold hover:underline cursor-pointer ml-1"
                  >
                    {isBn ? 'এখানে লগইন করুন' : 'Sign in here'}
                  </button>
                </div>
              </div>
            )}

            {/* ══════════════════════════════════════════════════════
                3. FORGOT PASSWORD MODE
            ══════════════════════════════════════════════════════ */}
            {isForgotPassword && (
              <div>
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
                    {isBn 
                      ? 'আপনার অ্যাকাউন্টের ইমেইল লিখুন, আমরা পাসওয়ার্ড রিসেট লিংক পাঠাব।' 
                      : 'Enter your registered email to receive a password reset link.'}
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                      {isBn ? 'ইমেইল' : 'Email Address'}
                    </label>
                    <div className="relative">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="user@example.com"
                        className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-orange-500 focus:ring-4 focus:ring-orange-100 dark:focus:ring-orange-950/40"
                      />
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md transition-all cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>{isBn ? 'পাঠানো হচ্ছে...' : 'Sending...'}</span>
                      </>
                    ) : (
                      <span>{isBn ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                    )}
                  </button>

                  <div className="text-center pt-2">
                    <button
                      type="button"
                      onClick={() => setIsForgotPassword(false)}
                      className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
                    >
                      {isBn ? '← লগইনে ফিরে যান' : '← Back to Sign In'}
                    </button>
                  </div>
                </form>
              </div>
            )}

          </div>

        </div>
      </main>

      {/* Footer Note */}
      <footer className="relative z-10 w-full text-center py-4 text-xs text-slate-400 dark:text-slate-600 font-medium">
        <p>
          {isBn ? 'হরে কৃষ্ণ • শ্রীল প্রভুপাদ অমৃত বাণীর অনুসরণে' : 'Hare Krishna • Dedicated to Srila Prabhupada'}
        </p>
      </footer>

    </div>
  );
};
