import React, { useState, useMemo, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Download, Award, ChevronLeft, ChevronRight, Save, ShieldCheck, 
  RotateCcw, Table as TableIcon, Check, RefreshCw,
  Activity, Sparkles, HeartHandshake, Layers, Calendar as CalendarIcon,
  TrendingUp, Copy, Send, FileText
} from 'lucide-react';
import type { CounseleeProfile, MatrixDayEntry, WeeklySadhanaCard } from '../../types/sadhana';
import { SADHANA_SCALES, SCORE_175_CONVERSION_TABLE, convertScoreTo175Pct } from '../../data/sadhanaScalesData';
import { getRegisteredCounselees, PRIMARY_COUNSELOR } from '../../data/counseleesData';
import { CounselorSelectorBar } from '../../components/shared/CounselorSelectorBar';
import { ScaleRulesModal } from '../../components/shared/ScaleRulesModal';
import { SadhanaHistoryModal } from '../../components/sadhana/SadhanaHistoryModal';
import { WeeklyReportModal, type WeeklyReportStats } from '../../components/sadhana/WeeklyReportModal';
import { saveWeeklyCardRecord } from '../../utils/sadhanaCloudSync';
import { toast } from 'react-hot-toast';
import jsPDF from 'jspdf';

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

const DEFAULT_SAMPLE_ENTRIES: Record<string, MatrixDayEntry> = {
  sat: { toBed: '20', wakeUp: '25', dayRest: '25', japa: '25', spBooks: '25', hearing: '5 Hour', studyWork: '30 Min.', cleaning: '30 Min.', followUp: '2 Hour', bbtBtg: '2 BTG', morningClass: '25', sadhanaCard: '25', sloka: 'BG-7/9', bhajanGayatri: '25' },
  sun: { toBed: '25', wakeUp: '25', dayRest: '00', japa: '20', spBooks: '00', hearing: '00', studyWork: '2 Hour', cleaning: '10 Min.', followUp: '10 Min.', bbtBtg: '00 BTG', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '25' },
  mon: { toBed: '25', wakeUp: '20', dayRest: '20', japa: '20', spBooks: '25', hearing: '25', studyWork: '2 Hour', cleaning: '20 Min.', followUp: '20 Min.', bbtBtg: '1 Gita', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '25' },
  tue: { toBed: '20', wakeUp: '05', dayRest: '25', japa: '15', spBooks: '25', hearing: '25', studyWork: '2 Hour', cleaning: '00 Min.', followUp: '10 Min.', bbtBtg: '00', morningClass: '00', sadhanaCard: '00', sloka: '-', bhajanGayatri: '00' },
  wed: { toBed: '15', wakeUp: '25', dayRest: '-5', japa: '05', spBooks: '00', hearing: '00', studyWork: '2 Hour', cleaning: '10 Min.', followUp: '00', bbtBtg: '00', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '25' },
  thu: { toBed: '05', wakeUp: '25', dayRest: '20', japa: '20', spBooks: '25', hearing: '25', studyWork: '3 Hour', cleaning: '20 Min.', followUp: '2 Hour', bbtBtg: '1 BTG', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '00' },
  fri: { toBed: '25', wakeUp: '25', dayRest: '25', japa: '25', spBooks: '25', hearing: '25', studyWork: '5 Hours', cleaning: '45 Min.', followUp: '3 Hour', bbtBtg: '00', morningClass: '25', sadhanaCard: '25', sloka: 'SB 1/2/3', bhajanGayatri: '25' }
};

