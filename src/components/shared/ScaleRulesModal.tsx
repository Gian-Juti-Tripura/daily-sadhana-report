import React, { useState } from 'react';
import { 
  X, Moon, Heart, ShieldCheck, 
  Sparkles, Award, Info, Flame
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  SADHANA_SCALES, 
  SCORE_175_CONVERSION_TABLE, 
  SADHANA_PHILOSOPHY 
} from '../../data/sadhanaScalesData';

interface ScaleRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialScaleId?: 1 | 2 | 3 | 4;
}

export const ScaleRulesModal: React.FC<ScaleRulesModalProps> = ({
  isOpen,
  onClose,
  initialScaleId = 2
}) => {
  const { language } = useLanguage();
  const { styles } = useTheme();
  const [activeTab, setActiveTab] = useState<'SCALE' | 'CONVERSION' | 'PHILOSOPHY'>('SCALE');
  const [selectedScale, setSelectedScale] = useState<1 | 2 | 3 | 4>(initialScaleId);

  if (!isOpen) return null;

  const scale = SADHANA_SCALES[selectedScale];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${styles.bannerGradient} text-white flex items-center justify-between shrink-0 shadow-md`}>
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
              <Award className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                {language === 'bn' ? 'ভয়েস সাধনা স্কেল ও ১৭৫ মূল্যায়ন পদ্ধতি' : 'VOICE Sadhana Scales & 175 Evaluation Matrix'}
              </h2>
              <p className="text-[11px] text-white/80 font-medium">
                {language === 'bn' ? 'শারীরিক সাধনাপত্র পুস্তিকা অনুযায়ী অনুমোদিত নিয়মাবলী' : 'Official physical booklet rules & system guidelines'}
              </p>
            </div>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/15 hover:bg-white/25 text-white transition-all cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 shrink-0 gap-2 flex-wrap">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <button
              onClick={() => setActiveTab('SCALE')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'SCALE'
                  ? `${styles.btnPrimary} text-white shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'স্কেল বিবরণী' : 'Scale Rubrics'}
            </button>
            <button
              onClick={() => setActiveTab('CONVERSION')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'CONVERSION'
                  ? `${styles.btnPrimary} text-white shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? '১৭৫ রূপান্তর ছক' : '175 Matrix Chart'}
            </button>
            <button
              onClick={() => setActiveTab('PHILOSOPHY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'PHILOSOPHY'
                  ? `${styles.btnPrimary} text-white shadow-xs`
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {language === 'bn' ? 'দর্শন ও দায়িত্ব' : 'Philosophy & Care'}
            </button>
          </div>

          {/* Scale 1-4 Pill Selector (Visible when SCALE tab active) */}
          {activeTab === 'SCALE' && (
            <div className="flex items-center space-x-1 bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-2xs">
              {([1, 2, 3, 4] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setSelectedScale(s)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all cursor-pointer ${
                    selectedScale === s
                      ? 'bg-amber-500 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-amber-600'
                  }`}
                >
                  Scale {s}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">

          {/* TAB 1: SCALE RUBRICS */}
          {activeTab === 'SCALE' && (
            <div className="space-y-6">
              
              {/* Scale Header Banner */}
              <div className="p-4 rounded-2xl bg-amber-50 dark:bg-slate-800/80 border border-amber-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-amber-500 text-white">
                      SCALE {scale.scaleId}
                    </span>
                    <h3 className="font-black text-base text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? scale.titleBn : scale.titleEn}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">
                    {language === 'bn' ? scale.targetAudienceBn : scale.targetAudienceEn}
                  </p>
                </div>

                {/* Gita Verse Quote */}
                <div className="text-right sm:max-w-xs text-[11px] text-amber-800 dark:text-amber-300 font-serif italic border-l-2 border-amber-400 pl-3">
                  "যুক্তাহারবিহারস্য যুক্তচেষ্টস্য কর্মসু । যুক্তস্বপ্নাববোধস্য যোগো ভবতি দুঃখহা ॥"
                  <span className="block text-[10px] text-slate-500 not-italic font-sans">
                    — ভগবদ্গীতা ৬.১৭
                  </span>
                </div>
              </div>

              {/* 1. BODY SECTION (Nidra - Bed, Wake, Day Sleep) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Moon className="w-4 h-4 text-indigo-500" />
                  <h4 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {language === 'bn' ? '১. দেহ সম্পর্কিত নিয়মাবলী (Body)' : '1. Body Regulation'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* To Bed */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'শয়ন (Nidra - To Bed)' : 'Nidra - To Bed'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Max 25 pts</span>
                    </div>
                    <div className="space-y-1">
                      {scale.toBed.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-600 dark:text-slate-400">{tier.label}</span>
                          <span className={`font-mono font-bold ${tier.marks > 0 ? 'text-emerald-600 dark:text-emerald-400' : tier.marks === 0 ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {tier.marks > 0 ? `+${tier.marks}` : tier.marks} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Wake Up */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'জাগরণ (Nidra - Wake Up)' : 'Nidra - Wake Up'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Max 25 pts</span>
                    </div>
                    <div className="space-y-1">
                      {scale.wakeUp.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-600 dark:text-slate-400">{tier.label}</span>
                          <span className={`font-mono font-bold ${tier.marks > 0 ? 'text-emerald-600 dark:text-emerald-400' : tier.marks === 0 ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {tier.marks > 0 ? `+${tier.marks}` : tier.marks} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Day Sleep */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'দিবানিদ্রা (Day Sleep)' : 'Nidra - Day Sleep'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Max 25 pts</span>
                    </div>
                    <div className="space-y-1">
                      {scale.daySleep.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-600 dark:text-slate-400">{tier.label}</span>
                          <span className={`font-mono font-bold ${tier.marks > 0 ? 'text-emerald-600 dark:text-emerald-400' : tier.marks === 0 ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {tier.marks > 0 ? `+${tier.marks}` : tier.marks} pts
                          </span>
                        </div>
                      ))}
                    </div>
                    {scale.scaleId >= 3 && (
                      <p className="text-[10px] text-amber-700 dark:text-amber-400 font-semibold pt-1 border-t border-slate-200 dark:border-slate-700">
                        * {language === 'bn' ? 'দীর্ঘ ভ্রমণের ক্ষেত্রে ১ ঘণ্টা অতিরিক্ত বোনাস দিবানিদ্রা অনুমোদিত।' : 'ONE HOUR bonus day sleep free for long journey.'}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. SOUL SECTION (Japa, SP Books, Lecture Hearing) */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Flame className="w-4 h-4 text-amber-500" />
                  <h4 className="font-black text-sm uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    {language === 'bn' ? '২. আত্মা সম্পর্কিত নিয়মাবলী (Soul)' : '2. Soul Cultivation'}
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* Japa */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'জপ (১৬ মালা সম্পন্ন)' : 'JAPA - All Rounds before'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Max 25 pts</span>
                    </div>
                    <div className="space-y-1">
                      {scale.japa.map((tier, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs py-0.5">
                          <span className="text-slate-600 dark:text-slate-400">{tier.label}</span>
                          <span className={`font-mono font-bold ${tier.marks > 0 ? 'text-emerald-600 dark:text-emerald-400' : tier.marks === 0 ? 'text-slate-400' : 'text-rose-600 dark:text-rose-400'}`}>
                            {tier.marks > 0 ? `+${tier.marks}` : tier.marks} pts
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SP Books */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'প্রভুপাদের গ্রন্থ অধ্যয়ন' : 'SP Books Daily'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Max 25 pts</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 dark:text-slate-300">
                          {language === 'bn' ? 'দৈনিক ৩০ মিনিট বা ততোধিক' : '30 Minutes or more daily'}
                        </span>
                        <span className="font-bold text-emerald-600 dark:text-emerald-400">25 pts</span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {language === 'bn' ? 'নিয়মিত নোট গ্রহণ ও উপলব্ধি সংরক্ষণ আবশ্যক।' : 'Active note-taking and realization required.'}
                      </p>
                    </div>
                  </div>

                  {/* Prescribed Hearing */}
                  <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700/80 space-y-2">
                    <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                      <span className="font-bold text-xs text-slate-800 dark:text-slate-200">
                        {language === 'bn' ? 'প্রবচন শ্রবণ (Lecture Hearing)' : 'Prescribed Lecture Hearing'}
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">Max 25 pts</span>
                    </div>
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
                      <span className="font-bold text-slate-800 dark:text-slate-200 block">
                        {language === 'bn' ? scale.prescribedHearing.noteBn : scale.prescribedHearing.noteEn}
                      </span>
                      {scale.scaleId === 4 && (
                        <div className="space-y-1 text-[11px] text-slate-600 dark:text-slate-400 border-t border-slate-200 dark:border-slate-700 pt-1.5">
                          <div className="flex justify-between">
                            <span>Guru Mah: 100+ min</span>
                            <span className="font-bold text-emerald-600">75 pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>SP Lecture: 100+ min</span>
                            <span className="font-bold text-emerald-600">75 pts</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Other Lecture: 50+ min</span>
                            <span className="font-bold text-emerald-600">20 pts</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. SEVA & OTHERS GRID */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* SEVA */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <Heart className="w-4 h-4 text-rose-500" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {language === 'bn' ? '৩. সেবা ও একাডেমিক / ক্যারিয়ার পড়াশোনা (Seva)' : '3. Seva & Academic / Career Study'}
                    </h4>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-bold block text-slate-900 dark:text-slate-100">STUDY / ACADEMICS / CAREER (Max 25 pts):</span>
                      <span className="text-[11px] text-slate-500">2h+ = 25 pts | 1:45h = 20 pts | 1:30h = 15 pts | 1h = 10 pts | 30m = 5 pts</span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-bold block text-slate-900 dark:text-slate-100">CLEANING (25 pts):</span>
                      <span className="text-[11px] text-slate-500">Washing clothes everyday & extra cleaning (spider nets, ceiling, fans).</span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-bold block text-slate-900 dark:text-slate-100">FOLLOW UP (25 pts):</span>
                      <span className="text-[11px] text-slate-500">Care of 2+ students outside VOICE, calling, MMC, DYS presentation.</span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
                      <span className="font-bold block text-slate-900 dark:text-slate-100">BBT / BTG (25 pts):</span>
                      <span className="text-[11px] text-slate-500">Distribute books in free time & subscribe teachers/contacts to BTG & CS.</span>
                    </div>
                  </div>
                </div>

                {/* OTHERS */}
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 space-y-2.5">
                  <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-700 pb-1.5">
                    <Sparkles className="w-4 h-4 text-purple-500" />
                    <h4 className="font-black text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                      {language === 'bn' ? '৪. অন্যান্য বিধান (Others)' : '4. Others Regulations'}
                    </h4>
                  </div>
                  
                  <div className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-slate-100">MORNING CLASS:</span>
                        <span className="text-[11px] text-slate-500">7 Morning Classes on time (Late = 5 pts)</span>
                      </div>
                      <span className="font-bold text-emerald-600">25 pts/day</span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-slate-100">SADHANA CARD:</span>
                        <span className="text-[11px] text-slate-500">Filling sadhana card daily before sleep</span>
                      </div>
                      <span className="font-bold text-emerald-600">25 pts</span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-slate-100">SLOKA MEMORIZING:</span>
                        <span className="text-[11px] text-slate-500">Memorizing 1 sloka per week</span>
                      </div>
                      <span className="font-bold text-emerald-600">25 pts</span>
                    </div>

                    <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <div>
                        <span className="font-bold block text-slate-900 dark:text-slate-100">BHAJAN / GAYATRI:</span>
                        <span className="text-[11px] text-slate-500">Daily recitation & contemplation</span>
                      </div>
                      <span className="font-bold text-emerald-600">25 pts</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: 175 MATRIX CHART */}
          {activeTab === 'CONVERSION' && (
            <div className="space-y-5">
              
              {/* Formula Explanation Card */}
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-slate-800 border border-amber-300 dark:border-slate-700 space-y-2">
                <div className="flex items-center gap-2">
                  <Info className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {language === 'bn' ? '১৭৫ নম্বর ম্যাট্রিক্সের গাণিতিক নীতি' : 'Mathematical Formula of the 175 Matrix'}
                  </h4>
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                  {language === 'bn' 
                    ? 'সাধনাপত্রে প্রতিটি কলামের দৈনিক সর্বোচ্চ মান ২৫ নম্বর। সপ্তাহে ৭ দিন × ২৫ = মোট ১৭৫ নম্বর। প্রতিটি কলামে অর্জিত মোট নম্বরের উপর ভিত্তি করে শতাংশ হিসাব করা হয় (Math.floor(Marks / 175 * 100)) যা সরাসরি নিচে প্রদর্শিত অনুমোদিত সারণির সাথে মিলে যায়।'
                    : 'Each column has a daily maximum of 25 marks. Over 7 days, 7 days × 25 marks = 175 maximum marks per column. The column percentage is derived via Math.floor(Marks / 175 * 100), matching the physical card chart printed below.'}
                </p>
              </div>

              {/* Complete Printed 175 Scale Lookup Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {language === 'bn' ? '১৭৫ নম্বর রূপান্তর চার্ট (Physical Card Reference)' : '175 Marks Conversion Chart (Physical Card Reference)'}
                  </h5>
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400">
                    Score & %
                  </span>
                </div>

                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-12 gap-2">
                  {SCORE_175_CONVERSION_TABLE.map(item => (
                    <div 
                      key={item.score}
                      className="p-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center font-mono shadow-2xs hover:border-amber-400 transition-all"
                    >
                      <div className="text-[10px] uppercase font-bold text-slate-400">Score</div>
                      <div className="text-sm font-black text-slate-800 dark:text-slate-100">{item.score}</div>
                      <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>
                      <div className="text-[10px] uppercase font-bold text-amber-500">%</div>
                      <div className="text-xs font-black text-amber-600 dark:text-amber-400">{item.pct}%</div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: PHILOSOPHY & CARE */}
          {activeTab === 'PHILOSOPHY' && (
            <div className="space-y-6">
              
              {/* Why Sadhana Card */}
              <div className="p-5 rounded-2xl bg-amber-500/10 dark:bg-slate-800/90 border border-amber-300 dark:border-slate-700 space-y-3.5">
                <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-2.5">
                  <h4 className="font-black text-sm sm:text-base text-amber-900 dark:text-amber-300 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-amber-600" />
                    <span>{language === 'bn' ? SADHANA_PHILOSOPHY.whySadhanaCard.titleBn : SADHANA_PHILOSOPHY.whySadhanaCard.titleEn}</span>
                  </h4>
                  <span className="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    {language === 'bn' ? 'শ্রীল ভক্তিবিনোদ ঠাকুরের ভক্তি পিরামিড' : 'Bhakti Pyramid'}
                  </span>
                </div>

                {/* Intro Prose */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                  {language === 'bn' ? SADHANA_PHILOSOPHY.whySadhanaCard.introBn : SADHANA_PHILOSOPHY.whySadhanaCard.introEn}
                </p>

                {/* Verse Quote Box */}
                <div className="p-3 bg-white/80 dark:bg-slate-900/80 rounded-xl border border-amber-200/80 dark:border-slate-700 text-center font-serif italic text-xs text-amber-900 dark:text-amber-300">
                  {SADHANA_PHILOSOPHY.whySadhanaCard.verse}
                </div>

                {/* 6 Core Points */}
                <div className="space-y-2 pt-1">
                  {(language === 'bn' ? SADHANA_PHILOSOPHY.whySadhanaCard.pointsBn : SADHANA_PHILOSOPHY.whySadhanaCard.pointsEn).map((pt, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                      <span className="leading-relaxed">{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 10 Responsibilities & 8 Principles Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Counselor 10 Responsibilities */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h5 className="font-black text-xs uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-amber-600" />
                      <span>{language === 'bn' ? SADHANA_PHILOSOPHY.counselorResponsibilities.titleBn : SADHANA_PHILOSOPHY.counselorResponsibilities.titleEn}</span>
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">১০টি নীতি</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {(language === 'bn' ? SADHANA_PHILOSOPHY.counselorResponsibilities.rulesBn : SADHANA_PHILOSOPHY.counselorResponsibilities.rulesEn).map((r, i) => (
                      <li key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-bold text-amber-600 dark:text-amber-400 shrink-0">✓</span>
                        <span>{r}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Counselee 8 Principles */}
                <div className="p-4 sm:p-5 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-2">
                    <h5 className="font-black text-xs uppercase tracking-wider text-purple-700 dark:text-purple-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-purple-600" />
                      <span>{language === 'bn' ? SADHANA_PHILOSOPHY.counseleeResponsibilities.titleBn : SADHANA_PHILOSOPHY.counseleeResponsibilities.titleEn}</span>
                    </h5>
                    <span className="text-[10px] font-bold text-slate-400">৮টি মূল দায়িত্ব</span>
                  </div>
                  <div className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                    {(language === 'bn' ? SADHANA_PHILOSOPHY.counseleeResponsibilities.rulesBn : SADHANA_PHILOSOPHY.counseleeResponsibilities.rulesEn).map((r, i) => (
                      <div key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="font-bold text-purple-600 dark:text-purple-400 shrink-0">•</span>
                        <div className="whitespace-pre-line">{r}</div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* How to Fill Up the Card (কিভাবে পূরণ করব) */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                  <h5 className="font-black text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-emerald-600" />
                    <span>{language === 'bn' ? SADHANA_PHILOSOPHY.howToFillUp.titleBn : SADHANA_PHILOSOPHY.howToFillUp.titleEn}</span>
                  </h5>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 font-mono">
                    Official Guide
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {(language === 'bn' ? SADHANA_PHILOSOPHY.howToFillUp.stepsBn : SADHANA_PHILOSOPHY.howToFillUp.stepsEn).map((step, idx) => (
                    <div key={idx} className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
                      <span className="font-bold text-amber-600 dark:text-amber-400 block">
                        {language === 'bn' ? `ধাপ ${idx + 1}` : `Step ${idx + 1}`}
                      </span>
                      <p className="leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            {language === 'bn' ? 'ভয়েস সাধনাপত্র ও পারমার্থিক জীবনধারা' : 'VOICE Sadhana & Spiritual Care System'}
          </span>
          <button
            onClick={onClose}
            className={`px-5 py-2 rounded-xl text-xs font-bold ${styles.btnPrimary} text-white shadow-sm cursor-pointer`}
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
