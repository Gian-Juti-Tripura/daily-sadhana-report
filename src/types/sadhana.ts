export type StayingLocation = 'VOICE' | 'Home' | 'Temple' | 'Outside';

export interface DailySadhanaReport {
  id: string;
  date: string; // DD/MM/YY or YYYY-MM-DD
  devoteeName: string;
  counselorName: string;
  stayingAt: StayingLocation;
  
  // Body
  wentToBed: string; // e.g. "10.40 pm"
  gotUp: string;     // e.g. "3.55 am"
  dayRestMinutes: number; // e.g. 0
  
  // Soul
  japaRounds: number; // e.g. 16
  japaCompletionTime: string; // e.g. "07:30 am"
  scriptureStudyMinutes: number; // e.g. 45
  scriptureBook: string; // e.g. "Bhagavad Gita As It Is"
  scriptureChapterPage?: string;
  scriptureNotes: boolean; // yes / no
  lectureHearingMinutes: number; // total
  lectureSpMinutes: number;
  lectureGuruMinutes: number;
  lectureOtherMinutes: number;
  
  // Seva & Academics
  renderedSeva: string;
  academicStudyHours: number; // e.g. 2.5
  
  // Morning Program Checklist
  mangalarati: boolean;
  nrsimharati: boolean;
  tulasiArati: boolean;
  wateringVrinda: boolean;
  siksastakamAndOffenses: boolean;
  
  // Additional
  slokaMemorizingCount: number;
  bhajanGayatriCompleted: boolean;
  socialMediaMinutes: number;
  
  submittedAt?: string;
}

export interface DayCardEntry {
  dayNameEn: string;
  dayNameBn: string;
  date: string;
  wentToBed: string;
  gotUp: string;
  dayRestMin: number;
  mangalArati: boolean | 'P' | 'L' | 'A';
  nrsimhaArati: boolean;
  tulasiArati: boolean;
  japaRounds: number;
  japaCompletedBy: string;
  spBookStudyMin: number;
  bookNotes: boolean;
  prescribedHearingMin: number;
  morningClass: boolean | 'P' | 'L' | 'A';
  templeCleaning: boolean;
  academicStudyMin: number;
  followUpBtgSeva: boolean;
  cardFillPunctual: boolean;
  slokaPractice: boolean;
  bhajanGayatri: boolean;
  dailyMarks: number;
  dailyPercentage: number;
}

export interface MatrixDayEntry {
  toBed: string;
  wakeUp: string;
  dayRest: string;
  japa: string;
  spBooks: string;
  hearing: string;
  studyWork: string;
  cleaning: string;
  followUp: string;
  bbtBtg: string;
  morningClass: string;
  sadhanaCard: string;
  sloka: string;
  bhajanGayatri: string;
}

export const DEFAULT_SAMPLE_MATRIX: Record<string, MatrixDayEntry> = {
  sat: { toBed: '20', wakeUp: '25', dayRest: '25', japa: '25', spBooks: '25', hearing: '25', studyWork: '30 Min.', cleaning: '30 Min.', followUp: '2 Hour', bbtBtg: '2 BTG', morningClass: '25', sadhanaCard: '25', sloka: 'BG-7/9', bhajanGayatri: '25' },
  sun: { toBed: '25', wakeUp: '25', dayRest: '00', japa: '20', spBooks: '00', hearing: '00', studyWork: '2 Hour', cleaning: '10 Min.', followUp: '10 Min.', bbtBtg: '00 BTG', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '25' },
  mon: { toBed: '25', wakeUp: '20', dayRest: '20', japa: '20', spBooks: '25', hearing: '25', studyWork: '2 Hour', cleaning: '20 Min.', followUp: '20 Min.', bbtBtg: '1 Gita', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '25' },
  tue: { toBed: '20', wakeUp: '05', dayRest: '25', japa: '15', spBooks: '25', hearing: '25', studyWork: '2 Hour', cleaning: '00 Min.', followUp: '10 Min.', bbtBtg: '00', morningClass: '00', sadhanaCard: '00', sloka: '-', bhajanGayatri: '00' },
  wed: { toBed: '15', wakeUp: '25', dayRest: '-5', japa: '05', spBooks: '00', hearing: '00', studyWork: '2 Hour', cleaning: '10 Min.', followUp: '00', bbtBtg: '00', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '25' },
  thu: { toBed: '05', wakeUp: '25', dayRest: '20', japa: '20', spBooks: '25', hearing: '25', studyWork: '3 Hour', cleaning: '20 Min.', followUp: '2 Hour', bbtBtg: '1 BTG', morningClass: '25', sadhanaCard: '25', sloka: '-', bhajanGayatri: '00' },
  fri: { toBed: '25', wakeUp: '25', dayRest: '25', japa: '25', spBooks: '25', hearing: '25', studyWork: '5 Hours', cleaning: '45 Min.', followUp: '3 Hour', bbtBtg: '00', morningClass: '25', sadhanaCard: '25', sloka: 'SB 1/2/3', bhajanGayatri: '25' }
};

export interface WeeklySadhanaCard {
  id: string;
  weekStartDate: string; // Saturday
  weekEndDate: string;   // Friday
  devoteeName: string;
  counselorName: string;
  scaleId: 1 | 2 | 3 | 4;
  days?: Record<string, DayCardEntry>; // 'sat' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri'
  matrixDays?: Record<string, MatrixDayEntry>;
  totalWeeklyMarks: number;
  maxWeeklyMarks: number;
  weeklyPercentage: number;
  bodyPercentage?: number;
  soulPercentage?: number;
  sevaRemark?: string;
  othersPercentage?: number;
  counselorDiagnosis?: string;
  counselorAdvice?: string;
  counselorSignature?: string;
  verifiedByCounselor: boolean;
}

export interface CounseleeProfile {
  id: string;
  name: string;
  nameBn?: string;
  spiritualName?: string;
  spiritualNameBn?: string;
  phone: string;
  email?: string;
  roomNo?: string;
  department?: string;
  institution?: string;
  scaleId: 1 | 2 | 3 | 4;
  counselorName: string;
  completedCourses: string[]; // course IDs
  completedCamps: string[];   // camp IDs
  spiritualTitle?: string;
  joinDate?: string;
  avatarUrl?: string;
  flowerAvatarId?: string;
}
