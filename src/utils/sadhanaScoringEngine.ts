import { SADHANA_SCALES, SCORE_175_CONVERSION_TABLE, convertScoreTo175Pct } from '../data/sadhanaScalesData';
export { SCORE_175_CONVERSION_TABLE, convertScoreTo175Pct };
import type { DayCardEntry, DailySadhanaReport, MatrixDayEntry } from '../types/sadhana';
import { DEFAULT_SAMPLE_MATRIX } from '../types/sadhana';

/**
 * Normalizes time string (e.g. "10.40 pm", "10:40 PM", "22:40") to "HH:MM" in 24h format.
 */
export function normalizeTimeTo24h(timeStr: string): string {
  if (!timeStr) return '00:00';
  let s = timeStr.trim().toLowerCase().replace('.', ':');
  
  const isPm = s.includes('pm');
  const isAm = s.includes('am');
  s = s.replace('pm', '').replace('am', '').trim();
  
  const parts = s.split(':');
  if (parts.length === 0) return '00:00';
  
  let hours = parseInt(parts[0], 10) || 0;
  const minutes = parts.length > 1 ? parseInt(parts[1], 10) || 0 : 0;
  
  if (isPm && hours < 12) hours += 12;
  if (isAm && hours === 12) hours = 0;
  
  const hStr = hours.toString().padStart(2, '0');
  const mStr = minutes.toString().padStart(2, '0');
  return `${hStr}:${mStr}`;
}

export function calculateWentToBedMarks(timeStr: string, scaleId: 1 | 2 | 3 | 4 = 2): number {
  if (!timeStr) return 0;
  const t24 = normalizeTimeTo24h(timeStr);
  const [h] = t24.split(':').map(Number);
  
  // Devotees going to bed post-midnight (00:00 to 11:59 AM) are beyond the latest cutoffs (after 11:30 PM / 10:45 PM)
  if (h >= 0 && h < 12) {
    return -5;
  }

  const scale = SADHANA_SCALES[scaleId] || SADHANA_SCALES[2];
  
  // Cutoffs are in "HH:MM" (e.g. 21:30, 22:00). Find the matching tier
  for (const tier of scale.toBed) {
    if (t24 <= tier.cutoff) {
      return tier.marks;
    }
  }
  return -5;
}

export function calculateWakeUpMarks(timeStr: string, scaleId: 1 | 2 | 3 | 4 = 2): number {
  if (!timeStr) return 0;
  const t24 = normalizeTimeTo24h(timeStr);
  const scale = SADHANA_SCALES[scaleId] || SADHANA_SCALES[2];
  
  for (const tier of scale.wakeUp) {
    if (t24 <= tier.cutoff) {
      return tier.marks;
    }
  }
  return -5;
}

export function calculateDaySleepMarks(minutes: number, scaleId: 1 | 2 | 3 | 4 = 2): number {
  if (minutes <= 0) return 25; // No day sleep gives maximum marks (30 min or less)
  const scale = SADHANA_SCALES[scaleId] || SADHANA_SCALES[2];
  for (const tier of scale.daySleep) {
    if (minutes <= parseInt(tier.cutoff, 10)) {
      return tier.marks;
    }
  }
  
  if (scaleId >= 3) {
    // Official card rule: "every minute beyond 60 min reduce 1 mark/min from 15."
    // e.g. 61 min = 14, 62 min = 13, 63 min = 12...
    const excess = minutes - 60;
    return Math.max(-20, 15 - excess);
  }
  
  // Scale 1 & 2: "Beyond 100 min every 10 min -5 marks"
  const excessTenths = Math.ceil((minutes - 100) / 10);
  return Math.max(-25, excessTenths * -5);
}

