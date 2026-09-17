export interface ScaleRubric {
  scaleId: 1 | 2 | 3 | 4;
  titleEn: string;
  titleBn: string;
  targetAudienceEn: string;
  targetAudienceBn: string;

  toBed: Array<{ cutoff: string; marks: number; label: string }>;
  wakeUp: Array<{ cutoff: string; marks: number; label: string }>;
  daySleep: Array<{ cutoff: string; marks: number; label: string; penaltyNote?: string }>;

  japa: Array<{ cutoff: string; marks: number; label: string }>;
  spBookDailyMarks: number;
  prescribedHearing: {
    standardHoursDaily?: number;
    spWeeklyQuotaMin?: number;
    guruWeeklyQuotaMin?: number;
    otherQuotaMin?: number;
    guruMarks?: number;
    spMarks?: number;
    otherMarks?: number;
    penaltyPer5MinLess?: number;
    marks: number;
    noteEn?: string;
    noteBn?: string;
  };

  studyAcademics: Array<{ cutoff: string; marks: number; label: string }>;
  cleaningMarks: number;
  followUpMarks: number;
  btgMarks: number;

  morningClassMarks: number;
  sadhanaCardMarks: number;
  slokaMarks: number;
  bhajanGayatriMarks: number;
}

export const SADHANA_SCALES: Record<number, ScaleRubric> = {
  1: {
    scaleId: 1,
    titleEn: 'Scale One: Newcomer in Krishna Consciousness',
    titleBn: 'স্কেল এক: কৃষ্ণভাবনায় নবীন (১-৬ মাস)',
    targetAudienceEn: 'Newcomer in Krishna Consciousness (1–2 months or at best 6 months)',
    targetAudienceBn: 'কৃষ্ণভাবনায় নবীন ভক্ত (১-২ মাস বা সর্বোচ্চ ৬ মাস)',
    toBed: [
      { cutoff: '22:00', marks: 25, label: '10:00 PM or before' },
      { cutoff: '22:15', marks: 20, label: 'Before 10:15 PM' },
      { cutoff: '22:30', marks: 15, label: 'Before 10:30 PM' },
      { cutoff: '22:45', marks: 10, label: 'Before 10:45 PM' },
      { cutoff: '23:00', marks: 5,  label: 'Before 11:00 PM' },
      { cutoff: '23:30', marks: 0,  label: 'Before 11:30 PM (0 marks)' },
      { cutoff: '24:00', marks: -5, label: 'After 11:30 PM' }
    ],
    wakeUp: [
      { cutoff: '04:30', marks: 25, label: '4:30 AM or before' },
      { cutoff: '04:35', marks: 20, label: 'Before 4:35 AM' },
      { cutoff: '04:40', marks: 15, label: 'Before 4:40 AM' },
      { cutoff: '04:45', marks: 10, label: 'Before 4:45 AM' },
      { cutoff: '04:50', marks: 5,  label: 'Before 4:50 AM' },
      { cutoff: '05:00', marks: 0,  label: 'Before 5:00 AM' },
      { cutoff: '06:00', marks: -5, label: 'After 5:00 AM' }
    ],
    daySleep: [
      { cutoff: '30',  marks: 25, label: '30 min or less' },
      { cutoff: '60',  marks: 20, label: '60 min' },
      { cutoff: '70',  marks: 15, label: '70 min' },
      { cutoff: '80',  marks: 10, label: '80 min' },
      { cutoff: '90',  marks: 5,  label: '90 min' },
      { cutoff: '100', marks: 0,  label: '100 min' },
      { cutoff: '200', marks: -5, label: 'Beyond 100 min (−5 per 10 min)', penaltyNote: '-5 marks per every 10 min over 100 min' }
    ],
    japa: [
      { cutoff: '08:00', marks: 25, label: 'Before 8:00 AM' },
      { cutoff: '09:00', marks: 20, label: 'Before 9:00 AM' },
      { cutoff: '13:00', marks: 15, label: 'Before 1:00 PM' },
      { cutoff: '15:00', marks: 10, label: 'Before 3:00 PM' },
      { cutoff: '18:00', marks: 5,  label: 'Before 6:00 PM' },
      { cutoff: '21:00', marks: 0,  label: 'Before 9:00 PM' },
      { cutoff: '24:00', marks: -5, label: 'Before 12 AM (−5)' }
    ],
    spBookDailyMarks: 25,
    prescribedHearing: {
      standardHoursDaily: 1,
      marks: 25,
      noteEn: 'Prescribed Lecture Hearing: 1 hour daily (25 marks)',
      noteBn: 'প্রতিদিন ১ ঘণ্টা নির্ধারিত প্রবচন শ্রবণ (২৫ নম্বর)'
    },
    studyAcademics: [
      { cutoff: '120', marks: 25, label: '2 hours or more' },
      { cutoff: '105', marks: 20, label: '1 hr 45 min or more' },
      { cutoff: '90',  marks: 15, label: '1 hr 30 min or more' },
      { cutoff: '60',  marks: 10, label: '1 hour or more' },
      { cutoff: '30',  marks: 5,  label: '30 minutes or more' },
      { cutoff: '0',   marks: 0,  label: 'Less than 30 min' }
    ],
    cleaningMarks: 25,
    followUpMarks: 25,
    btgMarks: 25,
    morningClassMarks: 25,
    sadhanaCardMarks: 25,
    slokaMarks: 25,
    bhajanGayatriMarks: 25
  },
  2: {
    scaleId: 2,
    titleEn: 'Scale Two: Student',
    titleBn: 'স্কেল দুই: ছাত্র ভক্ত',
    targetAudienceEn: 'VOICE Regular Student',
    targetAudienceBn: 'ভয়েসের নিয়মিত ছাত্র ভক্ত',
    toBed: [
      { cutoff: '22:00', marks: 25, label: '10:00 PM or before' },
      { cutoff: '22:15', marks: 20, label: 'Before 10:15 PM' },
      { cutoff: '22:30', marks: 15, label: 'Before 10:30 PM' },
      { cutoff: '22:45', marks: 10, label: 'Before 10:45 PM' },
      { cutoff: '23:00', marks: 5,  label: 'Before 11:00 PM' },
      { cutoff: '23:30', marks: 0,  label: 'Before 11:30 PM (0 marks)' },
      { cutoff: '24:00', marks: -5, label: 'After 11:30 PM' }
    ],
    wakeUp: [
      { cutoff: '04:00', marks: 25, label: '4:00 AM or before' },
      { cutoff: '04:10', marks: 20, label: '4:10 AM or before' },
      { cutoff: '04:15', marks: 15, label: 'Before 4:15 AM' },
      { cutoff: '04:20', marks: 10, label: 'Before 4:20 AM' },
      { cutoff: '04:25', marks: 5,  label: 'Before 4:25 AM' },
      { cutoff: '04:30', marks: 0,  label: '4:30 AM (0 marks)' },
      { cutoff: '05:00', marks: -5, label: 'After 4:30 AM' }
    ],
    daySleep: [
      { cutoff: '30',  marks: 25, label: '30 min or less' },
      { cutoff: '60',  marks: 20, label: '60 min' },
      { cutoff: '70',  marks: 15, label: '70 min' },
      { cutoff: '80',  marks: 10, label: '80 min' },
      { cutoff: '90',  marks: 5,  label: '90 min' },
      { cutoff: '100', marks: 0,  label: '100 min' },
      { cutoff: '200', marks: -5, label: 'Beyond 100 min (−5 per 10 min)', penaltyNote: '-5 marks per every 10 min over 100 min' }
    ],
    japa: [
      { cutoff: '08:00', marks: 25, label: 'Before 8:00 AM' },
      { cutoff: '09:00', marks: 20, label: 'Before 9:00 AM' },
      { cutoff: '13:00', marks: 15, label: 'Before 1:00 PM' },
      { cutoff: '15:00', marks: 10, label: 'Before 3:00 PM' },
      { cutoff: '18:00', marks: 5,  label: 'Before 6:00 PM' },
      { cutoff: '21:00', marks: 0,  label: 'Before 9:00 PM' },
      { cutoff: '24:00', marks: -5, label: 'Before 12 AM (−5)' }
    ],
    spBookDailyMarks: 25,
    prescribedHearing: {
      standardHoursDaily: 1,
      marks: 25,
      noteEn: 'Prescribed Lecture Hearing: 1 hour daily (25 marks)',
      noteBn: 'প্রতিদিন ১ ঘণ্টা নির্ধারিত প্রবচন শ্রবণ (২৫ নম্বর)'
    },
    studyAcademics: [
      { cutoff: '120', marks: 25, label: '2 hours or more' },
      { cutoff: '105', marks: 20, label: '1 hr 45 min or more' },
      { cutoff: '90',  marks: 15, label: '1 hr 30 min or more' },
      { cutoff: '60',  marks: 10, label: '1 hour or more' },
      { cutoff: '30',  marks: 5,  label: '30 minutes or more' },
      { cutoff: '0',   marks: 0,  label: 'Less than 30 min' }
    ],
    cleaningMarks: 25,
    followUpMarks: 25,
    btgMarks: 25,
    morningClassMarks: 25,
    sadhanaCardMarks: 25,
    slokaMarks: 25,
    bhajanGayatriMarks: 25
  },
  3: {
    scaleId: 3,
    titleEn: 'Scale Three: Student (Advanced)',
    titleBn: 'স্কেল তিন: অগ্রসর ছাত্র ভক্ত',
    targetAudienceEn: 'VOICE Student — stronger sadhana & spiritual growth',
    targetAudienceBn: 'উচ্চতর সাধনা অনুশীলনকারী ভয়েস ছাত্র ভক্ত',
    toBed: [
      { cutoff: '21:45', marks: 25, label: '9:45 PM or before' },
      { cutoff: '22:00', marks: 20, label: 'Before 10:00 PM' },
      { cutoff: '22:15', marks: 15, label: 'Before 10:15 PM' },
      { cutoff: '22:30', marks: 10, label: 'Before 10:30 PM' },
      { cutoff: '22:45', marks: 5,  label: 'Before 10:45 PM' },
      { cutoff: '23:00', marks: 0,  label: 'Before 11:00 PM' },
      { cutoff: '23:15', marks: -5, label: 'After 11:15 PM' }
    ],
    wakeUp: [
      { cutoff: '03:45', marks: 25, label: '3:45 AM or before' },
      { cutoff: '04:00', marks: 20, label: 'Before 4:00 AM' },
      { cutoff: '04:15', marks: 15, label: 'Before 4:15 AM' },
      { cutoff: '04:20', marks: 10, label: 'Before 4:20 AM' },
      { cutoff: '04:25', marks: 5,  label: 'Before 4:25 AM' },
      { cutoff: '04:30', marks: 0,  label: 'Before 4:30 AM' },
      { cutoff: '05:00', marks: -5, label: 'After 4:30 AM' }
    ],
    daySleep: [
      { cutoff: '30',  marks: 25, label: '30 min or less' },
      { cutoff: '45',  marks: 20, label: '45 min' },
      { cutoff: '60',  marks: 15, label: '60 min' },
      { cutoff: '61',  marks: 14, label: '61 min' },
      { cutoff: '62',  marks: 13, label: '62 min' },
      { cutoff: '63',  marks: 12, label: '63 min' },
      { cutoff: '200', marks: 0,  label: 'Beyond 60 min (−1 mark per min)', penaltyNote: '-1 mark per minute beyond 60 min. ONE HOUR bonus day sleep free for long journey.' }
    ],
    japa: [
      { cutoff: '08:00', marks: 25, label: 'Before 8:00 AM' },
      { cutoff: '09:00', marks: 20, label: 'Before 9:00 AM' },
      { cutoff: '13:00', marks: 15, label: 'Before 1:00 PM' },
      { cutoff: '15:00', marks: 10, label: 'Before 3:00 PM' },
      { cutoff: '18:00', marks: 5,  label: 'Before 6:00 PM' },
      { cutoff: '21:00', marks: 0,  label: 'Before 9:00 PM' },
      { cutoff: '24:00', marks: -5, label: 'Before 12 AM (−5)' }
    ],
    spBookDailyMarks: 25,
    prescribedHearing: {
      spWeeklyQuotaMin: 60,
      guruWeeklyQuotaMin: 60,
      marks: 25,
      noteEn: 'Prescribed Lecture Hearing: 1 Srila Prabhupada + 1 Gurumaharaj per week (25 marks)',
      noteBn: 'সাপ্তাহিক: ১টি শ্রীল প্রভুপাদ + ১টি গুরুমহারাজের প্রবচন (২৫ নম্বর)'
    },
    studyAcademics: [
      { cutoff: '120', marks: 25, label: '2 hours or more' },
      { cutoff: '105', marks: 20, label: '1 hr 45 min or more' },
      { cutoff: '90',  marks: 15, label: '1 hr 30 min or more' },
      { cutoff: '60',  marks: 10, label: '1 hour or more' },
      { cutoff: '30',  marks: 5,  label: '30 minutes or more' },
      { cutoff: '0',   marks: 0,  label: 'Less than 30 min' }
    ],
    cleaningMarks: 25,
    followUpMarks: 25,
    btgMarks: 25,
    morningClassMarks: 25,
    sadhanaCardMarks: 25,
    slokaMarks: 25,
    bhajanGayatriMarks: 25
  },
  4: {
    scaleId: 4,
    titleEn: 'Scale Four: Student (Senior / Ashramite)',
    titleBn: 'স্কেল চার: সিনিয়র ছাত্র ভক্ত / আশ্রমী',
    targetAudienceEn: 'Senior student, leader, counselor or full-time brahmachari candidate',
    targetAudienceBn: 'সিনিয়র ভক্ত, লিডার, কাউন্সেলর বা পূর্ণকালীন ব্রহ্মচারী প্রত্যাশী',
    toBed: [
      { cutoff: '21:30', marks: 25, label: '9:30 PM or before' },
      { cutoff: '22:00', marks: 15, label: 'Before 10:00 PM' },
      { cutoff: '22:15', marks: 10, label: 'Before 10:15 PM' },
      { cutoff: '22:30', marks: 5,  label: 'Before 10:30 PM' },
      { cutoff: '22:45', marks: 0,  label: 'Before 10:45 PM' },
      { cutoff: '23:30', marks: -5, label: 'After 10:45 PM' }
    ],
    wakeUp: [
      { cutoff: '03:30', marks: 25, label: '3:30 AM or before' },
      { cutoff: '03:45', marks: 20, label: 'Before 3:45 AM' },
      { cutoff: '04:00', marks: 15, label: 'Before 4:00 AM' },
      { cutoff: '04:15', marks: 10, label: 'Before 4:15 AM' },
      { cutoff: '04:20', marks: 5,  label: 'Before 4:20 AM' },
      { cutoff: '04:30', marks: 0,  label: 'Before 4:30 AM' },
      { cutoff: '05:00', marks: -5, label: 'After 4:30 AM' }
    ],
    daySleep: [
      { cutoff: '30',  marks: 25, label: '30 min or less' },
      { cutoff: '45',  marks: 20, label: '45 min' },
      { cutoff: '60',  marks: 15, label: '60 min' },
      { cutoff: '61',  marks: 14, label: '61 min' },
      { cutoff: '62',  marks: 13, label: '62 min' },
      { cutoff: '63',  marks: 12, label: '63 min' },
      { cutoff: '200', marks: 0,  label: 'Beyond 60 min (−1 mark per min)', penaltyNote: '-1 mark per minute beyond 60 min. ONE HOUR bonus day sleep free for long journey.' }
    ],
    japa: [
      { cutoff: '08:00', marks: 25, label: 'Before 8:00 AM' },
      { cutoff: '09:00', marks: 20, label: 'Before 9:00 AM' },
      { cutoff: '13:00', marks: 15, label: 'Before 1:00 PM' },
      { cutoff: '15:00', marks: 10, label: 'Before 3:00 PM' },
      { cutoff: '18:00', marks: 5,  label: 'Before 6:00 PM' },
      { cutoff: '21:00', marks: 0,  label: 'Before 9:00 PM' },
      { cutoff: '24:00', marks: -5, label: 'Before 12 AM (−5)' }
    ],
    spBookDailyMarks: 25,
    prescribedHearing: {
      spWeeklyQuotaMin: 100,
      guruWeeklyQuotaMin: 100,
      otherQuotaMin: 50,
      guruMarks: 75,
      spMarks: 75,
      otherMarks: 20,
      penaltyPer5MinLess: 2,
      marks: 25,
      noteEn: 'Weekly Sravan: Guru Mah 100+ min (75 pts) + SP 100+ min (75 pts) + Other 50+ min (20 pts). −2 marks per 5 min less. Alternatively: use SP/Guru slot instead of Other.',
      noteBn: 'সাপ্তাহিক শ্রবণ: গুরুমহারাজ ১০০+ মিনিট (৭৫ নম্বর) + শ্রীল প্রভুপাদ ১০০+ মিনিট (৭৫ নম্বর) + অন্যান্য ৫০+ মিনিট (২০ নম্বর)। প্রতি ৫ মিনিট কম হলে ২ নম্বর কাটা।'
    },
    studyAcademics: [
      { cutoff: '120', marks: 25, label: '2 hours or more' },
      { cutoff: '105', marks: 20, label: '1 hr 45 min or more' },
      { cutoff: '90',  marks: 15, label: '1 hr 30 min or more' },
      { cutoff: '60',  marks: 10, label: '1 hour or more' },
      { cutoff: '30',  marks: 5,  label: '30 minutes or more' },
      { cutoff: '0',   marks: 0,  label: 'Less than 30 min' }
    ],
    cleaningMarks: 25,
    followUpMarks: 25,
    btgMarks: 25,
    morningClassMarks: 25,
    sadhanaCardMarks: 25,
    slokaMarks: 25,
    bhajanGayatriMarks: 25
  }
};

