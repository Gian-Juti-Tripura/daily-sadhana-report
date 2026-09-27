import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Palette, BookOpen, Calendar, ShieldCheck,
  Globe, Menu, Download, Sparkles, Check, X, Type
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { Capacitor } from '@capacitor/core';
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

export type BannerFontId = 'cinzel' | 'playfair' | 'vibes' | 'marcellus' | 'cormorant' | 'rozha' | 'alexBrush';

export interface BannerFontConfig {
  id: BannerFontId;
  name: string;
  nameBn: string;
  enClass: string;
  bnClass: string;
  badge: string;
  badgeBn: string;
  description: string;
  descriptionBn: string;
}

export const BANNER_FONTS: BannerFontConfig[] = [
  {
    id: 'cinzel',
    name: '1. Cinzel (Royal Monumental)',
    nameBn: '১. রাজকীয় ক্লাসিক্যাল (Cinzel)',
    enClass: 'font-cinzel font-bold tracking-[0.16em]',
    bnClass: 'font-serifBengali font-bold tracking-[0.08em]',
    badge: 'Temple Imperial',
    badgeBn: 'মন্দির শিলালিপি',
    description: 'Classical Roman carved stone style — majestic, authoritative, temple-monumental.',
    descriptionBn: 'ধ্রুপদী রোমান খোদাইকৃত রাজকীয় শৈলী — গম্ভীর, মর্যাদাপূর্ণ ও মন্দিরসুলভ।'
  },
  {
    id: 'playfair',
    name: '2. Playfair Display (Regal High-Contrast)',
    nameBn: '২. মার্জিত রাজকীয় সেরিফ (Playfair)',
    enClass: 'font-playfair italic font-bold tracking-[0.08em]',
    bnClass: 'font-serifBengali font-bold tracking-[0.06em]',
    badge: 'High Contrast',
    badgeBn: 'স্পষ্ট ও উজ্জ্বল',
    description: 'High-contrast luxury serif with graceful curves and strong presence.',
    descriptionBn: 'উচ্চ কনট্রাস্টের রাজকীয় সেরিফ — স্পষ্ট, উজ্জ্বল ও চমৎকার নান্দনিক বক্ররেখা।'
  },
  {
    id: 'vibes',
    name: '3. Great Vibes (Divine Calligraphy)',
    nameBn: '৩. হস্তলিপিকৃত দিব্য ক্যালিগ্রাফি (Great Vibes)',
    enClass: 'font-vibes font-normal tracking-[0.04em] text-sm xs:text-base sm:text-xl md:text-2xl',
    bnClass: 'font-galada font-normal tracking-normal text-xs xs:text-sm sm:text-base md:text-lg',
    badge: 'Calligraphy',
    badgeBn: 'হস্তলিপি ক্যালিগ্রাফি',
    description: 'Handwritten golden manuscript calligraphy — poetic, soft, heartfelt devotional feel.',
    descriptionBn: 'স্বর্ণাক্ষরে হস্তলিপিকৃত প্রাচীন পুঁথির রূপ — ভক্তিময়, স্নিগ্ধ ও কাব্যিক।'
  },
  {
    id: 'marcellus',
    name: '4. Marcellus (Chiseled Temple Stone)',
    nameBn: '৪. খোদাইকৃত মন্দির শিলালিপি (Marcellus)',
    enClass: 'font-marcellus font-normal tracking-[0.14em]',
    bnClass: 'font-serifBengali font-semibold tracking-[0.08em]',
    badge: 'Serene Roman',
    badgeBn: 'শান্ত ও বিশুদ্ধ',
    description: 'Dignified Roman proportions with subtle flared serifs — serene, pure, sacred.',
    descriptionBn: 'অনন্য রোমান অনুপাত ও সামান্য বাঁকানো সেরিফ — শান্ত, পবিত্র ও শুভ্র।'
  },
  {
    id: 'cormorant',
    name: '5. Cormorant Garamond (Golden Scripture)',
    nameBn: '৫. শাস্ত্রীয় প্রকাশনা সেরিফ (Cormorant Garamond)',
    enClass: 'font-cormorant font-bold italic tracking-[0.14em]',
    bnClass: 'font-tiro italic font-normal tracking-[0.06em]',
    badge: 'Scripture Print',
    badgeBn: 'শাস্ত্রীয় মুদ্রণ',
    description: 'Classic Gita & Bhagavatam publishing typography — solid weight with golden radiance.',
    descriptionBn: 'গীতা ও ভাগবতম গ্রন্থ প্রকাশের ক্লাসিক্যাল রূপ — পরিমিত ওজন ও সুবর্ণ আভা।'
  },
  {
    id: 'rozha',
    name: '6. Rozha One (Ornate Vedic Display)',
    nameBn: '৬. অলংকৃত বৈদিক শৈলী (Rozha One)',
    enClass: 'font-rozha font-normal tracking-[0.06em]',
    bnClass: 'font-serifBengali font-black tracking-[0.06em]',
    badge: 'Vedic Impact',
    badgeBn: 'অলংকৃত ভারতীয়',
    description: 'High-contrast Indian manuscript headlines with bold verticals and hairline serifs.',
    descriptionBn: 'ভারতীয় শাস্ত্রীয় শিরোনাম শৈলী — গাঢ় উল্লম্ব টান ও সূক্ষ্ম অলংকরণ।'
  },
  {
    id: 'alexBrush',
    name: '7. Alex Brush (Devotional Brush Script)',
    nameBn: '৭. মার্জিত তুলির টান (Alex Brush)',
    enClass: 'font-alexBrush font-normal tracking-[0.05em] text-xs xs:text-sm sm:text-lg md:text-xl',
    bnClass: 'font-galada font-normal tracking-normal text-xs xs:text-sm sm:text-base md:text-lg',
    badge: 'Brush Script',
    badgeBn: 'তুলির টান',
    description: 'Smooth brush calligraphy with balanced ascenders and soft fluid grace.',
    descriptionBn: 'মসৃণ তুলির আঁচড়ে চমৎকার প্রাকৃতিক ছন্দ ও ভারসাম্য।'
  }
];