export function calculateJapaMarks(rounds: number, completionTimeStr: string, scaleId: 1 | 2 | 3 | 4 = 2): number {
  if (rounds < 16) {
    return Math.max(0, Math.round((rounds / 16) * 15));
  }
  const t24 = normalizeTimeTo24h(completionTimeStr);
  const scale = SADHANA_SCALES[scaleId] || SADHANA_SCALES[2];
  
  for (const tier of scale.japa) {
    if (t24 <= tier.cutoff) {
      return tier.marks;
    }
  }
  return -5;
}

export function calculateAcademicStudyMarks(minutesOrHours: number, isHours = false): number {
  const minutes = isHours ? minutesOrHours * 60 : minutesOrHours;
  if (minutes >= 120) return 25;
  if (minutes >= 105) return 20;
  if (minutes >= 90) return 15;
  if (minutes >= 60) return 10;
  if (minutes >= 30) return 5;
  return 0;
}

export function calculateBookStudyMarks(minutes: number): number {
  // Official Booklet rule: 30 minutes or more daily = 25 marks (max 25)
  if (minutes >= 30) return 25;
  if (minutes >= 20) return 15;
  if (minutes >= 10) return 10;
  if (minutes > 0) return 5;
  return 0;
}

export function calculateHearingMarks(minutes: number): number {
  if (minutes >= 60) return 25;
  if (minutes >= 45) return 20;
  if (minutes >= 30) return 15;
  if (minutes >= 15) return 10;
  return 0;
}

export interface DayScoreBreakdown {
  // 1. Body Category (3 practices * 25 = 75 max)
  wentToBedMarks: number;
  wakeUpMarks: number;
  daySleepMarks: number;
  bodyTotal: number;
  bodyAvgPct: number;

  // 2. Soul Category (3 practices * 25 = 75 max)
  japaMarks: number;
  bookStudyMarks: number;
  hearingMarks: number;
  soulTotal: number;
  soulAvgPct: number;

  // 3. Morning Program / Class (1 practice * 25 = 25 max)
  morningProgramMarks: number;
  morningClassMarks: number; // alias for morningProgramMarks
  mangalAratiMarks: number;  // informational

  // Auxiliary items (duration / qualitative metrics)
  cleaningSevaMarks: number;
  academicStudyMarks: number;
  cardPunctualityMarks: number;

  // 175 Matrix Totals (7 practices * 25 = 175 max)
  totalMarks: number;
  maxPossibleMarks: number;
  percentage: number;
}