export const SADHANA_PHILOSOPHY = {
  whySadhanaCard: {
    titleEn: 'Why Sadhana Card?',
    titleBn: 'কেন সাধনা কার্ড?',
    introEn: 'Bhakti is a matter of devotion and consciousness, so why show it on paper with pen? This question is often heard. First, we must understand that Bhakti is a science. Following the specific authorized process awards pure Krishna Prema as the result. But by which process? Following the path displayed by previous Acharyas, this entire sadhana card is prepared according to the Bhakti Pyramid of Srila Bhaktivinod Thakur. He emphasized health, sadhana, and seva. In the exact same way, this sadhana card ensures bodily health, sadhana for the soul, and accountability in devotional service. The Supreme Personality of Godhead, Lord Sri Krishna, in Bhagavad-gita has also recognized this regulated lifestyle as the remedy for material distress: Yuktahara viharasya bhavati dukha-ha (BG 6.17).',
    introBn: 'ভক্তি তো ভাবের ব্যাপার, কাগজ কলমে দেখাতে হবে কেন? প্রায়শই এ প্রশ্ন শোনা যায়। প্রথমেই বুঝতে হবে ভক্তি হচ্ছে একটি বিজ্ঞান। নির্দিষ্ট প্রক্রিয়া অনুসরণ করলে ফলস্বরূপ কৃষ্ণপ্রেম লাভ করা যাবে। কিন্তু কোন প্রক্রিয়ায়? পূর্বতন আচার্যবৃন্দ প্রদর্শিত পন্থায় সম্পূর্ণ সাধনাপত্রটি শ্রীল ভক্তিবিনোদ ঠাকুরের ভক্তি পিরামিড অনুসারে প্রস্তুতকৃত। তিনি স্বাস্থ্য, সাধনা, সেবার উপর জোরারোপ করেছেন। একইভাবে এই সাধনাপত্রে দেহের সুস্থতা, আত্মার জন্য সাধনা এবং সেবার জবাবদিহিতা নিশ্চিত করা হয়েছে। ভগবান শ্রীকৃষ্ণও ভগবদ্গীতায় এই ধরনের নিয়মিত জীবনযাপন প্রণালীকে দুঃখ নিবৃত্তির উপায়রূপে স্বীকৃতি দিয়েছেন। যুক্তাহার বিহারস্য ভবতি দুঃখহা (ভগবদ্গীতা ৬.১৭)',
    verse: 'যুক্তাহারবিহারস্য যুক্তচেষ্টস্য কর্মসু । যুক্তস্বপ্নাববোধস্য যোগো ভবতি দুঃখহা ॥ (ভগবদ্গীতা ৬.১৭)',
    pointsEn: [
      '1. Accountability is the prerequisite for good governance. Therefore, accountability through the sadhana card is essential to maintain discipline in the devotee community.',
      '2. We have surely seen people who pass away suddenly. Though appearing disease-free from outside, some fatal illness had destroyed their vital organs. Had a medical report been prepared, the disease would have been detected. The sadhana card is like a spiritual medical report that reveals the latest status of our chronic material disease.',
      '3. "Our advancement does not come merely from our own sadhana; when Guru and Vaishnavas are pleased seeing our sadhana, only then do we advance." — HH Jayapataka Swami. Vaishnavas, as representatives of Gurudeva, wish to know our overall situation through this card — can we not do even this little for them?',
      '4. Living a balanced lifestyle keeps our mind stable and serene. Consequently, we can give our maximum concentration to any endeavor, which is the prerequisite for success.',
      '5. Irregulated lifestyle is the root cause of all diseases. The sadhana card extracts us from the vicious cycle of irregular living.',
      '6. Fulfilling the commitments of the sadhana card leaves no vacant time for anarthas like prajalpa (idle talk), vaishnava-ninda (criticism), or excessive sleep. Thus our bhakti remains well protected.'
    ],
    pointsBn: [
      '১. সুশাসনের পূর্বশর্ত হলো জবাবদিহিতা। তাই ভক্তসমাজে নিয়মশৃঙ্খলা বজায় রাখতে সাধনাপত্ররূপী জবাবদিহিতা অত্যাবশ্যক।',
      '২. হঠাৎ করেই দেহ রেখেছে এমন লোককে নিশ্চয়ই আমরা দেখেছি। আপাত দৃষ্টিতে নীরোগ মনে হলেও কোন ঘাতক রোগ শরীরের যন্ত্রাংশকে ধ্বংস করে দিয়েছে। তবে মেডিকেল রিপোর্ট তৈরি করা হলে রোগটি নিশ্চয়ই ধরা পড়ত। সাধনাপত্রও মেডিকেল রিপোর্টের মতো যা আমাদের দীর্ঘসময়ের পুরাতন ভবরোগের সর্বশেষ পরিস্থিতি তুলে ধরবে।',
      '৩. আমাদের সাধনা দিয়ে আমাদের উন্নতি হয় না, যখন সেই সাধনা দেখে গুরু-বৈষ্ণব সন্তুষ্ট হন তখনই আমাদের উন্নতি হয়। ---শ্রীল জয়পতাকা স্বামী। গুরুদেবের প্রতিনিধি রূপে বৈষ্ণবরা সাধনাপত্রের মাধ্যমে আমাদের সার্বিক পরিস্থিতি জানতে চাইছেন, আমরা কি এই সামান্যটুকু করতে পারব না?',
      '৪. ভারসাম্যপূর্ণ জীবনযাপন করলে আমাদের মনও স্থিতিশীল অবস্থায় থাকবে। ফলে যে কোনো কাজে সর্বোচ্চ মনোযোগ দিতে পারব যা সাফল্যের পূর্বশর্ত।',
      '৫. অনিয়মিত জীবনযাপনই সমস্ত রোগের মূল কারণ। সাধনাপত্র আমাদেরকে এই অনিয়মিত জীবনযাপনের চক্র থেকে বের করবে।',
      '৬. সাধনাপত্রের শর্তসমূহ পূরণ করতে গিয়ে দেখা যাবে প্রজল্প, বৈষ্ণব নিন্দা, অতিরিক্ত ঘুম প্রভৃতি অনর্থসমূহের জন্য কোনো অবশিষ্ট সময় থাকবে না। ফলে আমাদের ভক্তি থাকবে সুরক্ষিত।'
    ]
  },
  counselorResponsibilities: {
    titleEn: "Counselor's Core Responsibilities",
    titleBn: 'কাউন্সিলরের দায়িত্ব',
    rulesEn: [
      '1. First and foremost, be diligent in your own sadhana and show your card regularly to your counselor.',
      '2. Action speaks louder than words ("কথার চেয়ে কাজের জোর বেশী"). If our conduct and sadhana are exemplary, they effortlessly inspire ourselves and those under our care.',
      '3. Do not stay awake late at night unless required for preaching or special circumstances. Otherwise, attending the morning program on time will be difficult, and the potency of our words will diminish.',
      '4. Inspect counselees\' sadhana cards weekly and provide necessary guidance. The advice must be clear, acceptable, and practically actionable.',
      '5. Do not force, rather encourage and inspire. Encouragement makes difficult things easy, whereas force only ruins relationships.',
      '6. When inspecting scripture reading and lecture hearing, check their notes, sign regularly, and listen to their realizations. Tendency to cheat (vipralipsa) exists in everyone, so remain vigilant.',
      '7. Follow this care hierarchy strictly: a) Health -> b) Academics/Job -> c) Sadhana -> d) Seva. Exclusive advancement in sadhana or exclusive advancement in academics alone is not desirable.',
      '8. Assign services considering individual capacity, busyness, and circumstances. Comparing ("If he can do it, why can\'t you?") breeds inferiority complex. Give guidance considering each person\'s unique situation.',
      '9. Immediately praise any good quality in a devotee; this earns the spiritual right to gently correct them. Mere correction without praise damages relationships! Use the Sandwich Feedback Method.',
      '10. Pray regularly before the Deities for the devotees under your care. It was by the earnest prayer of Gopinath Acharya that his brother-in-law Sarvabhauma Bhattacharya attained Mahaprabhu\'s mercy.'
    ],
    rulesBn: [
      '১. সর্বপ্রথমে নিজের সাধনায় যত্নবান হউন এবং নিয়মিতভাবে আপনার কাউন্সিলরের কাছে সাধনাপত্র দেখান।',
      '২. Action speaks louder than words বা “কথার চেয়ে কাজের জোর বেশী।” আমাদের আচরণ এবং সাধনা যদি আদর্শস্থানীয় হয় তবে তা সহজেই আমাদের ও অধীনস্থদের উপর রেখাপাত করবে।',
      '৩. প্রচারের প্রয়োজনে ও বিশেষ পরিস্থিতি ছাড়া অধিক রাত পর্যন্ত জেগে থাকবেন না। নচেৎ ঠিক সময়ে সকালের কার্যক্রমে যোগদান করাটা কষ্টকর হবে। ফলে আমাদের কথার শক্তিও স্তিমিত হবে।',
      '৪. প্রতি সপ্তাহে অধীনস্থ ভক্তদের সাধনাপত্র দেখুন এবং প্রয়োজনীয় পরামর্শ দিন। পরামর্শগুলো হবে সুস্পষ্ট, গ্রহণযোগ্য এবং পালনীয়।',
      '৫. জোর করবেন না বরং উৎসাহ প্রদান করুন। উৎসাহ প্রদানের ফলে অনেক কঠিন বিষয়ও সহজ হয়। অন্যদিকে জোর করার ফলে কেবল সম্পর্কই নষ্ট হয়।',
      '৬. গ্রন্থ অধ্যয়ন, প্রবচন শ্রবণের ক্ষেত্রে নোট দেখুন, নিয়মিত স্বাক্ষর করুন এবং উপলব্ধি সমূহ শ্রবণ করুন। বিপ্রলিপ্সা বা প্রতারণার প্রবণতা সবার আছে। তাই সতর্ক হোন।',
      '৭. যত্ন নেয়ার ক্ষেত্রে নিম্নোক্ত ক্রমটি অনুসরণ করুন : ক) স্বাস্থ্য খ) লেখাপড়া গ) সাধনা ঘ) সেবা। শুধু সাধনাই উন্নতি বা শুধু লেখাপড়ার উন্নতি কোনটিই কাম্য নয়।',
      '৮. যোগ্যতা, ব্যস্ততা এবং পরিস্থিতি বিবেচনা করে সেবায় নিযুক্ত করুন। “ও এটা পারলে তুমি পারবে না কেন?” এই ধরনের তুলনা হীনমন্যতার জন্ম দেয়। তাই প্রত্যেকের বিশেষ পরিস্থিতি বিবেচনা করে নির্দেশ দিন।',
      '৯. অধীনস্থ ভক্তদের যেকোনো ভালগুণের তৎক্ষণাৎ প্রশংসা করুন, এর ফলে সংশোধন করার অধিকার জন্মাবে। শুধুমাত্র সংশোধনের ফলে সম্পর্ক নষ্ট হয়! সংশোধনের ক্ষেত্রে স্যান্ডউইচ ফিডব্যাক নীতি ব্যবহার করুন।',
      '১০. নিয়মিতভাবে অধীনস্থ ভক্তদের জন্য শ্রীবিগ্রহের কাছে প্রার্থনা করুন। কেবল গোপীনাথ আচার্যের প্রার্থনার ফলে তার শ্যালক সার্বভৌম ভট্টাচার্য মহাপ্রভুর কৃপালাভে করেছিলেন।'
    ]
  },
  counseleeResponsibilities: {
    titleEn: "Counselee's Responsibilities & Principles",
    titleBn: 'কাউন্সিলির দায়িত্ব',
    rulesEn: [
      '1. First realize that this sadhana card is solely for your own spiritual advancement; your counselor or mentor has no personal interest in it. Fill it self-initiatively and submit reports.',
      '2. Filling it every night before sleep is an excellent practice. Alternatively, it can be filled the next morning. But filling it hurriedly at the end of the week or only when the mentor asks is hazardous. Escape this toxic cycle.',
      '3. Stagnant ditch water spoils easily, but flowing river water never spoils. Always endeavor to elevate your sadhana standard. Initially devotees may have accommodated 5:00 AM rising or 8 rounds of japa, but remaining complacent there will leave us spiritually deprived. Strive for the ideal standard.',
      '4. In whatever way correction is offered, accept it humbly and be prepared to improve ourselves.',
      '5. Study diligently for academics and prepare for competitive exams such as BCS, Bank Jobs, etc.',
      '6. Whenever studying scriptures or hearing lectures, listen attentively and take active notes so the subject matter is deeply assimilated.',
      '7. Always remember the 4 Classes of Disciples:\n   ▪ 1st Class: Understands the heart and desire of Guru and Vaishnavas and acts accordingly.\n   ▪ 2nd Class: Enthusiastically endeavors to execute instructions upon receiving them from Guru and Vaishnavas.\n   ▪ 3rd Class: Endeavors to follow instructions but lacks enthusiasm.\n   ▪ 4th Class: Has neither enthusiasm nor endeavor to follow instructions.\n   * We should strive to be at least 2nd Class disciples.',
      '8. "One who doesn\'t preach cannot advance in Krishna Consciousness." From this instruction of Srila Prabhupada, we understand how vital preaching is for advancement. Try your utmost within your capacity.'
    ],
    rulesBn: [
      '১. প্রথমে অনুধাবন করুন এই সাধনা পত্রটি কেবল আমার উন্নতি বিধানের জন্য, এতে আমার কাউন্সিলর বা নির্দেশকের কোনো স্বার্থ নেই। তাই স্ব উদ্যোগে পূরণ করুন এবং রিপোর্ট দিন।',
      '২. প্রতিদিন রাত্রে নিদ্রার পূর্বে পূরণ করার নীতিটি খুব ভাল। অথবা পরের দিন সকালে পূরণ করা যেতে পারে। কিন্তু সপ্তাহ শেষে বা নির্দেশক ভক্ত এসে সাধনাপত্র খুঁজলেই কেবল পূরণ করার মানসিকতাটি ভয়াবহ। এই বিষাক্ত চক্র থেকে বের হোন।',
      '৩. ডোবার জল খুব সহজেই নষ্ট হয় কিন্তু নদীর গতিশীল জল কখনো নষ্ট হয় না। তাই সর্বদাই চেষ্টা করুন কিভাবে আরো উন্নত হওয়া যায়। প্রাথমিক পর্যায়ে ভক্তরা হয়তো আমাদের ৫টায় সকালের কার্যক্রমে যোগদান করা বা ৮ মালা জপ করা প্রভৃতি সুযোগ দিয়েছেন কিন্তু তাতে সন্তুষ্ট হয়ে থাকলে আমরা ঠকে যাব। আমাদের উচিত আদর্শ মানে আসা।',
      '৪. যেভাবেই আমাদেরকে সংশোধনী দেয়া হোক না কেন আমরা যেন তা গ্রহণ করে নিজেদেরকে উন্নত করতে প্রস্তুত থাকি।',
      '৫. নিয়মিত লেখাপড়া করুন এবং প্রতিযোগিতামূলক পরীক্ষা যেমন-বিসিএস, ব্যাংক জব প্রভৃতির জন্যও প্রস্তুতি রাখুন।',
      '৬. যখনই গ্রন্থ অধ্যয়ন করব বা প্রবচন শ্রবণ করব, আমরা যেন মনোযোগের সাথে শ্রবণ করি অর্থাৎ নোট করি এর ফলে আমরা ভালভাবে বিষয়টি আত্মস্থ করতে পারব।',
      '৭. চার ধরনের শিষ্যের কথা সর্বদা স্মরণ রাখুন:\n   ▪ প্রথম শ্রেণী--গুরুদেব ও বৈষ্ণবদের মনোভিলাষ জেনে সে অনুসারে কাজ করে।\n   ▪ দ্বিতীয় শ্রেণী--গুরু-বৈষ্ণবদের নির্দেশ পাওয়ার পর তা পালন করার জন্য উৎসাহ সহকারে প্রচেষ্টা করে।\n   ▪ তৃতীয় শ্রেণী--নির্দেশ পালনের জন্য প্রচেষ্টা করে কিন্তু উৎসাহ নেই।\n   ▪ চতুর্থ শ্রেণী--নির্দেশ পালনে উৎসাহও নেই, প্রচেষ্টাও নেই।\n   * আমাদের অন্তঃপক্ষে দ্বিতীয় শ্রেণীর শিষ্য হওয়ার প্রচেষ্টা করা উচিত।',
      '৮. One who don\'t preach, can not advance in Krisna Consciousness. যে প্রচার করে না সে কৃষ্ণভাবনায় উন্নত হতে পারে না। --- শ্রীল প্রভুপাদের এই কথা থেকে আমরা বুঝতে পারি উন্নতির জন্য প্রচার কতটা আবশ্যক। তাই সাধ্যের মধ্যে সর্বোচ্চ চেষ্টা করুন।'
    ]
  },
  howToFillUp: {
    titleEn: 'How to Fill Up the Sadhana Card',
    titleBn: 'কিভাবে পূরণ করব',
    stepsEn: [
      '1. Determine your scale according to your counselor\'s guidance. Fill daily and at week\'s end sum the marks to calculate percentage. For example, if total marks is 150 out of 175, percentage will be 150/175 = 86% (or 85% as per physical lookup table).',
      '2. Calculate average percentage by section. For example, Body % average = (to bed% + get up% + day rest%) / 3. Soul % average = (japa finishing% + sp book study% + lecture hearing%) / 3.',
      '3. For Seva, record duration or tangible outcome. For example, duration of book distribution or number of books distributed, etc.'
    ],
    stepsBn: [
      '১. কাউন্সিলর প্রদত্ত নির্দেশনা অনুসারে আপনার স্তর নির্ধারণ করুন। প্রতিদিন পূরণ করুন এবং সপ্তাহ শেষে যোগ করুন ও শতকরা নির্ণয় করুন। যেমন যোগফল যদি ১৫০ হয় এবং পূর্ণমান ১৭৫ হলে, শতকরা হবে ১৫০/১৭৫ বা ৮৬%।',
      '২. বিভাগ অনুযায়ী গড় নির্ণয় করুন। যেমন Body % এর গড় হলো (to bed + get up + day rest) / 3. Soul = (japa finishing + sp book study + lecture hearing)/3.',
      '৩. সেবার ক্ষেত্রে সময় লিখুন অথবা ফলাফল লিখুন। যেমন গ্রন্থ বিতরণ কতক্ষণ করেছেন বা কয়টি করেছেন ইত্যাদি।'
    ]
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// 175 MATRIX SCORE & % CONVERSION TABLE (Directly printed on physical card)
// ─────────────────────────────────────────────────────────────────────────────
export const SCORE_175_CONVERSION_TABLE: Array<{ score: number; pct: number }> = [
  { score: 175, pct: 100 },
  { score: 170, pct: 97 },
  { score: 165, pct: 94 },
  { score: 160, pct: 91 },
  { score: 155, pct: 88 },
  { score: 150, pct: 85 },
  { score: 145, pct: 82 },
  { score: 140, pct: 80 },
  { score: 135, pct: 77 },
  { score: 130, pct: 74 },
  { score: 125, pct: 71 },
  { score: 120, pct: 68 },
  { score: 115, pct: 65 },
  { score: 110, pct: 62 },
  { score: 105, pct: 60 },
  { score: 100, pct: 57 },
  { score: 95,  pct: 54 },
  { score: 90,  pct: 51 },
  { score: 85,  pct: 48 },
  { score: 80,  pct: 45 },
  { score: 75,  pct: 42 },
  { score: 70,  pct: 40 },
  { score: 65,  pct: 37 },
  { score: 60,  pct: 34 },
  { score: 55,  pct: 31 },
  { score: 50,  pct: 28 },
  { score: 45,  pct: 25 },
  { score: 40,  pct: 22 },
  { score: 35,  pct: 20 },
  { score: 30,  pct: 17 },
  { score: 25,  pct: 14 },
  { score: 20,  pct: 11 },
  { score: 15,  pct: 8 },
  { score: 10,  pct: 5 },
  { score: 5,   pct: 2 }
];

/**
 * Converts weekly total score (out of 175 max per column) to percentage using the official floor rule.
 */
export function convertScoreTo175Pct(score: number): number {
  if (score <= 0) return 0;
  if (score >= 175) return 100;
  return Math.floor((score / 175) * 100);
}
