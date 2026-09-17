import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Palette, BookOpen, Calendar, ShieldCheck,
  Globe, Menu
} from 'lucide-react';
import { DevoteeAvatar } from '../shared/DevoteeAvatar';
import type { CounseleeProfile } from '../../types/sadhana';

interface CounselorNavbarProps {
  activeTab: 'DAILY_REPORT' | 'DIGITAL_CARD' | 'COUNSELOR_DESK';
  setActiveTab: (tab: 'DAILY_REPORT' | 'DIGITAL_CARD' | 'COUNSELOR_DESK') => void;
  onOpenThemeModal: () => void;
  onOpenProfileModal: () => void;
  onOpenAuthModal: () => void;
  activeDevotee?: CounseleeProfile;
  currentDevoteeName: string;
}

// Sacred Royal Vedic Ornamental Art Divider (Proportional Vector Architecture)
const RoyalVedicFlourish: React.FC<{ flip?: boolean; className?: string }> = ({
  flip = false,
  className = ''
}) => (
  <svg
    viewBox="0 0 140 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`h-3.5 sm:h-4 md:h-4.5 w-auto shrink-0 drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] ${flip ? 'scale-x-[-1]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id={flip ? "vedic-gold-flip" : "vedic-gold"} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d97706" stopOpacity="0.2" />
        <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.85" />
        <stop offset="80%" stopColor="#fef08a" stopOpacity="1" />
        <stop offset="100%" stopColor="#ffffff" stopOpacity="1" />
      </linearGradient>
      <linearGradient id="jewel-gold" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#ffffff" />
        <stop offset="40%" stopColor="#fef08a" />
        <stop offset="100%" stopColor="#d97706" />
      </linearGradient>
    </defs>

    {/* Main tapered golden spine */}
    <path
      d="M 5 12 L 132 12"
      stroke={flip ? "url(#vedic-gold-flip)" : "url(#vedic-gold)"}
      strokeWidth="1.1"
      strokeLinecap="round"
      opacity="0.9"
    />

    {/* Upper classical leaf scroll vine */}
    <path
      d="M 40 12 C 55 12, 65 5, 84 5 C 96 5, 106 9, 118 12"
      stroke="#fef08a"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.95"
    />
    {/* Upper delicate spiral curl */}
    <path
      d="M 84 5 C 88 3, 92 3, 93 5 C 94 6.8, 92.5 8, 90 8 C 87.5 8, 86.5 6.5, 88 5.2"
      stroke="#fde047"
      strokeWidth="0.8"
      fill="none"
      opacity="0.9"
    />

    {/* Lower classical leaf scroll vine */}
    <path
      d="M 40 12 C 55 12, 65 19, 84 19 C 96 19, 106 15, 118 12"
      stroke="#fef08a"
      strokeWidth="0.9"
      strokeLinecap="round"
      fill="none"
      opacity="0.95"
    />
    {/* Lower delicate spiral curl */}
    <path
      d="M 84 19 C 88 21, 92 21, 93 19 C 94 17.2, 92.5 16, 90 16 C 87.5 16, 86.5 17.5, 88 18.8"
      stroke="#fde047"
      strokeWidth="0.8"
      fill="none"
      opacity="0.9"
    />

    {/* Symmetrical Pearl Beads along the axis */}
    <circle cx="15" cy="12" r="1.1" fill="#f59e0b" opacity="0.6" />
    <circle cx="30" cy="12" r="1.3" fill="#fbbf24" opacity="0.8" />
    <circle cx="58" cy="12" r="1.5" fill="#fde047" opacity="0.9" />
    <circle cx="121" cy="12" r="1.6" fill="#fef08a" />

    {/* Sacred 4-point Diamond Crest Jewel at x=102 */}
    <g transform="translate(102, 12)">
      <path d="M 0 -5 L 2 0 L 0 5 L -2 0 Z" fill="url(#jewel-gold)" />
      <path d="M -5 0 L 0 2 L 5 0 L 0 -2 Z" fill="url(#jewel-gold)" />
      <circle cx="0" cy="0" r="1" fill="#ffffff" />
    </g>

    {/* Royal Lotus Blossom Petal Motif at x=130 facing the invocation */}
    <g transform="translate(130, 12)">
      {/* Central sparkling jewel */}
      <circle cx="0" cy="0" r="2.2" fill="#ffffff" />
      <circle cx="0" cy="0" r="1.1" fill="#d97706" />
      {/* Top petal */}
      <path d="M 0 0 C 1.4 -2.8, 2.8 -4.5, 0 -6.5 C -2.8 -4.5, -1.4 -2.8, 0 0 Z" fill="#fef08a" opacity="0.95" />
      {/* Bottom petal */}
      <path d="M 0 0 C 1.4 2.8, 2.8 4.5, 0 6.5 C -2.8 4.5, -1.4 2.8, 0 0 Z" fill="#fef08a" opacity="0.95" />
      {/* Inner petal pointing toward invocation */}
      <path d="M 0 0 C 2.5 1.2, 4.5 2, 7 0 C 4.5 -2, 2.5 -1.2, 0 0 Z" fill="#ffffff" />
      {/* Outer petal */}
      <path d="M 0 0 C -2.5 1.2, -4 2, -6 0 C -4 -2, -2.5 -1.2, 0 0 Z" fill="#fde047" opacity="0.9" />
    </g>
  </svg>
);