export function calculateDailyReportScore(report: DailySadhanaReport, scaleId: 1 | 2 | 3 | 4 = 2): DayScoreBreakdown {
  const wentToBedMarks = calculateWentToBedMarks(report.wentToBed, scaleId);
  const wakeUpMarks = calculateWakeUpMarks(report.gotUp, scaleId);
  const daySleepMarks = calculateDaySleepMarks(report.dayRestMinutes, scaleId);
  
  // 1. Body Category (3 core practices * 25 max marks = 75 max)
  const bodyTotal = Math.max(0, wentToBedMarks + wakeUpMarks + daySleepMarks);
  const bodyAvgPct = Math.max(0, Math.min(100, Math.round((bodyTotal / 75) * 100)));

  // 2. Soul Category (3 core practices * 25 max marks = 75 max)
  const japaMarks = calculateJapaMarks(report.japaRounds, report.japaCompletionTime, scaleId);
  const bookStudyMarks = calculateBookStudyMarks(report.scriptureStudyMinutes);
  const totalHearingMinutes = report.lectureHearingMinutes || (report.lectureSpMinutes + report.lectureGuruMinutes + report.lectureOtherMinutes);
  const hearingMarks = calculateHearingMarks(totalHearingMinutes);
  const soulTotal = Math.max(0, japaMarks + bookStudyMarks + hearingMarks);
  const soulAvgPct = Math.max(0, Math.min(100, Math.round((soulTotal / 75) * 100)));

  // 3. Morning Program / Class Category (1 core practice * 25 max marks = 25 max)
  let morningProgramMarks = 0;
  if (report.mangalarati) {
    if (report.nrsimharati && report.tulasiArati) {
      morningProgramMarks = 25; // Full morning program attended
    } else {
      morningProgramMarks = 20; // Mangalarati + partial
    }
  } else if (report.nrsimharati || report.tulasiArati || report.siksastakamAndOffenses) {
    morningProgramMarks = 10; // Joined for prayers
  } else {
    morningProgramMarks = 0;
  }
  const morningClassMarks = morningProgramMarks;
  const mangalAratiMarks = report.mangalarati ? 15 : 0;

  // Auxiliary items (tracked duration/qualitative metrics per booklet rule 3)
  const cleaningSevaMarks = report.renderedSeva?.trim() ? 25 : 0;
  const academicStudyMarks = calculateAcademicStudyMarks(report.academicStudyHours, true);
  const cardPunctualityMarks = 25; // submitted daily
  
  // 175 MATRIX FORMULA:
  // 7 Core Practices * 25 max marks = 175 total marks
  // (3 Body + 3 Soul + 1 Morning Program = 7 practices)
  const rawTotal = wentToBedMarks + wakeUpMarks + daySleepMarks + japaMarks + bookStudyMarks + hearingMarks + morningProgramMarks;
  const totalMarks = Math.max(0, Math.min(175, rawTotal));
  const maxPossibleMarks = 175;
  const percentage = convertScoreTo175Pct(totalMarks);
  
  return {
    wentToBedMarks,
    wakeUpMarks,
    daySleepMarks,
    bodyTotal,
    bodyAvgPct,
    japaMarks,
    bookStudyMarks,
    hearingMarks,
    soulTotal,
    soulAvgPct,
    morningProgramMarks,
    morningClassMarks,
    mangalAratiMarks,
    cleaningSevaMarks,
    academicStudyMarks,
    cardPunctualityMarks,
    totalMarks,
    maxPossibleMarks,
    percentage
  };
}

export function calculateDayCardScore(entry: DayCardEntry, scaleId: 1 | 2 | 3 | 4 = 2): number {
  const wentToBedMarks = calculateWentToBedMarks(entry.wentToBed, scaleId);
  const wakeUpMarks = calculateWakeUpMarks(entry.gotUp, scaleId);
  const daySleepMarks = calculateDaySleepMarks(entry.dayRestMin, scaleId);
  
  const japaMarks = calculateJapaMarks(entry.japaRounds, entry.japaCompletedBy, scaleId);
  const bookStudyMarks = calculateBookStudyMarks(entry.spBookStudyMin);
  const hearingMarks = calculateHearingMarks(entry.prescribedHearingMin);
  
  const morningClassMarks = entry.morningClass === true || entry.morningClass === 'P' ? 25 : (entry.morningClass === 'L' ? 5 : 0);
  
  // 7 core practices * 25 = 175
  const total = wentToBedMarks + wakeUpMarks + daySleepMarks + japaMarks + bookStudyMarks + hearingMarks + morningClassMarks;
  
  return Math.max(0, Math.min(175, total));
}

/**
 * Synchronizes a DailySadhanaReport into the devotee's 7-Day Weekly Sadhana Card (Matrix).
 * Finds the corresponding Saturday-to-Friday week offset and day of week ('sat'...'fri'),
 * updates the cell values in localStorage, and dispatches a global 'sadhana_matrix_updated' event.
 */
