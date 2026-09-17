import type { CounseleeProfile } from '../types/sadhana';

export const PRIMARY_COUNSELOR = {
  name: 'HG Rashbihari Krishna Chandra Das Brahmachari',
  nameBn: 'শ্রীপাদ রাসবিহারী কৃষ্ণ চন্দ্র দাস ব্রহ্মচারী',
  titleEn: 'Counselor, Central VOICE & Senior Preacher, IYF Chittagong',
  titleBn: 'কাউন্সেলর, সেন্ট্রাল ভয়েস ও সিনিয়র প্রচারক, আইওয়াইএফ চট্টগ্রাম',
  avatar: '/assets/srila_prabhupada_white.png'
};

export const COUNSELORS_LIST = [
  'HG Rashbihari Krishna Chandra Das Brahmachari',
  'HG Raghav Kirtan Das',
  'HG Radheshyam Das',
  'Custom (অন্যান্য)'
];

export const INITIAL_COUNSELEES: CounseleeProfile[] = [
  {
    id: 'counselee_1',
    name: 'Gian Juti Tripura',
    nameBn: 'জ্ঞান জ্যোতি ত্রিপুরা',
    spiritualName: 'Gianjyoti Das',
    spiritualNameBn: 'জ্ঞানজ্যোতি দাস',
    phone: '+8801571328549',
    email: 'gianjuti.csecu@gmail.com',
    roomNo: 'Room 302',
    department: 'Computer Science & Engineering',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3', 'course_4', 'course_5'],
    completedCamps: ['camp_1', 'camp_2', 'camp_3', 'camp_4', 'camp_5'],
    spiritualTitle: 'Bhakti Shastri Aspirant & Study Care Lead',
    joinDate: '2022-03-15'
  },
  {
    id: 'counselee_2',
    name: 'Utpol Das Khocon',
    nameBn: 'উৎপল দাস খোকন',
    spiritualName: 'Utpala Gauranga Das',
    spiritualNameBn: 'উৎপল গৌরাঙ্গ দাস',
    phone: '+8801812345678',
    email: 'utpol.voice@gmail.com',
    roomNo: 'Room 201',
    department: 'Mathematics',
    institution: 'University of Chittagong',
    scaleId: 3,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3', 'course_4'],
    completedCamps: ['camp_1', 'camp_2', 'camp_3'],
    spiritualTitle: 'Sadhana Acharya',
    joinDate: '2021-11-10'
  },
  {
    id: 'counselee_3',
    name: 'Chaitanya Das',
    nameBn: 'চৈতন্য দাস',
    spiritualName: 'Chaitanya Das',
    spiritualNameBn: 'চৈতন্য দাস',
    phone: '+8801712345679',
    roomNo: 'Room 202',
    department: 'Physics',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3'],
    completedCamps: ['camp_1', 'camp_2'],
    spiritualTitle: 'Kirtan Seva Lead',
    joinDate: '2023-01-20'
  },
  {
    id: 'counselee_4',
    name: 'Pranto C Das',
    nameBn: 'প্রান্ত চন্দ্র দাস',
    spiritualName: 'Prananatha Das',
    spiritualNameBn: 'প্রাণনাথ দাস',
    phone: '+8801612345680',
    roomNo: 'Room 302',
    department: 'Computer Science & Engineering',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3', 'course_4'],
    completedCamps: ['camp_1', 'camp_2', 'camp_3'],
    spiritualTitle: 'Study Care Co-Lead',
    joinDate: '2022-08-14'
  },
  {
    id: 'counselee_5',
    name: 'Sanga Das',
    nameBn: 'সঙ্গ দাস',
    spiritualName: 'Sanga Das',
    spiritualNameBn: 'সঙ্গ দাস',
    phone: '+8801812345681',
    roomNo: 'Room 101',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Prasadam Seva Sevak',
    joinDate: '2023-06-01'
  },
  {
    id: 'counselee_6',
    name: 'Dipendranath Roy',
    nameBn: 'দীপেন্দ্রনাথ রায়',
    phone: '+8801912345682',
    roomNo: 'Room 102',
    scaleId: 1,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Bhakti Candidate',
    joinDate: '2024-02-15'
  },
  {
    id: 'counselee_7',
    name: 'Ankon Das',
    nameBn: 'অঙ্কন দাস',
    phone: '+8801512345683',
    roomNo: 'Room 203',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Temple Cleaning Lead',
    joinDate: '2023-09-10'
  },
  {
    id: 'counselee_8',
    name: 'Antar Das',
    nameBn: 'অন্তর দাস',
    phone: '+8801712345684',
    roomNo: 'Room 204',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3'],
    completedCamps: ['camp_1', 'camp_2'],
    spiritualTitle: 'Veranda Seva Sevak',
    joinDate: '2022-10-05'
  },
  {
    id: 'counselee_9',
    name: 'Roton Das',
    nameBn: 'রতন দাস',
    phone: '+8801812345685',
    roomNo: 'Room 103',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Dinner Seva Sevak',
    joinDate: '2023-04-12'
  },
  {
    id: 'counselee_10',
    name: 'Joy Das',
    nameBn: 'জয় দাস',
    phone: '+8801912345686',
    roomNo: 'Room 104',
    scaleId: 1,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: [],
    spiritualTitle: 'Newcomer',
    joinDate: '2024-05-18'
  },
  {
    id: 'counselee_11',
    name: 'Joykan Das',
    nameBn: 'জয়কান দাস',
    phone: '+8801512345687',
    roomNo: 'Room 105',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Breakfast Seva Sevak',
    joinDate: '2023-11-25'
  },
  {
    id: 'counselee_12',
    name: 'Bappi Chowdhury',
    nameBn: 'বাপ্পী চৌধুরী',
    phone: '+8801612345688',
    roomNo: 'Room 205',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3'],
    completedCamps: ['camp_1', 'camp_2', 'camp_3'],
    spiritualTitle: 'Campus Preacher',
    joinDate: '2022-01-10'
  },
  {
    id: 'counselee_13',
    name: 'Raghav Kirtan Das',
    nameBn: 'রাঘব কীর্তন দাস',
    spiritualName: 'Raghav Kirtan Das Brahmachari',
    spiritualNameBn: 'শ্রীপাদ রাঘব কীর্তন দাস ব্রহ্মচারী',
    phone: '+8801711122334',
    roomNo: 'Ashram Room 1',
    scaleId: 4,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2', 'course_3', 'course_4', 'course_5', 'course_6'],
    completedCamps: ['camp_1', 'camp_2', 'camp_3', 'camp_4', 'camp_5', 'camp_6', 'camp_7'],
    spiritualTitle: 'Ashram Commander & Senior Counselor',
    joinDate: '2019-06-01'
  }
];