// Sacred Royal Vedic Ornamental Art Divider (Proportional Vector Architecture)
const RoyalVedicFlourish: React.FC<{ flip?: boolean; className?: string }> = ({
  flip = false,
  className = ''
}) => (
  <svg
    viewBox="0 0 140 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={`h-3 sm:h-3.5 md:h-4 w-auto shrink-0 drop-shadow-[0_1px_1px_rgba(0,0,0,0.25)] ${flip ? 'scale-x-[-1]' : ''} ${className}`}
  >
    <defs>
      <linearGradient id={flip ? "vedic-gold-flip" : "vedic-gold"} x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#d97706" stopOpacity="0.15" />
        <stop offset="40%" stopColor="#fbbf24" stopOpacity="0.8" />
        <stop offset="80%" stopColor="#fef08a" stopOpacity="0.95" />
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
      strokeWidth="0.8"
      strokeLinecap="round"
      opacity="0.85"
    />

    {/* Upper classical leaf scroll vine */}
    <path
      d="M 40 12 C 55 12, 65 5, 84 5 C 96 5, 106 9, 118 12"
      stroke="#fef08a"
      strokeWidth="0.7"
      strokeLinecap="round"
      fill="none"
      opacity="0.9"
    />
    {/* Upper delicate spiral curl */}
    <path
      d="M 84 5 C 88 3, 92 3, 93 5 C 94 6.8, 92.5 8, 90 8 C 87.5 8, 86.5 6.5, 88 5.2"
      stroke="#fde047"
      strokeWidth="0.6"
      fill="none"
      opacity="0.85"
    />

    {/* Lower classical leaf scroll vine */}
    <path
      d="M 40 12 C 55 12, 65 19, 84 19 C 96 19, 106 15, 118 12"
      stroke="#fef08a"
      strokeWidth="0.7"
      strokeLinecap="round"
      fill="none"
      opacity="0.9"
    />
    {/* Lower delicate spiral curl */}
    <path
      d="M 84 19 C 88 21, 92 21, 93 19 C 94 17.2, 92.5 16, 90 16 C 87.5 16, 86.5 17.5, 88 18.8"
      stroke="#fde047"
      strokeWidth="0.6"
      fill="none"
      opacity="0.85"
    />

    {/* Symmetrical Pearl Beads along the axis */}
    <circle cx="15" cy="12" r="0.9" fill="#f59e0b" opacity="0.5" />
    <circle cx="30" cy="12" r="1.1" fill="#fbbf24" opacity="0.7" />
    <circle cx="58" cy="12" r="1.3" fill="#fde047" opacity="0.85" />
    <circle cx="121" cy="12" r="1.4" fill="#fef08a" />

    {/* Sacred 4-point Diamond Crest Jewel at x=102 */}
    <g transform="translate(102, 12)">
      <path d="M 0 -4 L 1.6 0 L 0 4 L -1.6 0 Z" fill="url(#jewel-gold)" />
      <path d="M -4 0 L 0 1.6 L 4 0 L 0 -1.6 Z" fill="url(#jewel-gold)" />
      <circle cx="0" cy="0" r="0.8" fill="#ffffff" />
    </g>

    {/* Royal Lotus Blossom Petal Motif at x=130 facing the invocation */}
    <g transform="translate(130, 12)">
      {/* Central sparkling jewel */}
      <circle cx="0" cy="0" r="1.8" fill="#ffffff" />
      <circle cx="0" cy="0" r="0.9" fill="#d97706" />
      {/* Top petal */}
      <path d="M 0 0 C 1.2 -2.4, 2.4 -4, 0 -5.5 C -2.4 -4, -1.2 -2.4, 0 0 Z" fill="#fef08a" opacity="0.9" />
      {/* Bottom petal */}
      <path d="M 0 0 C 1.2 2.4, 2.4 4, 0 5.5 C -2.4 4, -1.2 2.4, 0 0 Z" fill="#fef08a" opacity="0.9" />
      {/* Inner petal pointing toward invocation */}
      <path d="M 0 0 C 2.2 1, 4 1.8, 6 0 C 4 -1.8, 2.2 -1, 0 0 Z" fill="#ffffff" />
      {/* Outer petal */}
      <path d="M 0 0 C -2.2 1, -3.5 1.8, -5 0 C -3.5 -1.8, -2.2 -1, 0 0 Z" fill="#fde047" opacity="0.85" />
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

  const [bannerFont, setBannerFont] = React.useState<BannerFontId>(() => {
    return (localStorage.getItem('voice_banner_font') as BannerFontId) || 'cinzel';
  });
  const [isFontModalOpen, setIsFontModalOpen] = React.useState(false);
  const activeFont = BANNER_FONTS.find(f => f.id === bannerFont) || BANNER_FONTS[0];

  const handleSelectFont = (id: BannerFontId) => {
    setBannerFont(id);
    localStorage.setItem('voice_banner_font', id);
    const selected = BANNER_FONTS.find(f => f.id === id);
    toast.success(
      language === 'bn' 
        ? `ফন্ট নির্ধারিত হয়েছে: ${selected?.nameBn || id}` 
        : `Banner font set to: ${selected?.name || id}`
    );
  };

  const [canInstall, setCanInstall] = React.useState(false);

  React.useEffect(() => {
    if (Capacitor.isNativePlatform()) return;
    const isStandalone = 
      window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;
    const isInstalled = sessionStorage.getItem('sadhana_pwa_installed') === 'true';
    if (!isStandalone && !isInstalled) {
      setCanInstall(true);
    }

    const handleInstalled = () => {
      setCanInstall(false);
    };

    window.addEventListener('appinstalled', handleInstalled);
    window.addEventListener('pwa_installed_success', handleInstalled);
    return () => {
      window.removeEventListener('appinstalled', handleInstalled);
      window.removeEventListener('pwa_installed_success', handleInstalled);
    };
  }, []);

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
      <div className={`bg-gradient-to-r ${styles.bannerGradient} border-b border-amber-400/25 border-t border-white/15 text-white py-1 sm:py-1.5 px-2.5 sm:px-5 flex items-center justify-between gap-1.5 sm:gap-4 transition-all shadow-xs relative overflow-hidden`}>
        
        {/* Subtle center divine radiance highlight */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-300/15 via-transparent to-transparent pointer-events-none" />

        {/* Left: Srila Prabhupada Circular Portrait */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10" title="His Divine Grace A.C. Bhaktivedanta Swami Prabhupada">
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full ring-1.5 ring-amber-200/80 p-[1px] bg-amber-500/20 shadow-sm shrink-0 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
            <img
              src="/assets/srila_prabhupada_circle.png"
              alt="Srila Prabhupada"
              className="w-full h-full object-cover rounded-full"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/srila_prabhupada.jpg';
              }}
            />
          </div>
          <span className="hidden xl:inline font-medium text-[11px] text-amber-100/90 tracking-wide">
            {language === 'bn' ? 'শ্রীল প্রভুপাদ' : 'Srila Prabhupada'}
          </span>
        </div>

        {/* Center: Symmetrical Vedic Art & Sacred Invocation */}
        <div className="flex items-center justify-center gap-1 sm:gap-2 flex-1 min-w-0 px-0.5 sm:px-1 overflow-hidden z-10">
          {/* Left Symmetrical Art Flourish & Delicate Hairline */}
          <div className="flex-1 flex justify-end items-center gap-1 sm:gap-2 min-w-[8px] overflow-hidden">
            <div className="flex-1 h-[0.5px] bg-gradient-to-r from-transparent via-amber-200/30 to-amber-300/70 max-w-[90px] sm:max-w-[180px]" />
            <RoyalVedicFlourish flip={false} className="hidden sm:block opacity-90" />
            <span className="text-amber-200/60 text-[8px] sm:text-[9px] select-none leading-none">✦</span>
          </div>

          {/* Centerpiece: Sacred Invocation with Ethereal Om Accents */}
          <div 
            onClick={() => setIsFontModalOpen(true)}
            className="flex items-center gap-1 sm:gap-2 shrink-0 px-0.5 sm:px-1 cursor-pointer group hover:scale-[1.01] transition-transform select-none"
            title={language === 'bn' ? 'ফন্ট পরিবর্তন করতে ক্লিক করুন' : 'Click to preview & change font'}
          >
            <span className="text-amber-200/90 font-light text-[10px] sm:text-xs select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
              ॐ
            </span>
            <h2 className={`${language === 'bn' ? activeFont.bnClass : activeFont.enClass} text-xs xs:text-[13px] sm:text-[15px] md:text-base text-amber-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] text-center whitespace-nowrap select-none group-hover:text-amber-200 transition-colors`}>
              {language === 'bn'
                ? 'শ্রীশ্রী গুরু ও গৌরাঙ্গ জয়তু'
                : 'Shree Shree Guru and Gauranga Jayatu'}
            </h2>
            <span className="text-amber-200/90 font-light text-[10px] sm:text-xs select-none drop-shadow-[0_1px_1px_rgba(0,0,0,0.3)]">
              ॐ
            </span>
            <span className="p-0.5 rounded-full bg-white/10 hover:bg-white/20 text-amber-200 transition-all hidden sm:inline-flex items-center justify-center opacity-70 group-hover:opacity-100" title={language === 'bn' ? 'ফন্ট অপশন' : 'Font Options'}>
              <Sparkles className="w-2.5 h-2.5" />
            </span>
          </div>

          {/* Right Symmetrical Art Flourish & Delicate Hairline */}
          <div className="flex-1 flex justify-start items-center gap-1 sm:gap-2 min-w-[8px] overflow-hidden">
            <span className="text-amber-200/60 text-[8px] sm:text-[9px] select-none leading-none">✦</span>
            <RoyalVedicFlourish flip={true} className="hidden sm:block opacity-90" />
            <div className="flex-1 h-[0.5px] bg-gradient-to-l from-transparent via-amber-200/30 to-amber-300/70 max-w-[90px] sm:max-w-[180px]" />
          </div>
        </div>

        {/* Right: IYF Chittagong Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 z-10" title="ISKCON Youth Forum (IYF) Chittagong">
          <span className="hidden xl:inline font-medium text-[11px] text-amber-100/90 tracking-wide">
            IYF
          </span>
          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white ring-1.5 ring-amber-200/80 p-[1.5px] shadow-sm shrink-0 flex items-center justify-center overflow-hidden hover:scale-105 transition-transform">
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
              <div className={`w-7 h-7 xs:w-7.5 xs:h-7.5 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-gradient-to-tr ${styles.bannerGradient} p-0.5 shadow-md flex items-center justify-center overflow-hidden ring-1.5 ring-emerald-400/30`}>
                <img
                  src="/logo.png"
                  alt="Sadhana"
                  className="w-full h-full object-cover rounded-full"
                  onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }}
                />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 bg-green-500 w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full border-2 border-white dark:border-slate-900" />
            </div>
            <h1 className="font-extrabold text-xs xs:text-sm sm:text-base text-slate-800 dark:text-slate-100 leading-tight truncate max-w-[140px] xs:max-w-[180px] sm:max-w-none">
              {language === 'bn' ? 'সাধনা পোর্টাল' : 'Sadhana Portal'}
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

            {/* Install Sadhana PWA App Trigger (shown only in browser when not standalone) */}
            {canInstall && (
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('open_pwa_install_modal'))}
                className="px-2 py-1.5 rounded-xl border border-amber-300/80 dark:border-amber-700/80 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white transition-all shadow-sm flex items-center gap-1 cursor-pointer active:scale-95 animate-pulse hover:animate-none"
                title={language === 'bn' ? 'সাধনা অ্যাপ ইনস্টল করুন' : 'Install Sadhana App'}
              >
                <Download className="w-3.5 h-3.5" />
                <span className="text-[10px] font-extrabold hidden sm:inline">
                  {language === 'bn' ? 'ইনস্টল' : 'Install'}
                </span>
              </button>
            )}

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
      {/* Sacred Invocation Font Showcase Modal */}
      {isFontModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/65 backdrop-blur-sm animate-scale-in">
          <div className="bg-white dark:bg-slate-900 border border-amber-500/30 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className={`bg-gradient-to-r ${styles.bannerGradient} p-4 sm:p-5 text-white flex items-center justify-between`}>
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-white/15 backdrop-blur-xs border border-white/20">
                  <Type className="w-5 h-5 text-amber-200" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg leading-tight">
                    {language === 'bn' ? 'দিব্য আবাহনী ফন্ট নির্বাচন' : 'Sacred Invocation Typography'}
                  </h3>
                  <p className="text-xs text-amber-100/90 mt-0.5">
                    {language === 'bn'
                      ? 'শীর্ষ ব্যানারের জন্য আপনার পছন্দের ফন্ট বেছে নিন'
                      : 'Choose your preferred typography for the top invocation banner'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFontModalOpen(false)}
                className="p-1.5 rounded-full bg-black/20 hover:bg-black/40 text-white/90 hover:text-white transition-colors cursor-pointer"
                title="Close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Font Options List */}
            <div className="p-3.5 sm:p-5 overflow-y-auto space-y-3 divide-y divide-slate-100 dark:divide-slate-800">
              {BANNER_FONTS.map((font) => {
                const isSelected = font.id === bannerFont;
                return (
                  <div
                    key={font.id}
                    onClick={() => handleSelectFont(font.id)}
                    className={`pt-3 first:pt-0 p-3 sm:p-4 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/25 shadow-md ring-2 ring-amber-500/40'
                        : 'border-slate-200 dark:border-slate-800 hover:border-amber-300 dark:hover:border-amber-700/60 bg-white dark:bg-slate-900/50 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm sm:text-base text-slate-800 dark:text-slate-100">
                          {language === 'bn' ? font.nameBn : font.name}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                          {language === 'bn' ? font.badgeBn : font.badge}
                        </span>
                      </div>
                      {isSelected ? (
                        <span className="flex items-center gap-1 text-xs font-extrabold text-amber-600 dark:text-amber-400">
                          <Check className="w-4 h-4" />
                          {language === 'bn' ? 'সক্রিয়' : 'Active'}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-slate-400 group-hover:text-amber-600">
                          {language === 'bn' ? 'সিলেক্ট করুন' : 'Apply'}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-slate-500 dark:text-slate-400 mb-2.5">
                      {language === 'bn' ? font.descriptionBn : font.description}
                    </p>

                    {/* Live Realistic Banner Preview */}
                    <div className={`bg-gradient-to-r ${styles.bannerGradient} rounded-xl py-2 px-3 sm:px-4 text-white flex items-center justify-center gap-2 shadow-xs border border-amber-400/20 overflow-hidden`}>
                      <span className="text-amber-200/80 text-[10px] select-none">✦ ॐ</span>
                      <span className={`${language === 'bn' ? font.bnClass : font.enClass} text-amber-50 drop-shadow-[0_1px_2px_rgba(0,0,0,0.35)] text-center whitespace-nowrap`}>
                        {language === 'bn'
                          ? 'শ্রীশ্রী গুরু ও গৌরাঙ্গ জয়তু'
                          : 'Shree Shree Guru and Gauranga Jayatu'}
                      </span>
                      <span className="text-amber-200/80 text-[10px] select-none">ॐ ✦</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Modal Footer */}
            <div className="p-3.5 sm:p-4 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {language === 'bn'
                  ? 'পছন্দটি ডিভাইসে সংরক্ষিত থাকবে।'
                  : 'Preference is saved.'}
              </span>
              <button
                type="button"
                onClick={() => setIsFontModalOpen(false)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold bg-gradient-to-r ${styles.bannerGradient} text-white shadow-md hover:opacity-95 transition-opacity cursor-pointer`}
              >
                {language === 'bn' ? 'সম্পন্ন' : 'Done'}
              </button>
            </div>

          </div>
        </div>
      )}
    </header>
  );
};