export function syncDailyReportToWeeklyMatrix(
  devoteeId: string,
  report: DailySadhanaReport,
  scoreBreakdown: DayScoreBreakdown
): { weekOffset: number; dayKey: string; updatedMatrix: Record<string, MatrixDayEntry> } | null {
  if (!devoteeId || !report.date) return null;

  try {
    const parts = report.date.split(/[\/\-\.]/);
    if (parts.length < 3) return null;
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    let year = parseInt(parts[2], 10);
    if (year < 100) year += 2000;
    const reportDateObj = new Date(year, month - 1, day);
    if (isNaN(reportDateObj.getTime())) return null;

    // Day of week mapping (Saturday is day 0 in our weekly matrix):
    // 0: Sun, 1: Mon, 2: Tue, 3: Wed, 4: Thu, 5: Fri, 6: Sat
    const dayKeyMap: Record<number, string> = {
      0: 'sun',
      1: 'mon',
      2: 'tue',
      3: 'wed',
      4: 'thu',
      5: 'fri',
      6: 'sat'
    };
    const dayKey = dayKeyMap[reportDateObj.getDay()];
    if (!dayKey) return null;

    // Calculate Saturday of current week (offset 0) and target week
    const getSaturdayOfWeek = (d: Date) => {
      const dow = d.getDay(); // 0 is Sun, 6 is Sat
      const diffToSat = (dow + 1) % 7;
      const sat = new Date(d.getFullYear(), d.getMonth(), d.getDate() - diffToSat);
      sat.setHours(0, 0, 0, 0);
      return sat;
    };

    const currentSat = getSaturdayOfWeek(new Date());
    const targetSat = getSaturdayOfWeek(reportDateObj);
    const diffMs = targetSat.getTime() - currentSat.getTime();
    const weekOffset = Math.round(diffMs / (7 * 24 * 60 * 60 * 1000));

    const matrixStorageKey = `weekly_matrix_${devoteeId}_offset_${weekOffset}`;
    let matrix: Record<string, MatrixDayEntry> = {};
    const existingStr = localStorage.getItem(matrixStorageKey);
    if (existingStr) {
      try {
        matrix = JSON.parse(existingStr);
      } catch (e) {
        matrix = { ...DEFAULT_SAMPLE_MATRIX };
      }
    } else {
      matrix = { ...DEFAULT_SAMPLE_MATRIX };
    }

    const pad2 = (n: number) => {
      if (n <= 0) return '00';
      return n < 10 ? `0${n}` : `${n}`;
    };

    const existingEntry = matrix[dayKey] || DEFAULT_SAMPLE_MATRIX[dayKey];

    const newDayEntry: MatrixDayEntry = {
      toBed: pad2(scoreBreakdown.wentToBedMarks),
      wakeUp: pad2(scoreBreakdown.wakeUpMarks),
      dayRest: scoreBreakdown.daySleepMarks < 0 ? `${scoreBreakdown.daySleepMarks}` : pad2(scoreBreakdown.daySleepMarks),
      japa: pad2(scoreBreakdown.japaMarks),
      spBooks: pad2(scoreBreakdown.bookStudyMarks),
      hearing: pad2(scoreBreakdown.hearingMarks),
      studyWork: report.academicStudyHours > 0 ? `${report.academicStudyHours} Hour` : (existingEntry?.studyWork || '2 Hour'),
      cleaning: report.renderedSeva && report.renderedSeva !== 'Custom (অন্যান্য)' ? report.renderedSeva.slice(0, 25) : (existingEntry?.cleaning || 'Ashram Seva'),
      followUp: existingEntry?.followUp || '10 Min.',
      bbtBtg: existingEntry?.bbtBtg || '00',
      morningClass: pad2(scoreBreakdown.morningProgramMarks),
      sadhanaCard: '25', // Daily report submission marks punctuality
      sloka: report.slokaMemorizingCount > 0 ? 'BG-Done' : (existingEntry?.sloka || '-'),
      bhajanGayatri: report.bhajanGayatriCompleted ? '25' : '00'
    };

    matrix[dayKey] = newDayEntry;
    localStorage.setItem(matrixStorageKey, JSON.stringify(matrix));

    // Dispatch global event for instant reactivity across open tabs
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('sadhana_matrix_updated', {
        detail: {
          devoteeId,
          weekOffset,
          dayKey,
          updatedMatrix: matrix
        }
      }));
    }

    return { weekOffset, dayKey, updatedMatrix: matrix };
  } catch (err) {
    console.error('Failed to sync daily report to weekly matrix:', err);
    return null;
  }
}