const LOCAL_STORAGE_KEY = 'counselor_registered_counselees_v1';

export const getRegisteredCounselees = (): CounseleeProfile[] => {
  try {
    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Enrich existing records with Bangla names, avatar, and counselor from storage/INITIAL_COUNSELEES
        return parsed.map((p: CounseleeProfile) => {
          const match = INITIAL_COUNSELEES.find(init => init.id === p.id || init.name === p.name);
          const storedAvatar = localStorage.getItem(`voice_devotee_avatar_${p.id}`);
          const storedFlower = localStorage.getItem(`voice_devotee_flower_${p.id}`);
          const storedCounselor = localStorage.getItem(`voice_counselor_${p.id}`);
          return {
            ...p,
            nameBn: p.nameBn || match?.nameBn || p.name,
            spiritualNameBn: p.spiritualNameBn || match?.spiritualNameBn || p.spiritualName,
            avatarUrl: p.avatarUrl || storedAvatar || match?.avatarUrl,
            flowerAvatarId: p.flowerAvatarId || storedFlower || match?.flowerAvatarId,
            counselorName: storedCounselor || p.counselorName || match?.counselorName || PRIMARY_COUNSELOR.name
          };
        });
      }
    }
  } catch (e) {
    console.error('Error reading counselees from localStorage', e);
  }
  return INITIAL_COUNSELEES.map(p => {
    const storedAvatar = localStorage.getItem(`voice_devotee_avatar_${p.id}`);
    const storedFlower = localStorage.getItem(`voice_devotee_flower_${p.id}`);
    const storedCounselor = localStorage.getItem(`voice_counselor_${p.id}`);
    return {
      ...p,
      avatarUrl: storedAvatar || p.avatarUrl,
      flowerAvatarId: storedFlower || p.flowerAvatarId,
      counselorName: storedCounselor || p.counselorName || PRIMARY_COUNSELOR.name
    };
  });
};

