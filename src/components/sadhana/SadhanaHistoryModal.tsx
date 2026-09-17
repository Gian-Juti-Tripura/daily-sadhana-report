import React, { useState, useEffect, useMemo } from 'react';
import { 
  X, Calendar as CalendarIcon, List, Cloud, Download, Upload, 
  RefreshCw, CheckCircle2, ChevronLeft, ChevronRight, Award, 
  Eye, Activity, Sparkles, HeartHandshake
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import type { CounseleeProfile, WeeklySadhanaCard } from '../../types/sadhana';
import { 
  getDailyReportsHistory, getWeeklyCardsHistory, syncWithCloud, 
  exportSadhanaBackupJson, importSadhanaBackupJson
} from '../../utils/sadhanaCloudSync';
import type { DailyReportHistoryItem } from '../../utils/sadhanaCloudSync';
import { DevoteeAvatar } from '../shared/DevoteeAvatar';
import { toast } from 'react-hot-toast';

interface SadhanaHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeDevotee: CounseleeProfile;
  onSelectDailyReport?: (dateStr: string) => void;
  onSelectWeeklyCard?: (card: WeeklySadhanaCard) => void;
}

export const SadhanaHistoryModal: React.FC<SadhanaHistoryModalProps> = ({
  isOpen,
  onClose,
  activeDevotee,
  onSelectDailyReport,
  onSelectWeeklyCard
}) => {
  const { language } = useLanguage();
  const { styles } = useTheme();

  const [activeTab, setActiveTab] = useState<'daily' | 'weekly' | 'cloud'>('daily');
  const [viewMode, setViewMode] = useState<'calendar' | 'timeline'>('calendar');
  
  // Data state
  const [dailyHistory, setDailyHistory] = useState<DailyReportHistoryItem[]>([]);
  const [weeklyHistory, setWeeklyHistory] = useState<WeeklySadhanaCard[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  // Calendar state
  const [currentCalendarDate, setCurrentCalendarDate] = useState(() => new Date());
  const [searchQuery, setSearchQuery] = useState('');

  // Load history whenever modal opens or devotee changes
  const loadHistory = () => {
    const daily = getDailyReportsHistory(activeDevotee.id);
    const weekly = getWeeklyCardsHistory(activeDevotee.id);
    setDailyHistory(daily);
    setWeeklyHistory(weekly);
  };

  useEffect(() => {
    if (isOpen) {
      loadHistory();
    }
  }, [isOpen, activeDevotee.id]);

  // Cloud sync handler
  const handleCloudSync = async () => {
    try {
      setIsSyncing(true);
      const res = await syncWithCloud(activeDevotee.id);
      setSyncMessage(res.message);
      if (res.success) {
        toast.success(res.message);
        loadHistory();
      } else {
        toast.error(res.message);
      }
    } catch {
      toast.error('Sync failed');
    } finally {
      setIsSyncing(false);
    }
  };

  // JSON Export
  const handleExportBackup = () => {
    const jsonStr = exportSadhanaBackupJson(activeDevotee.id, activeDevotee.name);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sadhana_Backup_${activeDevotee.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(language === 'bn' ? 'ব্যাকআপ ফাইল ডাউনলোড সম্পন্ন!' : 'Backup JSON exported successfully!');
  };

  // JSON Import
  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const res = importSadhanaBackupJson(content, activeDevotee.id);
      if (res.success) {
        toast.success(res.message);
        loadHistory();
      } else {
        toast.error(res.message);
      }
    };
    reader.readAsText(file);
  };

  // Calendar calculations
  const year = currentCalendarDate.getFullYear();
  const month = currentCalendarDate.getMonth(); // 0-indexed

  const monthNamesEn = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const monthNamesBn = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday

  // Map reports by date for instant calendar lookup
  const reportsByDate = useMemo(() => {
    const map = new Map<string, DailyReportHistoryItem>();
    dailyHistory.forEach(item => {
      // Standardize to DD/MM/YY and YYYY-MM-DD
      map.set(item.date, item);
      map.set(item.rawDate, item);
      const parts = item.date.split(/[/.-]/);
      if (parts.length === 3) {
        const [d, m, y] = parts;
        const normalized = `${parseInt(d, 10)}/${parseInt(m, 10)}/${y.length === 4 ? y.slice(-2) : y}`;
        map.set(normalized, item);
      }
    });
    return map;
  }, [dailyHistory]);

  const filteredTimeline = useMemo(() => {
    if (!searchQuery.trim()) return dailyHistory;
    const q = searchQuery.toLowerCase();
    return dailyHistory.filter(item => 
      item.date.includes(q) || 
      item.devoteeName.toLowerCase().includes(q) ||
      item.percentage.toString().includes(q)
    );
  }, [dailyHistory, searchQuery]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className={`p-4 sm:p-5 bg-gradient-to-r ${styles.bannerGradient} text-white flex items-center justify-between shrink-0 shadow-md`}>
          <div className="flex items-center gap-3">
            <DevoteeAvatar
              devotee={activeDevotee}
              devoteeId={activeDevotee.id}
              avatarUrl={activeDevotee.avatarUrl}
              size="md"
              className="ring-2 ring-white/60 shadow-sm"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black tracking-tight">
                  {language === 'bn' ? 'সাধনা ইতিহাস ও ক্লাউড আর্কাইভ' : 'Sadhana History & Cloud Archive'}
                </h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-white/20 border border-white/30 backdrop-blur-xs">
                  Scale {activeDevotee.scaleId}
                </span>
              </div>
              <p className="text-xs text-white/85 font-medium">
                {activeDevotee.name} {activeDevotee.spiritualName ? `(${activeDevotee.spiritualName})` : ''} • {activeDevotee.counselorName}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 pb-2 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'daily'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <CalendarIcon className="w-4 h-4" />
              <span>{language === 'bn' ? 'দৈনিক রিপোর্ট' : 'Daily Reports'}</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-black">
                {dailyHistory.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('weekly')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'weekly'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Award className="w-4 h-4" />
              <span>{language === 'bn' ? '১৭৫ সাপ্তাহিক কার্ড' : '175 Weekly Cards'}</span>
              <span className="ml-1 text-[11px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-black">
                {weeklyHistory.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('cloud')}
              className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'cloud'
                  ? 'bg-amber-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              <Cloud className="w-4 h-4" />
              <span>{language === 'bn' ? 'ক্লাউড ও ব্যাকআপ' : 'Cloud & Backup'}</span>
            </button>
          </div>

          {/* Sub-view toggle for Daily Reports */}
          {activeTab === 'daily' && (
            <div className="flex bg-slate-200 dark:bg-slate-700 p-0.5 rounded-xl">
              <button
                type="button"
                onClick={() => setViewMode('calendar')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'calendar'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Calendar View"
              >
                <CalendarIcon className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === 'timeline'
                    ? 'bg-white dark:bg-slate-900 text-amber-600 dark:text-amber-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                }`}
                title="Timeline List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Content Container */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          
          {/* TAB 1: DAILY REPORTS */}
          {activeTab === 'daily' && (
            <div>
              {viewMode === 'calendar' ? (
                /* Calendar View */
                <div className="space-y-4">
                  {/* Month Switcher */}
                  <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-800 p-2.5 rounded-2xl border border-slate-200 dark:border-slate-700">
                    <button
                      type="button"
                      onClick={() => setCurrentCalendarDate(new Date(year, month - 1, 1))}
                      className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <span className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                      {language === 'bn' ? monthNamesBn[month] : monthNamesEn[month]} {year}
                    </span>
                    <button
                      type="button"
                      onClick={() => setCurrentCalendarDate(new Date(year, month + 1, 1))}
                      className="p-1.5 rounded-xl hover:bg-white dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Day Names Header */}
                  <div className="grid grid-cols-7 gap-1 text-center text-xs font-bold text-slate-500 dark:text-slate-400">
                    {(language === 'bn' 
                      ? ['রবি', 'সোম', 'মঙ্গল', 'বুধ', 'বৃহঃ', 'শুক্র', 'শনি']
                      : ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']).map((d, i) => (
                      <div key={i} className="py-1">
                        {d}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {/* Blank offset days */}
                    {Array.from({ length: firstDayIndex }).map((_, i) => (
                      <div key={`blank-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-2xl bg-slate-50/50 dark:bg-slate-900/30 opacity-40 border border-transparent" />
                    ))}

                    {/* Active Month Days */}
                    {Array.from({ length: daysInMonth }).map((_, idx) => {
                      const dayNum = idx + 1;
                      const dayDateStr = `${dayNum}/${month + 1}/${String(year).slice(-2)}`;
                      const isoStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
                      const report = reportsByDate.get(dayDateStr) || reportsByDate.get(isoStr);

                      const isToday = new Date().getDate() === dayNum && new Date().getMonth() === month && new Date().getFullYear() === year;

                      return (
                        <div
                          key={dayNum}
                          onClick={() => {
                            if (report && onSelectDailyReport) {
                              onSelectDailyReport(report.date);
                              onClose();
                            }
                          }}
                          className={`min-h-[70px] sm:min-h-[85px] p-1.5 sm:p-2 rounded-2xl border transition-all flex flex-col justify-between ${
                            report 
                              ? 'bg-amber-50/60 dark:bg-amber-950/20 border-amber-300 dark:border-amber-700/60 hover:shadow-md cursor-pointer hover:scale-[1.02]' 
                              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                          } ${isToday ? 'ring-2 ring-amber-500' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className={`text-xs font-bold ${isToday ? 'text-amber-600 dark:text-amber-400 font-black' : 'text-slate-700 dark:text-slate-300'}`}>
                              {dayNum}
                            </span>
                            {report && (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                            )}
                          </div>

                          {report ? (
                            <div className="mt-1">
                              <span className={`inline-block px-1.5 py-0.5 rounded-lg text-[10px] sm:text-xs font-black w-full text-center ${
                                report.percentage >= 85
                                  ? 'bg-emerald-500 text-white'
                                  : report.percentage >= 70
                                  ? 'bg-amber-400 text-slate-900'
                                  : 'bg-rose-500 text-white'
                              }`}>
                                {report.percentage}%
                              </span>
                              <p className="text-[9px] text-slate-500 dark:text-slate-400 text-center font-medium mt-0.5 truncate">
                                {report.totalMarks}/175
                              </p>
                            </div>
                          ) : (
                            <span className="text-[9px] text-slate-300 dark:text-slate-600 block text-center">
                              —
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-4 text-xs font-medium text-slate-600 dark:text-slate-300 pt-2">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
                      Grade A+ (85%+)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
                      Grade A (70-84%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block" />
                      Needs Care (&lt;70%)
                    </span>
                  </div>
                </div>
              ) : (
                /* Timeline List View */
                <div className="space-y-3">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={language === 'bn' ? 'তারিখ বা স্কোর দিয়ে খুঁজুন...' : 'Search by date or score...'}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold text-slate-900 dark:text-slate-100"
                  />

                  {filteredTimeline.length === 0 ? (
                    <div className="text-center py-10 text-slate-400">
                      {language === 'bn' ? 'কোন সংরক্ষিত দৈনিক রিপোর্ট পাওয়া যায়নি।' : 'No saved daily reports found.'}
                    </div>
                  ) : (
                    filteredTimeline.map((item) => (
                      <div
                        key={item.id}
                        className="bg-slate-50 dark:bg-slate-800/60 p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-amber-400 transition-all"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                              {item.date}
                            </span>
                            <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                              {item.data.stayingAt || 'VOICE'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-600 dark:text-slate-400 font-medium flex-wrap">
                            <span className="flex items-center gap-1">
                              <Activity className="w-3.5 h-3.5 text-amber-500" />
                              দেহ: {item.bodyAvgPct}%
                            </span>
                            <span className="flex items-center gap-1">
                              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                              আত্মা: {item.soulAvgPct}%
                            </span>
                            <span className="flex items-center gap-1">
                              <HeartHandshake className="w-3.5 h-3.5 text-emerald-500" />
                              সেবা: {item.sevaRemark}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          <div className="text-right">
                            <div className="text-lg font-black text-amber-600 dark:text-amber-400">
                              {item.percentage}%
                            </div>
                            <div className="text-[10px] text-slate-500 font-bold">
                              {item.totalMarks} / 175
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              if (onSelectDailyReport) {
                                onSelectDailyReport(item.date);
                                onClose();
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>{language === 'bn' ? 'খুলুন' : 'Open'}</span>
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: WEEKLY CARDS */}
          {activeTab === 'weekly' && (
            <div className="space-y-3">
              {weeklyHistory.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  {language === 'bn' ? 'কোন সংরক্ষিত সাপ্তাহিক সাধনা কার্ড পাওয়া যায়নি।' : 'No saved weekly sadhana cards found.'}
                </div>
              ) : (
                weeklyHistory.map((card) => (
                  <div
                    key={card.id}
                    className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-amber-400 transition-all"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-base text-slate-900 dark:text-slate-100">
                          {card.weekStartDate} — {card.weekEndDate}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-bold">
                          Scale {card.scaleId}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 font-medium flex-wrap">
                        <span>দেহ: {card.bodyPercentage || 0}%</span>
                        <span>আত্মা: {card.soulPercentage || 0}%</span>
                        <span>সেবা: {card.sevaRemark || 'Good'}</span>
                        <span>অন্যান্য: {card.othersPercentage || 0}%</span>
                      </div>
                      {card.counselorDiagnosis && (
                        <p className="text-xs text-slate-500 italic mt-1 max-w-xl truncate">
                          "{card.counselorDiagnosis}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xl font-black text-amber-600 dark:text-amber-400">
                          {card.weeklyPercentage}%
                        </div>
                        <div className="text-[11px] text-slate-500 font-bold">
                          {card.totalWeeklyMarks} / {card.maxWeeklyMarks}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          if (onSelectWeeklyCard) {
                            onSelectWeeklyCard(card);
                            onClose();
                          }
                        }}
                        className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>{language === 'bn' ? 'ছক দেখুন' : 'View Matrix'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* TAB 3: CLOUD & BACKUP */}
          {activeTab === 'cloud' && (
            <div className="space-y-5">
              {/* Cloud Database Section */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-5 h-5 text-amber-500" />
                    <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? 'সুপাবেজ ক্লাউড ডাটাবেজ সিঙ্ক' : 'Supabase Cloud Database Sync'}
                    </h4>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">
                    Live Cloud Connected
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'bn'
                    ? 'আপনার সমস্ত সাধনা রিপোর্ট ক্লাউড সার্ভারের সাথে সিঙ্ক রাখুন যাতে মোবাইল, ট্যাবলেট বা ল্যাপটপ যেকোনো ডিভাইস থেকে রিপোর্ট অ্যাক্সেস করা যায়।'
                    : 'Sync all sadhana reports with the cloud database so your records are accessible across mobile, tablet, and desktop devices.'}
                </p>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleCloudSync}
                    disabled={isSyncing}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
                    <span>{isSyncing ? (language === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : (language === 'bn' ? 'এখনই সিঙ্ক করুন' : 'Sync with Cloud Now')}</span>
                  </button>

                  {syncMessage && (
                    <span className="text-xs text-slate-500 font-medium">
                      {syncMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* JSON Portable Backup & Restore */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center gap-2">
                  <Download className="w-5 h-5 text-amber-500" />
                  <h4 className="font-black text-sm sm:text-base text-slate-900 dark:text-slate-100">
                    {language === 'bn' ? 'অফলাইন JSON ব্যাকআপ ও রিস্টোর' : 'Offline JSON Backup & Restore'}
                  </h4>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {language === 'bn'
                    ? 'ইন্টারনেট সংযোগ ছাড়াও ১০০% নিরাপদ থাকার জন্য সম্পূর্ণ সাধনা আর্কাইভ একটি ফাইলে ডাউনলোড করে কম্পিউটারে বা গুগল ড্রাইভে সংরক্ষণ করতে পারেন।'
                    : 'Download your entire sadhana archive as a portable JSON file to store on your computer or Google Drive for 100% offline data security.'}
                </p>

                <div className="flex items-center gap-3 flex-wrap pt-2">
                  <button
                    type="button"
                    onClick={handleExportBackup}
                    className="px-4 py-2 rounded-xl bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 text-white text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
                  >
                    <Download className="w-4 h-4 text-amber-400" />
                    <span>{language === 'bn' ? 'ব্যাকআপ ফাইল ডাউনলোড করুন (JSON)' : 'Download Backup File (JSON)'}</span>
                  </button>

                  <label className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition-all flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4 text-emerald-500" />
                    <span>{language === 'bn' ? 'ফাইল থেকে রিস্টোর করুন' : 'Restore from Backup File'}</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleImportBackup}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-3.5 sm:p-4 bg-slate-100 dark:bg-slate-800/80 border-t border-slate-200 dark:border-slate-700/80 flex items-center justify-between text-xs text-slate-500 shrink-0">
          <span>
            {language === 'bn' ? 'সর্বমোট সংরক্ষিত রেকর্ড:' : 'Total saved records:'} {dailyHistory.length} {language === 'bn' ? 'দিন' : 'days'}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold transition-colors cursor-pointer"
          >
            {language === 'bn' ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
