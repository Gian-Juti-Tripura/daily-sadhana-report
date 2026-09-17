import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { 
  X, User, LogIn, LogOut, UserPlus, 
  Phone, Mail, CheckCircle2, Sparkles, AlertCircle
} from 'lucide-react';
import type { CounseleeProfile } from '../../types/sadhana';
import { 
  getRegisteredCounselees, 
  addRegisteredCounselee, 
  COUNSELORS_LIST,
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
  const [authTab, setAuthTab] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');
  const [counselees, setCounselees] = useState<CounseleeProfile[]>(getRegisteredCounselees());

  // Sign up form state
  const [fullName, setFullName] = useState('');
  const [spiritualName, setSpiritualName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [counselor, setCounselor] = useState(COUNSELORS_LIST[0]);
  const [scaleId, setScaleId] = useState<1 | 2 | 3 | 4>(2);
  const [institution, setInstitution] = useState('University of Chittagong');
  const [roomNo, setRoomNo] = useState('');
  const [department, setDepartment] = useState('');

  // Login selection state
  const [selectedDevoteeId, setSelectedDevoteeId] = useState(activeDevotee.id);

  // Sync list when modal opens
  useEffect(() => {
    if (isOpen) {
      const fresh = getRegisteredCounselees();
      setCounselees(fresh);
      setSelectedDevoteeId(activeDevotee.id);
    }
  }, [isOpen, activeDevotee.id]);

  if (!isOpen) return null;

  // Handle Log Out
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

  // Handle Login / Select Devotee
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const found = counselees.find(c => c.id === selectedDevoteeId);
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
    }
  };

  // Handle Sign Up (Register new devotee into dropdown list)
  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      toast.error(language === 'bn' ? 'দয়া করে পূর্ণ নাম লিখুন' : 'Please enter your full name');
      return;
    }

    const newProfile = addRegisteredCounselee({
      name: fullName.trim(),
      spiritualName: spiritualName.trim(),
      phone: phone.trim(),
      email: email.trim(),
      counselorName: counselor,
      scaleId,
      institution: institution.trim(),
      roomNo: roomNo.trim(),
      department: department.trim(),
      completedCourses: ['dys'],
      completedCamps: ['camp_sankalpa'],
      spiritualTitle: spiritualName ? 'Devotee Aspirant' : 'Bhakti Candidate'
    });

    // Notify other components
    window.dispatchEvent(new CustomEvent('voice_devotees_updated', { detail: newProfile }));

    // Set as active & logged in
    localStorage.setItem('voice_logged_in_user_id', newProfile.id);
    localStorage.setItem('voice_active_devotee_id', newProfile.id);
    onSelectDevotee(newProfile);

    toast.success(
      language === 'bn'
        ? `অভিনন্দন ${newProfile.name}! আপনি সফলভাবে নিবন্ধিত ও লগইন হয়েছেন`
        : `Congratulations ${newProfile.name}! Registered and logged in successfully`
    );

    // Reset form
    setFullName('');
    setSpiritualName('');
    setPhone('');
    setEmail('');
    setRoomNo('');
    setDepartment('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full shadow-2xl border border-amber-300/60 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 px-5 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-white/20 rounded-xl backdrop-blur-sm">
              <Sparkles className="w-5 h-5 text-amber-100" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg leading-tight">
                {language === 'bn' ? 'ভক্ত প্রবেশ ও নিবন্ধন' : 'Devotee Access & Sign Up'}
              </h2>
              <p className="text-[11px] text-amber-100/90 font-medium">
                Central VOICE • IYF Chittagong
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/20 transition-colors text-white"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 p-1.5 gap-1.5">
          <button
            onClick={() => setAuthTab('LOGIN')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              authTab === 'LOGIN'
                ? 'bg-white dark:bg-slate-900 text-amber-700 dark:text-amber-400 shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-4 h-4" />
            <span>{language === 'bn' ? 'লগইন / ভক্ত নির্বাচন' : 'Log In / Select'}</span>
          </button>

          <button
            onClick={() => setAuthTab('SIGNUP')}
            className={`flex-1 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all ${
              authTab === 'SIGNUP'
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/25'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            <span>{language === 'bn' ? 'নতুন সাইন আপ' : 'Sign Up (New)'}</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">

          {/* TAB 1: LOGIN / DEVOTEE SELECT */}
          {authTab === 'LOGIN' && (
            <div className="space-y-4">
              
              {/* Currently Active Devotee Card */}
              <div className="bg-amber-50/70 dark:bg-slate-800/70 p-3.5 rounded-2xl border border-amber-200/80 dark:border-slate-700 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    {language === 'bn' ? 'বর্তমান সক্রিয় প্রোফাইল' : 'Currently Active Profile'}
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-200 dark:bg-amber-900/50 text-amber-900 dark:text-amber-200">
                    Scale {activeDevotee.scaleId}
                  </span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-amber-500 to-orange-500 text-white font-black text-sm flex items-center justify-center shadow-md shadow-amber-500/20">
                    {activeDevotee.name ? activeDevotee.name[0].toUpperCase() : 'D'}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-800 dark:text-slate-100 text-sm truncate">
                      {activeDevotee.name}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {activeDevotee.spiritualName ? `${activeDevotee.spiritualName} • ` : ''}{activeDevotee.counselorName || PRIMARY_COUNSELOR.name}
                    </p>
                  </div>
                </div>

                {/* Log Out button for active devotee */}
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 py-1.5 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/30 dark:hover:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-1.5 border border-rose-200 dark:border-rose-800 transition-all"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'লগআউট করুন' : 'Log Out from this Device'}</span>
                </button>
              </div>

              {/* Select Existing Registered Devotee */}
              <form onSubmit={handleLogin} className="space-y-3 pt-1">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                    {language === 'bn' ? 'অন্য ভক্ত হিসেবে লগইন / নির্বাচন করুন:' : 'Switch / Log in as another registered devotee:'}
                  </label>
                  <select
                    value={selectedDevoteeId}
                    onChange={(e) => setSelectedDevoteeId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    {counselees.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} {c.spiritualName ? `(${c.spiritualName})` : ''} — Scale {c.scaleId}
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-amber-500/25 transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{language === 'bn' ? 'লগইন নিশ্চিত করুন' : 'Confirm & Log In'}</span>
                </button>
              </form>

              {/* Helpful notice */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 flex items-start gap-2 text-[11px] text-slate-500">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  {language === 'bn'
                    ? 'আপনি কি প্রথমবার এসেছেন? ওপরের "নতুন সাইন আপ" ট্যাবে ক্লিক করে আপনার নাম যুক্ত করুন।'
                    : 'First time here? Click the "Sign Up (New)" tab above to add your name to the registered devotees dropdown.'}
                </p>
              </div>

            </div>
          )}

          {/* TAB 2: SIGN UP (FIRST-TIME DEVOTEE REGISTRATION) */}
          {authTab === 'SIGNUP' && (
            <form onSubmit={handleSignUp} className="space-y-3">
              
              {/* Full Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'bn' ? 'পূর্ণ নাম (Full Name) *' : 'Full Name *'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Gian Juti Tripura"
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  />
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                </div>
              </div>

              {/* Spiritual Name */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  {language === 'bn' ? 'দীক্ষাকৃত নাম (Spiritual Name - ঐচ্ছিক)' : 'Initiated Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={spiritualName}
                  onChange={(e) => setSpiritualName(e.target.value)}
                  placeholder="e.g. Gianjyoti Das"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone / WhatsApp'}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+8801..."
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                    <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'ইমেইল' : 'Email'}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="devotee@gmail.com"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                    />
                    <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Counselor & Sadhana Scale */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'কাউন্সেলর' : 'Counselor'}
                  </label>
                  <select
                    value={counselor}
                    onChange={(e) => setCounselor(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    {COUNSELORS_LIST.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'সাধনা স্কেল (Scale)' : 'Sadhana Scale'}
                  </label>
                  <select
                    value={scaleId}
                    onChange={(e) => setScaleId(parseInt(e.target.value, 10) as 1 | 2 | 3 | 4)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  >
                    <option value={1}>Scale 1 (Primary / নবীন সাধক)</option>
                    <option value={2}>Scale 2 (Standard / সাধারণ নিয়ম)</option>
                    <option value={3}>Scale 3 (Advanced / অগ্রসর সাধক)</option>
                    <option value={4}>Scale 4 (Strict / কঠোর নিয়ম)</option>
                  </select>
                </div>
              </div>

              {/* Room & Department */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'রুম নং' : 'Room No'}
                  </label>
                  <input
                    type="text"
                    value={roomNo}
                    onChange={(e) => setRoomNo(e.target.value)}
                    placeholder="Room 302"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    {language === 'bn' ? 'বিভাগ / শিক্ষাপ্রতিষ্ঠান' : 'Department / Uni'}
                  </label>
                  <input
                    type="text"
                    value={department}
                    onChange={(e) => {
                      setDepartment(e.target.value);
                      if (e.target.value.includes(',')) {
                        setInstitution(e.target.value.split(',')[1].trim());
                      }
                    }}
                    placeholder="CSE, CU"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-100"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25 transition-all"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>
                    {language === 'bn' ? 'নিবন্ধন ও সরাসরি লগইন করুন' : 'Register & Log In Now'}
                  </span>
                </button>
                <p className="text-[10px] text-center text-slate-500 mt-1.5">
                  {language === 'bn' 
                    ? '✓ নিবন্ধনের সাথে সাথে আপনার নাম ড্রপডাউনে যুক্ত হয়ে যাবে' 
                    : '✓ Your name will instantly appear in all devotee dropdown lists'}
                </p>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
};