export const saveRegisteredCounselees = (list: CounseleeProfile[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.error('Error saving counselees to localStorage', e);
  }
};

export const updateDevoteeCounselor = (
  devoteeId: string,
  counselorName: string
): CounseleeProfile | null => {
  const current = getRegisteredCounselees();
  let updatedProfile: CounseleeProfile | null = null;
  const updatedList = current.map(p => {
    if (p.id === devoteeId) {
      updatedProfile = {
        ...p,
        counselorName
      };
      return updatedProfile;
    }
    return p;
  });

  localStorage.setItem('voice_selected_counselor', counselorName);
  localStorage.setItem(`voice_counselor_${devoteeId}`, counselorName);

  if (updatedProfile) {
    saveRegisteredCounselees(updatedList);
    window.dispatchEvent(new CustomEvent('voice_counselor_changed', { detail: counselorName }));
    window.dispatchEvent(new CustomEvent('voice_devotees_updated', { detail: updatedProfile }));
  }

  return updatedProfile;
};

export const addRegisteredCounselee = (newCounselee: Partial<CounseleeProfile>): CounseleeProfile => {
  const current = getRegisteredCounselees();
  const profile: CounseleeProfile = {
    id: `counselee_${Date.now()}`,
    name: newCounselee.name || 'New Devotee',
    spiritualName: newCounselee.spiritualName || '',
    phone: newCounselee.phone || '',
    email: newCounselee.email || '',
    roomNo: newCounselee.roomNo || '',
    department: newCounselee.department || '',
    institution: newCounselee.institution || '',
    scaleId: newCounselee.scaleId || 2,
    counselorName: newCounselee.counselorName || PRIMARY_COUNSELOR.name,
    completedCourses: newCounselee.completedCourses || ['course_1'],
    completedCamps: newCounselee.completedCamps || [],
    spiritualTitle: newCounselee.spiritualTitle || 'Bhakti Candidate',
    joinDate: newCounselee.joinDate || new Date().toISOString().split('T')[0]
  };
  const updated = [...current, profile];
  saveRegisteredCounselees(updated);
  return profile;
};

export const updateDevoteeAvatar = (
  devoteeId: string,
  avatarUrl: string | null,
  flowerAvatarId?: string
): CounseleeProfile | null => {
  const current = getRegisteredCounselees();
  let updatedProfile: CounseleeProfile | null = null;
  const updatedList = current.map(p => {
    if (p.id === devoteeId) {
      updatedProfile = {
        ...p,
        avatarUrl: avatarUrl || undefined,
        flowerAvatarId: flowerAvatarId ?? p.flowerAvatarId
      };
      return updatedProfile;
    }
    return p;
  });

  if (avatarUrl) {
    localStorage.setItem(`voice_devotee_avatar_${devoteeId}`, avatarUrl);
  } else {
    localStorage.removeItem(`voice_devotee_avatar_${devoteeId}`);
  }

  if (flowerAvatarId) {
    localStorage.setItem(`voice_devotee_flower_${devoteeId}`, flowerAvatarId);
  }

  if (updatedProfile) {
    saveRegisteredCounselees(updatedList);
    window.dispatchEvent(new CustomEvent('voice_devotees_updated', { detail: updatedProfile }));
  }

  return updatedProfile;
};

