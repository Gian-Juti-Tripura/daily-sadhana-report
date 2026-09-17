import { supabase } from '../supabase/supabaseClient';
import type { DailySadhanaReport, WeeklySadhanaCard } from '../types/sadhana';
import { calculateDailyReportScore } from './sadhanaScoringEngine';

export interface DailyReportHistoryItem {
  id: string;
  date: string; // DD/MM/YY or YYYY-MM-DD
  rawDate: string; // standardized for sorting e.g. YYYY-MM-DD
  devoteeId: string;
  devoteeName: string;
  totalMarks: number;
  percentage: number;
  bodyAvgPct: number;
  soulAvgPct: number;
  sevaRemark: string;
  othersScore: number;
  submittedAt: string;
  syncStatus: 'synced' | 'local';
  data: DailySadhanaReport;
}

const REPORT_INDEX_PREFIX = 'sadhana_report_index_';
const WEEKLY_INDEX_PREFIX = 'weekly_card_index_';

/**
 * Normalizes date string into ISO-like comparable string (YYYY-MM-DD)
 */
export function normalizeDateForSort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.split(/[/.-]/);
  if (parts.length === 3) {
    let [d, m, y] = parts;
    if (d.length === 4) return `${d}-${m.padStart(2, '0')}-${y.padStart(2, '0')}`; // already YYYY-MM-DD
    if (y.length === 2) y = '20' + y;
    return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`;
  }
  return dateStr;
}

/**
 * Saves a daily report locally, updates devotee's historical index, and attempts background sync to Supabase.
 */
export async function saveDailyReportRecord(
  report: DailySadhanaReport,
  devoteeId: string,
  scaleId: 1 | 2 | 3 | 4 = 2
): Promise<DailyReportHistoryItem> {
  const dateKey = report.date.replace(/\//g, '-');
  const storageKey = `sadhana_report_${devoteeId}_${dateKey}`;

  // 1. Save full report to localStorage
  localStorage.setItem(storageKey, JSON.stringify(report));

  // 2. Compute scores
  const score = calculateDailyReportScore(report, scaleId);
  const now = new Date().toISOString();

  const historyItem: DailyReportHistoryItem = {
    id: storageKey,
    date: report.date,
    rawDate: normalizeDateForSort(report.date),
    devoteeId,
    devoteeName: report.devoteeName,
    totalMarks: score.totalMarks,
    percentage: score.percentage,
    bodyAvgPct: score.bodyAvgPct,
    soulAvgPct: score.soulAvgPct,
    sevaRemark: report.renderedSeva || 'Good',
    othersScore: score.morningProgramMarks,
    submittedAt: report.submittedAt || now,
    syncStatus: 'local',
    data: report
  };

  // 3. Update the devotee's index list in localStorage
  try {
    const indexKey = `${REPORT_INDEX_PREFIX}${devoteeId}`;
    const existingRaw = localStorage.getItem(indexKey);
    let indexList: DailyReportHistoryItem[] = existingRaw ? JSON.parse(existingRaw) : [];
    
    // Deduplicate by date
    indexList = indexList.filter(item => item.date !== report.date);
    indexList.unshift(historyItem);
    
    // Sort descending by date
    indexList.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
    localStorage.setItem(indexKey, JSON.stringify(indexList));
  } catch (e) {
    console.warn('Failed to update local report index', e);
  }

  // 4. Background cloud sync to Supabase sadhana_logs
  try {
    const isoDate = historyItem.rawDate || new Date().toISOString().split('T')[0];
    await supabase.from('sadhana_logs').upsert({
      log_date: isoDate,
      scale_id: scaleId,
      body_score: score.bodyTotal,
      body_avg: score.bodyAvgPct,
      soul_score: score.soulTotal,
      soul_avg: score.soulAvgPct,
      seva_score: score.cleaningSevaMarks,
      others_score: score.morningProgramMarks,
      grand_total: score.totalMarks,
      percentage: score.percentage,
      to_bed_time: report.wentToBed,
      wake_up_time: report.gotUp,
      day_sleep_min: report.dayRestMinutes,
      japa_finish_time: report.japaCompletionTime,
      study_academic_min: Math.round(report.academicStudyHours * 60),
      notes: JSON.stringify({
        devoteeId,
        devoteeName: report.devoteeName,
        stayingAt: report.stayingAt,
        renderedSeva: report.renderedSeva,
        scriptureBook: report.scriptureBook,
        fullReport: report
      })
    });
    historyItem.syncStatus = 'synced';
  } catch (err) {
    // Graceful offline fallback
    console.warn('Supabase background sync skipped or failed (offline-first active)', err);
  }

  return historyItem;
}

/**
 * Retrieves all historical daily reports for a devotee from local index and storage keys.
 */
export function getDailyReportsHistory(devoteeId: string): DailyReportHistoryItem[] {
  const indexKey = `${REPORT_INDEX_PREFIX}${devoteeId}`;
  const historyMap = new Map<string, DailyReportHistoryItem>();

  // 1. Check indexed records
  try {
    const saved = localStorage.getItem(indexKey);
    if (saved) {
      const parsed: DailyReportHistoryItem[] = JSON.parse(saved);
      parsed.forEach(item => historyMap.set(item.date, item));
    }
  } catch (e) {
    console.warn('Error reading report index', e);
  }

  // 2. Scan localStorage for any unindexed sadhana_report_{devoteeId}_* keys
  try {
    const prefix = `sadhana_report_${devoteeId}_`;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const report: DailySadhanaReport = JSON.parse(raw);
          if (report?.date && !historyMap.has(report.date)) {
            const score = calculateDailyReportScore(report, 2);
            historyMap.set(report.date, {
              id: key,
              date: report.date,
              rawDate: normalizeDateForSort(report.date),
              devoteeId,
              devoteeName: report.devoteeName,
              totalMarks: score.totalMarks,
              percentage: score.percentage,
              bodyAvgPct: score.bodyAvgPct,
              soulAvgPct: score.soulAvgPct,
              sevaRemark: report.renderedSeva || 'Good',
              othersScore: score.morningProgramMarks,
              submittedAt: report.submittedAt || new Date().toISOString(),
              syncStatus: 'local',
              data: report
            });
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error scanning unindexed reports', e);
  }

  const result = Array.from(historyMap.values());
  result.sort((a, b) => b.rawDate.localeCompare(a.rawDate));
  return result;
}

/**
 * Saves a weekly sadhana card and updates devotee's weekly card index.
 */
export async function saveWeeklyCardRecord(card: WeeklySadhanaCard, devoteeId: string): Promise<void> {
  const cardKey = `weekly_sadhana_card_${card.id}`;
  localStorage.setItem(cardKey, JSON.stringify(card));

  try {
    const indexKey = `${WEEKLY_INDEX_PREFIX}${devoteeId}`;
    const saved = localStorage.getItem(indexKey);
    let list: WeeklySadhanaCard[] = saved ? JSON.parse(saved) : [];
    list = list.filter(c => c.id !== card.id);
    list.unshift(card);
    localStorage.setItem(indexKey, JSON.stringify(list));
  } catch (e) {
    console.warn('Failed to index weekly card', e);
  }
}

/**
 * Retrieves all saved weekly cards for a devotee.
 */
export function getWeeklyCardsHistory(devoteeId: string): WeeklySadhanaCard[] {
  const indexKey = `${WEEKLY_INDEX_PREFIX}${devoteeId}`;
  const cardMap = new Map<string, WeeklySadhanaCard>();

  try {
    const saved = localStorage.getItem(indexKey);
    if (saved) {
      const list: WeeklySadhanaCard[] = JSON.parse(saved);
      list.forEach(c => cardMap.set(c.id, c));
    }
  } catch (e) {
    console.warn('Error reading weekly card index', e);
  }

  // Scan localStorage for any unindexed weekly cards
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('weekly_sadhana_card_')) {
        const raw = localStorage.getItem(key);
        if (raw) {
          const card: WeeklySadhanaCard = JSON.parse(raw);
          if (card?.id && (card.devoteeName || card.id.includes(devoteeId))) {
            if (!cardMap.has(card.id)) {
              cardMap.set(card.id, card);
            }
          }
        }
      }
    }
  } catch (e) {
    console.warn('Error scanning weekly cards', e);
  }

  return Array.from(cardMap.values());
}

/**
 * Syncs and pulls recent records from Supabase cloud database into local cache.
 */
export async function syncWithCloud(devoteeId: string): Promise<{ success: boolean; count: number; message: string }> {
  try {
    const { data, error } = await supabase
      .from('sadhana_logs')
      .select('*')
      .order('log_date', { ascending: false })
      .limit(50);

    if (error || !data) {
      return { success: false, count: 0, message: error?.message || 'No records retrieved from cloud' };
    }

    let syncedCount = 0;
    data.forEach((row: any) => {
      try {
        if (row.notes) {
          const parsedNotes = typeof row.notes === 'string' ? JSON.parse(row.notes) : row.notes;
          if (parsedNotes.devoteeId === devoteeId && parsedNotes.fullReport) {
            const report: DailySadhanaReport = parsedNotes.fullReport;
            const dateKey = report.date.replace(/\//g, '-');
            const storageKey = `sadhana_report_${devoteeId}_${dateKey}`;
            
            // Only update if not already locally present
            if (!localStorage.getItem(storageKey)) {
              localStorage.setItem(storageKey, JSON.stringify(report));
              syncedCount++;
            }
          }
        }
      } catch {
        // Skip unparseable note rows
      }
    });

    return { success: true, count: syncedCount, message: `Successfully synced ${syncedCount} records with cloud.` };
  } catch (err: any) {
    return { success: false, count: 0, message: err?.message || 'Offline or network unreachable' };
  }
}

/**
 * Exports all sadhana history as a portable JSON backup file.
 */
export function exportSadhanaBackupJson(devoteeId: string, devoteeName: string): string {
  const dailyReports = getDailyReportsHistory(devoteeId);
  const weeklyCards = getWeeklyCardsHistory(devoteeId);

  const backupPayload = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    devoteeId,
    devoteeName,
    dailyReportsCount: dailyReports.length,
    weeklyCardsCount: weeklyCards.length,
    dailyReports,
    weeklyCards
  };

  return JSON.stringify(backupPayload, null, 2);
}

/**
 * Restores sadhana history from a JSON backup.
 */
export function importSadhanaBackupJson(jsonString: string, devoteeId: string): { success: boolean; count: number; message: string } {
  try {
    const payload = JSON.parse(jsonString);
    let imported = 0;

    if (Array.isArray(payload.dailyReports)) {
      payload.dailyReports.forEach((item: DailyReportHistoryItem) => {
        if (item.data && item.date) {
          const dateKey = item.date.replace(/\//g, '-');
          localStorage.setItem(`sadhana_report_${devoteeId}_${dateKey}`, JSON.stringify(item.data));
          imported++;
        }
      });
    }

    if (Array.isArray(payload.weeklyCards)) {
      payload.weeklyCards.forEach((card: WeeklySadhanaCard) => {
        if (card.id) {
          localStorage.setItem(`weekly_sadhana_card_${card.id}`, JSON.stringify(card));
          imported++;
        }
      });
    }

    return { success: true, count: imported, message: `Successfully restored ${imported} records from backup file.` };
  } catch (e: any) {
    return { success: false, count: 0, message: `Invalid backup file format: ${e.message}` };
  }
}
