import React, { useState, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  ShieldCheck, CheckCircle2, Clock, MessageSquare, Search, Sparkles, Award
} from 'lucide-react';
import type { CounseleeProfile } from '../../types/sadhana';
import { getRegisteredCounselees, PRIMARY_COUNSELOR } from '../../data/counseleesData';
import { SADHANA_PHILOSOPHY } from '../../data/sadhanaScalesData';
import { ScaleRulesModal } from '../../components/shared/ScaleRulesModal';
import { toast } from 'react-hot-toast';

interface CounselorDeskPageProps {
  activeDevotee: CounseleeProfile;
  onSelectDevotee: (devotee: CounseleeProfile) => void;
  onSwitchToCard: () => void;
}

interface CounseleeLiveState {
  profile: CounseleeProfile;
  submittedToday: boolean;
  submissionTime?: string;
  bodyScore: number;
  soulScore: number;
  wakeUp: string;
  bedTime: string;
  japaRounds: number;
  mangalarati: boolean;
  seva: string;
  avgWeeklyScore: number;
}

export const CounselorDeskPage: React.FC<CounselorDeskPageProps> = ({
  activeDevotee,
  onSelectDevotee,
  onSwitchToCard
}) => {
  const { language } = useLanguage();
  const { styles } = useTheme();
  const [counselees] = useState<CounseleeProfile[]>(getRegisteredCounselees());
  const [filterScale, setFilterScale] = useState<'ALL' | '1' | '2' | '3' | '4'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'SUBMITTED' | 'PENDING'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);

  // Mock live submission statuses for counselor monitoring
  const liveDevoteeList: CounseleeLiveState[] = useMemo(() => {
    return counselees.map((dev, idx) => {
      // Create realistic initial states
      const isSubmitted = idx !== 3 && idx !== 6 && idx !== 9; // mostly submitted
      return {
        profile: dev,
        submittedToday: isSubmitted,
        submissionTime: isSubmitted ? (idx % 2 === 0 ? '08:15 AM' : '07:45 AM') : undefined,
        bodyScore: isSubmitted ? (90 - (idx % 3) * 4) : 0,
        soulScore: isSubmitted ? (94 - (idx % 2) * 5) : 0,
        wakeUp: isSubmitted ? (idx % 2 === 0 ? '3.55 AM' : '4.10 AM') : '—',
        bedTime: isSubmitted ? (idx % 2 === 0 ? '10.30 PM' : '10.45 PM') : '—',
        japaRounds: isSubmitted ? 16 : 0,
        mangalarati: isSubmitted,
        seva: idx === 0 ? 'Translating Utkarsha Book' : idx === 1 ? '1. Offering Arati & Sringer' : 'Prasadam & Temple Seva',
        avgWeeklyScore: 84 + ((idx * 3) % 14)
      };
    });
  }, [counselees]);

  const filteredDevotees = useMemo(() => {
    return liveDevoteeList.filter(d => {
      if (filterScale !== 'ALL' && d.profile.scaleId.toString() !== filterScale) return false;
      if (filterStatus === 'SUBMITTED' && !d.submittedToday) return false;
      if (filterStatus === 'PENDING' && d.submittedToday) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return d.profile.name.toLowerCase().includes(q) || (d.profile.spiritualName || '').toLowerCase().includes(q);
      }
      return true;
    });
  }, [liveDevoteeList, filterScale, filterStatus, searchQuery]);

  // Summary Metrics
  const submittedCount = liveDevoteeList.filter(d => d.submittedToday).length;
  const pendingCount = liveDevoteeList.length - submittedCount;
  const highAchieversCount = liveDevoteeList.filter(d => d.avgWeeklyScore >= 85).length;

  const handleSendFeedback = (dev: CounseleeLiveState) => {
    const text = `Hare Krishna ${dev.profile.name} Prabhu! 
Blessings from ${PRIMARY_COUNSELOR.name}.
${dev.submittedToday 
  ? `I reviewed your daily sadhana report for today. Your 16 rounds japa and wake-up at ${dev.wakeUp} are inspiring! Keep striving for constant dynamic growth in Krishna consciousness.` 
  : `Gentle reminder to fill up your Daily Sadhana Report tonight before taking rest. Sadhana is our spiritual medical report!`}`;
    
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 py-6 space-y-6">
      
      {/* Counselor Header */}
      <div className={`bg-gradient-to-r ${styles.bannerGradient} rounded-3xl p-6 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4`}>
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-white/20 text-white border border-white/30">
              {language === 'bn' ? 'কাউন্সেলর মনিটরিং পোর্টাল' : 'Counselor Oversight Portal'}
            </span>
            <span className="text-xs text-amber-100 font-medium">Central VOICE, IYF Chittagong</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {language === 'bn' ? 'কাউন্সেলর ড্যাশবোর্ড' : 'Counselor Dashboard'}
          </h2>
          <p className="text-xs sm:text-sm text-amber-100/90 mt-1 max-w-xl">
            {language === 'bn'
              ? 'সকল কাউন্সেলীদের সাধনার অবস্থান পর্যবেক্ষণ করুন এবং যত্নশীল পরামর্শ প্রদান করুন।'
              : 'Monitor all counselees\' sadhana status and provide caring spiritual guidance.'}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 shrink-0">
          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] sm:text-xs text-amber-100 font-bold block">
              {language === 'bn' ? 'আজ দাখিলকৃত' : 'Submitted'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{submittedCount}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] sm:text-xs text-amber-100 font-bold block">
              {language === 'bn' ? 'বাকি আছে' : 'Pending'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{pendingCount}</span>
          </div>

          <div className="bg-white/10 backdrop-blur-md p-3 rounded-2xl border border-white/20 text-center">
            <span className="text-[10px] sm:text-xs text-amber-100 font-bold block">
              {language === 'bn' ? 'সেরা স্কোরার' : 'Grade A+'}
            </span>
            <span className="text-xl sm:text-2xl font-black text-white">{highAchieversCount}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border ${styles.accentBorderColor} shadow-sm flex flex-wrap items-center justify-between gap-3`}>
        
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={language === 'bn' ? 'ভক্তের নাম বা দীক্ষার নাম দিয়ে খুঁজুন...' : 'Search by counselee name...'}
            className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/60"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          <button
            onClick={() => setFilterStatus('ALL')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === 'ALL' ? `${styles.btnPrimary}` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'bn' ? 'সকল' : 'All'} ({liveDevoteeList.length})
          </button>
          <button
            onClick={() => setFilterStatus('SUBMITTED')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === 'SUBMITTED' ? 'bg-green-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'bn' ? 'দাখিলকৃত' : 'Done'} ({submittedCount})
          </button>
          <button
            onClick={() => setFilterStatus('PENDING')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === 'PENDING' ? 'bg-rose-600 text-white shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            {language === 'bn' ? 'বাকি' : 'Pending'} ({pendingCount})
          </button>
        </div>

        {/* Scale Filter */}
        <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
          {(['ALL', '1', '2', '3', '4'] as const).map(s => (
            <button
              key={s}
              onClick={() => setFilterScale(s)}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                filterScale === s ? `${styles.btnPrimary}` : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {s === 'ALL' ? (language === 'bn' ? 'সব স্কেল' : 'All Scales') : `Scale ${s}`}
            </button>
          ))}
        </div>

        {/* View Scale Rules Modal Button */}
        <button
          type="button"
          onClick={() => setIsScaleModalOpen(true)}
          className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-amber-50 dark:hover:bg-slate-700 hover:text-amber-600 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
          title={language === 'bn' ? '৪টি স্কেলের অনুমোদিত নিয়মাবলী দেখুন' : 'View all 4 scale rubrics & guidelines'}
        >
          <Award className="w-3.5 h-3.5 text-amber-500" />
          <span>{language === 'bn' ? 'স্কেল গাইড ও নিয়মাবলী' : 'Scale Rubrics Guide'}</span>
        </button>

      </div>

      {/* Counselees Live Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDevotees.map((item) => {
          const isSelected = item.profile.id === activeDevotee.id;

          return (
            <div
              key={item.profile.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all shadow-sm flex flex-col justify-between ${
                isSelected
                  ? `border-transparent ring-2 ${styles.activeRing} ring-opacity-40 shadow-md`
                  : `border-slate-200 dark:border-slate-800 hover:${styles.accentBorderColor}`
              }`}
            >
              <div>
                {/* Header info */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-xl ${styles.btnPrimary} font-bold flex items-center justify-center text-base shadow-sm shrink-0`}>
                      {item.profile.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-800 dark:text-slate-100">
                        {item.profile.name}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {item.profile.spiritualName ? `${item.profile.spiritualName} • ` : ''}Scale {item.profile.scaleId}
                      </p>
                    </div>
                  </div>

                  {item.submittedToday ? (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>{item.submissionTime || 'Submitted'}</span>
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </span>
                  )}
                </div>

                {/* Key Metrics Snapshot */}
                <div className="grid grid-cols-3 gap-2 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700/60 text-center mb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium block">Wake Up</span>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{item.wakeUp}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Japa</span>
                    <span className="text-xs font-bold text-amber-600">{item.japaRounds} Rds</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 font-medium block">Avg Score</span>
                    <span className="text-xs font-bold text-green-600">{item.avgWeeklyScore}%</span>
                  </div>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 mb-3">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Seva:</span> {item.seva}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    onSelectDevotee(item.profile);
                    onSwitchToCard();
                    toast.success(`Opening 7-day card for ${item.profile.name}`);
                  }}
                  className={`flex-1 py-1.5 px-2.5 rounded-xl ${styles.subtleBgColor} ${styles.primaryTextColor} hover:opacity-90 text-xs font-bold transition-all text-center`}
                >
                  {language === 'bn' ? 'সাধনাপত্র দেখুন' : 'Inspect Card'}
                </button>

                <button
                  onClick={() => handleSendFeedback(item)}
                  className="p-1.5 rounded-xl bg-green-50 dark:bg-green-950/40 hover:bg-green-100 text-green-700 dark:text-green-300 text-xs transition-all flex items-center justify-center"
                  title="Send Counselor WhatsApp Advice"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Counselor Responsibilities & Principles Accordion / Guide */}
      <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-900/60 p-6 rounded-3xl border ${styles.accentBorderColor}`}>
        
        {/* 10 Responsibilities */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${styles.primaryTextColor}`}>
              <ShieldCheck className="w-5 h-5" />
              <span>{language === 'bn' ? SADHANA_PHILOSOPHY.counselorResponsibilities.titleBn : SADHANA_PHILOSOPHY.counselorResponsibilities.titleEn}</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">১০টি দায়িত্ব</span>
          </div>
          <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {(language === 'bn' ? SADHANA_PHILOSOPHY.counselorResponsibilities.rulesBn : SADHANA_PHILOSOPHY.counselorResponsibilities.rulesEn).map((r, i) => (
              <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                <span className={`font-bold shrink-0 ${styles.primaryTextColor}`}>•</span>
                <span>{r}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* 8 Counselee Principles */}
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
            <h3 className={`font-bold text-sm sm:text-base flex items-center gap-2 ${styles.primaryTextColor}`}>
              <Sparkles className="w-5 h-5" />
              <span>{language === 'bn' ? SADHANA_PHILOSOPHY.counseleeResponsibilities.titleBn : SADHANA_PHILOSOPHY.counseleeResponsibilities.titleEn}</span>
            </h3>
            <span className="text-xs font-bold text-slate-400">৮টি মূল শিক্ষা</span>
          </div>
          <div className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
            {(language === 'bn' ? SADHANA_PHILOSOPHY.counseleeResponsibilities.rulesBn : SADHANA_PHILOSOPHY.counseleeResponsibilities.rulesEn).map((r, i) => (
              <div key={i} className="flex items-start gap-1.5 leading-relaxed">
                <span className={`font-bold shrink-0 ${styles.primaryTextColor}`}>•</span>
                <div className="whitespace-pre-line">{r}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Scale Rules & 175 System Modal */}
      <ScaleRulesModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
      />

    </div>
  );
};
