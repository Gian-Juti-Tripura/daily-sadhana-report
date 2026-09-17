import React, { useState, useEffect } from 'react';
import { ShieldCheck, ChevronDown, Plus } from 'lucide-react';
import type { CounseleeProfile } from '../../types/sadhana';
import { COUNSELORS_LIST, getRegisteredCounselees } from '../../data/counseleesData';
import { COUNSELOR_BN_MAP } from '../layout/CounselorFooter';
import { useTheme } from '../../context/ThemeContext';
import { DevoteeAvatar } from './DevoteeAvatar';

interface CounselorSelectorBarProps {
  counselees: CounseleeProfile[];
  activeDevotee: CounseleeProfile;
  onDevoteeChange: (d: CounseleeProfile) => void;
  language: 'bn' | 'en';
  onOpenAuthModal?: () => void;
}

export const CounselorSelectorBar: React.FC<CounselorSelectorBarProps> = ({
  counselees: initialCounselees,
  activeDevotee,
  onDevoteeChange,
  language,
  onOpenAuthModal,
}) => {
  const { styles } = useTheme();
  const [localCounselees, setLocalCounselees] = useState<CounseleeProfile[]>(initialCounselees);
  const [selectedCounselor, setSelectedCounselor] = useState<string>(() => {
    return activeDevotee.counselorName || localStorage.getItem('voice_selected_counselor') || COUNSELORS_LIST[0];
  });

  useEffect(() => {
    setLocalCounselees(initialCounselees);
  }, [initialCounselees]);

  useEffect(() => {
    if (activeDevotee.counselorName) {
      setSelectedCounselor(activeDevotee.counselorName);
    }
  }, [activeDevotee.counselorName]);

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<CounseleeProfile>;
      const fresh = getRegisteredCounselees();
      setLocalCounselees(fresh);
      if (customEvent.detail) {
        onDevoteeChange(customEvent.detail);
      }
    };
    window.addEventListener('voice_devotees_updated', handleUpdate);
    return () => window.removeEventListener('voice_devotees_updated', handleUpdate);
  }, [onDevoteeChange]);

  const filteredCounselees = localCounselees;

  const handleOpenAuth = () => {
    if (onOpenAuthModal) {
      onOpenAuthModal();
    } else {
      window.dispatchEvent(new CustomEvent('open_voice_auth_modal'));
    }
  };

  const handleCounselorChange = (newCounselor: string) => {
    if (newCounselor === '__add__') {
      handleOpenAuth();
      return;
    }
    setSelectedCounselor(newCounselor);
    localStorage.setItem('voice_selected_counselor', newCounselor);
    const updated = {
      ...activeDevotee,
      counselorName: newCounselor
    };
    onDevoteeChange(updated);
    window.dispatchEvent(new CustomEvent('voice_counselor_changed', { detail: newCounselor }));
  };

  const handleDevoteeSelect = (devoteeId: string) => {
    const found = filteredCounselees.find((d) => d.id === devoteeId);
    if (!found) return;

    const assignedCounselor = found.counselorName || selectedCounselor || COUNSELORS_LIST[0];
    setSelectedCounselor(assignedCounselor);
    localStorage.setItem('voice_selected_counselor', assignedCounselor);
    const updated = {
      ...found,
      counselorName: assignedCounselor
    };
    onDevoteeChange(updated);
    window.dispatchEvent(new CustomEvent('voice_counselor_changed', { detail: assignedCounselor }));
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-1.5 sm:p-2 shadow-xs flex flex-row items-center gap-1.5 sm:gap-2.5 transition-all">

      {/* 1. Counselor Select Box */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 bg-slate-50/90 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
        <div className="p-1 rounded-lg bg-amber-100/80 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 shrink-0">
          <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 stroke-[2.5]" />
        </div>
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0 hidden lg:inline">
          {language === 'bn' ? 'কাউন্সেলর:' : 'Counselor:'}
        </span>
        <div className="relative flex-1 min-w-0">
          <select
            value={selectedCounselor}
            onChange={(e) => handleCounselorChange(e.target.value)}
            className="w-full appearance-none bg-transparent text-slate-900 dark:text-slate-100 font-extrabold text-xs sm:text-sm outline-none cursor-pointer pr-4 truncate"
          >
            {COUNSELORS_LIST.map((c) => (
              <option key={c} value={c} className="py-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-bold">
                {language === 'bn' ? (COUNSELOR_BN_MAP[c] || c) : c}
              </option>
            ))}
            <option value="__add__" className={`font-bold py-1 ${styles.primaryTextColor} bg-white dark:bg-slate-900`}>
              + {language === 'bn' ? 'নতুন কাউন্সেলর যোগ করুন...' : 'Add Counselor...'}
            </option>
          </select>
          <div className={`pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center ${styles.primaryTextColor}`}>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 2. Devotee Select Box (with Sacred Flower / Profile Avatar) */}
      <div className="flex-1 min-w-0 flex items-center gap-1.5 sm:gap-2 bg-slate-50/90 dark:bg-slate-800/70 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl px-2 sm:px-3 py-1.5 sm:py-2 border border-slate-200 dark:border-slate-700/80 hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
        <div className="shrink-0 flex items-center justify-center">
          <DevoteeAvatar
            devotee={activeDevotee}
            size="xs"
            language={language}
            className="shrink-0 shadow-2xs"
          />
        </div>
        <span className="text-[10px] sm:text-xs font-extrabold text-slate-500 dark:text-slate-400 shrink-0 hidden lg:inline">
          {language === 'bn' ? 'ভক্ত:' : 'Devotee:'}
        </span>
        <div className="relative flex-1 min-w-0">
          <select
            value={activeDevotee.id}
            onChange={(e) => handleDevoteeSelect(e.target.value)}
            className="w-full appearance-none bg-transparent text-slate-900 dark:text-slate-100 font-extrabold text-xs sm:text-sm outline-none cursor-pointer pr-4 truncate"
          >
            {filteredCounselees.map((d) => {
              const displayName = language === 'bn' ? (d.nameBn || d.name) : d.name;
              const displaySpiritual = language === 'bn' ? (d.spiritualNameBn || d.spiritualName) : d.spiritualName;
              const scaleLabel = language === 'bn' ? `স্কেল ${d.scaleId}` : `Scale ${d.scaleId}`;
              return (
                <option key={d.id} value={d.id} className="py-1 text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 font-bold">
                  {displayName}{displaySpiritual ? ` (${displaySpiritual})` : ''} — {scaleLabel}
                </option>
              );
            })}
          </select>
          <div className={`pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 flex items-center ${styles.primaryTextColor}`}>
            <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
          </div>
        </div>
      </div>

      {/* 3. Add Devotee Button (Compact, always in same row) */}
      <button
        type="button"
        onClick={handleOpenAuth}
        className={`shrink-0 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl ${styles.btnPrimary} font-bold text-xs flex items-center justify-center gap-1 shadow-sm hover:shadow-md transition-all cursor-pointer`}
        title={language === 'bn' ? 'নতুন ভক্ত নিবন্ধন / সাইন আপ' : 'Register / Sign Up New Devotee'}
      >
        <Plus className="w-3.5 h-3.5 stroke-[3]" />
        <span className="text-xs font-bold">{language === 'bn' ? 'নতুন' : 'New'}</span>
      </button>

    </div>
  );
};
