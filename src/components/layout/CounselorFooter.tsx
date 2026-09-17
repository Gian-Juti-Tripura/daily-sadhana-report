import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { ShieldCheck, User } from 'lucide-react';
import { PRIMARY_COUNSELOR } from '../../data/counseleesData';

interface CounselorFooterProps {
  currentDevoteeName?: string;
  counselorName?: string;
}

export const COUNSELOR_BN_MAP: Record<string, string> = {
  'HG Rashbihari Krishna Chandra Das Brahmachari': 'শ্রীপাদ রাসবিহারী কৃষ্ণ চন্দ্র দাস ব্রহ্মচারী',
  'HG Raghav Kirtan Das': 'শ্রীপাদ রাঘব কীর্তন দাস',
  'HG Radheshyam Das': 'শ্রীপাদ রাধেশ্যাম দাস',
  'Custom (অন্যান্য)': 'অন্যান্য কাউন্সেলর'
};

export const CounselorFooter: React.FC<CounselorFooterProps> = ({
  currentDevoteeName = 'Gian Juti Tripura',
  counselorName
}) => {
  const { language } = useLanguage();
  const [counselor, setCounselor] = useState<string>(() => {
    return counselorName || localStorage.getItem('voice_selected_counselor') || PRIMARY_COUNSELOR.name;
  });

  useEffect(() => {
    if (counselorName) {
      setCounselor(counselorName);
    }
  }, [counselorName]);

  useEffect(() => {
    const handleCounselorUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      if (customEvent.detail) {
        setCounselor(customEvent.detail);
      }
    };
    window.addEventListener('voice_counselor_changed', handleCounselorUpdate);
    return () => window.removeEventListener('voice_counselor_changed', handleCounselorUpdate);
  }, []);

  const effectiveCounselorName = counselor || PRIMARY_COUNSELOR.name;
  const displayCounselor = language === 'bn'
    ? (COUNSELOR_BN_MAP[effectiveCounselorName] || effectiveCounselorName)
    : effectiveCounselorName;

  return (
    <footer className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 mt-6 text-white shadow-inner">
      {/* Mini Mahamantra line */}
      <div className="border-b border-white/15 py-1 px-3 text-center bg-black/10">
        <p className="text-[10px] xs:text-[11px] font-bold tracking-wide drop-shadow-sm truncate">
          🌸{' '}
          {language === 'bn'
            ? 'হরে কৃষ্ণ হরে কৃষ্ণ কৃষ্ণ কৃষ্ণ হরে হরে । হরে রাম হরে রাম রাম রাম হরে হরে ॥'
            : 'Hare Krishna Hare Krishna Krishna Krishna Hare Hare | Hare Rama Hare Rama Rama Rama Hare Hare ||'}
          {' '}🌸
        </p>
      </div>

      {/* Compact Info Row with Counselor Name, Devotee Name, and Copyright */}
      <div className="max-w-7xl mx-auto px-3 py-1.5 flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-[10px] xs:text-[11px]">
        
        {/* Left: Counselor & Devotee Names fitted neatly */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-0.5 min-w-0">
          {/* Counselor Name */}
          <span className="inline-flex items-center gap-1 font-semibold text-amber-100">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="opacity-80">{language === 'bn' ? 'কাউন্সেলর:' : 'Counselor:'}</span>
            <span className="font-bold text-white">
              {displayCounselor}
            </span>
          </span>

          <span className="opacity-40 hidden xs:inline">•</span>

          {/* Devotee Name */}
          <span className="inline-flex items-center gap-1 font-semibold text-amber-100">
            <User className="w-3.5 h-3.5 text-amber-200 shrink-0" />
            <span className="opacity-80">{language === 'bn' ? 'ভক্ত:' : 'Devotee:'}</span>
            <span className="font-bold text-white">
              {currentDevoteeName}
            </span>
          </span>
        </div>

        {/* Right: Copyright (Card download deleted) */}
        <div className="flex items-center gap-2 text-amber-100/90 shrink-0">
          <span className="opacity-80 text-[10px]">
            © {new Date().getFullYear()} Central VOICE, IYF
          </span>
        </div>

      </div>
    </footer>
  );
};
