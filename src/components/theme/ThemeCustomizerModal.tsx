import React from 'react';
import { createPortal } from 'react-dom';
import { 
  X, Sun, Moon, Laptop, Check, 
  RotateCcw, Palette, Flower2, Flame, Image as ImageIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  THEME_PALETTES, 
  type ThemeMode, 
  type ThemePaletteId 
} from '../../utils/themeSettings';
import { triggerHaptic } from '../../utils/haptics';

interface ThemeCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ThemeCustomizerModal: React.FC<ThemeCustomizerModalProps> = ({ isOpen, onClose }) => {
  const { language } = useLanguage();
  const {
    settings,
    styles,
    setMode,
    setPalette,
    toggleFlowerShower,
    toggleLighting,
    toggleBackground,
    resetDefaults
  } = useTheme();

  if (!isOpen) return null;

  const handleModeChange = (mode: ThemeMode) => {
    triggerHaptic();
    setMode(mode);
  };

  const handlePaletteChange = (palette: ThemePaletteId) => {
    triggerHaptic();
    setPalette(palette);
  };

  const handleToggleFlowers = () => {
    triggerHaptic();
    toggleFlowerShower();
  };

  const handleToggleLighting = () => {
    triggerHaptic();
    toggleLighting();
  };

  const handleToggleBackground = () => {
    triggerHaptic();
    toggleBackground();
  };

  const handleReset = () => {
    triggerHaptic();
    resetDefaults();
  };

