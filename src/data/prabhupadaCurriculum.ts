/**
 * শ্রীল প্রভুপাদের গ্রন্থ অধ্যয়ন তালিকা (Official Fixed Central VOICE Syllabus)
 * Exactly matching the printed physical curriculum card.
 */

export interface CurriculumSemester {
  semesterNumber: number;
  yearLabelBn: string;
  yearLabelEn: string;
  semesterTitleBn: string;
  semesterTitleEn: string;
  books: Array<{
    id: string;
    serial: number;
    titleBn: string;
    titleEn: string;
  }>;
}

export const PRABHUPADA_8_SEMESTER_CURRICULUM: CurriculumSemester[] = [
  {
    semesterNumber: 3,
    yearLabelBn: '২য় বর্ষ',
    yearLabelEn: 'Year 2',
    semesterTitleBn: '২য় বর্ষ (৩য় সেমিস্টার)',
    semesterTitleEn: 'Year 2 (Semester 3)',
    books: [
      { id: 'sem3_1', serial: 1, titleBn: '১. শ্রীকৃষ্ণের সন্ধানে', titleEn: '1. On the Way to Krishna' },
      { id: 'sem3_2', serial: 2, titleBn: '২. অনুপম উপহার', titleEn: '2. The Matchless Gift' },
      { id: 'sem3_3', serial: 3, titleBn: '৩. জন্ম-মৃত্যুর পরপারে', titleEn: '3. Beyond Birth and Death' },
      { id: 'sem3_4', serial: 4, titleBn: '৪. আদর্শ প্রশ্ন আদর্শ উত্তর', titleEn: '4. Perfect Questions, Perfect Answers' },
      { id: 'sem3_5', serial: 5, titleBn: '৫. পুনরাগমন', titleEn: '5. Coming Back: The Science of Reincarnation' },
      { id: 'sem3_6', serial: 6, titleBn: '৬. কৃষ্ণভাবনার অমৃত', titleEn: '6. The Nectar of Krishna Consciousness' },
      { id: 'sem3_7', serial: 7, titleBn: '৭. আত্মজ্ঞান লাভের পন্থা (প্রথম ৫ অধ্যায়)', titleEn: '7. The Science of Self-Realization (Chapters 1-5)' },
    ]
  },
  {
    semesterNumber: 4,
    yearLabelBn: '২য় বর্ষ',
    yearLabelEn: 'Year 2',
    semesterTitleBn: '২য় বর্ষ (৪র্থ সেমিস্টার)',
    semesterTitleEn: 'Year 2 (Semester 4)',
    books: [
      { id: 'sem4_1', serial: 1, titleBn: '১. আত্মজ্ঞান লাভের পন্থা (৬-৮ অধ্যায়)', titleEn: '1. The Science of Self-Realization (Chapters 6-8)' },
      { id: 'sem4_2', serial: 2, titleBn: '২. যেমন কর্ম তেমন ফল', titleEn: '2. The Laws of Nature: An Infallible Justice' },
      { id: 'sem4_3', serial: 3, titleBn: '৩. কিভাবে মৃত্যুকে জয় করবেন?', titleEn: '3. Victory Over Death' },
      { id: 'sem4_4', serial: 4, titleBn: '৪. ঈশোপনিষদ (মন্ত্র ১-১০)', titleEn: '4. Sri Isopanisad (Mantras 1-10)' },
      { id: 'sem4_5', serial: 5, titleBn: '৫. লীলা পুরুষোত্তম শ্রীকৃষ্ণ (১-২১ অধ্যায়)', titleEn: '5. Krsna: The Supreme Personality of Godhead (Chapters 1-21)' },
    ]
  },
  {
    semesterNumber: 5,
    yearLabelBn: '৩য় বর্ষ',
    yearLabelEn: 'Year 3',
    semesterTitleBn: '৩য় বর্ষ (৫ম সেমিস্টার)',
    semesterTitleEn: 'Year 3 (Semester 5)',
    books: [
      { id: 'sem5_1', serial: 1, titleBn: '১. জীবন আসে জীবন থেকে', titleEn: '1. Life Comes from Life' },
      { id: 'sem5_2', serial: 2, titleBn: '২. জীবন জিজ্ঞাসা', titleEn: '2. Inquiry into Life' },
      { id: 'sem5_3', serial: 3, titleBn: '৩. কুন্তিদেবীর শিক্ষা', titleEn: '3. Teachings of Queen Kunti' },
      { id: 'sem5_4', serial: 4, titleBn: '৪. কপিল শিক্ষামৃত', titleEn: '4. Teachings of Lord Kapila' },
      { id: 'sem5_5', serial: 5, titleBn: '৫. উপদেশামৃত (১-৬ শ্লোক)', titleEn: '5. The Nectar of Instruction (Verses 1-6)' },
      { id: 'sem5_6', serial: 6, titleBn: '৬. শ্রীমদ্ভগবদ্গীতা যথাযথ (১-৬ অধ্যায়)', titleEn: '6. Bhagavad-gita As It Is (Chapters 1-6)' },
      { id: 'sem5_7', serial: 7, titleBn: '৭. লীলা পুরুষোত্তম শ্রীকৃষ্ণ (২২-৩৪ অধ্যায়)', titleEn: '7. Krsna: The Supreme Personality of Godhead (Chapters 22-34)' },
    ]
  },
  {
    semesterNumber: 6,
    yearLabelBn: '৩য় বর্ষ',
    yearLabelEn: 'Year 3',
    semesterTitleBn: '৩য় বর্ষ (৬ষ্ঠ সেমিস্টার)',
    semesterTitleEn: 'Year 3 (Semester 6)',
    books: [
      { id: 'sem6_1', serial: 1, titleBn: '১. উপদেশামৃত (৭-১১ শ্লোক)', titleEn: '1. The Nectar of Instruction (Verses 7-11)' },
      { id: 'sem6_2', serial: 2, titleBn: '২. হরেকৃষ্ণ চ্যালেঞ্জ', titleEn: '2. The Hare Krishna Challenge' },
      { id: 'sem6_3', serial: 3, titleBn: '৩. কৃষ্ণভক্তি সর্বোত্তম বিজ্ঞান', titleEn: '3. Devotion to Lord Krishna: The Topmost Science' },
      { id: 'sem6_4', serial: 4, titleBn: '৪. শ্রীমদ্ভগবদ্গীতা যথাযথ (৭-১২ অধ্যায়)', titleEn: '4. Bhagavad-gita As It Is (Chapters 7-12)' },
      { id: 'sem6_5', serial: 5, titleBn: '৫. শ্রীচৈতন্য মহাপ্রভুর শিক্ষা', titleEn: '5. Teachings of Lord Caitanya' },
      { id: 'sem6_6', serial: 6, titleBn: '৬. শ্রীমদ্ভাগবত (১ম স্কন্ধ) (১-৬ অধ্যায়)', titleEn: '6. Srimad-Bhagavatam Canto 1 (Chapters 1-6)' },
      { id: 'sem6_7', serial: 7, titleBn: '৭. লীলা পুরুষোত্তম শ্রীকৃষ্ণ (৩৫-৫৯ অধ্যায়)', titleEn: '7. Krsna: The Supreme Personality of Godhead (Chapters 35-59)' },
    ]
  },
  {
    semesterNumber: 7,
    yearLabelBn: '৪র্থ বর্ষ',
    yearLabelEn: 'Year 4',
    semesterTitleBn: '৪র্থ বর্ষ (৭ম সেমিস্টার)',
    semesterTitleEn: 'Year 4 (Semester 7)',
    books: [
      { id: 'sem7_1', serial: 1, titleBn: '১. শ্রীমদ্ভগবদ্গীতা যথাযথ (১৩-১৮ অধ্যায়)', titleEn: '1. Bhagavad-gita As It Is (Chapters 13-18)' },
      { id: 'sem7_2', serial: 2, titleBn: '২. শ্রীমদ্ভাগবত (১ম স্কন্ধ) (৭-১৩ অধ্যায়)', titleEn: '2. Srimad-Bhagavatam Canto 1 (Chapters 7-13)' },
      { id: 'sem7_3', serial: 3, titleBn: '৩. লীলা পুরুষোত্তম শ্রীকৃষ্ণ (৬০-৭৮ অধ্যায়)', titleEn: '3. Krsna: The Supreme Personality of Godhead (Chapters 60-78)' },
    ]
  },
  {
    semesterNumber: 8,
    yearLabelBn: '৪র্থ বর্ষ',
    yearLabelEn: 'Year 4',
    semesterTitleBn: '৪র্থ বর্ষ (৮ম সেমিস্টার)',
    semesterTitleEn: 'Year 4 (Semester 8)',
    books: [
      { id: 'sem8_1', serial: 1, titleBn: '১. শ্রীমদ্ভাগবত (১ম স্কন্ধ) (১৪-১৯ অধ্যায়)', titleEn: '1. Srimad-Bhagavatam Canto 1 (Chapters 14-19)' },
      { id: 'sem8_2', serial: 2, titleBn: '২. লীলা পুরুষোত্তম শ্রীকৃষ্ণ (৭৯-৮৯ অধ্যায়)', titleEn: '2. Krsna: The Supreme Personality of Godhead (Chapters 79-89)' },
    ]
  }
];

