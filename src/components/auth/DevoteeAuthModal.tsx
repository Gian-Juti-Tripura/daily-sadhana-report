import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  X, LogOut, Mail, ShieldCheck, UserCheck, 
  ExternalLink, Sparkles
} from 'lucide-react';
import type { CounseleeProfile } from '../../types/sadhana';
import { supabase } from '../../supabase/supabaseClient';
import { DevoteeAvatar } from '../shared/DevoteeAvatar';
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
}) => {
  const { language } = useLanguage();
  const isBn = language === 'bn';
  const { styles } = useTheme();

  if (!isOpen) return null;

  // Handle Log Out
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Supabase signOut error:', e);
    }

    localStorage.removeItem('voice_logged_in_user_id');
    localStorage.removeItem('voice_active_devotee_id');
    localStorage.removeItem('voice_selected_counselor');
    localStorage.removeItem('voice_auth_role');
    sessionStorage.removeItem('voice_login_dismissed_session');

    window.dispatchEvent(new CustomEvent('voice_devotee_logged_out'));
    toast.success(isBn ? 'সফলভাবে লগআউট হয়েছে' : 'Logged out successfully');
    onClose();
  };

  const handleOpenProfile = () => {
    onClose();
    window.dispatchEvent(new CustomEvent('open_devotee_profile_modal'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-[28px] shadow-2xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 overflow-hidden text-slate-800 dark:text-slate-100">
        
        {/* Soft Background Radial Glow */}
        <div 
          aria-hidden="true" 
          className="pointer-events-none absolute -top-20 -right-20 w-52 h-52 rounded-full blur-3xl opacity-20 dark:opacity-10 bg-amber-500"
        />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer z-10"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <UserCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 dark:text-white leading-tight">
              {isBn ? 'আমার অ্যাকাউন্ট' : 'My Devotee Account'}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isBn ? 'লগইনকৃত ভক্তের তথ্য' : 'Active authenticated session'}
            </p>
          </div>
        </div>

        {/* User Card Overview */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-700/80 flex items-center gap-3.5 mb-5">
          <DevoteeAvatar
            devotee={activeDevotee}
            devoteeId={activeDevotee.id}
            devoteeName={activeDevotee.name}
            avatarUrl={activeDevotee.avatarUrl}
            flowerAvatarId={activeDevotee.flowerAvatarId}
            size="lg"
            language={language}
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-base text-slate-900 dark:text-white truncate">
                {activeDevotee.name}
              </h3>
              <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                {isBn ? 'অনলাইন' : 'Active'}
              </span>
            </div>
            {activeDevotee.spiritualName && (
              <p className="text-xs text-amber-700 dark:text-amber-400 font-semibold truncate mt-0.5">
                {activeDevotee.spiritualName}
              </p>
            )}
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              {activeDevotee.spiritualTitle || 'Bhakti Aspirant'}
            </p>
          </div>
        </div>

        {/* User Details Grid */}
        <div className="space-y-2.5 mb-6 text-xs">
          {/* Email */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <Mail className="w-4 h-4 text-slate-400" />
              <span>{isBn ? 'ইমেইল' : 'Email'}</span>
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
              {activeDevotee.email || '—'}
            </span>
          </div>

          {/* Assigned Counselor */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <ShieldCheck className="w-4 h-4 text-amber-500" />
              <span>{isBn ? 'কাউন্সেলর' : 'Counselor'}</span>
            </span>
            <span className="font-bold text-amber-700 dark:text-amber-400 truncate max-w-[200px]">
              {activeDevotee.counselorName || 'Prabhupad'}
            </span>
          </div>

          {/* Sadhana Scale */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700/60">
            <span className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-medium">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span>{isBn ? 'সাধনা স্কেল' : 'Sadhana Scale'}</span>
            </span>
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {isBn ? `স্কেল ${activeDevotee.scaleId || 2}` : `Scale ${activeDevotee.scaleId || 2}`}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Edit Profile & Photo */}
          <button
            type="button"
            onClick={handleOpenProfile}
            className={`w-full py-3 px-4 rounded-xl ${styles.btnPrimary} font-bold text-xs sm:text-sm shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer`}
          >
            <ExternalLink className="w-4 h-4" />
            <span>{isBn ? 'প্রোফাইল ও সিলেবাস দেখুন' : 'View Profile & Syllabus'}</span>
          </button>

          {/* Log Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="w-full py-3 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-700 dark:text-rose-300 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
          >
            <LogOut className="w-4 h-4" />
            <span>{isBn ? 'লগআউট করুন' : 'Log Out'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