  return createPortal(
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in overflow-y-auto"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden transition-all my-auto max-h-[92vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Sacred Aesthetic */}
        <div className={`px-5 py-4 sm:px-6 sm:py-5 border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r ${styles.bannerGradient} text-white flex items-center justify-between shrink-0 shadow-sm`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center shadow-md">
              <Palette size={20} />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                <span>{language === 'bn' ? 'থিম ও ভিজ্যুয়াল স্টাইল' : 'Theme & Visual Experience'}</span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-white/25 text-white shadow-xs">
                  Pro
                </span>
              </h3>
              <p className="text-[11px] text-white/80">
                {language === 'bn' 
                  ? 'ব্যক্তিগত পছন্দের রঙ, আলোকসজ্জা ও পরিবেশ কাস্টমাইজ করুন' 
                  : 'Personalize your colors, divine lighting & devotional mood'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/20 transition-colors cursor-pointer"
            title="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          
          {/* SECTION 1: Appearance Mode (Light / Dark / System) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'bn' ? '১. মোড নির্বাচন (Light / Dark)' : '1. Appearance Mode'}
              </span>
              <span className={`text-[11px] font-bold ${styles.primaryTextColor}`}>
                {settings.mode === 'light' 
                  ? (language === 'bn' ? '☀️ দিনের আলো (ভাইব্রেন্ট)' : '☀️ Light Mode (Vibrant)') 
                  : settings.mode === 'dark' 
                  ? (language === 'bn' ? '🌙 নির্মল রাত্রি (অন্ধকার)' : '🌙 Dark Mode') 
                  : (language === 'bn' ? '💻 সিস্টেম অটো' : '💻 System Auto')}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {/* Light Mode */}
              <button
                onClick={() => handleModeChange('light')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.mode === 'light'
                    ? 'bg-amber-500/10 border-amber-500 ring-2 ring-amber-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-amber-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-amber-100 dark:bg-slate-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs">
                  <Sun size={17} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'দিনের আলো' : 'Light Mode'}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1">
                  {language === 'bn' ? 'উজ্জ্বল ও স্পষ্ট' : 'Bright & Vibrant'}
                </span>
              </button>

              {/* Dark Mode */}
              <button
                onClick={() => handleModeChange('dark')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.mode === 'dark'
                    ? 'bg-indigo-500/10 border-indigo-500 ring-2 ring-indigo-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-indigo-100 dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs">
                  <Moon size={17} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'অন্ধকার' : 'Dark Mode'}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1">
                  {language === 'bn' ? 'মন্দির নিশীথ' : 'Temple Night'}
                </span>
              </button>

              {/* System Mode */}
              <button
                onClick={() => handleModeChange('system')}
                className={`p-3 rounded-2xl border text-center flex flex-col items-center gap-1.5 transition-all cursor-pointer ${
                  settings.mode === 'system'
                    ? 'bg-slate-500/10 border-slate-500 ring-2 ring-slate-500/40 shadow-sm'
                    : 'bg-slate-50 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                }`}
              >
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 flex items-center justify-center shadow-xs">
                  <Laptop size={17} />
                </div>
                <span className="text-xs font-black text-slate-900 dark:text-white">
                  {language === 'bn' ? 'সিস্টেম' : 'Auto System'}
                </span>
                <span className="text-[10px] text-slate-500 line-clamp-1">
                  {language === 'bn' ? 'ডিভাইসের সাথে' : 'Sync Device'}
                </span>
              </button>
            </div>
          </div>

          {/* SECTION 2: Personal Choice Color Themes (Chrome Browser Style) */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'bn' ? '২. ব্যক্তিগত রঙের থিম (Personal Color Themes)' : '2. Personal Choice Palettes'}
              </span>
              <span className="text-[10px] text-slate-400">
                {language === 'bn' ? '৬টি আধ্যাত্মিক থিম' : '6 Spiritual Themes'}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {THEME_PALETTES.map((palette) => {
                const isSelected = settings.palette === palette.id;
                return (
                  <button
                    key={palette.id}
                    onClick={() => handlePaletteChange(palette.id)}
                    className={`relative p-3 rounded-2xl border text-left transition-all flex items-start gap-3 cursor-pointer group ${
                      isSelected
                        ? 'ring-2 shadow-sm'
                        : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-100/80 dark:hover:bg-slate-800/70'
                    }`}
                    style={{
                      borderColor: isSelected ? palette.primaryHex : undefined,
                      boxShadow: isSelected ? `0 0 0 2px ${palette.primaryHex}40` : undefined,
                      backgroundColor: isSelected ? `${palette.primaryHex}10` : undefined
                    }}
                  >
                    {/* Swatch Preview Discs */}
                    <div className="flex -space-x-1.5 shrink-0 mt-1">
                      {palette.previewColors.map((color, idx) => (
                        <div
                          key={idx}
                          className="w-5 h-5 rounded-full ring-2 ring-white dark:ring-slate-900 shadow-xs"
                          style={{ backgroundColor: color }}
                        />
                      ))}
                    </div>

                    {/* Text Details */}
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-xs font-black text-slate-900 dark:text-white line-clamp-1">
                        {language === 'bn' ? palette.nameBn : palette.nameEn}
                      </div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                        {language === 'bn' ? palette.taglineBn : palette.taglineEn}
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    {isSelected && (
                      <span 
                        className="absolute top-3 right-3 w-5 h-5 text-white rounded-full flex items-center justify-center text-[10px] font-black shadow-xs"
                        style={{ backgroundColor: palette.primaryHex }}
                      >
                        <Check size={12} strokeWidth={3} />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* SECTION 3: Visual Effects & Devotional Atmosphere Toggles */}
          <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-500">
                {language === 'bn' ? '৩. আধ্যাত্মিক পরিবেশ ও ভিজ্যুয়াল ইফেক্টস' : '3. Devotional Atmosphere & Effects'}
              </span>
            </div>

            {/* Toggle 1: Flower Showering Effect */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <Flower2 size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'পুষ্পবৃষ্টি ইফেক্ট (Flower Showering)' : 'Flower Showering Effect'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'স্ক্রিনের উপর মৃদু পুষ্প ও তুলসী বৃষ্টির প্রবাহ' : 'Gentle spiritual petals shower across the screen'}
                  </div>
                </div>
              </div>

              {/* Switch */}
              <button
                onClick={handleToggleFlowers}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.flowerShower ? 'bg-rose-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.flowerShower}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform absolute top-1 ${
                    settings.flowerShower ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Ambient Divine Lighting & Sunrays */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Flame size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'আলো ও সূর্যপ্রভা (Divine Lighting & Rays)' : 'Divine Lighting & Sunrays'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'পৃষ্ঠার উপরিভাগে মৃদু দিব্য আলোর জ্যোতি' : 'Radiating divine glowing aura above banner'}
                  </div>
                </div>
              </div>

              {/* Switch */}
              <button
                onClick={handleToggleLighting}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.lightingEffects ? 'bg-amber-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.lightingEffects}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform absolute top-1 ${
                    settings.lightingEffects ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 3: Sri Krishna Spiritual Sky */}
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-900 dark:text-white">
                    {language === 'bn' ? 'শ্রীকৃষ্ণ পটভূমি (Spiritual Sky Atmosphere)' : 'Sri Krishna Spiritual Sky'}
                  </div>
                  <div className="text-[10px] text-slate-500">
                    {language === 'bn' ? 'মৃদু আধ্যাত্মিক টেক্সচার ব্যাকগ্রাউন্ড' : 'Subtle spiritual texture background atmosphere'}
                  </div>
                </div>
              </div>

              {/* Switch */}
              <button
                onClick={handleToggleBackground}
                className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                  settings.backgroundAtmosphere ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-700'
                }`}
                role="switch"
                aria-checked={settings.backgroundAtmosphere}
              >
                <div 
                  className={`w-4 h-4 rounded-full bg-white shadow-md transform transition-transform absolute top-1 ${
                    settings.backgroundAtmosphere ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            </div>

          </div>

        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className={`flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:${styles.primaryTextColor} transition-colors cursor-pointer`}
          >
            <RotateCcw size={13} />
            <span>{language === 'bn' ? 'ডিফল্ট সেটিংসে ফিরুন' : 'Reset to Defaults'}</span>
          </button>

          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl ${styles.btnPrimary} font-black text-xs shadow-md hover:opacity-95 transition-all cursor-pointer`}
          >
            {language === 'bn' ? 'সম্পন্ন' : 'Done'}
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
