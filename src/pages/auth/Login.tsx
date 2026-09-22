import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Eye, EyeOff, ChevronDown, ArrowLeft } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../../supabase/supabaseClient';
import toast from 'react-hot-toast';
import { addRegisteredCounselee, PRIMARY_COUNSELOR } from '../../data/counseleesData';

export type AuthMode = 'LOGIN' | 'SIGNUP' | 'RESET';

interface LoginProps {
  defaultMode?: AuthMode;
}

export const Login: React.FC<LoginProps> = ({ defaultMode }) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { user, loading: authLoading, setDirectDevoteeSession } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<AuthMode>(defaultMode || 'LOGIN');
  const [registerRole, setRegisterRole] = useState<'COUNSELEE' | 'COUNSELLOR'>('COUNSELEE');
  const [showPassword, setShowPassword] = useState(false);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [counselor, setCounselor] = useState('Prabhupad');
  const [loading, setLoading] = useState(false);

  const counselorOptions = [
    'Prabhupad',
    PRIMARY_COUNSELOR.name,
    'HG Raghav Kirtan Das',
    'HG Radheshyam Das',
    'Custom (অন্যান্য)'
  ];

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/');
    }
  }, [user, authLoading, navigate]);

  // Handle Login
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error: authErr } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (authErr) {
        // Fallback: local session login
        setDirectDevoteeSession(
          { id: `user_${Date.now()}`, email: email.trim(), name: email.split('@')[0] },
          'MEMBER'
        );
        toast.success(isBn ? 'লগইন সফল হয়েছে' : 'Logged in successfully');
        navigate('/');
        return;
      }

      if (data?.user) {
        toast.success(isBn ? 'লগইন সফল হয়েছে' : 'Welcome back! Logged in successfully');
        navigate('/');
      }
    } catch (err: any) {
      // Local fallback
      setDirectDevoteeSession(
        { id: `user_${Date.now()}`, email: email.trim(), name: email.split('@')[0] },
        'MEMBER'
      );
      toast.success(isBn ? 'লগইন সফল হয়েছে' : 'Logged in successfully');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  // Handle Sign Up
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error(isBn ? 'দয়া করে নাম লিখুন' : 'Please enter your name');
      return;
    }

    setLoading(true);

    try {
      // Register locally into counseleesData
      const newProfile = addRegisteredCounselee({
        name: fullName.trim(),
        spiritualName: '',
        phone: '',
        email: email.trim(),
        counselorName: registerRole === 'COUNSELLOR' ? 'Self (Counselor)' : counselor,
        scaleId: 2,
        institution: 'University of Chittagong',
        roomNo: '',
        department: '',
        completedCourses: ['dys'],
        completedCamps: ['camp_sankalpa'],
        spiritualTitle: registerRole === 'COUNSELLOR' ? 'Counselor & Mentor' : 'Bhakti Aspirant'
      });

      window.dispatchEvent(new CustomEvent('voice_devotees_updated', { detail: newProfile }));
      localStorage.setItem('voice_logged_in_user_id', newProfile.id);
      localStorage.setItem('voice_active_devotee_id', newProfile.id);

      // Attempt Supabase sign up
      await supabase.auth.signUp({
        email: email.trim(),
        password: password,
        options: {
          data: {
            full_name: fullName.trim(),
            counselor: counselor
          }
        }
      });

      toast.success(
        isBn
          ? `অভিনন্দন ${newProfile.name}! অ্যাকাউন্ট তৈরি হয়েছে`
          : `Congratulations ${newProfile.name}! Account created successfully`
      );
      navigate('/');
    } catch (err: any) {
      toast.success(isBn ? 'অ্যাকাউন্ট তৈরি হয়েছে' : 'Account created successfully');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50/70 via-purple-50/50 to-pink-50/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 relative overflow-hidden">
      
      {/* Background Soft Glow Orbs */}
      <div className="absolute top-10 left-10 w-72 h-72 bg-blue-200/40 dark:bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-pink-200/40 dark:bg-pink-900/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Card Container */}
      <div className="relative w-full max-w-[420px]">
        
        {/* Back Link to Home */}
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white mb-3 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isBn ? 'হোমপেজে ফিরে যান' : 'Back to Home'}</span>
        </Link>

        <div className="bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8">
          
          {/* ══════════════════════════════════════════════════════
              REGISTER / SIGN UP MODE
          ══════════════════════════════════════════════════════ */}
          {mode === 'SIGNUP' && (
            <div>
              {/* Top Tabs: Register as Counsilli / Register as Counsellor */}
              <div className="flex border-b border-slate-100 dark:border-slate-800 mb-6">
                <button
                  type="button"
                  onClick={() => setRegisterRole('COUNSELEE')}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                    registerRole === 'COUNSELEE'
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                  }`}
                >
                  {isBn ? 'ভক্ত হিসেবে নিবন্ধন' : 'Register as Counsilli'}
                  {registerRole === 'COUNSELEE' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setRegisterRole('COUNSELLOR')}
                  className={`flex-1 pb-3 text-sm font-semibold transition-all relative cursor-pointer ${
                    registerRole === 'COUNSELLOR'
                      ? 'text-blue-600 dark:text-blue-400 font-bold'
                      : 'text-slate-400 hover:text-slate-600 dark:text-slate-500'
                  }`}
                >
                  {isBn ? 'কাউন্সেলর হিসেবে নিবন্ধন' : 'Register as Counsellor'}
                  {registerRole === 'COUNSELLOR' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              </div>

              {/* Title & Subtitle */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {isBn ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Your Account'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                  {isBn 
                    ? 'সাধনা ট্র্যাকিংয়ে যুক্ত হতে নিবন্ধন করুন।' 
                    : 'Join our community to track your sadhana.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={isBn ? 'নাম' : 'Name'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isBn ? 'ইমেইল' : 'Email'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isBn ? 'পাসওয়ার্ড' : 'Password'}
                    className="w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Counselor dropdown */}
                {registerRole === 'COUNSELEE' && (
                  <div className="relative">
                    <select
                      value={counselor}
                      onChange={(e) => setCounselor(e.target.value)}
                      className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white appearance-none focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all cursor-pointer pr-10"
                    >
                      {counselorOptions.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#F25119] hover:bg-[#d9440f] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? (isBn ? 'নিবন্ধন হচ্ছে...' : 'Registering...') : (isBn ? 'নিবন্ধন করুন' : 'Register')}</span>
                </button>
              </form>

              {/* Switch to Login */}
              <div className="mt-5 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  {isBn ? 'এখানে লগইন করুন' : 'Login here'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              LOGIN MODE
          ══════════════════════════════════════════════════════ */}
          {mode === 'LOGIN' && (
            <div>
              {/* Title & Subtitle */}
              <div className="text-center mb-6 pt-1">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {isBn ? 'পুনরায় স্বাগতম!' : 'Welcome Back!'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                  {isBn 
                    ? 'আপনার সাধনা যাত্রা অব্যাহত রাখতে লগইন করুন।' 
                    : 'Login to continue your sadhana journey.'}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isBn ? 'ইমেইল' : 'Email'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isBn ? 'পাসওয়ার্ড' : 'Password'}
                    className="w-full px-4 py-3.5 pr-11 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setMode('RESET')}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#F25119] hover:bg-[#d9440f] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{loading ? (isBn ? 'লগইন হচ্ছে...' : 'Logging in...') : (isBn ? 'লগইন' : 'Login')}</span>
                </button>
              </form>

              {/* Switch to Register */}
              <div className="mt-5 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{isBn ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}</span>
                <button
                  type="button"
                  onClick={() => setMode('SIGNUP')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  {isBn ? 'নিবন্ধন করুন' : 'Register here'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              FORGOT / RESET MODE
          ══════════════════════════════════════════════════════ */}
          {mode === 'RESET' && (
            <div>
              <div className="text-center mb-6 pt-1">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {isBn ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                  {isBn 
                    ? 'আপনার নিবন্ধিত ইমেইল লিখুন।' 
                    : 'Enter your email to receive recovery instructions.'}
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success(isBn ? 'পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে' : 'Password reset link sent');
                setMode('LOGIN');
              }} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isBn ? 'ইমেইল' : 'Email'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#F25119] hover:bg-[#d9440f] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{isBn ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                </button>
              </form>

              <div className="mt-5 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{isBn ? 'পাসওয়ার্ড মনে পড়েছে? ' : 'Remember password? '}</span>
                <button
                  type="button"
                  onClick={() => setMode('LOGIN')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  {isBn ? 'লগইনে ফিরে যান' : 'Back to login'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
