import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, Eye, EyeOff, ChevronDown, LogOut
} from 'lucide-react';
import type { CounseleeProfile } from '../../types/sadhana';
import { 
  getRegisteredCounselees, 
  addRegisteredCounselee, 
  PRIMARY_COUNSELOR
} from '../../data/counseleesData';
import { toast } from 'react-hot-toast';

interface DevoteeAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDevotee: CounseleeProfile;
  onSelectDevotee: (devotee: CounseleeProfile) => void;
}

export const DevoteeAuthModal: React.FC<DevoteeAuthModalProps> = ({
  isOpen,
  onClose,
  activeDevotee,
  onSelectDevotee
}) => {
  const { language } = useLanguage();
  const [authMode, setAuthMode] = useState<'LOGIN' | 'REGISTER' | 'FORGOT'>('LOGIN');
  const [registerRole, setRegisterRole] = useState<'COUNSELEE' | 'COUNSELLOR'>('COUNSELEE');
  const [showPassword, setShowPassword] = useState(false);
  const [counselees, setCounselees] = useState<CounseleeProfile[]>(getRegisteredCounselees());

  // Form states
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [counselor, setCounselor] = useState('Prabhupad');
  const [selectedDevoteeId, setSelectedDevoteeId] = useState(activeDevotee.id);
  const [showDevoteePicker, setShowDevoteePicker] = useState(false);

  // Sync registered list when modal opens
  useEffect(() => {
    if (isOpen) {
      const fresh = getRegisteredCounselees();
      setCounselees(fresh);
      setSelectedDevoteeId(activeDevotee.id);
      if (activeDevotee.email) {
        setEmail(activeDevotee.email);
      }
    }
  }, [isOpen, activeDevotee]);

  if (!isOpen) return null;

  // Counselor options with Prabhupad on top
  const counselorOptions = [
    'Prabhupad',
    PRIMARY_COUNSELOR.name,
    'HG Raghav Kirtan Das',
    'HG Radheshyam Das',
    'Custom (অন্যান্য)'
  ];

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('voice_logged_in_user_id');
    localStorage.removeItem('voice_active_devotee_id');
    const fresh = getRegisteredCounselees();
    if (fresh.length > 0) {
      onSelectDevotee(fresh[0]);
    }
    toast.success(language === 'bn' ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully');
    onClose();
  };

  // Handle Login
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Try matching by email
    const trimmedEmail = email.trim().toLowerCase();
    let found = counselees.find(c => c.email && c.email.toLowerCase() === trimmedEmail);

    // 2. If not found by email, try matching by selected devotee
    if (!found && selectedDevoteeId) {
      found = counselees.find(c => c.id === selectedDevoteeId);
    }

    // 3. If still not found, check if email matches a devotee name
    if (!found && trimmedEmail) {
      found = counselees.find(c => c.name.toLowerCase().includes(trimmedEmail));
    }

    if (found) {
      localStorage.setItem('voice_logged_in_user_id', found.id);
      localStorage.setItem('voice_active_devotee_id', found.id);
      onSelectDevotee(found);
      toast.success(
        language === 'bn' 
          ? `স্বাগতম ${found.name}! সফলভাবে লগইন হয়েছে` 
          : `Welcome ${found.name}! Logged in successfully`
      );
      onClose();
    } else {
      // Fallback: If devotee doesn't exist yet, create or log in
      if (!email.trim()) {
        toast.error(language === 'bn' ? 'দয়া করে ইমেইল লিখুন' : 'Please enter your email');
        return;
      }
      toast.error(
        language === 'bn' 
          ? 'এই ইমেইল দিয়ে কোনো অ্যাকাউন্ট পাওয়া যায়নি। নিবন্ধন করুন।' 
          : 'Account not found with this email. Please register.'
      );
      setAuthMode('REGISTER');
    }
  };

  // Handle Register
  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error(language === 'bn' ? 'দয়া করে নাম লিখুন' : 'Please enter your name');
      return;
    }

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
    onSelectDevotee(newProfile);

    toast.success(
      language === 'bn'
        ? `অভিনন্দন ${newProfile.name}! আপনার অ্যাকাউন্ট তৈরি হয়েছে`
        : `Congratulations ${newProfile.name}! Account created successfully`
    );

    setFullName('');
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-fadeIn">
      
      {/* Outer Soft Pastel Ambient Glow */}
      <div className="relative w-full max-w-[420px]">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-200/40 via-purple-200/30 to-pink-200/40 rounded-[32px] blur-xl opacity-80 pointer-events-none" />

        {/* Main Card Container */}
        <div className="relative bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-100 dark:border-slate-800 p-6 sm:p-8 overflow-hidden">
          
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* ══════════════════════════════════════════════════════
              REGISTER MODE
          ══════════════════════════════════════════════════════ */}
          {authMode === 'REGISTER' && (
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
                  {language === 'bn' ? 'ভক্ত হিসেবে নিবন্ধন' : 'Register as Counsilli'}
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
                  {language === 'bn' ? 'কাউন্সেলর হিসেবে নিবন্ধন' : 'Register as Counsellor'}
                  {registerRole === 'COUNSELLOR' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              </div>

              {/* Header Title & Subtitle */}
              <div className="text-center mb-6">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {language === 'bn' ? 'অ্যাকাউন্ট তৈরি করুন' : 'Create Your Account'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                  {language === 'bn' 
                    ? 'সাধনা ট্র্যাকিংয়ে যুক্ত হতে নিবন্ধন করুন।' 
                    : 'Join our community to track your sadhana.'}
                </p>
              </div>

              {/* Register Form */}
              <form onSubmit={handleRegister} className="space-y-3.5">
                {/* Name */}
                <div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder={language === 'bn' ? 'নাম' : 'Name'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                {/* Email */}
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'bn' ? 'ইমেইল' : 'Email'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
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

                {/* Counselor Selection (for Counselee) */}
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

                {/* Register Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#F25119] hover:bg-[#d9440f] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'নিবন্ধন করুন' : 'Register'}</span>
                </button>
              </form>

              {/* Switch to Login */}
              <div className="mt-5 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{language === 'bn' ? 'ইতিমধ্যে অ্যাকাউন্ট আছে? ' : 'Already have an account? '}</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  {language === 'bn' ? 'এখানে লগইন করুন' : 'Login here'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              LOGIN MODE
          ══════════════════════════════════════════════════════ */}
          {authMode === 'LOGIN' && (
            <div>
              {/* Header Title & Subtitle */}
              <div className="text-center mb-6 pt-1">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {language === 'bn' ? 'পুনরায় স্বাগতম!' : 'Welcome Back!'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                  {language === 'bn'
                    ? 'আপনার সাধনা যাত্রা অব্যাহত রাখতে লগইন করুন।'
                    : 'Login to continue your sadhana journey.'}
                </p>
              </div>

              {/* Login Form */}
              <form onSubmit={handleLogin} className="space-y-3.5">
                {/* Email */}
                <div>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'bn' ? 'ইমেইল বা নাম' : 'Email'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                {/* Password */}
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={language === 'bn' ? 'পাসওয়ার্ড' : 'Password'}
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

                {/* Forgot Password Link */}
                <div className="flex justify-end pt-0.5">
                  <button
                    type="button"
                    onClick={() => setAuthMode('FORGOT')}
                    className="text-xs text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer"
                  >
                    {language === 'bn' ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot password?'}
                  </button>
                </div>

                {/* Login Button */}
                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#F25119] hover:bg-[#d9440f] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'লগইন' : 'Login'}</span>
                </button>
              </form>

              {/* Active Profile Info & Quick Switch Option */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {language === 'bn' ? 'বর্তমান সক্রিয় ভক্ত:' : 'Active profile:'}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {activeDevotee.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    onClick={() => setShowDevoteePicker(!showDevoteePicker)}
                    className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold hover:underline cursor-pointer"
                  >
                    {showDevoteePicker 
                      ? (language === 'bn' ? 'তালিকা লুকান' : 'Hide list') 
                      : (language === 'bn' ? 'ভক্ত তালিকা থেকে নির্বাচন' : 'Switch profile')}
                  </button>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>{language === 'bn' ? 'লগআউট' : 'Logout'}</span>
                  </button>
                </div>

                {/* Quick Devotee Selector Dropdown if toggled */}
                {showDevoteePicker && (
                  <div className="pt-2 animate-fadeIn">
                    <select
                      value={selectedDevoteeId}
                      onChange={(e) => {
                        const found = counselees.find(c => c.id === e.target.value);
                        if (found) {
                          setSelectedDevoteeId(found.id);
                          setEmail(found.email || found.name);
                          onSelectDevotee(found);
                          toast.success(`${found.name} selected`);
                        }
                      }}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-100 cursor-pointer"
                    >
                      {counselees.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.spiritualTitle || `Scale ${c.scaleId}`})
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Switch to Register */}
              <div className="mt-4 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{language === 'bn' ? 'অ্যাকাউন্ট নেই? ' : "Don't have an account? "}</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('REGISTER')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  {language === 'bn' ? 'নিবন্ধন করুন' : 'Register here'}
                </button>
              </div>
            </div>
          )}

          {/* ══════════════════════════════════════════════════════
              FORGOT PASSWORD MODE
          ══════════════════════════════════════════════════════ */}
          {authMode === 'FORGOT' && (
            <div>
              <div className="text-center mb-6 pt-1">
                <h2 className="text-2xl sm:text-[26px] font-black text-slate-900 dark:text-white tracking-tight leading-tight">
                  {language === 'bn' ? 'পাসওয়ার্ড রিসেট' : 'Reset Password'}
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5 font-normal">
                  {language === 'bn'
                    ? 'আপনার নিবন্ধিত ইমেইল লিখুন।'
                    : 'Enter your email to receive recovery instructions.'}
                </p>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                toast.success(language === 'bn' ? 'পাসওয়ার্ড রিসেট লিংক পাঠানো হয়েছে' : 'Password reset link sent to your email');
                setAuthMode('LOGIN');
              }} className="space-y-3.5">
                <div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={language === 'bn' ? 'ইমেইল' : 'Email'}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900/30 transition-all"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full mt-2 py-3.5 px-4 rounded-xl bg-[#F25119] hover:bg-[#d9440f] active:scale-[0.99] text-white font-bold text-base shadow-lg shadow-orange-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>{language === 'bn' ? 'রিসেট লিংক পাঠান' : 'Send Reset Link'}</span>
                </button>
              </form>

              <div className="mt-5 text-center text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <span>{language === 'bn' ? 'পাসওয়ার্ড মনে পড়েছে? ' : 'Remember password? '}</span>
                <button
                  type="button"
                  onClick={() => setAuthMode('LOGIN')}
                  className="text-blue-600 dark:text-blue-400 font-semibold hover:underline cursor-pointer ml-1"
                >
                  {language === 'bn' ? 'লগইনে ফিরে যান' : 'Back to login'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