const toBnNum = (n: number | string) => {
  const bnDigits = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
  return String(n).replace(/[0-9]/g, (w) => bnDigits[parseInt(w, 10)]);
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
  const [isExporting, setIsExporting] = useState(false);
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
  const weekDates = useMemo(() => {
    const today = new Date();
    today.setDate(today.getDate() + weekOffset * 7);
    const dayOfWeek = today.getDay(); // 0 is Sunday, 6 is Saturday
    const diffToSat = (dayOfWeek + 1) % 7; 
    const saturday = new Date(today);
    saturday.setDate(today.getDate() - diffToSat);

    return DAYS_OF_WEEK.map((d, index) => {
      const dt = new Date(saturday);
      dt.setDate(saturday.getDate() + index);
      const dateStr = `${dt.getDate()}/${dt.getMonth() + 1}`;
      return {
        key: d.key,
        nameEn: d.nameEn,
        nameBn: d.nameBn,
        fullNameEn: d.fullNameEn,
        date: dateStr
      };
    });
  }, [weekOffset]);

  // Matrix entries state for 7 days
  const [matrixEntries, setMatrixEntries] = useState<Record<string, MatrixDayEntry>>(() => {
    const saved = localStorage.getItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return DEFAULT_SAMPLE_ENTRIES;
  });

  // Auto-save status state
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  // Reload saved matrix and meta if activeDevotee or weekOffset changes
  useEffect(() => {
    setIsInitialLoadDone(false);
    const saved = localStorage.getItem(`weekly_matrix_${activeDevotee.id}_offset_${weekOffset}`);
    if (saved) {
      try {
        setMatrixEntries(JSON.parse(saved));
      } catch (e) {
        setMatrixEntries(DEFAULT_SAMPLE_ENTRIES);
      }
    } else {
      setMatrixEntries(DEFAULT_SAMPLE_ENTRIES);
    }

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
  }, [activeDevotee.id, weekOffset]);

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

  // 175-mark column calculations (7 days * 25 max marks = 175 per scored column)
  const columnCalculations = useMemo(() => {
    const dayKeys = DAYS_OF_WEEK.map(d => d.key);

    const calcCol = (field: keyof MatrixDayEntry) => {
      const total = dayKeys.reduce((sum, key) => sum + parseCellMark(matrixEntries[key]?.[field] || '0'), 0);
      const pct = convertScoreTo175Pct(total);
      return { total, pct };
    };

    // Body
    const toBed = calcCol('toBed');
    const wakeUp = calcCol('wakeUp');
    const dayRest = calcCol('dayRest');
    const bodyAvgPct = Math.round((toBed.pct + wakeUp.pct + dayRest.pct) / 3);

    // Soul
    const japa = calcCol('japa');
    const spBooks = calcCol('spBooks');
    const hearing = calcCol('hearing');
    const soulAvgPct = Math.round((japa.pct + spBooks.pct + hearing.pct) / 3);

    // Others
    const morningClass = calcCol('morningClass');
    const sadhanaCard = calcCol('sadhanaCard');
    const bhajanGayatri = calcCol('bhajanGayatri');
    const othersAvgPct = Math.round((morningClass.pct + sadhanaCard.pct + bhajanGayatri.pct) / 3);

    // Sum of all 9 numerically scored columns
    const totalScoredMarks = toBed.total + wakeUp.total + dayRest.total +
                             japa.total + spBooks.total + hearing.total +
                             morningClass.total + sadhanaCard.total + bhajanGayatri.total;
    
    // Max marks = 9 columns * 175 = 1575 marks
    const maxWeeklyScoredMarks = 9 * 175;
    const overallPercentage = Math.max(0, Math.min(100, Math.round((totalScoredMarks / maxWeeklyScoredMarks) * 100)));

    return {
      toBed,
      wakeUp,
      dayRest,
      bodyAvgPct,
      bodyTotalMarks: toBed.total + wakeUp.total + dayRest.total,
      japa,
      spBooks,
      hearing,
      soulAvgPct,
      soulTotalMarks: japa.total + spBooks.total + hearing.total,
      morningClass,
      sadhanaCard,
      bhajanGayatri,
      othersAvgPct,
      othersTotalMarks: morningClass.total + sadhanaCard.total + bhajanGayatri.total,
      totalScoredMarks,
      maxWeeklyScoredMarks,
      overallPercentage
    };
  }, [matrixEntries]);

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
      : '2.5';

    return {
      matHours: matHoursTotal > 0 ? (matHoursTotal % 1 === 0 ? matHoursTotal.toString() : matHoursTotal.toFixed(1)) : '40',
      bodyPct: columnCalculations.bodyAvgPct > 0 ? columnCalculations.bodyAvgPct.toFixed(2) : '60.29',
      soulPct: columnCalculations.soulAvgPct > 0 ? columnCalculations.soulAvgPct.toFixed(2) : '75.26',
      spHours: parseFloat(spHoursCalc) > 0 ? spHoursCalc : '2.5',
      spBookRef: spBookRefFound || 'Śrīmad-Bhāgavatam 3.27.10',
      lectHours: lectHoursTotal > 0 ? (lectHoursTotal % 1 === 0 ? lectHoursTotal.toString() : lectHoursTotal.toFixed(1)) : '6',
      slokaText: slokasFound.length > 0
        ? `Yes — “${slokasFound[0]}”`
        : 'Yes — “Vidyā vivādāya dhanaṁ madāya...” (Śrīmad-Bhāgavatam 4.22.24)'
    };
  }, [matrixEntries, columnCalculations]);

  const generateWeeklyReportText = () => {
    return `🌿 Hare Krishna. 🙏

This is *${activeDevotee.name}.* Here is my weekly report for ${weekDates[0].date}:

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

  const handleExportPdf = () => {
    try {
      setIsExporting(true);
      toast.loading(language === 'bn' ? 'সাপ্তাহিক সারসংক্ষেপ PDF তৈরি হচ্ছে...' : 'Generating weekly summary PDF...');

      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const W = 210; // A4 width mm
      const margin = 14;
      const contentW = W - margin * 2;
      let y = 0;

      // Palette
      const crimson = [120, 0, 30];
      const deepEmerald = [16, 110, 72];
      const goldAmber = [180, 115, 0];
      const slate900 = [15, 23, 42];
      const slate700 = [51, 65, 85];
      const slate500 = [100, 116, 139];
      const slate100 = [241, 245, 249];
      const slate200 = [226, 232, 240];
      const white = [255, 255, 255];

      // ── Header Band ─────────────────────────────────────────────────
      pdf.setFillColor(crimson[0], crimson[1], crimson[2]);
      pdf.rect(0, 0, W, 22, 'F');
      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFontSize(13);
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? 'সাপ্তাহিক সাধনা সারসংক্ষেপ' : 'Weekly Sadhana Progress Summary', margin, 9.5);
      pdf.setFontSize(8);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${activeDevotee.name}  •  Scale ${selectedScale}  •  ${weekDates[0].date} — ${weekDates[6].date}`, margin, 16);
      pdf.text(`${language === 'bn' ? 'কাউন্সেলর' : 'Counselor'}: ${counselorSignature}`, W - margin, 16, { align: 'right' });
      y = 27;

      // ── SECTION 1: Weekly Sadhana Report Listing (Clean Text Cards — NO BARS) ──
      pdf.setFillColor(slate100[0], slate100[1], slate100[2]);
      pdf.roundedRect(margin, y, contentW, 64, 2, 2, 'F');
      pdf.setDrawColor(slate200[0], slate200[1], slate200[2]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, y, contentW, 64, 2, 2, 'S');

      // Title header
      pdf.setFillColor(crimson[0], crimson[1], crimson[2]);
      pdf.roundedRect(margin, y, contentW, 7, 2, 2, 'F');
      pdf.rect(margin, y + 4, contentW, 3, 'F');
      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.text(language === 'bn' ? '১. সাপ্তাহিক সাধনা প্রতিবেদন (সারসংক্ষেপ তালিকা)' : '1. Weekly Sadhana Report (Summary Listing)', margin + 4, y + 5);

      y += 12;

      // 6 metrics formatted in 2 clean columns
      const col1X = margin + 6;
      const col2X = margin + contentW / 2 + 4;
      const rowGap = 8;

      const pct = columnCalculations.overallPercentage;
      const grade = pct >= 85 ? 'A+' : pct >= 70 ? 'A' : pct >= 55 ? 'B' : 'C';

      // Row 1: Material Study & Śrīla Prabhupāda Study
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8);
      pdf.setTextColor(slate900[0], slate900[1], slate900[2]);
      pdf.text(language === 'bn' ? '• প্রাতিষ্ঠানিক পড়াশোনা:' : '• Material Study:', col1X, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${weeklyStats.matHours} hours`, col1X + 42, y);

      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? '• শ্রীল প্রভুপাদের গ্রন্থ:' : '• Prabhupāda Study:', col2X, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${weeklyStats.spHours} hours (${weeklyStats.spBookRef})`, col2X + 40, y);

      y += rowGap;

      // Row 2: Body % & Soul %
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? '• দেহ (Body):' : '• Body Score:', col1X, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${weeklyStats.bodyPct}%  (${columnCalculations.bodyTotalMarks}/225 Marks)`, col1X + 42, y);

      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? '• আত্মা (Soul):' : '• Soul Score:', col2X, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${weeklyStats.soulPct}%  (${columnCalculations.soulTotalMarks}/225 Marks)`, col2X + 40, y);

      y += rowGap;

      // Row 3: Lecture Hearing & Sloka Memorization
      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? '• প্রবচন শ্রবণ:' : '• Lecture Hearing:', col1X, y);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`${weeklyStats.lectHours} hours`, col1X + 42, y);

      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? '• শ্লোক মুখস্থকরণ:' : '• Śloka Memorization:', col2X, y);
      pdf.setFont('helvetica', 'normal');
      const slokaShort = weeklyStats.slokaText.length > 38 ? weeklyStats.slokaText.substring(0, 36) + '...' : weeklyStats.slokaText;
      pdf.text(slokaShort, col2X + 40, y);

      y += rowGap + 2;

      // Score divider line
      pdf.setDrawColor(slate200[0], slate200[1], slate200[2]);
      pdf.line(margin + 4, y - 2, margin + contentW - 4, y - 2);

      // Overall Score strip (Listing text format)
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(8.5);
      pdf.setTextColor(deepEmerald[0], deepEmerald[1], deepEmerald[2]);
      pdf.text(
        language === 'bn' 
          ? `সাপ্তাহিক মোট অর্জন (১৭৫ ম্যাট্রিক্স):  ${pct}%  (${columnCalculations.totalScoredMarks}/${columnCalculations.maxWeeklyScoredMarks} নম্বর)  •  গ্রেড: ${grade}`
          : `Overall Weekly 175-Score:  ${pct}%  (${columnCalculations.totalScoredMarks}/${columnCalculations.maxWeeklyScoredMarks} Marks)  •  Grade: ${grade}`,
        col1X, y + 3
      );

      y += 18;

      // ── SECTION 2: 7-Day Sadhana Progress Listing Table (NO BARS!) ───
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(9);
      pdf.setTextColor(slate900[0], slate900[1], slate900[2]);
      pdf.text(language === 'bn' ? '২. দৈনিক অগ্রগতি তালিকা (শনি — শুক্র)' : '2. Daily Progress Listing (Sat — Fri)', margin, y);
      y += 4;

      // Table Column Definitions
      const cols = [
        { label: language === 'bn' ? 'দিন / তারিখ' : 'Day / Date', w: 26, align: 'left' },
        { label: language === 'bn' ? 'শয়ন' : 'Sleep', w: 14, align: 'center' },
        { label: language === 'bn' ? 'জাগরণ' : 'Wake', w: 14, align: 'center' },
        { label: language === 'bn' ? 'দিবানিদ্রা' : 'Rest', w: 14, align: 'center' },
        { label: language === 'bn' ? 'জপ' : 'Japa', w: 14, align: 'center' },
        { label: language === 'bn' ? 'গ্রন্থ' : 'Book', w: 14, align: 'center' },
        { label: language === 'bn' ? 'শ্রবণ' : 'Hear', w: 14, align: 'center' },
        { label: language === 'bn' ? 'ক্লাস' : 'Class', w: 14, align: 'center' },
        { label: language === 'bn' ? 'কার্ড' : 'Card', w: 14, align: 'center' },
        { label: language === 'bn' ? 'ভজন' : 'Bhajan', w: 14, align: 'center' },
        { label: language === 'bn' ? 'মোট' : 'Total', w: 18, align: 'center' },
        { label: language === 'bn' ? 'অবস্থা' : 'Status', w: 18, align: 'center' }
      ];

      // Table Header Row
      pdf.setFillColor(crimson[0], crimson[1], crimson[2]);
      pdf.rect(margin, y, contentW, 6.5, 'F');
      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(6.5);

      let curX = margin;
      cols.forEach(c => {
        if (c.align === 'center') {
          pdf.text(c.label, curX + c.w / 2, y + 4.5, { align: 'center' });
        } else {
          pdf.text(c.label, curX + 2, y + 4.5);
        }
        curX += c.w;
      });
      y += 6.5;

      // Table 7 Data Rows
      const rowHeight = 8;
      weekDates.forEach((d, idx) => {
        const row = matrixEntries[d.key];
        const dayTotalRaw = ['toBed','wakeUp','dayRest','japa','spBooks','hearing','morningClass','sadhanaCard','bhajanGayatri']
          .reduce((s, f) => s + parseCellMark((row as unknown as Record<string, string>)?.[f] || '0'), 0);
        const hasData = dayTotalRaw > 0;
        const dayPct = Math.min(100, Math.round((dayTotalRaw / (9 * 25)) * 100));

        // Alternating background
        pdf.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
        pdf.rect(margin, y, contentW, rowHeight, 'F');
        pdf.setDrawColor(slate200[0], slate200[1], slate200[2]);
        pdf.setLineWidth(0.2);
        pdf.rect(margin, y, contentW, rowHeight, 'S');

        // Day label
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        pdf.setTextColor(slate900[0], slate900[1], slate900[2]);
        const dayNameStr = language === 'bn' ? d.nameBn : d.nameEn;
        pdf.text(`${dayNameStr} (${d.date})`, margin + 2, y + 5.2);

        // Sub-column values (Text listing)
        const cellValues = [
          row?.toBed || '-',
          row?.wakeUp || '-',
          row?.dayRest || '-',
          row?.japa || '-',
          row?.spBooks || '-',
          row?.hearing || '-',
          row?.morningClass || '-',
          row?.sadhanaCard || '-',
          row?.bhajanGayatri || '-'
        ];

        let cellX = margin + cols[0].w;
        cellValues.forEach((val, vi) => {
          pdf.setFont('helvetica', 'normal');
          pdf.setFontSize(6.5);
          pdf.setTextColor(slate700[0], slate700[1], slate700[2]);
          const colW = cols[vi + 1].w;
          pdf.text(String(val), cellX + colW / 2, y + 5.2, { align: 'center' });
          cellX += colW;
        });

        // Day Total
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(7);
        if (hasData) {
          const scColor = dayPct >= 80 ? deepEmerald : dayPct >= 65 ? goldAmber : crimson;
          pdf.setTextColor(scColor[0], scColor[1], scColor[2]);
          pdf.text(`${dayTotalRaw} (${dayPct}%)`, cellX + cols[10].w / 2, y + 5.2, { align: 'center' });
        } else {
          pdf.setTextColor(slate500[0], slate500[1], slate500[2]);
          pdf.text('—', cellX + cols[10].w / 2, y + 5.2, { align: 'center' });
        }
        cellX += cols[10].w;

        // Status
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        if (hasData) {
          pdf.setTextColor(deepEmerald[0], deepEmerald[1], deepEmerald[2]);
          pdf.text(language === 'bn' ? 'সম্পন্ন ✓' : 'Done ✓', cellX + cols[11].w / 2, y + 5.2, { align: 'center' });
        } else {
          pdf.setTextColor(slate500[0], slate500[1], slate500[2]);
          pdf.text(language === 'bn' ? 'বাকি' : 'Pending', cellX + cols[11].w / 2, y + 5.2, { align: 'center' });
        }

        y += rowHeight;
      });

      // Weekly Column Totals Footer Row
      pdf.setFillColor(slate100[0], slate100[1], slate100[2]);
      pdf.rect(margin, y, contentW, rowHeight, 'F');
      pdf.setDrawColor(slate200[0], slate200[1], slate200[2]);
      pdf.setLineWidth(0.2);
      pdf.rect(margin, y, contentW, rowHeight, 'S');

      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.setTextColor(crimson[0], crimson[1], crimson[2]);
      pdf.text(language === 'bn' ? 'সাপ্তাহিক যোগফল' : 'Weekly Total', margin + 2, y + 5.2);

      const colTotals = [
        columnCalculations.toBed.total,
        columnCalculations.wakeUp.total,
        columnCalculations.dayRest.total,
        columnCalculations.japa.total,
        columnCalculations.spBooks.total,
        columnCalculations.hearing.total,
        columnCalculations.morningClass.total,
        columnCalculations.sadhanaCard.total,
        columnCalculations.bhajanGayatri.total
      ];

      let totX = margin + cols[0].w;
      colTotals.forEach((tot, ti) => {
        const colW = cols[ti + 1].w;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(6.5);
        pdf.setTextColor(slate900[0], slate900[1], slate900[2]);
        pdf.text(String(tot), totX + colW / 2, y + 5.2, { align: 'center' });
        totX += colW;
      });

      pdf.setTextColor(deepEmerald[0], deepEmerald[1], deepEmerald[2]);
      pdf.text(`${columnCalculations.totalScoredMarks}`, totX + cols[10].w / 2, y + 5.2, { align: 'center' });
      totX += cols[10].w;
      pdf.text(`${pct}%`, totX + cols[11].w / 2, y + 5.2, { align: 'center' });

      y += rowHeight + 8;

      // ── SECTION 3: Counselor Remarks ─────────────────────────────────
      pdf.setFillColor(slate100[0], slate100[1], slate100[2]);
      pdf.roundedRect(margin, y, contentW, 26, 2, 2, 'F');
      pdf.setDrawColor(slate200[0], slate200[1], slate200[2]);
      pdf.setLineWidth(0.3);
      pdf.roundedRect(margin, y, contentW, 26, 2, 2, 'S');

      pdf.setFillColor(crimson[0], crimson[1], crimson[2]);
      pdf.roundedRect(margin, y, contentW, 6, 2, 2, 'F');
      pdf.rect(margin, y + 3, contentW, 3, 'F');
      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.text(language === 'bn' ? 'কাউন্সেলরের মূল্যায়ন ও মন্তব্য' : "Counselor's Review & Guidance", margin + 4, y + 4.5);

      pdf.setTextColor(slate700[0], slate700[1], slate700[2]);
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7);
      pdf.text(language === 'bn' ? 'রোগ নির্ণয়:' : 'Diagnosis:', margin + 4, y + 11.5);
      pdf.setFont('helvetica', 'normal');
      const diagLines = pdf.splitTextToSize(counselorDiagnosis, contentW - 8);
      pdf.text(diagLines.slice(0, 2), margin + 4, y + 15.5);

      pdf.setFont('helvetica', 'bold');
      pdf.text(language === 'bn' ? 'পরামর্শ:' : 'Advice:', margin + 4, y + 21);
      pdf.setFont('helvetica', 'normal');
      const adviceLines = pdf.splitTextToSize(counselorAdvice, contentW - 40);
      pdf.text(adviceLines.slice(0, 1), margin + 4, y + 25);

      // Signature
      pdf.setFont('helvetica', 'bold');
      pdf.setFontSize(7.5);
      pdf.setTextColor(crimson[0], crimson[1], crimson[2]);
      pdf.text(counselorSignature, W - margin - 4, y + 23, { align: 'right' });
      pdf.setDrawColor(crimson[0], crimson[1], crimson[2]);
      pdf.setLineWidth(0.3);
      pdf.line(W - margin - 35, y + 24, W - margin - 4, y + 24);

      // ── Footer ──────────────────────────────────────────────────────
      pdf.setFillColor(crimson[0], crimson[1], crimson[2]);
      pdf.rect(0, 290, W, 7, 'F');
      pdf.setTextColor(white[0], white[1], white[2]);
      pdf.setFont('helvetica', 'normal');
      pdf.setFontSize(6.5);
      pdf.text('VOICE Hub — Advaita Acharya Youth Cultural Center', margin, 294.5);
      pdf.text(`Generated: ${new Date().toLocaleDateString()}`, W - margin, 294.5, { align: 'right' });

      pdf.save(`Weekly_Sadhana_Summary_${activeDevotee.name.replace(/\s+/g, '_')}_${weekDates[0].date.replace(/\//g, '-')}.pdf`);
      toast.dismiss();
      toast.success(language === 'bn' ? 'সাপ্তাহিক সারসংক্ষেপ PDF ডাউনলোড সম্পন্ন!' : 'Weekly summary PDF downloaded!');
    } catch (e) {
      toast.dismiss();
      toast.error('Failed to export PDF');
      console.error(e);
    } finally {
      setIsExporting(false);
    }
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

  const handleResetToSample = () => {
    setMatrixEntries(DEFAULT_SAMPLE_ENTRIES);
    toast.success(language === 'bn' ? 'নমুনা ছক পুনরুদ্ধার করা হয়েছে।' : 'Sample matrix restored.');
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
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="text-sm sm:text-base md:text-lg font-black tracking-tight truncate">
              {language === 'bn' ? '১৭৫ সাপ্তাহিক সাধনাপত্র ছক (শনি—শুক্র)' : '175 Weekly Sadhana Matrix (Sat–Fri)'}
            </h2>
            <span className="text-[10px] sm:text-xs font-bold bg-black/30 text-amber-200 px-2 py-0.5 rounded-full border border-white/10 shrink-0">
              Scale {selectedScale}
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
          {/* 1. Average (Gold/Amber Jewel Box) */}
          <div className="bg-gradient-to-br from-amber-500/30 to-amber-900/40 border border-amber-300/40 hover:border-amber-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-amber-500/20 group">
            <div className="flex items-center justify-between gap-1 text-[10px] sm:text-xs font-bold text-amber-200">
              <span className="flex items-center gap-1 truncate">
                <TrendingUp className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-300 shrink-0 group-hover:scale-110 transition-transform" />
                <span className="truncate">
                  {language === 'bn' ? 'গড়' : 'Avg'}
                  <span className="hidden sm:inline">{language === 'bn' ? ' অর্জন' : ' Score'}</span>
                </span>
              </span>
              <span className={`px-1 py-0.2 rounded text-[9px] font-black shrink-0 ${
                columnCalculations.overallPercentage >= 85 ? 'bg-emerald-400 text-slate-950' : columnCalculations.overallPercentage >= 70 ? 'bg-amber-300 text-slate-950' : 'bg-rose-400 text-white'
              }`}>
                {columnCalculations.overallPercentage >= 85 ? 'A+' : columnCalculations.overallPercentage >= 70 ? 'A' : 'B'}
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-amber-100 mt-1 tracking-tight">
              {language === 'bn' ? `${toBnNum(columnCalculations.overallPercentage)}%` : `${columnCalculations.overallPercentage}%`}
            </div>
          </div>

          {/* 2. Body (Emerald/Teal Jewel Box) */}
          <div className="bg-gradient-to-br from-emerald-500/30 to-teal-900/40 border border-emerald-300/40 hover:border-emerald-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-emerald-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-emerald-200 truncate">
              <Activity className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'দেহ' : 'Body'}
                <span className="hidden sm:inline"> (Body)</span>
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-emerald-100 mt-1 tracking-tight">
              {language === 'bn' ? `${toBnNum(columnCalculations.bodyAvgPct)}%` : `${columnCalculations.bodyAvgPct}%`}
            </div>
          </div>

          {/* 3. Soul (Royal Violet/Purple Jewel Box) */}
          <div className="bg-gradient-to-br from-purple-500/30 to-indigo-900/40 border border-purple-300/40 hover:border-purple-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-purple-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-purple-200 truncate">
              <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-purple-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'আত্মা' : 'Soul'}
                <span className="hidden sm:inline"> (Soul)</span>
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-purple-100 mt-1 tracking-tight">
              {language === 'bn' ? `${toBnNum(columnCalculations.soulAvgPct)}%` : `${columnCalculations.soulAvgPct}%`}
            </div>
          </div>

          {/* 4. Seva (Warm Rose/Coral Jewel Box) */}
          <div className="bg-gradient-to-br from-rose-500/30 to-pink-900/40 border border-rose-300/40 hover:border-rose-300/80 rounded-xl p-2 sm:p-2.5 backdrop-blur-md flex flex-col justify-between transition-all shadow-xs hover:shadow-rose-500/20 group">
            <div className="flex items-center gap-1 text-[10px] sm:text-xs font-bold text-rose-200 truncate">
              <HeartHandshake className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-rose-300 shrink-0 group-hover:scale-110 transition-transform" />
              <span className="truncate">
                {language === 'bn' ? 'সেবা' : 'Seva'}
                <span className="hidden sm:inline"> (Seva)</span>
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
                <span className="hidden sm:inline"> (Others)</span>
              </span>
            </div>
            <div className="text-sm sm:text-xl font-black text-sky-100 mt-1 tracking-tight">
              {language === 'bn' ? `${toBnNum(columnCalculations.othersAvgPct)}%` : `${columnCalculations.othersAvgPct}%`}
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
              {weekOffset === 0 && <span className="ml-1.5 text-amber-600 dark:text-amber-400 font-semibold font-sans">(Current)</span>}
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

        </div>


      </div>

      {/* Main 7-Day Matrix Table (Printable Container) */}
      <div 
        id="printable-sadhana-card-matrix"
        className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl p-3 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4 sm:space-y-5 overflow-hidden"
      >
        
        {/* Printable Card Header: Rendered only during PDF export or print */}
        <div className={`${isExporting ? 'flex' : 'hidden'} print:flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs`}>
          
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
                  {language === 'bn' ? '১. দেহ (BODY)' : 'BODY'}
                </th>
                <th colSpan={3} className="p-2 border border-white/20 bg-black/25">
                  {language === 'bn' ? '২. আত্মা (SOUL)' : 'SOUL'}
                </th>
                <th colSpan={4} className="p-2 border border-white/20 bg-black/15">
                  {language === 'bn' ? '৩. সেবা (SEVA IN MINUTE/HOUR)' : 'SEVA (IN MINUTE/HOUR)'}
                </th>
                <th colSpan={4} className="p-2 border border-white/20 bg-black/25">
                  {language === 'bn' ? '৪. অন্যান্য (OTHERS)' : 'OTHERS'}
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
                const row = matrixEntries[d.key] || DEFAULT_SAMPLE_ENTRIES[d.key];
                const isEven = index % 2 === 0;

                return (
                  <tr 
                    key={d.key} 
                    className={`transition-colors hover:bg-amber-50/50 dark:hover:bg-slate-800/60 ${
                      isEven ? 'bg-white dark:bg-slate-900' : 'bg-slate-50/70 dark:bg-slate-900/50'
                    }`}
                  >
                    {/* Day Name & Date */}
                    <td className="p-1.5 border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 text-center min-w-[65px]">
                      <div className="font-black text-[13px] text-[#7B0025] dark:text-rose-400 tracking-wide leading-tight">
                        {language === 'bn' ? d.nameBn : d.nameEn}
                      </div>
                      <div className="mt-0.5 inline-block bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-[11px] px-1.5 py-0.5 rounded-md leading-tight">
                        {d.date}
                      </div>
                    </td>

                    {/* BODY */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.toBed}
                        onChange={(e) => updateCell(d.key, 'toBed', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.wakeUp}
                        onChange={(e) => updateCell(d.key, 'wakeUp', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.dayRest}
                        onChange={(e) => updateCell(d.key, 'dayRest', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>

                    {/* SOUL */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.japa}
                        onChange={(e) => updateCell(d.key, 'japa', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.spBooks}
                        onChange={(e) => updateCell(d.key, 'spBooks', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.hearing}
                        onChange={(e) => updateCell(d.key, 'hearing', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>

                    {/* SEVA */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.studyWork}
                        onChange={(e) => updateCell(d.key, 'studyWork', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.cleaning}
                        onChange={(e) => updateCell(d.key, 'cleaning', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.followUp}
                        onChange={(e) => updateCell(d.key, 'followUp', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.bbtBtg}
                        onChange={(e) => updateCell(d.key, 'bbtBtg', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>

                    {/* OTHERS */}
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.morningClass}
                        onChange={(e) => updateCell(d.key, 'morningClass', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.sadhanaCard}
                        onChange={(e) => updateCell(d.key, 'sadhanaCard', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.sloka}
                        onChange={(e) => updateCell(d.key, 'sloka', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-semibold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs font-mono"
                      />
                    </td>
                    <td className="p-0.5 border border-slate-300 dark:border-slate-700">
                      <input
                        type="text"
                        value={row.bhajanGayatri}
                        onChange={(e) => updateCell(d.key, 'bhajanGayatri', e.target.value)}
                        className="w-full text-center py-1.5 px-0.5 bg-transparent text-slate-900 dark:text-slate-100 font-bold focus:bg-amber-50 dark:focus:bg-slate-800 focus:outline-hidden text-xs"
                      />
                    </td>
                  </tr>
                );
              })}

              {/* ROW 8: TOTAL (Sum of each column over 7 days, out of 175 marks) */}
              <tr className="bg-slate-100 dark:bg-slate-800/90 font-extrabold text-slate-900 dark:text-white">
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-left font-black tracking-wider uppercase bg-slate-200/80 dark:bg-slate-800">
                  {language === 'bn' ? 'মোট (TOTAL)' : 'TOTAL'}
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

                {/* SEVA (Totals in hours / min) */}
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  21 Hours
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  125 Min.
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  7.8 Hours
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[11px] font-bold text-amber-700 dark:text-amber-400">
                  3 BTG, 1 Gita
                </td>

                {/* OTHERS */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.morningClass.total}
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.sadhanaCard.total}
                </td>
                <td className="p-1.5 border border-slate-300 dark:border-slate-700 text-center text-[10px] text-slate-500 font-semibold">
                  2 Slokas
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center font-mono">
                  {columnCalculations.bhajanGayatri.total}
                </td>
              </tr>

              {/* ROW 9: % (Column Percentage out of 175 marks) */}
              <tr className="bg-amber-50/80 dark:bg-amber-950/40 font-black text-amber-900 dark:text-amber-200">
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-left font-black tracking-wider uppercase bg-amber-100/60 dark:bg-amber-950/60">
                  % (175 Marks)
                </td>

                {/* BODY */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.toBed.pct}%
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.wakeUp.pct}%
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.dayRest.pct}%
                </td>

                {/* SOUL */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.japa.pct}%
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.spBooks.pct}%
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.hearing.pct}%
                </td>

                {/* SEVA */}
                <td colSpan={4} className="p-2 border border-slate-300 dark:border-slate-700 text-center font-bold text-amber-700 dark:text-amber-300">
                  {sevaSummary}
                </td>

                {/* OTHERS */}
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.morningClass.pct}%
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.sadhanaCard.pct}%
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center text-slate-500 font-bold">
                  —
                </td>
                <td className="p-2 border border-slate-300 dark:border-slate-700 text-center">
                  {columnCalculations.bhajanGayatri.pct}%
                </td>
              </tr>

            </tbody>
          </table>
        </div>

        {/* Authentic Physical Card 175 Matrix Score & % Strip (Printed on physical card) */}
        <div className="bg-slate-100 dark:bg-slate-800/80 p-2 sm:p-2.5 rounded-2xl border border-slate-300 dark:border-slate-700 space-y-1.5 overflow-x-auto">
          <div className="flex items-center justify-between text-[11px] font-bold text-slate-700 dark:text-slate-300 px-1">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="font-extrabold uppercase tracking-wide">
                {language === 'bn' ? '১৭৫ নম্বর রূপান্তর সারণি (Score & % Reference)' : '175 Matrix Score & % Reference Scale'}
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
                {language === 'bn' ? 'দেহ (BODY)' : 'BODY'}
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {columnCalculations.bodyAvgPct}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'আত্মা (SOUL)' : 'SOUL'}
              </span>
              <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                {columnCalculations.soulAvgPct}%
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'সেবা (SEVA)' : 'SEVA'}
              </span>
              <span className="text-lg font-black text-emerald-600 dark:text-emerald-400">
                {sevaSummary}
              </span>
            </div>

            <div className="p-2.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-2xs">
              <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400 block">
                {language === 'bn' ? 'অন্যান্য (OTHERS)' : 'OTHERS'}
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
                <span>{language === 'bn' ? '১. আধ্যাত্মিক পর্যবেক্ষণ (Observation):' : '1. OBSERVATION & DIAGNOSIS:'}</span>
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
                <span>{language === 'bn' ? '২. পালনীয় দিকনির্দেশনা (Advice):' : '2. PRACTICAL GUIDANCE & ADVICE:'}</span>
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
              {language === 'bn' ? 'সাপ্তাহিক' : 'Weekly'}
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
              {columnCalculations.totalScoredMarks}/{columnCalculations.maxWeeklyScoredMarks} {language === 'bn' ? 'নম্বর' : 'Marks'} • Scale {selectedScale}
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

        {/* Right: Quick Action Buttons */}
        <div className="flex items-center gap-1 sm:gap-2 flex-1 justify-end min-w-0">
          {/* Scale rules popup */}
          <button
            type="button"
            onClick={() => setIsScaleModalOpen(true)}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            title={language === 'bn' ? '১৭৫ নিয়মাবলী' : '175 Rules'}
          >
            <TableIcon className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden md:inline">{language === 'bn' ? '১৭৫ নিয়ম' : 'Rules'}</span>
          </button>

          {/* Reset to sample */}
          <button
            type="button"
            onClick={handleResetToSample}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            title={language === 'bn' ? 'নমুনা ছক পুনরুদ্ধার' : 'Reset sample data'}
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden md:inline">{language === 'bn' ? 'নমুনা' : 'Sample'}</span>
          </button>

          {/* Instant Manual Save Button */}
          <button
            type="button"
            onClick={handleSaveCard}
            className={`px-2.5 sm:px-3 py-1.5 rounded-lg ${styles.btnPrimary} text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shadow-xs cursor-pointer shrink-0`}
            title={language === 'bn' ? 'এখনই সংরক্ষণ করুন' : 'Save Card Now'}
          >
            <Save className="w-3.5 h-3.5 shrink-0" />
            <span>{language === 'bn' ? 'সংরক্ষণ' : 'Save'}</span>
          </button>

          {/* Copy Weekly Report */}
          <button
            type="button"
            onClick={handleCopyWeeklyReport}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shrink-0 cursor-pointer"
            title={language === 'bn' ? 'সাপ্তাহিক রিপোর্ট কপি' : 'Copy Weekly Report'}
          >
            {copiedWeekly ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-500" />}
            <span className="hidden sm:inline">{copiedWeekly ? (language === 'bn' ? 'কপি!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>

          {/* WhatsApp Send */}
          <button
            type="button"
            onClick={handleShareWeeklyReportWhatsApp}
            className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg bg-[#25D366] hover:bg-[#1ebe59] text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
            title={language === 'bn' ? 'হোয়াটসঅ্যাপ পাঠান' : 'Send WhatsApp'}
          >
            <Send className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          {/* Download PDF button */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-[11px] sm:text-xs font-bold flex items-center gap-1 transition-all shadow-xs disabled:opacity-50 cursor-pointer shrink-0"
            title="Download PDF"
          >
            <Download className="w-3.5 h-3.5 shrink-0" />
            <span>{isExporting ? '...' : 'PDF'}</span>
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