export const CounselorNavbar: React.FC<CounselorNavbarProps> = ({
  activeTab,
  setActiveTab,
  onOpenThemeModal,
  onOpenProfileModal,
  onOpenAuthModal,
  activeDevotee,
  currentDevoteeName
}) => {
  const { language, toggleLanguage } = useLanguage();
  const { styles } = useTheme();

  const tabs: {
    key: 'DAILY_REPORT' | 'DIGITAL_CARD' | 'COUNSELOR_DESK';
    icon: React.ReactNode;
    labelBn: string;
    labelEn: string;
  }[] = [
    {
      key: 'DAILY_REPORT',
      icon: <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
      labelBn: 'দৈনিক সাধনা',
      labelEn: 'Daily Report',
    },
    {
      key: 'DIGITAL_CARD',
      icon: <BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
      labelBn: 'সাধনাপত্র',
      labelEn: 'Sadhana Card',
    },
    {
      key: 'COUNSELOR_DESK',
      icon: <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />,
      labelBn: 'কাউন্সেলর ডেস্ক',
      labelEn: 'Counselor Desk',
    },
  ];

  return (
    <header className={`sticky top-0 z-40 backdrop-blur-md bg-white/95 dark:bg-slate-900/95 border-b ${styles.accentBorderColor} transition-colors shadow-sm`}>

      {/* Top Banner — Sacred Royal Invocation with Symmetrical Vedic Art */}
      <div className={`bg-gradient-to-r ${styles.bannerGradient} border-b border-amber-400/25 text-white py-1 sm:py-1.5 px-3 sm:px-5 flex items-center justify-between gap-2 sm:gap-4 transition-all shadow-xs relative overflow-hidden`}>
        
        {/* Subtle center divine radiance highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/12 via-transparent to-transparent pointer-events-none" />

        {/* Left: Srila Prabhupada Circular Portrait */}
        <div className="flex items-center gap-2 shrink-0 z-10" title="His Divine Grace A.C. Bhaktivedanta Swami Prabhupada">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-2 ring-amber-300/90 overflow-hidden bg-white/20 shadow-md shrink-0 flex items-center justify-center border border-amber-100/40 hover:scale-105 transition-transform">
            <img
              src="/assets/srila_prabhupada_circle.png"
              alt="Srila Prabhupada"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/srila_prabhupada.jpg';
              }}
            />
          </div>
          <span className="hidden xl:inline font-bold text-[11px] text-amber-100 tracking-tight">
            {language === 'bn' ? 'শ্রীল প্রভুপাদ' : 'Srila Prabhupada'}
          </span>
        </div>

        {/* Center: Symmetrical Vedic Art & Sacred Invocation */}
        <div className="flex items-center justify-center gap-1.5 sm:gap-3 flex-1 min-w-0 px-1 overflow-hidden z-10">
          {/* Left Symmetrical Art Flourish & Hairline */}
          <div className="flex-1 flex justify-end items-center gap-1.5 sm:gap-2 min-w-[20px] overflow-hidden">
            <div className="hidden xs:block flex-1 h-[1px] bg-gradient-to-r from-transparent via-amber-300/30 to-amber-300/75 max-w-[140px] sm:max-w-[200px]" />
            <RoyalVedicFlourish flip={false} />
          </div>

          {/* Centerpiece: Sacred Invocation with Halo Om Medallions */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 px-1">
            <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400/20 border border-amber-300/60 text-amber-200 font-serif font-black text-[11px] sm:text-xs shadow-xs select-none backdrop-blur-xs">
              ॐ
            </span>
            <h2 className={`${language === 'bn' ? 'font-serifBengali font-bold' : 'font-playfair italic font-semibold'} text-xs xs:text-sm sm:text-[15px] md:text-base tracking-widest text-amber-100 drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] text-center whitespace-nowrap`}>
              {language === 'bn'
                ? 'শ্রীশ্রী গুরু ও গৌরাঙ্গ জয়তু'
                : 'Shree Shree Guru and Gauranga Jayatu'}
            </h2>
            <span className="inline-flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400/20 border border-amber-300/60 text-amber-200 font-serif font-black text-[11px] sm:text-xs shadow-xs select-none backdrop-blur-xs">
              ॐ
            </span>
          </div>

          {/* Right Symmetrical Art Flourish & Hairline */}
          <div className="flex-1 flex justify-start items-center gap-1.5 sm:gap-2 min-w-[20px] overflow-hidden">
            <RoyalVedicFlourish flip={true} />
            <div className="hidden xs:block flex-1 h-[1px] bg-gradient-to-l from-transparent via-amber-300/30 to-amber-300/75 max-w-[140px] sm:max-w-[200px]" />
          </div>
        </div>

        {/* Right: IYF Chittagong Logo */}
        <div className="flex items-center gap-2 shrink-0 z-10" title="ISKCON Youth Forum (IYF) Chittagong">
          <span className="hidden xl:inline font-bold text-[11px] text-amber-100 tracking-tight">
            IYF
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white ring-2 ring-amber-300/90 p-0.5 overflow-hidden shadow-md shrink-0 flex items-center justify-center border border-amber-100/40 hover:scale-105 transition-transform">
            <img
              src="/assets/iyf_logo.png"
              alt="IYF Chittagong"
              className="w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>
        </div>

      </div>

      {/* Main Row */}
      <div className="px-2 xs:px-3 sm:px-5 lg:px-8">
        <div className="flex items-center justify-between h-12 sm:h-14 gap-2">

          {/* Left: Logo + Title only (clean, no counselor name) */}
          <div
            className="flex items-center gap-2 min-w-0 cursor-pointer shrink-0"
            onClick={() => setActiveTab('DAILY_REPORT')}
          >
            <div className="relative shrink-0">
              <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr ${styles.bannerGradient} p-0.5 shadow-md flex items-center justify-center overflow-hidden`}>
                <img
                  src="/logo.png"
                  alt="VOICE"
                  className="w-full h-full object-cover rounded-xl bg-white p-1"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <h1 className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[130px] xs:max-w-[170px] sm:max-w-none">
              {language === 'bn' ? 'সাধনা পোর্টাল' : 'VOICE Sadhana Portal'}
            </h1>
          </div>

          {/* Center: Desktop tabs */}
          <nav className="hidden lg:flex items-center gap-2 flex-1 max-w-2xl mx-4">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`flex-1 px-4 py-2 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border ${
                    isActive
                      ? `bg-gradient-to-r ${styles.bannerGradient} text-white shadow-md border-transparent`
                      : 'bg-slate-100 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70 dark:hover:bg-slate-700/60'
                  }`}
                >
                  {tab.icon}
                  <span>{language === 'bn' ? tab.labelBn : tab.labelEn}</span>
                </button>
              );
            })}
          </nav>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0">

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
              title={language === 'bn' ? 'Switch to English' : 'বাংলায় দেখুন'}
            >
              <div className="flex items-center gap-0.5">
                <Globe className={`w-3.5 h-3.5 ${styles.primaryTextColor}`} />
                <span className="text-[10px] font-bold text-slate-700 dark:text-slate-200 hidden xs:inline">{language === 'bn' ? 'EN' : 'BN'}</span>
              </div>
            </button>

            {/* Theme Customizer Trigger */}
            <button
              onClick={onOpenThemeModal}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all shadow-sm cursor-pointer"
              title="Change Theme & Appearance"
            >
              <Palette className={`w-3.5 h-3.5 ${styles.primaryTextColor}`} />
            </button>

            {/* Devotee Profile Trigger */}
            <button
              onClick={onOpenProfileModal}
              className={`p-1 sm:px-2.5 sm:py-1.5 rounded-xl ${styles.btnPrimary} text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm cursor-pointer`}
              title={language === 'bn' ? 'ভক্তের প্রোফাইল ও ছবি' : 'Devotee Profile & Photo'}
            >
              <DevoteeAvatar
                devotee={activeDevotee}
                devoteeId={activeDevotee?.id}
                devoteeName={activeDevotee?.name || currentDevoteeName}
                avatarUrl={activeDevotee?.avatarUrl}
                flowerAvatarId={activeDevotee?.flowerAvatarId}
                size="xs"
                language={language}
                className="shrink-0"
              />
              <span className="hidden sm:block max-w-[90px] truncate text-[11px] font-bold">
                {activeDevotee?.name || currentDevoteeName}
              </span>
            </button>

            {/* 3-bar Menu / Devotee Login, Sign Up & Logout */}
            <button
              onClick={onOpenAuthModal}
              className={`p-2 rounded-xl ${styles.btnPrimary} transition-all shadow-md flex items-center justify-center cursor-pointer`}
              aria-label="Devotee Login & Sign Up Menu"
              title={language === 'bn' ? 'লগইন / সাইন আপ / লগআউট (মেনু)' : 'Devotee Login / Sign Up / Logout'}
            >
              <Menu className="w-4 h-4" strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Tab Bar — harmonious styled card boxes */}
      <div className="lg:hidden grid grid-cols-3 gap-1 px-2 py-1.5 bg-slate-50/90 dark:bg-slate-900/90 border-t border-slate-200/60 dark:border-slate-800">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`py-1.5 px-1 rounded-xl flex flex-col items-center justify-center gap-0.5 text-[10px] xs:text-[11px] font-bold transition-all border ${
                isActive
                  ? `bg-gradient-to-r ${styles.bannerGradient} text-white shadow-md border-transparent`
                  : 'bg-white dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700/60'
              }`}
            >
              <div className="flex items-center gap-1">
                {tab.icon}
              </div>
              <span className="leading-tight text-center truncate max-w-full">
                {language === 'bn' ? tab.labelBn : tab.labelEn}
              </span>
            </button>
          );
        })}
      </div>
    </header>
  );
};
