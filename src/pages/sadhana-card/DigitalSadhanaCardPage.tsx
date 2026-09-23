import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Award, ChevronLeft, ChevronRight, Save, ShieldCheck, 
  Table as TableIcon, Check, RefreshCw,
  Activity, Sparkles, HeartHandshake, Layers, Calendar as CalendarIcon,
  TrendingUp, Copy, Send, FileText
} from 'lucide-react';
import type { CounseleeProfile, MatrixDayEntry, WeeklySadhanaCard, DailySadhanaReport } from '../../types/sadhana';
import { EMPTY_DAY_ENTRY, DEFAULT_UNREPORTED_DAY_ENTRY } from '../../types/sadhana';
import { SADHANA_SCALES, SCORE_175_CONVERSION_TABLE, convertScoreTo175Pct } from '../../data/sadhanaScalesData';
import { getRegisteredCounselees, PRIMARY_COUNSELOR } from '../../data/counseleesData';
import { CounselorSelectorBar } from '../../components/shared/CounselorSelectorBar';
import { ScaleRulesModal } from '../../components/shared/ScaleRulesModal';
import { SadhanaHistoryModal } from '../../components/sadhana/SadhanaHistoryModal';
import { WeeklyReportModal, type WeeklyReportStats } from '../../components/sadhana/WeeklyReportModal';
import { saveWeeklyCardRecord, getDailyReportsHistory, normalizeDateForSort } from '../../utils/sadhanaCloudSync';
import { calculateDailyReportScore } from '../../utils/sadhanaScoringEngine';
import { toast } from 'react-hot-toast';

interface DigitalSadhanaCardPageProps {
  activeDevotee: CounseleeProfile;
  onDevoteeChange?: (devotee: CounseleeProfile) => void;
}

const DAYS_OF_WEEK = [
  { key: 'sat', nameEn: 'SAT', nameBn: 'শনিবার', fullNameEn: 'Saturday' },
  { key: 'sun', nameEn: 'SUN', nameBn: 'রবিবার', fullNameEn: 'Sunday' },
  { key: 'mon', nameEn: 'MON', nameBn: 'সোমবার', fullNameEn: 'Monday' },
  { key: 'tue', nameEn: 'TUE', nameBn: 'মঙ্গলবার', fullNameEn: 'Tuesday' },
  { key: 'wed', nameEn: 'WED', nameBn: 'বুধবার', fullNameEn: 'Wednesday' },
  { key: 'thu', nameEn: 'THU', nameBn: 'বৃহস্পতিবার', fullNameEn: 'Thursday' },
  { key: 'fri', nameEn: 'FRI', nameBn: 'শুক্রবার', fullNameEn: 'Friday' }
];

const toBnNum = (n: number | string) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
};

export interface WeekDateInfo {
  key: string;
  nameEn: string;
  nameBn: string;
  fullNameEn: string;
  date: string;
  fullDate: string;
  isoDate: string;
  isFuture: boolean;
  isToday: boolean;
  isPast: boolean;
}

export const getWeekDates = (offset: number): WeekDateInfo[] => {
  const now = new Date();
  const target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + offset * 7);
  const dayOfWeek = target.getDay(); // 0 is Sunday, 6 is Saturday
  const diffToSat = (dayOfWeek + 1) % 7; 
  const saturday = new Date(target.getFullYear(), target.getMonth(), target.getDate() - diffToSat);
  saturday.setHours(0, 0, 0, 0);

  const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

  return DAYS_OF_WEEK.map((d, index) => {
    const dt = new Date(saturday.getFullYear(), saturday.getMonth(), saturday.getDate() + index);
    dt.setHours(0, 0, 0, 0);
    const dayMidnight = dt.getTime();
    const isFuture = dayMidnight > todayMidnight;
    const isToday = dayMidnight === todayMidnight;
    const isPast = dayMidnight < todayMidnight;

    const dayNum = dt.getDate();
    const monthNum = dt.getMonth() + 1;
    const yearNum = dt.getFullYear();
    const dateStr = `${dayNum}/${monthNum}`;
    const isoDate = `${yearNum}-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const fullDate = `${dayNum}/${monthNum}/${yearNum}`;

    return {
      key: d.key,
      nameEn: d.nameEn,
      nameBn: d.nameBn,
      fullNameEn: d.fullNameEn,
      date: dateStr,
      fullDate,
      isoDate,
      isFuture,
      isToday,
      isPast
    };
  });
};

export const buildProgressingWeekMatrix = (
  devoteeId: string,
  dates: WeekDateInfo[],
  scaleId: 1 | 2 | 3 | 4,
  savedMatrix?: Record<string, MatrixDayEntry> | null
): Record<string, MatrixDayEntry> => {
  const history = getDailyReportsHistory(devoteeId);
  const reportsByDate: Record<string, DailySadhanaReport> = {};
  history.forEach(item => {
    if (item.rawDate) reportsByDate[item.rawDate] = item.data;
    if (item.date) {
      reportsByDate[normalizeDateForSort(item.date)] = item.data;
      reportsByDate[item.date] = item.data;
    }
  });

  const pad2 = (n: number) => {
    if (n <= 0) return '00';
    return n < 10 ? `0${n}` : `${n}`;
  };

  const result: Record<string, MatrixDayEntry> = {};

  dates.forEach(d => {
    if (d.isFuture) {
      // Future days must strictly remain empty
      result[d.key] = { ...EMPTY_DAY_ENTRY };
    } else {
      // Elapsed day (past or today): check for daily report
      let report = reportsByDate[d.isoDate] || reportsByDate[d.fullDate] || reportsByDate[d.date];
      if (!report) {
        const k1 = `sadhana_report_${devoteeId}_${d.fullDate.replace(/\//g, '-')}`;
        const k2 = `sadhana_report_${devoteeId}_${d.isoDate}`;
        const raw = localStorage.getItem(k1) || localStorage.getItem(k2);
        if (raw) {
          try {
            report = JSON.parse(raw);
          } catch (e) {
            // ignore
          }
        }
      }

      if (report) {
        const score = calculateDailyReportScore(report, scaleId);
        result[d.key] = {
          toBed: pad2(score.wentToBedMarks),
          wakeUp: pad2(score.wakeUpMarks),
          dayRest: score.daySleepMarks < 0 ? `${score.daySleepMarks}` : pad2(score.daySleepMarks),
          japa: pad2(score.japaMarks),
          spBooks: pad2(score.bookStudyMarks),
          hearing: pad2(score.hearingMarks),
          studyWork: report.academicStudyHours > 0 ? `${report.academicStudyHours} Hour` : '0 Hour',
          cleaning: report.renderedSeva && report.renderedSeva !== 'Custom (অন্যান্য)' ? report.renderedSeva.slice(0, 25) : 'Ashram Seva',
          followUp: '10 Min.',
          bbtBtg: '00',
          morningClass: pad2(score.morningProgramMarks),
          sadhanaCard: '25',
          sloka: report.slokaMemorizingCount > 0 ? 'BG-Done' : '-',
          bhajanGayatri: report.bhajanGayatriCompleted ? '25' : '00'
        };
      } else if (savedMatrix && savedMatrix[d.key] && savedMatrix[d.key].toBed !== undefined && savedMatrix[d.key].toBed !== '') {
        result[d.key] = { ...savedMatrix[d.key] };
      } else {
        result[d.key] = { ...DEFAULT_UNREPORTED_DAY_ENTRY };
      }
    }
  });

  return result;
};

