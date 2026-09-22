import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  Copy, Check, Sparkles, Moon, Sun, 
  BookOpen, Clock, HeartHandshake, ShieldCheck, 
  Calendar, MessageCircle, RefreshCw
} from 'lucide-react';
import { ALL_CURRICULUM_BOOKS, PRABHUPADA_8_SEMESTER_CURRICULUM } from '../../data/prabhupadaCurriculum';
import { getRegisteredCounselees, PRIMARY_COUNSELOR } from '../../data/counseleesData';
import type { CounseleeProfile, DailySadhanaReport, StayingLocation } from '../../types/sadhana';
import { calculateDailyReportScore, syncDailyReportToWeeklyMatrix } from '../../utils/sadhanaScoringEngine';
import { toast } from 'react-hot-toast';
import { CounselorSelectorBar } from '../../components/shared/CounselorSelectorBar';
import { YesNoToggle } from '../../components/shared/YesNoToggle';
import { SadhanaHistoryModal } from '../../components/sadhana/SadhanaHistoryModal';
import { saveDailyReportRecord } from '../../utils/sadhanaCloudSync';

const ASHRAM_SERVICES = [
  'Cleaning Deities room & Veranda',
  '1. Offering Arati & Sringer (6:00 AM)',
  '2. Offering Bhoga',
  '3. Cleaning utensils at night + Mangal Arati Kirtan',
  '4. Preparing vegetables at night for morning',
  '5. Cleaning utensils + Prasad hall + Breakfast',
  '6. Making vegetables at night + Wash',
  '7. Lunch service + Gather utensils',
  '8. Veranda cleaning & Ashram maintenance',
  '9. Cooking in the morning (5:30 AM - 8:30 AM)',
  '10. Dinner service + Prasad hall + Utensils',
  '11. Cooking in the night for morning',
  '12. Breakfast service + Prasad hall',
  'Translating Srila Prabhupada / Utkarsha books',
  'Book Distribution & Campus Harinama',
  'Study Care Board & Mentoring Devotees',
  'Custom (অন্যান্য)'
];

const toBnNum = (val: string | number): string => {
  return String(val).replace(/[0-9]/g, (d) => ['০','১','২','৩','৪','৫','৬','৭','৮','৯'][parseInt(d, 10)]);
};

const formatChapterBn = (chStr: string): string => {
  if (!chStr) return '';
  return toBnNum(
    chStr
      .replace(/chapters?/gi, 'অধ্যায়')
      .replace(/verses?/gi, 'শ্লোক')
      .replace(/pages?/gi, 'পৃষ্ঠা')
  );
};

const STAYING_BN_MAP: Record<StayingLocation, string> = {
  VOICE: 'ভয়েস (VOICE)',
  Home: 'বাড়ি (Home)',
  Temple: 'মন্দির (Temple)',
  Outside: 'বাইরে / ভ্রমণ'
};

const SEVA_BN_MAP: Record<string, string> = {
  'Cleaning Deities room & Veranda': 'শ্রীবিগ্রহ কক্ষ ও বারান্দা পরিষ্কার',
  '1. Offering Arati & Sringer (6:00 AM)': '১. আরতি ও শৃঙ্গার নিবেদন (সকাল ৬:০০)',
  '2. Offering Bhoga': '২. রাজভোগ নিবেদন',
  '3. Cleaning utensils at night + Mangal Arati Kirtan': '৩. রাতে বাসনপত্র পরিষ্কার + মঙ্গল আরতি কীর্তন',
  '4. Preparing vegetables at night for morning': '৪. সকালের জন্য রাতে সবজি তৈরি',
  '5. Cleaning utensils + Prasad hall + Breakfast': '৫. বাসন পরিষ্কার + প্রসাদ হল + প্রাতরাশ',
  '6. Making vegetables at night + Wash': '৬. রাতে সবজি কাটা ও ধোয়া',
  '7. Lunch service + Gather utensils': '৭. মধ্যাহ্ন প্রসাদ সেবা + বাসন সংগ্রহ',
  '8. Veranda cleaning & Ashram maintenance': '৮. বারান্দা পরিষ্কার ও আশ্রম রক্ষণাবেক্ষণ',
  '9. Cooking in the morning (5:30 AM - 8:30 AM)': '৯. সকালের রান্না (সকাল ৫:৩০ - ৮:৩০)',
  '10. Dinner service + Prasad hall + Utensils': '১০. নৈশ প্রসাদ সেবা + প্রসাদ হল + বাসন',
  '11. Cooking in the night for morning': '১১. সকালের জন্য রাতে রান্না',
  '12. Breakfast service + Prasad hall': '১২. প্রাতরাশ সেবা + প্রসাদ হল',
  'Translating Srila Prabhupada / Utkarsha books': 'শ্রীল প্রভুপাদের / উৎকর্ষ গ্রন্থ অনুবাদ',
  'Book Distribution & Campus Harinama': 'গ্রন্থ বিতরণ ও ক্যাম্পাস হরিনাম সংকীর্তন',
  'Study Care Board & Mentoring Devotees': 'স্টাডি কেয়ার বোর্ড ও ভক্তদের দিকনির্দেশনা',
  'Custom (অন্যান্য)': 'অন্যান্য সেবা'
};

interface DailySadhanaReportPageProps {
  activeDevotee: CounseleeProfile;
  onDevoteeChange: (devotee: CounseleeProfile) => void;
}