// Flat list of all curriculum books in exact sequence
export const ALL_CURRICULUM_BOOKS = PRABHUPADA_8_SEMESTER_CURRICULUM.flatMap((sem) =>
  sem.books.map((b) => ({
    id: b.id,
    serial: b.serial,
    titleEn: b.titleEn,
    titleBn: b.titleBn,
    semesterNumber: sem.semesterNumber,
    semesterLabelEn: sem.semesterTitleEn,
    semesterLabelBn: sem.semesterTitleBn
  }))
);

// Srila Prabhupada quote from bottom of page
export const PRABHUPADA_CURRICULUM_QUOTE = {
  quoteBn: "তোমরা আমাদের গ্রন্থসমূহ অত্যন্ত যত্ন সহকারে পাঠ ও অধ্যয়ন করছ জেনে আমি খুব সন্তুষ্ট হয়েছি। তোমাদের অনেক ধন্যবাদ। কেবল আমার ওপর প্রচার নির্ভর করে না। আমার সকল শিষ্যদের ভাল প্রচারক হতে হবে। নিষ্ঠা সহকারে গ্রন্থ অধ্যয়নের ওপর তা নির্ভর করে। কারণ এর মাধ্যমে তোমরা সঠিক সিদ্ধান্ত উপনীত হতে পারবে।",
  sourceBn: "হৃদয়ানন্দকে পত্র ৫ জুলাই ১৯৭১",
  quoteEn: "I am very pleased to know that you are reading and studying our books very carefully. Thank you very much. Preaching does not depend on me alone; all my disciples must become good preachers. That depends on sincere study of our books, because through this you will be able to arrive at the correct conclusions.",
  sourceEn: "Letter to Hridayananda, 5 July 1971"
};