export const DigitalSadhanaCardPage: React.FC<DigitalSadhanaCardPageProps> = ({
  activeDevotee,
  onDevoteeChange
}) => {
  const { language } = useLanguage();
  const { styles } = useTheme();
  const [counselees] = useState<CounseleeProfile[]>(() => getRegisteredCounselees());
  const [selectedScale, setSelectedScale] = useState<1 | 2 | 3 | 4>(activeDevotee.scaleId || 2);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isScaleModalOpen, setIsScaleModalOpen] = useState(false);
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Counselor Remarks State (matching physical card page-1.png)
  const [counselorDiagnosis, setCounselorDiagnosis] = useState(
    'Please study your academic and spiritual books daily.'
  );
  const [counselorAdvice, setCounselorAdvice] = useState(
    'Complete full 16 rounds of japa before 8:00 AM. Maintain early sleeping discipline.'
  );
  const [counselorSignature, setCounselorSignature] = useState(
    activeDevotee.counselorName || PRIMARY_COUNSELOR.name
  );
  const [sevaSummary] = useState('Good');
  const [othersSummary] = useState('Good');

  // Compute dates for current Saturday-to-Friday week
  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);

  // Matrix entries state for 7 days (auto-filled progressing card)
  const [matrixEntries, setMatrixEntries] = useState<Record<string, MatrixDayEntry>>(() => {
    const dates = getWeekDates(0);
    return buildProgressingWeekMatrix(activeDevotee.id, dates, selectedScale);
  });

  // Auto-save status state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  // Reload progressing matrix and remarks if activeDevotee or weekOffset changes
  useEffect(() => {
    setIsInitialLoadDone(false);
    let savedParsed: Record<string, MatrixDayEntry> | null = null;
    const saved = localStorage.getItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`);
    if (saved) {
      try {
        savedParsed = JSON.parse(saved);
      } catch (e) {
        savedParsed = null;
      }
    }

    const progressingMatrix = buildProgressingWeekMatrix(activeDevotee.id, weekDates, selectedScale, savedParsed);
    setMatrixEntries(progressingMatrix);

    const savedMeta = localStorage.getItem(`weekly_meta_${activeDevotee.id}_offset_${weekOffset}`);
    if (savedMeta) {
      try {
        const meta = JSON.parse(savedMeta);
        if (meta.counselorDiagnosis !== undefined) setCounselorDiagnosis(meta.counselorDiagnosis);
        if (meta.counselorAdvice !== undefined) setCounselorAdvice(meta.counselorAdvice);
        if (meta.counselorSignature !== undefined) setCounselorSignature(meta.counselorSignature);
        if (meta.selectedScale) setSelectedScale(meta.selectedScale);
      } catch (e) {
        // ignore
      }
    }

    const timer = setTimeout(() => {
      setIsInitialLoadDone(true);
      setSaveStatus('saved');
    }, 150);
    return () => clearTimeout(timer);
  }, [activeDevotee.id, weekOffset, selectedScale, weekDates]);

  // Debounced auto-save effect whenever matrix or remarks change
  useEffect(() => {
    if (!isInitialLoadDone) return;

    setSaveStatus('saving');
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`, JSON.stringify(matrixEntries));
        localStorage.setItem(`weekly_meta_${activeDevotee.id}_offset_${weekOffset}`, JSON.stringify({
          counselorDiagnosis,
          counselorAdvice,
          counselorSignature,
          selectedScale
        }));
        setSaveStatus('saved');
      } catch (e) {
        setSaveStatus('saved');
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [matrixEntries, counselorDiagnosis, counselorAdvice, counselorSignature, selectedScale, activeDevotee.id, weekOffset, isInitialLoadDone]);

  // Listen for live matrix updates from DailySadhanaReportPage or tab focus
  useEffect(() => {
    const handleMatrixUpdated = (e: Event) => {
      const customEvent = e as CustomEvent<{ devoteeId: string; weekOffset: number; updatedMatrix: Record<string, MatrixDayEntry> }>;
      const { devoteeId, weekOffset: updatedOffset, updatedMatrix } = customEvent.detail || {};
      if (devoteeId === activeDevotee.id && updatedOffset === weekOffset && updatedMatrix) {
        setMatrixEntries(updatedMatrix);
      }
    };

    const handleWindowFocus = () => {
      const saved = localStorage.getItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`);
      if (saved) {
        try {
          setMatrixEntries(JSON.parse(saved));
        } catch (e) {
          // ignore
        }
      }
    };

    window.addEventListener('sadhana_matrix_updated', handleMatrixUpdated);
    window.addEventListener('focus', handleWindowFocus);
    return () => {
      window.removeEventListener('sadhana_matrix_updated', handleMatrixUpdated);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [activeDevotee.id, weekOffset]);

  const updateCell = (dayKey: string, field: keyof MatrixDayEntry, value: string) => {
    setMatrixEntries(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value
      }
    }));
  };

  // Safe integer parser for cell marks
  const parseCellMark = (val: string): number => {
    if (!val) return 0;
    const clean = val.trim();
    if (clean === '-' || clean === '00') return 0;
    const num = parseInt(clean, 10);
    return isNaN(num) ? 0 : num;
  };

  // Progression & 175-mark column calculations
  const columnCalculations = useMemo(() => {
    const dayKeys = DAYS_OF_WEEK.map(d => d.key);
    const elapsedDays = weekDates.filter(d => !d.isFuture);
    const elapsedDaysCount = elapsedDays.length; // 0 to 7
    const isAllFuture = elapsedDaysCount === 0;

    // For elapsed progression: max marks per column = elapsedDaysCount * 25
    const colMaxMarks = elapsedDaysCount > 0 ? elapsedDaysCount * 25 : 175;

    const calcCol = (field: keyof MatrixDayEntry) => {
      const total = dayKeys.reduce((sum, key) => sum + parseCellMark(matrixEntries[key]?.[field] || '0'), 0);
      const progressionPct = colMaxMarks > 0 ? Math.min(100, Math.max(0, Math.round((total / colMaxMarks) * 100))) : 0;
      const fullWeekPct = convertScoreTo175Pct(total);
      return { total, progressionPct, fullWeekPct, maxMarks: colMaxMarks };
    };

    // Body
    const toBed = calcCol('toBed');
    const wakeUp = calcCol('wakeUp');
    const dayRest = calcCol('dayRest');
    const bodyAvgPct = Math.round((toBed.progressionPct + wakeUp.progressionPct + dayRest.progressionPct) / 3);
    const bodyFullWeekAvgPct = Math.round((toBed.fullWeekPct + wakeUp.fullWeekPct + dayRest.fullWeekPct) / 3);

    // Soul
    const japa = calcCol('japa');
    const spBooks = calcCol('spBooks');
    const hearing = calcCol('hearing');
    const soulAvgPct = Math.round((japa.progressionPct + spBooks.progressionPct + hearing.progressionPct) / 3);
    const soulFullWeekAvgPct = Math.round((japa.fullWeekPct + spBooks.fullWeekPct + hearing.fullWeekPct) / 3);

    // Others
    const morningClass = calcCol('morningClass');
    const sadhanaCard = calcCol('sadhanaCard');
    const bhajanGayatri = calcCol('bhajanGayatri');
    const othersAvgPct = Math.round((morningClass.progressionPct + sadhanaCard.progressionPct + bhajanGayatri.progressionPct) / 3);
    const othersFullWeekAvgPct = Math.round((morningClass.fullWeekPct + sadhanaCard.fullWeekPct + bhajanGayatri.fullWeekPct) / 3);

    // Sum of all 9 numerically scored columns
    const totalScoredMarks = toBed.total + wakeUp.total + dayRest.total +
                             japa.total + spBooks.total + hearing.total +
                             morningClass.total + sadhanaCard.total + bhajanGayatri.total;
    
    // Max scored marks for elapsed days (9 columns * 25 marks = 225 marks/day)
    const maxScoredMarks = elapsedDaysCount > 0 ? elapsedDaysCount * (9 * 25) : (7 * 9 * 25);
    const maxWeeklyScoredMarks = 9 * 175; // 1575 marks
    const overallProgressionPct = maxScoredMarks > 0
      ? Math.min(100, Math.max(0, Math.round((totalScoredMarks / maxScoredMarks) * 100)))
      : 0;
    const overallFullWeekPct = Math.min(100, Math.max(0, Math.round((totalScoredMarks / maxWeeklyScoredMarks) * 100)));
    const dailyAverageMarks = elapsedDaysCount > 0 ? Math.round(totalScoredMarks / elapsedDaysCount) : 0;

    return {
      elapsedDaysCount,
      isAllFuture,
      toBed,
      wakeUp,
      dayRest,
      bodyAvgPct,
      bodyFullWeekAvgPct,
      bodyTotalMarks: toBed.total + wakeUp.total + dayRest.total,
      japa,
      spBooks,
      hearing,
      soulAvgPct,
      soulFullWeekAvgPct,
      soulTotalMarks: japa.total + spBooks.total + hearing.total,
      morningClass,
      sadhanaCard,
      bhajanGayatri,
      othersAvgPct,
      othersFullWeekAvgPct,
      othersTotalMarks: morningClass.total + sadhanaCard.total + bhajanGayatri.total,
      totalScoredMarks,
      maxScoredMarks,
      maxWeeklyScoredMarks,
      overallProgressionPct,
      overallFullWeekPct,
      overallPercentage: overallProgressionPct,
      dailyAverageMarks
    };
  }, [matrixEntries, weekDates]);

  const activeScaleInfo = SADHANA_SCALES[selectedScale];
  const [isWeeklyReportModalOpen, setIsWeeklyReportModalOpen] = useState(false);
  const [copiedWeekly, setCopiedWeekly] = useState(false);

  // Auto-computed weekly report stats matching the devotee's exact 6-metric format
  const weeklyStats: WeeklyReportStats = useMemo(() => {
    let matHoursTotal = 0;
    let lectHoursTotal = 0;
    const slokasFound: string[] = [];
    let spBookRefFound = '';

    DAYS_OF_WEEK.forEach(d => {
      const entry = matrixEntries[d.key];
      if (entry) {
        if (entry.studyWork) {
          const m = entry.studyWork.match(/([\d.]+)/);
          if (m) {
            const val = parseFloat(m[1]);
            if (entry.studyWork.toLowerCase().includes('min')) matHoursTotal += val / 60;
            else matHoursTotal += val;
          }
        }
        if (entry.hearing) {
          const m = entry.hearing.match(/([\d.]+)/);
          if (m) {
            const val = parseFloat(m[1]);
            if (entry.hearing.toLowerCase().includes('min')) lectHoursTotal += val / 60;
            else lectHoursTotal += val;
          }
        }
        if (entry.sloka && entry.sloka !== '-' && entry.sloka.trim() !== '') {
          slokasFound.push(entry.sloka.trim());
        }
        if (entry.bbtBtg && entry.bbtBtg !== '00' && entry.bbtBtg.trim() !== '') {
          spBookRefFound = entry.bbtBtg.trim();
        }
      }
    });

    const spHoursCalc = columnCalculations.spBooks.total > 0 
      ? (Math.round((columnCalculations.spBooks.total / 70) * 10) / 10).toFixed(1)
      : '0.0';

    return {
      matHours: matHoursTotal > 0 ? (matHoursTotal % 1 === 0 ? matHoursTotal.toString() : matHoursTotal.toFixed(1)) : '0',
      bodyPct: columnCalculations.bodyAvgPct > 0 ? columnCalculations.bodyAvgPct.toFixed(2) : '0.00',
      soulPct: columnCalculations.soulAvgPct > 0 ? columnCalculations.soulAvgPct.toFixed(2) : '0.00',
      spHours: parseFloat(spHoursCalc) > 0 ? spHoursCalc : '0.0',
      spBookRef: spBookRefFound || '—',
      lectHours: lectHoursTotal > 0 ? (lectHoursTotal % 1 === 0 ? lectHoursTotal.toString() : lectHoursTotal.toFixed(1)) : '0',
      slokaText: slokasFound.length > 0
        ? `Yes — “${slokasFound[0]}”`
        : '—'
    };
  }, [matrixEntries, columnCalculations]);

  const generateWeeklyReportText = () => {
    return `🌿 Hare Krishna. 🙏

This is *${activeDevotee.name}.* Here is my weekly progression report for ${weekDates[0].date}:

📊 *Progression:* ${columnCalculations.elapsedDaysCount}/7 days elapsed (${columnCalculations.overallProgressionPct}%)
📚 *Material Study:* ${weeklyStats.matHours} hours
💪 *Body:* ${weeklyStats.bodyPct}%
🕉️ *Soul:* ${weeklyStats.soulPct}%
📖 *Śrīla Prabhupāda Study:* ${weeklyStats.spHours} hours (${weeklyStats.spBookRef})
🎧 *Lecture Hearing:* ${weeklyStats.lectHours} hours
🪷 *Śloka Memorization:* ${weeklyStats.slokaText}

🌸 Hare Krishna. 🙏`;
  };

  const handleCopyWeeklyReport = () => {
    const text = generateWeeklyReportText();
    navigator.clipboard.writeText(text);
    setCopiedWeekly(true);
    toast.success(language === 'bn' ? 'সাপ্তাহিক রিপোর্ট কপি সম্পন্ন!' : 'Weekly report copied!');
    setTimeout(() => setCopiedWeekly(false), 2500);
  };

  const handleShareWeeklyReportWhatsApp = () => {
    const text = generateWeeklyReportText();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSaveCard = () => {
    const cardData: WeeklySadhanaCard = {
      id: `card_${activeDevotee.id}_week_${weekDates[0].date.replace(/\//g, '-')}`,
      weekStartDate: weekDates[0].date,
      weekEndDate: weekDates[6].date,
      devoteeName: activeDevotee.name,
      counselorName: activeDevotee.counselorName || PRIMARY_COUNSELOR.name,
      scaleId: selectedScale,
      matrixDays: matrixEntries,
      totalWeeklyMarks: columnCalculations.totalScoredMarks,
      maxWeeklyMarks: columnCalculations.maxWeeklyScoredMarks,
      weeklyPercentage: columnCalculations.overallPercentage,
      bodyPercentage: columnCalculations.bodyAvgPct,
      soulPercentage: columnCalculations.soulAvgPct,
      sevaRemark: sevaSummary,
      othersPercentage: columnCalculations.othersAvgPct,
      counselorDiagnosis,
      counselorAdvice,
      counselorSignature,
      verifiedByCounselor: true
    };

    localStorage.setItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`, JSON.stringify(matrixEntries));
    localStorage.setItem(`weekly_meta_${activeDevotee.id}_offset_${weekOffset}`, JSON.stringify({
      counselorDiagnosis,
      counselorAdvice,
      counselorSignature,
      selectedScale
    }));
    localStorage.setItem(`weekly_sadhana_card_${cardData.id}`, JSON.stringify(cardData));
    saveWeeklyCardRecord(cardData, activeDevotee.id);
    setSaveStatus('saved');
    toast.success(language === 'bn' ? 'সাধনাপত্র সফলভাবে সংরক্ষিত হয়েছে!' : 'Weekly card saved successfully!');
  };

  const handleSelectHistoricalCard = (card: WeeklySadhanaCard) => {
    if (card.matrixDays) {
      setMatrixEntries(card.matrixDays);
    }
    if (card.counselorDiagnosis) setCounselorDiagnosis(card.counselorDiagnosis);
    if (card.counselorAdvice) setCounselorAdvice(card.counselorAdvice);
    if (card.counselorSignature) setCounselorSignature(card.counselorSignature);
    if (card.scaleId) setSelectedScale(card.scaleId);
    toast.success(
      language === 'bn' 
        ? `${card.weekStartDate} — ${card.weekEndDate} এর সাপ্তাহিক কার্ড লোড করা হয়েছে`
        : `Loaded weekly card for ${card.weekStartDate} — ${card.weekEndDate}`
    );
  };

  const handleSyncWithDailyReports = () => {
    const refreshed = buildProgressingWeekMatrix(activeDevotee.id, weekDates, selectedScale, null);
    setMatrixEntries(refreshed);
    localStorage.setItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`, JSON.stringify(refreshed));
    toast.success(
      language === 'bn' 
        ? 'দৈনিক রিপোর্ট ও ডিফল্ট মান সহ সাধনাপত্র সিঙ্ক সম্পন্ন!' 
        : 'Sadhana card synced with daily reports and baseline defaults!'
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-2 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 animate-fade-in">
      
      {/* Counselor & Devotee Selector Bar — single row with DevoteeAvatar */}
      <CounselorSelectorBar
        counselees={counselees}
        activeDevotee={activeDevotee}
        onDevoteeChange={(d) => onDevoteeChange?.(d)}
        language={language}
      />

      {/* Compact & Stylish Top Overview: Single-row 5 distinct jewel-toned stat cards */}
      <div className={`bg-gradient-to-r ${styles.bannerGradient} rounded-2xl p-3 sm:p-4 text-white shadow-md shadow-amber-600/10 space-y-2.5 sm:space-y-3`}>
        {/* Header Row: Compact Title, Scale Badge & Archive Button in 1 line */}
        <div className="flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
          <div className="flex items-center gap-2 flex-wrap min-w-0">
            <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight truncate">
              {language === 'bn' ? '১৭৫ সাপ্তাহিক সাধনাপত্র (শনি—শুক্র)' : '175 Weekly Sadhana Matrix (Sat–Fri)'}
            </h2>
            <span className="text-[10px] sm:text-xs font-bold bg-black/30 text-amber-200 px-2 py-0.5 rounded border border-white/10 shrink-0">
              Scale {selectedScale}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded border border-amber-300/40 bg-black/30 text-amber-200 text-[10px] sm:text-[11px] font-mono font-bold">
              <span>
                {language === 'bn'
                  ? `[ ${toBnNum(columnCalculations.elapsedDaysCount)} / ৭ দিন ]`
                  : `[ ${columnCalculations.elapsedDaysCount} / 7 Days ]`}
              </span>
              <span className="text-white/60">•</span>
              <span>
                {language === 'bn'
                  ? `অগ্রগতি: ${toBnNum(columnCalculations.overallProgressionPct)}%`
                  : `Progress: ${columnCalculations.overallProgressionPct}%`}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-2.5 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <CalendarIcon className="w-3.5 h-3.5 text-amber-200" />
            <span>{language === 'bn' ? 'আর্কাইভ ও ইতিহাস' : 'Archive & History'}</span>
          </button>
        </div>

        {/* 5 Distinct Mini-Stat Boxes (Always 5-column row, compact and colorful) */}
        <div className="grid grid-cols-5 gap-1.5 sm:gap-2.5">
          {/* 1. Progression Average (Gold/Amber Jewel Box) */}
          <div className="bg-gradient-to-br from-amber-500/30 to-amber-900/40 border border-amber-300/40 hover:border-amber-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-amber-500/20 group">
            <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs font-bold text-amber-200">
              <span className="flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">
                  {language === 'bn' ? 'চলতি অগ্রগতি' : 'Progress Avg'}
                </span>
              </span>
              <span className={`px-1 py-0.2 rounded text-[9px] font-black shrink-0 ${
                columnCalculations.overallProgressionPct >= 85 ? 'bg-emerald-400 text-slate-950' : columnCalculations.overallProgressionPct >= 70 ? 'bg-amber-300 text-slate-950' : 'bg-rose-400 text-white'
              }`}>
                {columnCalculations.overallProgressionPct >= 85 ? 'A+' : columnCalculations.overallProgressionPct >= 70 ? 'A' : 'B'}
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-amber-100 mt-1 tracking-tight">
              {columnCalculations.isAllFuture ? '—' : `${language === 'bn' ? toBnNum(columnCalculations.overallProgressionPct) : columnCalculations.overallProgressionPct}%`}
            </div>
          </div>

          {/* 2. Body (Emerald/Teal Jewel Box) */}
          <div className="bg-gradient-to-br from-emerald-500/30 to-teal-900/40 border border-emerald-300/40 hover:border-emerald-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-emerald-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-200 truncate">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'দেহ' : 'Body'}
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-emerald-100 mt-1 tracking-tight">
              {columnCalculations.isAllFuture ? '—' : `${language === 'bn' ? toBnNum(columnCalculations.bodyAvgPct) : columnCalculations.bodyAvgPct}%`}
            </div>
          </div>

          {/* 3. Soul (Royal Violet/Purple Jewel Box) */}
          <div className="bg-gradient-to-br from-purple-500/30 to-indigo-900/40 border border-purple-300/40 hover:border-purple-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-purple-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-purple-200 truncate">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'আত্মা' : 'Soul'}
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-purple-100 mt-1 tracking-tight">
              {columnCalculations.isAllFuture ? '—' : `${language === 'bn' ? toBnNum(columnCalculations.soulAvgPct) : columnCalculations.soulAvgPct}%`}
            </div>
          </div>

          {/* 4. Seva (Warm Rose/Coral Jewel Box) */}
          <div className="bg-gradient-to-br from-rose-500/30 to-pink-900/40 border border-rose-300/40 hover:border-rose-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-rose-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-200 truncate">
              <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'সেবা' : 'Seva'}
              </span>
            </div>
            <div className="text-xs sm:text-lg font-black text-rose-100 mt-1 truncate tracking-tight">
              {sevaSummary || (language === 'bn' ? 'উত্তম' : 'Good')}
            </div>
          </div>

          {/* 5. Others (Sky Blue/Cyan Jewel Box) */}
          <div className="bg-gradient-to-br from-sky-500/30 to-blue-900/40 border border-sky-300/40 hover:border-sky-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-sky-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-sky-200 truncate">
              <Layers className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'অন্যান্য' : 'Others'}
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-sky-100 mt-1 tracking-tight">
              {columnCalculations.isAllFuture ? '—' : `${language === 'bn' ? toBnNum(columnCalculations.othersAvgPct) : columnCalculations.othersAvgPct}%`}
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar: Scale Picker, Week Navigator & Actions (Organized 2-Tier Layout) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 sm:p-4 border border-slate-200 dark:border-slate-800 shadow-sm space-y-3">
        
        {/* Tier 1: Scale Selector on Left, Week Navigator on Right */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          
          {/* Scale Picker */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 shrink-0">
              <Award className="w-4 h-4 text-amber-500" />
              <span>{language === 'bn' ? 'সাধনা স্কেল:' : 'Sadhana Scale:'}</span>
            </span>
            <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
              {([1, 2, 3, 4] as const).map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedScale(s)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    selectedScale === s
                      ? 'bg-amber-500 text-white shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:text-amber-600'
                  }`}
                >
                  Scale {s}
                </button>
              ))}
            </div>
            <span className="hidden md:inline text-xs text-slate-500 font-medium">
              ({language === 'bn' ? activeScaleInfo.titleBn : activeScaleInfo.titleEn})
            </span>
          </div>

          {/* Week Navigator */}
          <div className="flex items-center gap-1.5 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setWeekOffset(prev => prev - 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs cursor-pointer transition-all"
              title={language === 'bn' ? 'পূর্ববর্তী সপ্তাহ' : 'Previous Week'}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            
            <div className="px-3 py-1 bg-amber-50 dark:bg-slate-800 rounded-xl border border-amber-200 dark:border-slate-700 text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
              <span>{weekDates[0].date} — {weekDates[6].date}</span>
              {weekOffset === 0 && <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-semibold font-sans">{language === 'bn' ? '(চলতি সপ্তাহ)' : '(Current)'}</span>}
            </div>

            <button
              type="button"
              onClick={() => setWeekOffset(prev => prev + 1)}
              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-amber-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs cursor-pointer transition-all"
              title={language === 'bn' ? 'পরবর্তী সপ্তাহ' : 'Next Week'}
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Tier 2: Minimal Action Bar */}
        <div className="flex items-center gap-2 flex-wrap">

          <button
            type="button"
            onClick={handleSaveCard}
            className="py-1.5 px-3 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'bn' ? 'সাধনাপত্র সংরক্ষণ করুন' : 'Save Card'}
          >
            {saveStatus === 'saving' ? (
              <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
            ) : (
              <Save className="w-3.5 h-3.5 text-amber-600" />
            )}
            <span>{saveStatus === 'saving' ? (language === 'bn' ? 'সংরক্ষণ...' : 'Saving...') : (language === 'bn' ? 'সংরক্ষণ' : 'Save')}</span>
          </button>

          <button
            type="button"
            onClick={() => setIsWeeklyReportModalOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/40 dark:hover:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'bn' ? 'সাপ্তাহিক রিপোর্ট' : 'Weekly Report'}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>{language === 'bn' ? 'সাপ্তাহিক রিপোর্ট' : 'Weekly Report'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyWeeklyReport}
            className="py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-slate-100 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'bn' ? 'রিপোর্ট কপি' : 'Copy Report'}
          >
            {copiedWeekly ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedWeekly ? (language === 'bn' ? 'কপি!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>

          <button
            type="button"
            onClick={handleShareWeeklyReportWhatsApp}
            className="py-1.5 px-3 rounded-lg bg-[#25D366] hover:bg-[#1ebe59] text-white text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="WhatsApp"
          >
            <Send className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>

          <button
            type="button"
            onClick={() => setIsScaleModalOpen(true)}
            className="py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-amber-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-amber-700 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'bn' ? 'স্কেল ও ১৭৫ নিয়মাবলী' : 'Scale & Rules'}
          >
            <TableIcon className="w-3.5 h-3.5 text-amber-500" />
            <span>{language === 'bn' ? 'স্কেল ও নিয়ম' : 'Scale & Rules'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncWithDailyReports}
            className="py-1.5 px-3 rounded-lg bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800/80 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 hover:text-emerald-700 border border-slate-200 dark:border-slate-700 text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title={language === 'bn' ? 'দৈনিক রিপোর্ট থেকে সিঙ্ক করুন' : 'Sync from Daily Reports'}
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
            <span>{language === 'bn' ? 'রিপোর্ট সিঙ্ক' : 'Sync Reports'}</span>
          </button>

        </div>


      </div>

      {/* Main 7-Day Matrix Table (Printable Container) */}
      <div 
        id="printable-sadhana-card-matrix"
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5 overflow-hidden"
      >
        
        {/* Printable Card Header: Rendered only during print */}
        <div className="hidden print:flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs">
          
          <div className="flex items-center gap-2.5 sm:gap-3 flex-wrap min-w-0">
            {/* Date */}
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
                {language === 'bn' ? 'তারিখ:' : 'DATE:'}
              </span>
              <span className="font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-900 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 text-[11px]">
                {weekDates[0].date} — {weekDates[6].date}
              </span>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600 font-light">|</span>

            {/* Counsellee */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                {language === 'bn' ? 'ভক্ত:' : 'COUNSELLEE:'}
              </span>
              <span className="font-bold text-slate-900 dark:text-slate-100 truncate">
                {language === 'bn' ? (activeDevotee.nameBn || activeDevotee.name) : activeDevotee.name}
              </span>
            </div>

            <span className="hidden sm:inline text-slate-300 dark:text-slate-600 font-light">|</span>

            {/* Counsellor */}
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400 shrink-0">
                {language === 'bn' ? 'কাউন্সেলর:' : 'COUNSELLOR:'}
              </span>
              <span className="font-bold text-amber-700 dark:text-amber-400 truncate">
                {activeDevotee.counselorName || PRIMARY_COUNSELOR.name}
              </span>
            </div>
          </div>

          {/* Scale Badge on Right */}
          <div className="flex items-center gap-1.5 shrink-0 self-start sm:self-auto pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200 dark:border-slate-700">
            <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-500 dark:text-slate-400">
              {language === 'bn' ? 'স্কেল:' : 'SCALE:'}
            </span>
            <span className="px-2.5 py-0.5 rounded-md bg-amber-500 text-white font-black text-xs shadow-2xs">
              Scale {selectedScale}
            </span>
          </div>

        </div>

        {/* 175-Marks 7-Days Matrix Table (Exact Replica of physical card page-1.png) */}
        <div className="overflow-x-auto rounded-xl border border-slate-300 dark:border-slate-700">
          <table className="w-full text-center border-collapse text-xs">
            <thead>
              
              {/* Category Header Row */}
              <tr className={`bg-gradient-to-r ${styles.bannerGradient} text-white font-extrabold text-[11px] sm:text-xs uppercase tracking-wider`}>
                <th rowSpan={2} className="p-2 border-2 border-white/50 min-w-[65px] bg-[#7B0025] font-black text-white text-[13px] tracking-widest uppercase shadow-lg">
                  {language === 'bn' ? 'দিন / বার' : 'DAY'}
                </th>
                <th colSpan={3} className="p-2 border border-white/20 bg-black/15">
                  {language === 'bn' ? '১. দেহ' : '1. BODY'}
                </th>
                <th colSpan={3} className="p-2 border border-white/20 bg-black/25">
                  {language === 'bn' ? '২. আত্মা' : '2. SOUL'}
                </th>
                <th colSpan={4} className="p-2 border border-white/20 bg-black/15">
                  {language === 'bn' ? '৩. সেবা' : '3. SEVA'}
                </th>
                <th colSpan={4} className="p-2 border border-white/20 bg-black/25">
                  {language === 'bn' ? '৪. অন্যান্য' : '4. OTHERS'}
                </th>
              </tr>

              {/* Sub-column Headers */}
              <tr className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-[10px] sm:text-[11px] font-bold">
                {/* BODY (3 cols) */}
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[58px]" title="Went to bed marks (25 max)">
                  <div>{language === 'bn' ? 'শয়ন' : 'TO BED'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[58px]" title="Wake up marks (25 max)">
                  <div>{language === 'bn' ? 'জাগরণ' : 'WAKE UP'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[58px]" title="Day rest marks (25 max)">
                  <div>{language === 'bn' ? 'দিবানিন্দ্রা' : 'DAY REST'}</div>
                </th>

                {/* SOUL (3 cols) */}
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[58px]" title="Japa marks (25 max)">
                  <div>{language === 'bn' ? 'জপ' : 'JAPA'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[58px]" title="SP Books reading marks (25 max)">
                  <div>{language === 'bn' ? 'গ্রন্থ' : 'SP BOOKS'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[65px]" title="Lecture hearing marks (25 max)">
                  <div>{language === 'bn' ? 'শ্রবণ' : 'HEARING'}</div>
                </th>

                {/* SEVA (4 cols) */}
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[75px]" title="Study or work time">
                  <div>{language === 'bn' ? 'পড়াশোনা' : 'STUDY/WORK'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[70px]" title="Temple cleaning service">
                  <div>{language === 'bn' ? 'পরিষ্কার' : 'CLEANING'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[70px]" title="Devotee follow up service">
                  <div>{language === 'bn' ? 'ফলোআপ' : 'FOLLOW UP'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[75px]" title="Book distribution / BTG / CS">
                  <div>{language === 'bn' ? 'গ্রন্থবিতরণ' : 'BBT/BTG/CS'}</div>
                </th>

                {/* OTHERS (4 cols) */}
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[62px]" title="Morning class marks (25 max)">
                  <div>{language === 'bn' ? 'ক্লাস' : 'CLASS'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[62px]" title="Sadhana card marks (25 max)">
                  <div>{language === 'bn' ? 'সাধনা কার্ড' : 'CARD'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[75px]" title="Sloka memorizing (references)">
                  <div>{language === 'bn' ? 'শ্লোক' : 'SLOKA'}</div>
                </th>
                <th className="p-1.5 border border-slate-300 dark:border-slate-700 min-w-[62px]" title="Bhajan Gayatri marks (25 max)">
                  <div>{language === 'bn' ? 'গায়ত্রী' : 'GAYATRI'}</div>
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
              
              {/* 7 DAY ROWS: SAT, SUN, MON, TUE, WED, THU, FRI */}
              {weekDates.map((d, index) => {
                const row = matrixEntries[d.key] || (d.isFuture ? EMPTY_DAY_ENTRY : DEFAULT_UNREPORTED_DAY_ENTRY);
                const isEven = index % 2 === 0;

                return (
                  <tr 
                    key={d.key} 
                    className={`transition-colors hover:bg-amber-50/50 dark:hover:bg-slate-800/60 ${
                      isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-900/50'
                    }`}
                  >
                    {/* Day Name & Date */}
                    <td className={`p-1.5 border border-slate-300 dark:border-slate-700 text-center min-w-[65px] ${
                      d.isFuture ? 'bg-slate-100/50 dark:bg-slate-800/30' : d.isToday ? 'bg-amber-50/80 dark:bg-amber-950/30' : 'bg-slate-50 dark:bg-slate-800/60'
                    }`}>
                      <div className={`font-black text-[13px] tracking-wide leading-tight ${
                        d.isFuture ? 'text-slate-400 dark:text-slate-500' : d.isToday ? 'text-amber-800 dark:text-amber-300' : 'text-[#7B0025] dark:text-rose-400'
                      }`}>
                        {language === 'bn' ? d.nameBn : d.nameEn}
                      </div>
                      <div className={`mt-0.5 inline-block font-bold text-[11px] px-1.5 py-0.5 rounded leading-tight ${
                        d.isFuture
                          ? 'bg-slate-200/50 dark:bg-slate-700/50 text-slate-400 dark:text-slate-500 font-mono'
                          : d.isToday
                          ? 'bg-amber-200/80 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200'
                          : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                      }`}>
                        {d.date}
                      </div>
                      {d.isFuture && (
                        <div className="mt-0.5">
                          <span className="inline-block text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200/70 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                            {language === 'bn' ? 'আসন্ন' : 'Upcoming'}
                          </span>
                        </div>
                      )}
                      {d.isToday && (
                        <div className="mt-0.5">
                          <span className="inline-block text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500 text-white shadow-2xs">
                            {language === 'bn' ? 'আজ' : 'Today'}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* BODY */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.toBed}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'toBed', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.wakeUp}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'wakeUp', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.dayRest}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'dayRest', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>

                    {/* SOUL */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.japa}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'japa', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.spBooks}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'spBooks', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.hearing}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'hearing', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>

                    {/* SEVA */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.studyWork}
                        placeholder={d.isFuture ? '—' : '0 Hour'}
                        onChange={(e) => updateCell(d.key, 'studyWork', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.cleaning}
                        placeholder={d.isFuture ? '—' : '-'}
                        onChange={(e) => updateCell(d.key, 'cleaning', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.followUp}
                        placeholder={d.isFuture ? '—' : '-'}
                        onChange={(e) => updateCell(d.key, 'followUp', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.bbtBtg}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'bbtBtg', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>

                    {/* OTHERS */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.morningClass}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'morningClass', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.sadhanaCard}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'sadhanaCard', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.sloka}
                        placeholder={d.isFuture ? '—' : '-'}
                        onChange={(e) => updateCell(d.key, 'sloka', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs font-mono ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.bhajanGayatri}
                        placeholder={d.isFuture ? '—' : '00'}
                        onChange={(e) => updateCell(d.key, 'bhajanGayatri', e.target.value)}
                        className={`w-full text-center py-1.5 px-0.5 bg-transparent font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs ${
                          d.isFuture ? 'text-slate-400 dark:text-slate-500 placeholder:text-slate-300 dark:placeholder:text-slate-700' : 'text-slate-900 dark:text-slate-100'
                        }`}
                      />
                    </td>
                  </tr>
                );
              })}

              {/* ROW 8: TOTAL (Sum of each column over elapsed days) */}
              <tr className="bg-slate-100 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white">
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-left font-black tracking-wider uppercase bg-slate-200/80 dark:bg-slate-800">
                  <div className="leading-tight">{language === 'bn' ? 'মোট' : 'TOTAL'}</div>
                  <div className="text-[10px] font-mono text-slate-500 font-normal">
                    {language === 'bn' ? `(সর্বোচ্চ ${toBnNum(columnCalculations.toBed.maxMarks)})` : `(Max ${columnCalculations.toBed.maxMarks})`}
                  </div>
                </td>

                {/* BODY */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.toBed.total}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.wakeUp.total}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.dayRest.total}
                </td>

                {/* SOUL */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.japa.total}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.spBooks.total}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.hearing.total}
                </td>

                {/* SEVA (Dynamic totals in hours / min) */}
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  {weeklyStats.matHours !== '0' ? `${weeklyStats.matHours} ${language === 'bn' ? 'ঘণ্টা' : 'Hours'}` : '—'}
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  {sevaSummary || (language === 'bn' ? 'উত্তম' : 'Good')}
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  —
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  {weeklyStats.spBookRef !== '—' ? weeklyStats.spBookRef : '—'}
                </td>

                {/* OTHERS */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.morningClass.total}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.sadhanaCard.total}
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-500 font-semibold truncate max-w-[75px]" title={weeklyStats.slokaText}>
                  {weeklyStats.slokaText !== '—' ? weeklyStats.slokaText : '—'}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.bhajanGayatri.total}
                </td>
              </tr>

              {/* ROW 9: % (Progression Percentage out of elapsed days) */}
              <tr className="bg-amber-50/80 dark:bg-amber-950/40 font-black text-amber-900 dark:text-amber-200">
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-left font-black tracking-wider uppercase bg-amber-100/60 dark:bg-amber-950/60">
                  <div className="leading-tight text-amber-900 dark:text-amber-200">
                    {language === 'bn' ? '% অগ্রগতি' : '% PROGRESS'}
                  </div>
                  <div className="text-[10px] font-mono text-amber-700 dark:text-amber-400 font-normal">
                    {language === 'bn' ? `(${toBnNum(columnCalculations.elapsedDaysCount)} দিন)` : `(${columnCalculations.elapsedDaysCount} Days)`}
                  </div>
                </td>

                {/* BODY */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.toBed.progressionPct}%`}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.wakeUp.progressionPct}%`}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.dayRest.progressionPct}%`}
                </td>

                {/* SOUL */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.japa.progressionPct}%`}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.spBooks.progressionPct}%`}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.hearing.progressionPct}%`}
                </td>

                {/* SEVA */}
                <td colSpan={4} className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold text-amber-700 dark:text-amber-300">
                  {sevaSummary || (language === 'bn' ? 'উত্তম' : 'Good')}
                </td>

                {/* OTHERS */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.morningClass.progressionPct}%`}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.sadhanaCard.progressionPct}%`}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center text-slate-500 font-bold">
                  —
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.isAllFuture ? '—' : `${columnCalculations.bhajanGayatri.progressionPct}%`}
                </td>
              </tr>

              {/* ROW 10: Full 175-Scale Reference (shown when week is progressing) */}
              {columnCalculations.elapsedDaysCount < 7 && (
                <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 font-bold text-[11px]">
                  <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-left uppercase bg-slate-100 dark:bg-slate-800 text-[10px]">
                    {language === 'bn' ? '% ১৭৫ স্কেল (লক্ষ্য)' : '% 175 SCALE (Goal)'}
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.toBed.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.wakeUp.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.dayRest.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.japa.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.spBooks.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.hearing.fullWeekPct}%</td>
                  <td colSpan={4} className="p-1 border border-slate-300 dark:border-slate-700 text-center text-[10px]">
                    {language === 'bn' ? '১৭৫ স্কেল লক্ষ্য' : '175 Scale Goal'}
                  </td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.morningClass.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.sadhanaCard.fullWeekPct}%</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">—</td>
                  <td className="p-1 border border-slate-300 dark:border-slate-700 text-center font-mono">{columnCalculations.bhajanGayatri.fullWeekPct}%</td>
                </tr>
              )}

            </tbody>
          </table>
        </div>

        {/* Authentic Physical Card 175 Matrix Score & % Strip (Printed on physical card) */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-2 sm:p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-1.5 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-extrabold uppercase tracking-wide">
                {language === 'bn' ? '১৭৫ নম্বর রূপান্তর সারণি' : '175 Matrix Score & % Reference Scale'}
              </span>
            </span>
            <span className="text-[10px] text-amber-700 dark:text-amber-400 font-mono font-bold">
              7 Days × 25 Marks = 175 Marks / Column
            </span>
          </div>

          <table className="w-full border-collapse border border-slate-300 dark:border-slate-600 text-center font-mono text-[10px] sm:text-[11px]">
            <tbody>
              <tr className="bg-slate-200 dark:bg-slate-700 font-black text-slate-900 dark:text-white">
                <td className="p-1 border border-slate-300 dark:border-slate-600 font-sans uppercase font-black text-[9px] bg-slate-300 dark:bg-slate-800 text-slate-800 dark:text-slate-200 shrink-0 px-2">
                  Score
                </td>
                {SCORE_175_CONVERSION_TABLE.map(item => (
                  <td key={item.score} className="p-1 border border-slate-300 dark:border-slate-600 min-w-[24px]">
                    {item.score}
                  </td>
                ))}
              </tr>
              <tr className="bg-amber-50 dark:bg-amber-950/40 font-black text-amber-900 dark:text-amber-300">
                <td className="p-1 border border-slate-300 dark:border-slate-600 font-sans uppercase font-black text-[9px] bg-amber-200 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 shrink-0 px-2">
                  & %
                </td>
                {SCORE_175_CONVERSION_TABLE.map(item => (
                  <td key={item.score} className="p-1 border border-slate-300 dark:border-slate-600 min-w-[24px]">
                    {item.pct}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>

        {/* SECTION SUMMARIES & COMMENTS PANEL (matching page-1.png bottom) */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-200 dark:border-slate-700/80 space-y-4">
          
          {/* 4 Category Summary Pills (BODY, SOUL, SEVA, OTHERS) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'দেহ' : 'BODY'}
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {columnCalculations.bodyAvgPct}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'আত্মা' : 'SOUL'}
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {columnCalculations.soulAvgPct}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'সেবা' : 'SEVA'}
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {sevaSummary}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'অন্যান্য' : 'OTHERS'}
              </span>
              <span className="text-lg font-black text-purple-600 dark:text-purple-400">
                {othersSummary} ({columnCalculations.othersAvgPct}%)
              </span>
            </div>
          </div>

          {/* Counselor Comment / Spiritual Diagnosis & Practical Advice in Dual Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{language === 'bn' ? '১. আধ্যাত্মিক পর্যবেক্ষণ:' : '1. OBSERVATION:'}</span>
              </label>
              <textarea
                rows={2}
                value={counselorDiagnosis}
                onChange={(e) => setCounselorDiagnosis(e.target.value)}
                placeholder="Please study your academic and spiritual books daily..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-600" />
                <span>{language === 'bn' ? '২. পালনীয় দিকনির্দেশনা:' : '2. PRACTICAL GUIDANCE:'}</span>
              </label>
              <textarea
                rows={2}
                value={counselorAdvice}
                onChange={(e) => setCounselorAdvice(e.target.value)}
                placeholder="Complete full 16 rounds of japa before 8:00 AM..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-medium text-slate-900 dark:text-slate-100 focus:ring-1 focus:ring-amber-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Counselor Signature & Sandwich Guidance */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-700 gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-700 dark:text-slate-300">Sandwich Feedback:</span>{' '}
              {language === 'bn' 
                ? 'আন্তরিকতার প্রশংসা করুন, গঠনমূলক নির্দেশনা দিন এবং কৃষ্ণপ্রেমের আশীর্বাদ জানান।' 
                : 'Praise sincerity first, offer loving correction, bless with Krishna Prema.'}
            </div>

            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{language === 'bn' ? 'স্বাক্ষর:' : 'Signature:'}</span>
              <input
                type="text"
                value={counselorSignature}
                onChange={(e) => setCounselorSignature(e.target.value)}
                className="px-3 py-1 rounded-xl border border-amber-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-serif font-bold text-amber-800 dark:text-amber-400"
              />
            </div>
          </div>

        </div>

      </div>

      {/* Floating Action Bar for Sadhana Card Fill-Up — sticky at bottom */}
      <div className="sticky bottom-1.5 sm:bottom-3 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl px-2.5 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between gap-1.5">
        
        {/* Left: Weekly Score Badge & Devotee Info */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
          {/* Score Badge */}
          <div className={`bg-gradient-to-r ${styles.bannerGradient} text-white rounded-lg px-2.5 py-1 shadow-sm flex flex-col items-center justify-center shrink-0 leading-tight`}>
            <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-wider text-white/90 leading-none">
              {columnCalculations.elapsedDaysCount < 7 
                ? (language === 'bn' ? 'চলতি অগ্রগতি' : 'Progression')
                : (language === 'bn' ? 'সাপ্তাহিক' : 'Weekly')}
            </span>
            <span className="text-xs sm:text-sm font-black leading-tight">
              {columnCalculations.overallPercentage}%
            </span>
          </div>

          {/* Devotee Info & Marks */}
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none leading-tight">
              {language === 'bn' ? (activeDevotee.nameBn || activeDevotee.name) : activeDevotee.name}
            </p>
            <p className={`text-[9px] sm:text-[10px] font-bold ${styles.primaryTextColor} truncate leading-tight`}>
              {columnCalculations.totalScoredMarks}/{columnCalculations.maxScoredMarks} {language === 'bn' ? 'নম্বর' : 'Marks'}
              {columnCalculations.elapsedDaysCount < 7 ? ` (${columnCalculations.elapsedDaysCount}/৭ দিন)` : ` • Scale ${selectedScale}`}
            </p>
          </div>

          {/* Real-time Auto-save Indicator */}
          <div className="hidden sm:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700">
            {saveStatus === 'saving' ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                <span>{language === 'bn' ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <Check className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                <span>{language === 'bn' ? 'স্বয়ংক্রিয় সংরক্ষিত' : 'Auto-saved'}</span>
              </span>
            )}
          </div>
        </div>

        {/* Right: Quick Action Buttons — compact & proportional */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Copy Weekly Report */}
          <button
            type="button"
            onClick={handleCopyWeeklyReport}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
            title={language === 'bn' ? 'সাপ্তাহিক রিপোর্ট কপি' : 'Copy Weekly Report'}
          >
            {copiedWeekly ? <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{copiedWeekly ? (language === 'bn' ? 'কপি!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>

          {/* WhatsApp Send */}
          <button
            type="button"
            onClick={handleShareWeeklyReportWhatsApp}
            className="px-2 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebe59] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
            title={language === 'bn' ? 'হোয়াটসঅ্যাপ পাঠান' : 'Send WhatsApp'}
          >
            <Send className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">WA</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Instant Manual Save Button */}
          <button
            type="button"
            onClick={handleSaveCard}
            className={`px-2 py-1 rounded-lg ${styles.btnPrimary} text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer`}
            title={language === 'bn' ? 'এখনই সংরক্ষণ করুন' : 'Save Card Now'}
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{language === 'bn' ? 'সংরক্ষণ' : 'Save'}</span>
          </button>
        </div>

      </div>

      {/* Scale Rules & 175 System Modal */}
      <ScaleRulesModal
        isOpen={isScaleModalOpen}
        onClose={() => setIsScaleModalOpen(false)}
        initialScaleId={selectedScale}
      />

      {/* Sadhana History & Cloud Archive Modal */}
      <SadhanaHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        activeDevotee={activeDevotee}
        onSelectWeeklyCard={(c) => handleSelectHistoricalCard(c)}
      />

      {/* Weekly Report Preview & Customization Modal */}
      <WeeklyReportModal
        isOpen={isWeeklyReportModalOpen}
        onClose={() => setIsWeeklyReportModalOpen(false)}
        devoteeName={activeDevotee.name}
        weekDateStr={weekDates[0].date}
        stats={weeklyStats}
        language={language}
      />

    </div>
  );
};