export const DailySadhanaReportPage: React.FC<DailySadhanaReportPageProps> = ({
  activeDevotee,
  onDevoteeChange
}) => {
  const { language } = useLanguage();
  const { styles } = useTheme();
  const [counselees, setCounselees] = useState<CounseleeProfile[]>(getRegisteredCounselees());
  
  // Format today's date e.g. "16/9/26"
  const now = new Date();
  const todayFormatted = `${now.getDate()}/${now.getMonth() + 1}/${String(now.getFullYear()).slice(-2)}`;

  // Form State matching user prompt
  const [reportDate, setReportDate] = useState(todayFormatted);
  const [stayingAt, setStayingAt] = useState<StayingLocation>('VOICE');
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);

  // Body
  const [wentToBed, setWentToBed] = useState('10.40 pm');
  const [gotUp, setGotUp] = useState('3.55 am');
  const [dayRestMinutes, setDayRestMinutes] = useState(0);

  // Soul
  const [japaRounds, setJapaRounds] = useState(16);
  const [japaCompletionTime, setJapaCompletionTime] = useState('7.30 am');
  
  const [scriptureStudyMinutes, setScriptureStudyMinutes] = useState(45);
  const [scriptureBook, setScriptureBook] = useState('sem3_1');
  const [customBookName, setCustomBookName] = useState('');
  const [scriptureChapterPage, setScriptureChapterPage] = useState('Chapter 4');
  const [scriptureNotes, setScriptureNotes] = useState(true);

  const [lectureSpMinutes, setLectureSpMinutes] = useState(15);
  const [lectureGuruMinutes, setLectureGuruMinutes] = useState(15);
  const [lectureOtherMinutes, setLectureOtherMinutes] = useState(0);

  // Seva & Academic Study
  const [selectedSeva, setSelectedSeva] = useState(ASHRAM_SERVICES[0]);
  const [customSeva, setCustomSeva] = useState('');
  const [academicStudyHours, setAcademicStudyHours] = useState(2.5);

  // Morning Program Attended Checklist
  const [mangalarati, setMangalarati] = useState(true);
  const [nrsimharati, setNrsimharati] = useState(true);
  const [tulasiArati, setTulasiArati] = useState(true);
  const [wateringVrinda, setWateringVrinda] = useState(true);
  const [siksastakamAndOffenses, setSiksastakamAndOffenses] = useState(true);

  // Additional
  const [slokaMemorized, setSlokaMemorized] = useState(true);
  const [bhajanGayatriCompleted, setBhajanGayatriCompleted] = useState(true);
  const [socialMediaMinutes, setSocialMediaMinutes] = useState(30);

  // UI state
  const [copied, setCopied] = useState(false);
  const [isInitialLoadDone, setIsInitialLoadDone] = useState(false);

  // Sync devotee list if updated elsewhere
  useEffect(() => {
    setCounselees(getRegisteredCounselees());
  }, []);

  const effectiveRenderedSeva = selectedSeva === 'Custom (অন্যান্য)' 
    ? (customSeva.trim() || 'General Ashram Seva') 
    : selectedSeva;

  const effectiveRenderedSevaBn = selectedSeva === 'Custom (অন্যান্য)'
    ? (customSeva.trim() || 'অন্যান্য সেবা')
    : (SEVA_BN_MAP[selectedSeva] || selectedSeva);

  const selectedBookObj = useMemo(() => {
    return ALL_CURRICULUM_BOOKS.find(b => b.id === scriptureBook);
  }, [scriptureBook]);

  const effectiveBookTitle = scriptureBook === 'custom'
    ? (customBookName.trim() || 'Vaishnava Literature')
    : (language === 'bn' ? selectedBookObj?.titleBn || selectedBookObj?.titleEn : selectedBookObj?.titleEn) || 'Bhagavad-gita As It Is';

  const totalHearingMinutes = lectureSpMinutes + lectureGuruMinutes + lectureOtherMinutes;

  // Compute live score
  const reportObj: DailySadhanaReport = {
    id: `report_${activeDevotee.id}_${reportDate.replace(/\//g, '-')}`,
    date: reportDate,
    devoteeName: activeDevotee.name,
    counselorName: activeDevotee.counselorName || PRIMARY_COUNSELOR.name,
    stayingAt,
    wentToBed,
    gotUp,
    dayRestMinutes,
    japaRounds,
    japaCompletionTime,
    scriptureStudyMinutes,
    scriptureBook: effectiveBookTitle,
    scriptureChapterPage,
    scriptureNotes,
    lectureHearingMinutes: totalHearingMinutes,
    lectureSpMinutes,
    lectureGuruMinutes,
    lectureOtherMinutes,
    renderedSeva: effectiveRenderedSeva,
    academicStudyHours,
    mangalarati,
    nrsimharati,
    tulasiArati,
    wateringVrinda,
    siksastakamAndOffenses,
    slokaMemorizingCount: slokaMemorized ? 1 : 0,
    bhajanGayatriCompleted,
    socialMediaMinutes
  };

  const scoreBreakdown = useMemo(() => {
    return calculateDailyReportScore(reportObj, activeDevotee.scaleId || 2);
  }, [reportObj, activeDevotee.scaleId]);

  const morningAttendedCount = useMemo(() => {
    return [
      mangalarati,
      nrsimharati,
      tulasiArati,
      wateringVrinda,
      siksastakamAndOffenses
    ].filter(Boolean).length;
  }, [mangalarati, nrsimharati, tulasiArati, wateringVrinda, siksastakamAndOffenses]);

  // Load existing saved report on mount or when devotee/date changes
  useEffect(() => {
    setIsInitialLoadDone(false);
    const storageKey = `sadhana_report_${activeDevotee.id}_${reportDate.replace(/\//g, '-')}`;
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        if (data.stayingAt) setStayingAt(data.stayingAt);
        if (data.wentToBed) setWentToBed(data.wentToBed);
        if (data.gotUp) setGotUp(data.gotUp);
        if (typeof data.dayRestMinutes === 'number') setDayRestMinutes(data.dayRestMinutes);
        if (typeof data.japaRounds === 'number') setJapaRounds(data.japaRounds);
        if (data.japaCompletionTime) setJapaCompletionTime(data.japaCompletionTime);
        if (typeof data.scriptureStudyMinutes === 'number') setScriptureStudyMinutes(data.scriptureStudyMinutes);
        if (data.scriptureBook) {
          const matched = ALL_CURRICULUM_BOOKS.find(
            b => b.titleEn === data.scriptureBook || b.titleBn === data.scriptureBook || b.id === data.scriptureBook
          );
          if (matched) {
            setScriptureBook(matched.id);
          } else {
            setScriptureBook('custom');
            setCustomBookName(data.scriptureBook);
          }
        }
        if (data.scriptureChapterPage) setScriptureChapterPage(data.scriptureChapterPage);
        if (typeof data.scriptureNotes === 'boolean') setScriptureNotes(data.scriptureNotes);
        if (typeof data.lectureSpMinutes === 'number') setLectureSpMinutes(data.lectureSpMinutes);
        if (typeof data.lectureGuruMinutes === 'number') setLectureGuruMinutes(data.lectureGuruMinutes);
        if (typeof data.lectureOtherMinutes === 'number') setLectureOtherMinutes(data.lectureOtherMinutes);
        if (data.renderedSeva) {
          if (ASHRAM_SERVICES.includes(data.renderedSeva)) {
            setSelectedSeva(data.renderedSeva);
          } else {
            setSelectedSeva('Custom (অন্যান্য)');
            setCustomSeva(data.renderedSeva);
          }
        }
        if (typeof data.academicStudyHours === 'number') setAcademicStudyHours(data.academicStudyHours);
        if (typeof data.mangalarati === 'boolean') setMangalarati(data.mangalarati);
        if (typeof data.nrsimharati === 'boolean') setNrsimharati(data.nrsimharati);
        if (typeof data.tulasiArati === 'boolean') setTulasiArati(data.tulasiArati);
        if (typeof data.wateringVrinda === 'boolean') setWateringVrinda(data.wateringVrinda);
        if (typeof data.siksastakamAndOffenses === 'boolean') setSiksastakamAndOffenses(data.siksastakamAndOffenses);
        if (typeof data.slokaMemorizingCount === 'number') setSlokaMemorized(data.slokaMemorizingCount > 0);
        if (typeof data.bhajanGayatriCompleted === 'boolean') setBhajanGayatriCompleted(data.bhajanGayatriCompleted);
        if (typeof data.socialMediaMinutes === 'number') setSocialMediaMinutes(data.socialMediaMinutes);
      } catch (e) {
        console.error('Failed to parse saved report', e);
      }
    }
    const timer = setTimeout(() => {
      setIsInitialLoadDone(true);
    }, 120);
    return () => clearTimeout(timer);
  }, [activeDevotee.id, reportDate]);

  // Silent background auto-save & auto-sync to 7-Day Weekly Matrix
  useEffect(() => {
    if (!isInitialLoadDone) return;

    const timer = setTimeout(() => {
      try {
        const storageKey = `sadhana_report_${activeDevotee.id}_${reportDate.replace(/\//g, '-')}`;
        localStorage.setItem(storageKey, JSON.stringify(reportObj));
        const liveScore = calculateDailyReportScore(reportObj, activeDevotee.scaleId || 2);
        syncDailyReportToWeeklyMatrix(activeDevotee.id, reportObj, liveScore);
        saveDailyReportRecord(reportObj, activeDevotee.id, activeDevotee.scaleId || 2);
      } catch (e) {
        console.error('Silent background sync error', e);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [
    isInitialLoadDone,
    reportDate,
    stayingAt,
    wentToBed,
    gotUp,
    dayRestMinutes,
    japaRounds,
    japaCompletionTime,
    scriptureStudyMinutes,
    scriptureBook,
    customBookName,
    scriptureChapterPage,
    scriptureNotes,
    lectureSpMinutes,
    lectureGuruMinutes,
    lectureOtherMinutes,
    selectedSeva,
    customSeva,
    academicStudyHours,
    mangalarati,
    nrsimharati,
    tulasiArati,
    wateringVrinda,
    siksastakamAndOffenses,
    slokaMemorized,
    bhajanGayatriCompleted,
    socialMediaMinutes,
    activeDevotee.id,
    activeDevotee.scaleId
  ]);

  // Generate WhatsApp Message formatted cleanly in active language
  const generateWhatsAppMessage = () => {
    if (language === 'bn') {
      const bookNameBn = scriptureBook === 'custom'
        ? (customBookName.trim() || 'বৈষ্ণব সাহিত্য')
        : (selectedBookObj?.titleBn || effectiveBookTitle);

      const chapterBn = scriptureChapterPage ? ` (${formatChapterBn(scriptureChapterPage)})` : '';
      const formattedBookBn = `${bookNameBn}${chapterBn}`;

      const stayingBn = STAYING_BN_MAP[stayingAt] || stayingAt;

      return `*দৈনিক সাধনা রিপোর্ট — ${toBnNum(reportDate)}*
*${activeDevotee.name}*
অবস্থান: *${stayingBn}*

*দেহ*
(১) শয়ন সময়: ${toBnNum(wentToBed)}
(২) শয্যা ত্যাগ: ${toBnNum(gotUp)}
(৩) দিবানিদ্রা: ${toBnNum(dayRestMinutes)} মিনিট

*আত্মা*
(১) জপ: ${toBnNum(japaRounds)} মালা (জপ সমাপ্তির সময়: ${toBnNum(japaCompletionTime)})
(২) শাস্ত্রীয় অধ্যয়ন: ${toBnNum(scriptureStudyMinutes)} মিনিট
    (ক) অধ্যয়নকৃত গ্রন্থ: ${formattedBookBn}
    (খ) নোট: ${scriptureNotes ? 'হ্যাঁ' : 'না'}
(৩) প্রবচন শ্রবণ: ${toBnNum(totalHearingMinutes)} মিনিট
    (ক) শ্রীল প্রভুপাদ: ${toBnNum(lectureSpMinutes)} মিনিট
    (খ) গুরুমহারাজ: ${toBnNum(lectureGuruMinutes)} মিনিট
    (গ) অন্যান্য: ${toBnNum(lectureOtherMinutes)} মিনিট

*সেবা ও একাডেমিক / ক্যারিয়ার পড়াশোনা:*
(১) সম্পাদিত সেবা: ${effectiveRenderedSevaBn}
(২) একাডেমিক / ক্যারিয়ার (চাকরির) পড়াশোনা: ${toBnNum(academicStudyHours)} ঘন্টা

*মর্নিং প্রোগ্রাম উপস্থিতি:*
(১) মঙ্গল আরতি: ${mangalarati ? 'হ্যাঁ' : 'না'}
(২) নৃসিংহ আরতি: ${nrsimharati ? 'হ্যাঁ' : 'না'}
(৩) তুলসী আরতি ও পরিক্রমা: ${tulasiArati ? 'হ্যাঁ' : 'না'}
(৪) বৃন্দাদেবীকে জলদান: ${wateringVrinda ? 'হ্যাঁ' : 'না'}
(৫) শিক্ষাষ্টক ও দশবিধ নামাপরাধ পাঠ: ${siksastakamAndOffenses ? 'হ্যাঁ' : 'না'}

*অন্যান্য:*
(১) শ্লোক মুখস্থকরণ: ${slokaMemorized ? 'হ্যাঁ' : 'না'}
(২) ভজন / গায়ত্রী: ${bhajanGayatriCompleted ? 'হ্যাঁ' : 'না'}
(৩) সোশ্যাল মিডিয়া / স্ক্রিন সময়: ${toBnNum(socialMediaMinutes)} মিনিট`;
    }

    // English Report Format
    const bookNameEn = scriptureBook === 'custom'
      ? effectiveBookTitle
      : (selectedBookObj?.titleEn || effectiveBookTitle);

    const chapterEn = scriptureChapterPage ? ` (${scriptureChapterPage})` : '';
    const formattedBookEn = `${bookNameEn}${chapterEn}`;

    return `*Daily Sadhana Report — ${reportDate}*
*${activeDevotee.name}*
Staying at: *${stayingAt === 'VOICE' ? 'VOICE Ashram' : stayingAt}*

*Body*
(1) Bed time: ${wentToBed}
(2) Wake-up time: ${gotUp}
(3) Day rest: ${dayRestMinutes} min

*Soul*
(1) Japa: ${japaRounds} rounds (Completion time: ${japaCompletionTime})
(2) Scripture study: ${scriptureStudyMinutes} min
    (a) Book studied: ${formattedBookEn}
    (b) Notes: ${scriptureNotes ? 'Yes' : 'No'}
(3) Lecture hearing: ${totalHearingMinutes} min
    (a) Srila Prabhupada: ${lectureSpMinutes} min
    (b) Gurumaharaj: ${lectureGuruMinutes} min
    (c) Others: ${lectureOtherMinutes} min

*Seva & Academic / Career Study:*
(1) Seva performed: ${effectiveRenderedSeva}
(2) Academic / Career study: ${academicStudyHours} hrs

*Morning Program Attendance:*
(1) Mangalarati: ${mangalarati ? 'Yes' : 'No'}
(2) Nrsimharati: ${nrsimharati ? 'Yes' : 'No'}
(3) Tulasi arati & parikrama: ${tulasiArati ? 'Yes' : 'No'}
(4) Watering Vrinda devi: ${wateringVrinda ? 'Yes' : 'No'}
(5) Siksastakam & 10 offenses: ${siksastakamAndOffenses ? 'Yes' : 'No'}

*Additional:*
(1) Sloka memorizing: ${slokaMemorized ? 'Yes' : 'No'}
(2) Bhajan / Gayatri: ${bhajanGayatriCompleted ? 'Yes' : 'No'}
(3) Social media / Screen time: ${socialMediaMinutes} min`;
  };

  const handleCopyWhatsApp = () => {
    const text = generateWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(language === 'bn' ? 'হোয়াটসঅ্যাপ মেসেজ কপি করা হয়েছে!' : 'WhatsApp report copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleShareWhatsApp = () => {
    const text = generateWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  const handleSaveReport = async () => {
    try {
      const storageKey = `sadhana_report_${activeDevotee.id}_${reportDate.replace(/\//g, '-')}`;
      localStorage.setItem(storageKey, JSON.stringify(reportObj));
      await saveDailyReportRecord(reportObj, activeDevotee.id, activeDevotee.scaleId || 2);
      const syncResult = syncDailyReportToWeeklyMatrix(activeDevotee.id, reportObj, scoreBreakdown);
      const dayName = syncResult ? syncResult.dayKey.toUpperCase() : '';
      toast.success(
        language === 'bn'
          ? `সাধনা রিপোর্ট ও সাপ্তাহিক সাধনা কার্ড (${dayName}) সফলভাবে সংরক্ষিত ও সিঙ্কড!`
          : `Daily report & weekly Sadhana Card (${dayName}) saved & synced successfully!`
      );
    } catch (e) {
      toast.error('Error saving report');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-6 py-4 sm:py-8">

      {/* Counselor Selector — first line of report */}
      <CounselorSelectorBar counselees={counselees} activeDevotee={activeDevotee} onDevoteeChange={onDevoteeChange} language={language} />

      {/* Desktop two-panel layout / Mobile single column */}
      <div className="mt-4 sm:mt-6 lg:grid lg:grid-cols-[1fr_340px] xl:grid-cols-[1fr_380px] lg:gap-8 lg:items-start space-y-4 sm:space-y-6 lg:space-y-0">

        {/* ═══════════════════════════════════════════════════════
            LEFT PANEL — Full Form
        ═══════════════════════════════════════════════════════ */}
        <div className="space-y-4 sm:space-y-6 min-w-0">

      {/* Compact Top Banner: Title + Scale + History */}
      <div className={`bg-gradient-to-r ${styles.bannerGradient} rounded-2xl px-4 py-3 sm:px-5 sm:py-3.5 text-white shadow-md shadow-emerald-600/10`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="text-amber-300/70 text-lg sm:text-xl font-serif leading-none shrink-0 select-none">ॐ</span>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-base font-black tracking-tight leading-tight truncate">
                {language === 'bn' ? 'দৈনিক সাধনা রিপোর্ট' : 'Daily Sadhana Report'}
              </h2>
              <p className="text-[10px] text-amber-200/70 font-medium leading-tight mt-0.5 truncate">
                {language === 'bn'
                  ? `${activeDevotee.name} — স্কেল ${activeDevotee.scaleId}`
                  : `${activeDevotee.name} — Scale ${activeDevotee.scaleId}`}
              </p>
              <p className="text-[9px] sm:text-[10px] text-white/40 font-normal leading-tight mt-0.5 truncate">
                {language === 'bn' ? 'আধ্যাত্মিক অগ্রগতির দৈনিক প্রতিবেদন' : 'Daily spiritual progress report'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-1.5 rounded-full text-[11px] sm:text-xs font-bold bg-white/15 hover:bg-white/25 text-white border border-white/25 hover:border-white/50 backdrop-blur-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-xs shrink-0"
          >
            <Calendar className="w-3.5 h-3.5 text-amber-200" />
            <span>{language === 'bn' ? 'ইতিহাস' : 'History'}</span>
          </button>
        </div>
      </div>

      {/* Main Form Container */}
      <div 
        id="daily-sadhana-print-card"
        className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200/90 dark:border-slate-800 space-y-8"
      >
        
        {/* SECTION 0: Report Date & Staying Location (Single Row) */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 bg-slate-50 dark:bg-slate-800/60 p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80">

          {/* Report Date */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 truncate">
                <Calendar className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${styles.primaryTextColor} shrink-0`} />
                <span className="truncate">{language === 'bn' ? 'প্রতিবেদনের তারিখ' : 'Report Date'}</span>
              </label>
              <button
                type="button"
                onClick={() => setIsHistoryModalOpen(true)}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-0.5 cursor-pointer shrink-0 ml-1"
              >
                <span>{language === 'bn' ? 'ক্যালেন্ডার' : 'Calendar'}</span>
              </button>
            </div>
            <input
              type="text"
              value={reportDate}
              onChange={(e) => setReportDate(e.target.value)}
              placeholder="17/9/26"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 transition-all"
            />
          </div>

          {/* Staying Location */}
          <div>
            <label className="text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 block mb-1 flex items-center gap-1.5 truncate">
              <ShieldCheck className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${styles.primaryTextColor} shrink-0`} />
              <span className="truncate">{language === 'bn' ? 'বর্তমান অবস্থান (Staying at)' : 'Staying At'}</span>
            </label>
            <select
              value={stayingAt}
              onChange={(e) => setStayingAt(e.target.value as StayingLocation)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500 transition-all cursor-pointer"
            >
              <option value="VOICE">{language === 'bn' ? 'VOICE (ভয়েস)' : 'VOICE'}</option>
              <option value="Home">{language === 'bn' ? 'Home (বাড়ি)' : 'Home'}</option>
              <option value="Temple">{language === 'bn' ? 'Temple (মন্দির)' : 'Temple'}</option>
              <option value="Outside">{language === 'bn' ? 'Outside (বাইরে / ভ্রমণ)' : 'Outside'}</option>
            </select>
          </div>

        </div>

        {/* SECTION 1: BODY (দেহ) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Moon className={`w-5 h-5 ${styles.primaryTextColor}`} />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {language === 'bn' ? '১. দেহ সম্পর্কিত নিয়মাবলী (Body Regulation)' : '1. Body Regulation'}
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles.badgeClass}`}>
              {language === 'bn'
                ? `মোট: ${toBnNum(scoreBreakdown.bodyTotal)}/৭৫ (${toBnNum(scoreBreakdown.bodyAvgPct)}%)`
                : `Total: ${scoreBreakdown.bodyTotal}/75 (${scoreBreakdown.bodyAvgPct}%)`}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* (1) Went to bed */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  (1) {language === 'bn' ? 'শয়ন সময় (Went to bed)' : 'Went to bed'}
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
                  +{scoreBreakdown.wentToBedMarks} pts
                </span>
              </div>
              <input
                type="text"
                value={wentToBed}
                onChange={(e) => setWentToBed(e.target.value)}
                placeholder="10.40 pm"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['9.30 pm', '9.45 pm', '10.00 pm', '10.30 pm', '10.40 pm', '11.00 pm'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setWentToBed(t)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      wentToBed === t
                        ? `${styles.btnPrimary} text-white border-transparent shadow-xs`
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* (2) Got up */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  (2) {language === 'bn' ? 'শয্যা ত্যাগ (Got up)' : 'Got up'}
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
                  +{scoreBreakdown.wakeUpMarks} pts
                </span>
              </div>
              <input
                type="text"
                value={gotUp}
                onChange={(e) => setGotUp(e.target.value)}
                placeholder="3.55 am"
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
              />
              <div className="flex flex-wrap gap-1.5 pt-1">
                {['3.30 am', '3.45 am', '3.55 am', '4.00 am', '4.15 am', '4.30 am'].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setGotUp(t)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      gotUp === t
                        ? `${styles.btnPrimary} text-white border-transparent shadow-xs`
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* (3) Day rest */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  (3) {language === 'bn' ? 'দিবানিন্দ্রা (Day rest)' : 'Day rest (minutes)'}
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
                  +{scoreBreakdown.daySleepMarks} pts
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={0}
                  max={240}
                  value={dayRestMinutes}
                  onChange={(e) => setDayRestMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                />
                <span className="text-xs font-bold text-slate-500">min</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[0, 15, 30, 45, 60].map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setDayRestMinutes(m)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      dayRestMinutes === m
                        ? `${styles.btnPrimary} text-white border-transparent shadow-xs`
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {m}m
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 2: SOUL (আত্মা) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Sun className={`w-5 h-5 ${styles.primaryTextColor}`} />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {language === 'bn' ? '২. পারমার্থিক অনুশীলন (Soul Culture)' : '2. Soul Culture'}
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles.badgeClass}`}>
              {language === 'bn'
                ? `মোট: ${toBnNum(scoreBreakdown.soulTotal)}/৭৫ (${toBnNum(scoreBreakdown.soulAvgPct)}%)`
                : `Total: ${scoreBreakdown.soulTotal}/75 (${scoreBreakdown.soulAvgPct}%)`}
            </span>
          </div>

          <div className="space-y-4">
            
            {/* (1) Japa & Completion Time */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  (1) {language === 'bn' ? 'হরেকৃষ্ণ মহামন্ত্র জপ (Japa rounds)' : 'Japa (rounds)'}
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    min={0}
                    max={64}
                    value={japaRounds}
                    onChange={(e) => setJapaRounds(parseInt(e.target.value, 10) || 0)}
                    className="w-28 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                  />
                  <span className={`text-xs font-bold ${styles.primaryTextColor}`}>
                    {japaRounds >= 16 ? (language === 'bn' ? '✨ ১৬ মালা পূর্ণ' : '✨ 16 Rounds Quota Full') : (language === 'bn' ? `⚠️ আরও ${16 - japaRounds} মালা বাকি` : `⚠️ Need ${16 - japaRounds} more`)}
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                  {language === 'bn' ? 'জপ সমাপ্তির সময় (Japa completion time)' : 'Japa completion time'}
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="text"
                    value={japaCompletionTime}
                    onChange={(e) => setJapaCompletionTime(e.target.value)}
                    placeholder="7.30 am"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                  />
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
                    +{scoreBreakdown.japaMarks} pts
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  {['7.00 am', '7.30 am', '8.00 am', '8.30 am', '9.00 am', '1.00 pm'].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setJapaCompletionTime(t)}
                      className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                        japaCompletionTime === t
                          ? `${styles.btnPrimary} text-white border-transparent shadow-xs`
                          : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* (2) Scripture Study (Page 6 8-Semester Curriculum) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <div className="flex items-center space-x-2">
                  <BookOpen className={`w-4 h-4 ${styles.primaryTextColor}`} />
                  <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                    (2) {language === 'bn' ? 'শাস্ত্রীয় গ্রন্থ অধ্যয়ন (শ্রীল প্রভুপাদের ৮-সেমিস্টার পাঠ্যক্রম)' : 'Scripture Study (Srila Prabhupada 8-Semester Curriculum)'}
                  </span>
                </div>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
                  +{scoreBreakdown.bookStudyMarks} pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                
                {/* Study Minutes */}
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {language === 'bn' ? 'অধ্যয়ন সময় (মিনিট)' : 'Study Time (minutes)'}
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min={0}
                      value={scriptureStudyMinutes}
                      onChange={(e) => setScriptureStudyMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                    />
                    <span className="text-xs font-bold text-slate-500">min</span>
                  </div>
                </div>

                {/* Book Curriculum Dropdown (Categorized by 8 Semesters) */}
                <div className="sm:col-span-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {language === 'bn' ? 'অধ্যয়নকৃত গ্রন্থ নির্বাচন (প্রভুপাদের ৮-সেমিস্টার পাঠ্যসূচি)' : 'Select Book (Srila Prabhupada 8-Semester Curriculum)'}
                  </label>
                  <select
                    value={scriptureBook}
                    onChange={(e) => setScriptureBook(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-amber-500"
                  >
                    {PRABHUPADA_8_SEMESTER_CURRICULUM.map((sem) => (
                      <optgroup 
                        key={sem.semesterNumber} 
                        label={`--- ${language === 'bn' ? sem.semesterTitleBn : sem.semesterTitleEn} ---`}
                      >
                        {sem.books.map((b) => (
                          <option key={b.id} value={b.id}>
                            {language === 'bn' ? b.titleBn : b.titleEn}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="custom">{language === 'bn' ? 'অন্যান্য গ্রন্থ (Custom)' : 'Custom Book'}</option>
                  </select>
                </div>

              </div>

              {/* Custom Book Name input if selected */}
              {scriptureBook === 'custom' && (
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {language === 'bn' ? 'গ্রন্থের নাম লিখুন:' : 'Enter Custom Book Title:'}
                  </label>
                  <input
                    type="text"
                    value={customBookName}
                    onChange={(e) => setCustomBookName(e.target.value)}
                    placeholder="e.g. Teachings of Lord Caitanya"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
              )}

              {/* Chapter & Notes Toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                <div>
                  <label className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 block mb-1">
                    {language === 'bn' ? 'অধ্যায় বা পৃষ্ঠা বিবরণ' : 'Chapter / Page Range'}
                  </label>
                  <input
                    type="text"
                    value={scriptureChapterPage}
                    onChange={(e) => setScriptureChapterPage(e.target.value)}
                    placeholder="Chapter 4, Verses 1-10"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>

                <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
                  <div>
                    <span className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 block">
                      {language === 'bn' ? 'নোট লিখেছেন কি না?' : 'Notes Taken?'}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {scriptureNotes 
                        ? (language === 'bn' ? 'নোট সংরক্ষণ করা হয়েছে' : 'Realization notes recorded')
                        : (language === 'bn' ? 'নোট সংরক্ষণ করা হয়নি' : 'No notes recorded')}
                    </span>
                  </div>
                  <YesNoToggle value={scriptureNotes} onChange={setScriptureNotes} />
                </div>
              </div>
            </div>

            {/* (3) Lecture Hearing (প্রবচন শ্রবণ) */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-700/80 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100">
                  (3) {language === 'bn' ? 'প্রবচন শ্রবণ (Lecture hearing)' : 'Lecture hearing'} ({totalHearingMinutes} min total)
                </span>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${styles.badgeClass}`}>
                  +{scoreBreakdown.hearingMarks} pts
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Srila Prabhupada (শ্রীল প্রভুপাদ)
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min={0}
                      value={lectureSpMinutes}
                      onChange={(e) => setLectureSpMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-bold"
                    />
                    <span className="text-xs font-bold text-slate-400">min</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Gurumaharaj (গুরুমহারাজ)
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min={0}
                      value={lectureGuruMinutes}
                      onChange={(e) => setLectureGuruMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-bold"
                    />
                    <span className="text-xs font-bold text-slate-400">min</span>
                  </div>
                </div>

                <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
                  <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                    Others (অন্যান্য সিনিয়র ভক্ত)
                  </label>
                  <div className="flex items-center space-x-1.5">
                    <input
                      type="number"
                      min={0}
                      value={lectureOtherMinutes}
                      onChange={(e) => setLectureOtherMinutes(parseInt(e.target.value, 10) || 0)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 text-sm font-bold"
                    />
                    <span className="text-xs font-bold text-slate-400">min</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 3: SEVA & ACADEMIC STUDY (সেবা ও শিক্ষা) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <HeartHandshake className={`w-5 h-5 ${styles.primaryTextColor}`} />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {language === 'bn' ? '৩. সেবা ও একাডেমিক / ক্যারিয়ার পড়াশোনা (Seva & Academic / Career study)' : '3. Seva & Academic / Career Study'}
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {language === 'bn' ? 'সময় ও ফলাফলভিত্তিক সেবা (১৭৫ নীতি)' : 'Duration & Outcome (175 Matrix)'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* (1) Rendered Seva */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                (1) {language === 'bn' ? 'সম্পাদিত সেবা (Rendered Seva)' : 'Rendered Seva (dropdown / text)'}
              </label>
              <select
                value={selectedSeva}
                onChange={(e) => setSelectedSeva(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100"
              >
                {ASHRAM_SERVICES.map((s, idx) => (
                  <option key={idx} value={s}>
                    {language === 'bn' ? (SEVA_BN_MAP[s] || s) : s}
                  </option>
                ))}
              </select>

              {selectedSeva === 'Custom (অন্যান্য)' && (
                <input
                  type="text"
                  value={customSeva}
                  onChange={(e) => setCustomSeva(e.target.value)}
                  placeholder={language === 'bn' ? 'সেবার বিবরণ লিখুন...' : 'Enter service details...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100 mt-2"
                />
              )}
            </div>

            {/* (2) Academic & Career study */}
            <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  (2) {language === 'bn' ? 'একাডেমিক / ক্যারিয়ার (চাকরির) পড়াশোনা (Academic / Career study)' : 'Academic / Career study (hours)'}
                </label>
                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full shrink-0 ${styles.badgeClass}`}>
                  {academicStudyHours > 0
                    ? (language === 'bn' ? `${toBnNum(academicStudyHours)} ঘণ্টা সম্পন্ন` : `${academicStudyHours}h logged`)
                    : (language === 'bn' ? 'সময় লিখুন' : 'Record hours')}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  step="0.5"
                  min={0}
                  max={24}
                  value={academicStudyHours}
                  onChange={(e) => setAcademicStudyHours(parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
                <span className="text-xs font-bold text-slate-500">hours</span>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[1.0, 1.5, 2.0, 2.5, 3.0, 4.0].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setAcademicStudyHours(h)}
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                      academicStudyHours === h
                        ? `${styles.btnPrimary} text-white border-transparent shadow-xs`
                        : 'bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {h}h
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* SECTION 4: MORNING PROGRAM CHECKLIST (প্রাতঃকালীন কার্যক্রম) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
            <div className="flex items-center space-x-2">
              <Clock className={`w-5 h-5 ${styles.primaryTextColor}`} />
              <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                {language === 'bn' ? '৪. প্রাতঃকালীন কার্যক্রমে উপস্থিতি (Morning program attended)' : '4. Morning Program Attended'}
              </h3>
            </div>
            <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${styles.badgeClass}`}>
              +{scoreBreakdown.morningProgramMarks}/25 pts
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            
            {/* Mangalarati */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? '১. মঙ্গল আরতি (Mangalarati)' : '1. Mangalarati'}
              </span>
              <YesNoToggle value={mangalarati} onChange={setMangalarati} />
            </div>

            {/* Nrsimharati */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? '২. নৃসিংহ আরতি (Nrsimharati)' : '2. Nrsimharati'}
              </span>
              <YesNoToggle value={nrsimharati} onChange={setNrsimharati} />
            </div>

            {/* Tulasi arati & parikrama */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? '৩. তুলসী আরতি ও পরিক্রমা (Tulasi arati & parikrama)' : '3. Tulasi arati & parikrama'}
              </span>
              <YesNoToggle value={tulasiArati} onChange={setTulasiArati} />
            </div>

            {/* Watering Vrinda devi */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? '৪. বৃন্দাদেবীকে জলদান (Watering Vrinda devi)' : '4. Watering Vrinda devi'}
              </span>
              <YesNoToggle value={wateringVrinda} onChange={setWateringVrinda} />
            </div>

            {/* Siksastakam & 10 offenses */}
            <div className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3 sm:col-span-2">
              <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                {language === 'bn' ? '৫. শিক্ষাষ্টক ও দশবিধ নামাপরাধ পাঠ (Siksastakam & 10 offenses)' : '5. Siksastakam & 10 offenses recitation'}
              </span>
              <YesNoToggle value={siksastakamAndOffenses} onChange={setSiksastakamAndOffenses} />
            </div>

          </div>
        </div>

        {/* SECTION 5: ADDITIONAL (অন্যান্য) */}
        <div className="space-y-4">
          <div className={`flex items-center space-x-2 border-b ${styles.accentBorderColor} pb-2`}>
            <Sparkles className={`w-5 h-5 ${styles.primaryTextColor}`} />
            <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100">
              {language === 'bn' ? '৫. অন্যান্য (Additional)' : '5. Additional'}
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            
            {/* (1) Sloka memorizing */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                  (1) {language === 'bn' ? 'শ্লোক মুখস্থকরণ' : 'Sloka memorizing'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {slokaMemorized ? (language === 'bn' ? 'মুখস্থ সম্পন্ন' : 'Memorized') : (language === 'bn' ? 'চলমান' : 'In progress')}
                </span>
              </div>
              <YesNoToggle value={slokaMemorized} onChange={setSlokaMemorized} />
            </div>

            {/* (2) Bhajan / Gayatri */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800/60 shadow-xs flex items-center justify-between gap-3">
              <div>
                <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 block">
                  (2) {language === 'bn' ? 'ভজন ও গায়ত্রী সম্পন্ন' : 'Bhajan / Gayatri'}
                </span>
                <span className="text-[11px] text-slate-500">
                  {bhajanGayatriCompleted ? (language === 'bn' ? 'সম্পন্ন' : 'Completed') : (language === 'bn' ? 'অসম্পূর্ণ' : 'Pending')}
                </span>
              </div>
              <YesNoToggle value={bhajanGayatriCompleted} onChange={setBhajanGayatriCompleted} />
            </div>

            {/* (3) Social media / Screen time */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/40 space-y-1.5 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <label className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200">
                  (3) {language === 'bn' ? 'সোশ্যাল মিডিয়া / স্ক্রিন সময়' : 'Social media / screen time'}
                </label>
                <span className="text-[11px] text-slate-500">
                  {socialMediaMinutes <= 30 ? '✅ Controlled' : '⚠️ Keep ≤30m'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min={0}
                  value={socialMediaMinutes}
                  onChange={(e) => setSocialMediaMinutes(parseInt(e.target.value, 10) || 0)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-semibold text-slate-800 dark:text-slate-100"
                />
                <span className="text-xs text-slate-500 font-semibold">min</span>
              </div>
            </div>

          </div>
        </div>



      </div>{/* END Main Form Card */}

        </div>{/* END LEFT PANEL */}

        {/* ═══════════════════════════════════════════════════════
            RIGHT PANEL — Sticky Sidebar (desktop only)
        ═══════════════════════════════════════════════════════ */}
        <div className="hidden lg:block">
          <div className="sticky top-6 space-y-4">

            {/* Score Summary Card */}
            <div className={`rounded-2xl border ${styles.accentBorderColor} ${styles.subtleBgColor} p-5 shadow-sm`}>
              <div className="flex items-center justify-between mb-4">
                <h3 className={`font-extrabold text-base ${styles.primaryTextColor} flex items-center gap-2`}>
                  <span>🪷</span>
                  {language === 'bn' ? 'দৈনিক স্কোর' : 'Daily Score'}
                </h3>
                <span className={`text-2xl font-black ${styles.primaryTextColor}`}>
                  {scoreBreakdown.percentage}%
                </span>
              </div>

              {/* Score bars */}
              {[
                { label: language === 'bn' ? 'দেহ' : 'Body', value: scoreBreakdown.bodyTotal, max: 75, pct: scoreBreakdown.bodyAvgPct },
                { label: language === 'bn' ? 'আত্মা' : 'Soul', value: scoreBreakdown.soulTotal, max: 75, pct: scoreBreakdown.soulAvgPct },
                { label: language === 'bn' ? 'মর্নিং' : 'Morning', value: scoreBreakdown.morningProgramMarks, max: 25, pct: Math.round(scoreBreakdown.morningProgramMarks / 25 * 100) },
              ].map(({ label, value, max, pct }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    <span>{label}</span>
                    <span>{value}/{max} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${styles.bannerGradient} transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              ))}

              <div className={`mt-3 pt-3 border-t ${styles.accentBorderColor} flex justify-between items-center`}>
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                  {language === 'bn' ? 'মোট নম্বর' : 'Total Marks'}
                </span>
                <span className={`text-sm font-black ${styles.primaryTextColor}`}>
                  {scoreBreakdown.totalMarks}/175
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm space-y-2.5">
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 mb-3">
                {language === 'bn' ? 'রিপোর্ট পাঠান' : 'Export Report'}
              </h3>

              <button
                onClick={handleShareWhatsApp}
                className="w-full px-4 py-2.5 rounded-xl bg-[#25D366] hover:bg-[#1ebe59] text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                {language === 'bn' ? 'হোয়াটসঅ্যাপে পাঠান' : 'Send via WhatsApp'}
              </button>

              <button
                onClick={handleCopyWhatsApp}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {copied ? <Check className="w-4 h-4 text-green-600 shrink-0" /> : <Copy className="w-4 h-4 shrink-0" />}
                {copied
                  ? (language === 'bn' ? 'কপি হয়েছে!' : 'Copied!')
                  : (language === 'bn' ? 'রিপোর্ট কপি' : 'Copy Report Text')
                }
              </button>

              <button
                onClick={handleSaveReport}
                className={`w-full px-4 py-2.5 rounded-xl ${styles.btnPrimary} text-white text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer`}
              >
                <RefreshCw className="w-4 h-4 shrink-0" />
                {language === 'bn' ? 'সংরক্ষণ ও সিঙ্ক' : 'Save & Sync'}
              </button>
            </div>

            {/* WhatsApp Message Preview */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 shadow-sm">
              <h3 className="font-extrabold text-sm text-slate-700 dark:text-slate-300 mb-2 flex items-center gap-2">
                <MessageCircle className="w-4 h-4 text-[#25D366]" />
                {language === 'bn' ? 'হোয়াটসঅ্যাপ প্রিভিউ' : 'WhatsApp Preview'}
              </h3>
              <textarea
                readOnly
                value={generateWhatsAppMessage()}
                rows={14}
                className="w-full text-[11px] font-mono leading-relaxed text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-3 resize-none focus:outline-none"
              />
            </div>

          </div>
        </div>{/* END RIGHT PANEL */}

      </div>{/* END two-panel grid */}

      {/* Floating Export Action Bar — mobile only (hidden on desktop, actions in sidebar) */}
      <div className="lg:hidden sticky bottom-1.5 sm:bottom-3 z-30 mt-4 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl px-2 sm:px-4 py-1.5 flex items-center justify-between gap-1.5">

        {/* Left: Clarified Score Badge & Devotee Name */}
        <div className="flex items-center gap-1.5 sm:gap-2 min-w-0">
          {/* Score Badge with Clear Label */}
          <div className={`bg-gradient-to-r ${styles.bannerGradient} text-white rounded-lg px-2.5 py-1 shadow-sm flex flex-col items-center justify-center shrink-0 leading-tight`}>
            <span className="text-[8px] sm:text-[9px] uppercase font-extrabold tracking-wider text-white/90 leading-none">
              {language === 'bn' ? 'স্কোর' : 'Score'}
            </span>
            <span className="text-xs sm:text-sm font-black leading-tight">
              {scoreBreakdown.percentage}%
            </span>
          </div>

          {/* Devotee Name & Detailed Marks (visible on all devices) */}
          <div className="min-w-0">
            <p className="text-[11px] sm:text-xs font-extrabold text-slate-800 dark:text-slate-100 truncate max-w-[100px] xs:max-w-[140px] sm:max-w-none leading-tight">
              {language === 'bn' ? (activeDevotee.nameBn || activeDevotee.name) : activeDevotee.name}
            </p>
            <p className={`text-[9px] sm:text-[10px] font-bold ${styles.primaryTextColor} truncate leading-tight`}>
              {language === 'bn'
                ? `${toBnNum(scoreBreakdown.totalMarks)}/১৭৫ নম্বর`
                : `${scoreBreakdown.totalMarks}/175 Marks`}
            </p>
          </div>

          {/* Mini Category pills on larger screens */}
          <div className="hidden md:flex items-center gap-1.5 pl-2 border-l border-slate-200 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400">
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {language === 'bn' ? `দেহ: ${toBnNum(scoreBreakdown.bodyAvgPct)}%` : `Body: ${scoreBreakdown.bodyAvgPct}%`}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {language === 'bn' ? `আত্মা: ${toBnNum(scoreBreakdown.soulAvgPct)}%` : `Soul: ${scoreBreakdown.soulAvgPct}%`}
            </span>
            <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
              {language === 'bn' ? `মর্নিং: ${toBnNum(scoreBreakdown.morningProgramMarks)}/২৫` : `Morning: ${scoreBreakdown.morningProgramMarks}/25`}
            </span>
          </div>
        </div>

        {/* Action buttons in single compact row — minimal & proportional */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={handleCopyWhatsApp}
            className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
            title={language === 'bn' ? 'টেক্সট কপি' : 'Copy WhatsApp Report'}
          >
            {copied ? <Check className="w-3.5 h-3.5 text-green-600 shrink-0" /> : <Copy className="w-3.5 h-3.5 shrink-0" />}
            <span>{copied ? (language === 'bn' ? 'কপি!' : 'Copied!') : (language === 'bn' ? 'কপি' : 'Copy')}</span>
          </button>

          <button
            onClick={handleShareWhatsApp}
            className="px-2 py-1 rounded-lg bg-[#25D366] hover:bg-[#1ebe59] text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs shrink-0 cursor-pointer"
            title="Share to WhatsApp"
          >
            <MessageCircle className="w-3.5 h-3.5 shrink-0" />
            <span className="sm:hidden">WA</span>
            <span className="hidden sm:inline">WhatsApp</span>
          </button>

          <button
            onClick={handleSaveReport}
            className="px-2 py-1 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold flex items-center gap-1 transition-all shadow-xs shadow-amber-500/20 shrink-0 cursor-pointer"
            title={language === 'bn' ? 'সংরক্ষণ ও সিঙ্ক' : 'Manual Save & Sync'}
          >
            <RefreshCw className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">{language === 'bn' ? 'সংরক্ষণ' : 'Save'}</span>
          </button>
        </div>
      </div>

      {/* Dedicated Publication-Grade Printable Document for PDF Export & Printing (Clean, Glitch-Free, Standard Fonts) */}
      <div
        id="daily-sadhana-pdf-document"
        style={{
          position: 'fixed',
          left: '-9999px',
          top: 0,
          width: '800px',
          backgroundColor: '#ffffff',
          color: '#0f172a',
          zIndex: -9999,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
        }}
        className="p-8 bg-white text-slate-900 border border-slate-300"
      >
        {/* Top Spiritual Header */}
        <div className="border-b-2 border-amber-600 pb-3 mb-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-13 h-13 rounded-full bg-gradient-to-br from-amber-600 to-amber-800 flex items-center justify-center text-white font-black text-2xl shadow-sm border border-amber-300">
              ॐ
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-black tracking-tight text-slate-900 uppercase">
                  ISKCON YOUTH FORUM (IYF) • ADVAITA VOICE
                </h1>
                <span className="px-2.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[11px] font-extrabold border border-amber-300">
                  Scale {activeDevotee.scaleId}
                </span>
              </div>
              <p className="text-xs font-bold text-amber-700 tracking-wide mt-0.5 uppercase">
                DAILY SADHANA EVALUATION REPORT (175 MATRIX SYSTEM)
              </p>
              <p className="text-[10.5px] text-slate-500 italic mt-0.5">
                "Simple Living, High Thinking" • Dedicated to His Divine Grace A.C. Bhaktivedanta Swami Prabhupada
              </p>
            </div>
          </div>

          {/* Daily Score Crest */}
          <div className="bg-amber-50 border-2 border-amber-500 rounded-xl px-4 py-2 text-center min-w-[120px]">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-amber-800 block">
              DAILY SCORE
            </span>
            <span className="text-2xl font-black text-amber-900 leading-none block my-0.5">
              {scoreBreakdown.percentage}%
            </span>
            <span className="text-[11px] font-extrabold text-amber-700 block">
              {scoreBreakdown.totalMarks} / 175 Marks
            </span>
          </div>
        </div>

        {/* Devotee Metadata Summary Bar */}
        <div className="grid grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 mb-4 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              DEVOTEE:
            </span>
            <span className="font-extrabold text-slate-900 text-sm block leading-normal">
              {activeDevotee.name}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              COUNSELOR:
            </span>
            <span className="font-bold text-slate-800 text-xs block leading-normal">
              {activeDevotee.counselorName || PRIMARY_COUNSELOR.name}
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              DATE & LOCATION:
            </span>
            <span className="font-bold text-slate-800 text-xs block leading-normal">
              {reportDate} ({stayingAt === 'VOICE' ? 'VOICE Ashram' : stayingAt})
            </span>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-500 block mb-0.5">
              PERFORMANCE:
            </span>
            <span className="font-extrabold text-amber-800 text-xs block leading-normal">
              Body: {scoreBreakdown.bodyAvgPct}% | Soul: {scoreBreakdown.soulAvgPct}%
            </span>
          </div>
        </div>

        {/* Section 1: Body Regulation */}
        <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-1.5 flex items-center justify-between border-b border-slate-200">
            <span className="font-black text-xs text-slate-800 uppercase tracking-wide">
              1. Body Regulation
            </span>
            <span className="text-[11px] font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
              Subtotal: {scoreBreakdown.bodyTotal} / 75 ({scoreBreakdown.bodyAvgPct}%)
            </span>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <th className="py-2 pl-3.5 text-left">Practice</th>
                <th className="py-2 text-left">Recorded Time / Value</th>
                <th className="py-2 text-left">Standard Rule</th>
                <th className="py-2 pr-3.5 text-right">Marks Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 pl-3.5 font-bold text-slate-800">(1) Went to bed</td>
                <td className="py-2 font-bold text-slate-900">{wentToBed}</td>
                <td className="py-2 text-slate-500 text-[11px]">Before 10:30 PM</td>
                <td className="py-2 pr-3.5 text-right font-black text-amber-700">
                  +{scoreBreakdown.wentToBedMarks} / 25
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-3.5 font-bold text-slate-800">(2) Got up</td>
                <td className="py-2 font-bold text-slate-900">{gotUp}</td>
                <td className="py-2 text-slate-500 text-[11px]">Before 4:00 AM</td>
                <td className="py-2 pr-3.5 text-right font-black text-amber-700">
                  +{scoreBreakdown.wakeUpMarks} / 25
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-3.5 font-bold text-slate-800">(3) Day rest</td>
                <td className="py-2 font-bold text-slate-900">{dayRestMinutes} min</td>
                <td className="py-2 text-slate-500 text-[11px]">&lt; 30 minutes or zero</td>
                <td className="py-2 pr-3.5 text-right font-black text-amber-700">
                  +{scoreBreakdown.daySleepMarks} / 25
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Soul Practices */}
        <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-1.5 flex items-center justify-between border-b border-slate-200">
            <span className="font-black text-xs text-slate-800 uppercase tracking-wide">
              2. Soul Practices
            </span>
            <span className="text-[11px] font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
              Subtotal: {scoreBreakdown.soulTotal} / 75 ({scoreBreakdown.soulAvgPct}%)
            </span>
          </div>
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-[10px] text-slate-500 font-bold border-b border-slate-200">
                <th className="py-2 pl-3.5 text-left">Practice</th>
                <th className="py-2 text-left">Details</th>
                <th className="py-2 text-left">Completion & Notes</th>
                <th className="py-2 pr-3.5 text-right">Marks Earned</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr>
                <td className="py-2 pl-3.5 font-bold text-slate-800">(1) Japa Chanting</td>
                <td className="py-2 font-bold text-slate-900">{japaRounds} rounds</td>
                <td className="py-2 text-slate-600 text-[11px]">Finished: {japaCompletionTime}</td>
                <td className="py-2 pr-3.5 text-right font-black text-amber-700">
                  +{scoreBreakdown.japaMarks} / 25
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-3.5 font-bold text-slate-800">(2) Scripture Study</td>
                <td className="py-2 font-bold text-slate-900">
                  {scriptureStudyMinutes} min
                  <span className="block text-[11px] font-normal text-slate-600 mt-0.5">
                    {selectedBookObj?.titleEn || effectiveBookTitle} ({scriptureChapterPage || 'General'})
                  </span>
                </td>
                <td className="py-2 text-slate-600 text-[11px]">
                  Notes Taken: {scriptureNotes ? 'Yes' : 'No'}
                </td>
                <td className="py-2 pr-3.5 text-right font-black text-amber-700">
                  +{scoreBreakdown.bookStudyMarks} / 25
                </td>
              </tr>
              <tr>
                <td className="py-2 pl-3.5 font-bold text-slate-800">(3) Lecture Hearing</td>
                <td className="py-2 font-bold text-slate-900">{totalHearingMinutes} min</td>
                <td className="py-2 text-slate-600 text-[11px]">
                  SP: {lectureSpMinutes}m | Guru: {lectureGuruMinutes}m | Other: {lectureOtherMinutes}m
                </td>
                <td className="py-2 pr-3.5 text-right font-black text-amber-700">
                  +{scoreBreakdown.hearingMarks} / 25
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 3: Morning Program */}
        <div className="mb-4 border border-slate-200 rounded-xl overflow-hidden">
          <div className="bg-slate-100 px-3.5 py-1.5 flex items-center justify-between border-b border-slate-200">
            <span className="font-black text-xs text-slate-800 uppercase tracking-wide">
              3. Morning Program Attendance
            </span>
            <span className="text-[11px] font-extrabold text-slate-700 bg-white px-2.5 py-0.5 rounded border border-slate-200">
              Attended: {morningAttendedCount} / 5 | Marks: {scoreBreakdown.morningProgramMarks} / 25
            </span>
          </div>
          <div className="grid grid-cols-5 divide-x divide-slate-200 text-center text-xs py-2.5 bg-white">
            <div className="px-1.5">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Mangalarati</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${mangalarati ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {mangalarati ? '✓ Attended' : '✗ Missed'}
              </span>
            </div>
            <div className="px-1.5">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Nrsimharati</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${nrsimharati ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {nrsimharati ? '✓ Attended' : '✗ Missed'}
              </span>
            </div>
            <div className="px-1.5">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Tulasi Arati</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${tulasiArati ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {tulasiArati ? '✓ Attended' : '✗ Missed'}
              </span>
            </div>
            <div className="px-1.5">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Watering Vrinda</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${wateringVrinda ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {wateringVrinda ? '✓ Yes' : '✗ No'}
              </span>
            </div>
            <div className="px-1.5">
              <span className="text-[10px] text-slate-500 font-bold block mb-1">Siksastakam</span>
              <span className={`inline-block px-2.5 py-0.5 rounded text-[11px] font-bold ${siksastakamAndOffenses ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' : 'bg-rose-100 text-rose-800 border border-rose-300'}`}>
                {siksastakamAndOffenses ? '✓ Yes' : '✗ No'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 4: Seva, Academic & Additional */}
        <div className="mb-4 grid grid-cols-2 gap-3.5 text-xs">
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70">
            <h4 className="font-black text-slate-800 mb-2 border-b border-slate-200 pb-1 text-[11px] uppercase tracking-wider">
              Seva & Academic / Career Study
            </h4>
            <div className="space-y-1.5">
              <div>
                <span className="text-slate-500 block text-[10px] font-bold uppercase">Rendered Seva:</span>
                <span className="font-bold text-slate-800 text-[12px] block mt-0.5 leading-normal">
                  {effectiveRenderedSeva}
                </span>
              </div>
              <div className="flex items-center justify-between pt-1">
                <span className="text-slate-500 text-[10px] font-bold uppercase">Academic / Career Study:</span>
                <span className="font-bold text-slate-800 text-xs">
                  {academicStudyHours} Hours
                </span>
              </div>
            </div>
          </div>

          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70">
            <h4 className="font-black text-slate-800 mb-2 border-b border-slate-200 pb-1 text-[11px] uppercase tracking-wider">
              Additional Disciplines
            </h4>
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Sloka Memorizing:</span>
                <span className={`font-bold ${slokaMemorized ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {slokaMemorized ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-600">Bhajan / Gayatri:</span>
                <span className={`font-bold ${bhajanGayatriCompleted ? 'text-emerald-700' : 'text-slate-500'}`}>
                  {bhajanGayatriCompleted ? 'Yes' : 'No'}
                </span>
              </div>
              <div className="flex items-center justify-between pt-0.5">
                <span className="text-slate-600">Social Media Time:</span>
                <span className="font-bold text-slate-800">
                  {socialMediaMinutes} min
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 5: Counselor Assessment & Signature */}
        <div className="border border-slate-300 rounded-xl p-3.5 mb-4 bg-white">
          <div className="mb-3">
            <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block mb-1">
              Counselor Diagnosis & Guidance:
            </span>
            <div className="h-9 border-b border-dashed border-slate-300 flex items-end pb-1 text-slate-400 italic text-[11px]">
              ....................................................................................................................................................................................................................................
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 pt-2">
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-4">
                Devotee Signature:
              </span>
              <div className="border-t border-slate-400 pt-1 text-[11px] font-bold text-slate-800">
                {activeDevotee.name}
              </div>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 font-bold block mb-4">
                Counselor Signature & Date:
              </span>
              <div className="border-t border-slate-400 pt-1 text-[11px] font-bold text-slate-800 flex justify-between">
                <span>{activeDevotee.counselorName || PRIMARY_COUNSELOR.name}</span>
                <span className="text-slate-500 font-normal">Date: {reportDate}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Spiritual Footer */}
        <div className="text-center pt-2.5 border-t border-slate-200 text-[10.5px] text-slate-600">
          <p className="font-bold text-amber-800 tracking-wider">
            Hare Krishna Hare Krishna Krishna Krishna Hare Hare • Hare Rama Hare Rama Rama Rama Hare Hare
          </p>
          <p className="text-[9.5px] text-slate-400 mt-0.5">
            Advaita VOICE Hub Sadhana Management System • Official Spiritual Assessment • Date: {reportDate}
          </p>
        </div>
      </div>

      {/* Sadhana History & Cloud Archive Modal */}
      <SadhanaHistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
        activeDevotee={activeDevotee}
        onSelectDailyReport={(d) => setReportDate(d)}
      />

    </div>
  );
};
