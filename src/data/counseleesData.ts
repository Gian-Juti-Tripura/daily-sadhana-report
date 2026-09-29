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

export const DEFAULT_GUEST_DEVOTEE: CounseleeProfile = {
  id: 'guest_devotee',
  name: 'Devotee',
  nameBn: 'ভক্ত সাধক',
  spiritualName: '',
  spiritualNameBn: '',
  phone: '',
  email: '',
  roomNo: '',
  department: '',
  institution: 'University of Chittagong',
  scaleId: 2,
  counselorName: PRIMARY_COUNSELOR.name,
  completedCourses: [],
  completedCamps: [],
  spiritualTitle: 'Bhakti Aspirant',
  joinDate: '2023-01-01'
};

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
    id: 'member_5',
    name: 'Dipendranath Roy',
    nameBn: 'দীপেন্দ্রনাথ রায়',
    spiritualName: 'Dipendra Das',
    spiritualNameBn: 'দীপেন্দ্র দাস',
    phone: '01320903062',
    email: 'dipendranathroy2003@gmail.com',
    roomNo: 'Room 304',
    department: 'Philosophy',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1', 'camp_2'],
    spiritualTitle: 'Morning Incharge & Internal Manager',
    joinDate: '2022-07-08'
  },
  {
    id: 'member_0',
    name: 'Utpol Das Khocon',
    nameBn: 'উৎপল দাস খোকন',
    spiritualName: 'Utpol Das',
    spiritualNameBn: 'উৎপল দাস',
    phone: '01790839891',
    email: 'utpol.acce.cu@gmail.com',
    roomNo: 'Room 301',
    department: 'ACCE',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'VOICE Coordinator & Senior Mentor',
    joinDate: '2021-09-18'
  },
  {
    id: 'member_1',
    name: 'Chaitanya Das',
    nameBn: 'চৈতন্য দাস',
    spiritualName: 'Chaitanya Das',
    spiritualNameBn: 'চৈতন্য দাস',
    phone: '01331982443',
    email: 'bappi.sanskrit.cu@gmail.com',
    roomNo: 'Room 303',
    department: 'Sanskrit',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Youth Devotee',
    joinDate: '2023-11-02'
  },
  {
    id: 'member_3',
    name: 'Pranto Chandra Das',
    nameBn: 'প্রান্ত চন্দ্র দাস',
    spiritualName: 'Pranto Krishna Das',
    spiritualNameBn: 'প্রান্ত কৃষ্ণ দাস',
    phone: '01609302008',
    email: 'pranto.cse.cu@gmail.com',
    roomNo: 'Room 302',
    department: 'Computer Science & Engineering',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1', 'course_2'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Technical Support & Study Care',
    joinDate: '2023-02-14'
  },
  {
    id: 'member_4',
    name: 'Sangakara Das',
    nameBn: 'সাঙ্গাকারা দাস',
    spiritualName: 'Sangakara Krishna Das',
    spiritualNameBn: 'সাঙ্গাকারা কৃষ্ণ দাস',
    phone: '01722711849',
    email: 'sangakara.chem.cu@gmail.com',
    roomNo: 'Room 305',
    department: 'Chemistry',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Security & Kitchen Incharge',
    joinDate: '2021-12-05'
  },
  {
    id: 'member_6',
    name: 'Ankan Nath',
    nameBn: 'অঙ্কন নাথ',
    spiritualName: 'Ankan Das',
    spiritualNameBn: 'অঙ্কন দাস',
    phone: '01933503979',
    email: 'ankan.socio.cu@gmail.com',
    roomNo: 'Room 306',
    department: 'Sociology',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'IYF Preaching Member',
    joinDate: '2022-01-20'
  },
  {
    id: 'member_7',
    name: 'Antor Kumar Mohanto',
    nameBn: 'অন্তর কুমার মহন্ত',
    spiritualName: 'Antor Das',
    spiritualNameBn: 'অন্তর দাস',
    phone: '01704370139',
    email: 'antor.sanskrit.cu@gmail.com',
    roomNo: 'Room 307',
    department: 'Sanskrit',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Morning Program Seva Lead',
    joinDate: '2023-04-15'
  },
  {
    id: 'member_8',
    name: 'Roton Roy',
    nameBn: 'রতন রায়',
    spiritualName: 'Roton Das',
    spiritualNameBn: 'রতন দাস',
    phone: '01750504601',
    email: 'roton.sanskrit.cu@gmail.com',
    roomNo: 'Room 308',
    department: 'Sanskrit',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Study Care Incharge',
    joinDate: '2022-10-10'
  },
  {
    id: 'member_9',
    name: 'Utshab Sarkar Joy',
    nameBn: 'উৎসব সরকার জয়',
    spiritualName: 'Utshab Das',
    spiritualNameBn: 'উৎসব দাস',
    phone: '01734550288',
    email: 'utshab.joy.cu@gmail.com',
    roomNo: 'Room 309',
    department: 'Sanskrit',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Kirtan & Bhajan Lead',
    joinDate: '2022-08-28'
  },
  {
    id: 'member_10',
    name: 'Joykanto Sen',
    nameBn: 'জয়কান্ত সেন',
    spiritualName: 'Joykanto Das',
    spiritualNameBn: 'জয়কান্ত দাস',
    phone: '01754034183',
    email: 'joykanto.sanskrit.cu@gmail.com',
    roomNo: 'Room 310',
    department: 'Sanskrit',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Temple Cleanliness Seva',
    joinDate: '2022-06-18'
  },
  {
    id: 'member_11',
    name: 'Bappi Chandra Sarkar',
    nameBn: 'বাপ্পী চন্দ্র সরকার',
    spiritualName: 'Bappi Das',
    spiritualNameBn: 'বাপ্পী দাস',
    phone: '01331982443',
    email: 'bappic.cu@gmail.com',
    roomNo: 'Room 311',
    department: 'Sanskrit',
    institution: 'University of Chittagong',
    scaleId: 2,
    counselorName: 'HG Rashbihari Krishna Chandra Das Brahmachari',
    completedCourses: ['course_1'],
    completedCamps: ['camp_1'],
    spiritualTitle: 'Youth Member',
    joinDate: '2023-11-02'
  }
];

const LOCAL_STORAGE_KEY = 'counselor_registered_counselees_v2';

export const getRegisteredCounselees = (): CounseleeProfile[] => {
  try {
    // Purge legacy demo list containing mock members
    localStorage.removeItem('counselor_registered_counselees_v1');

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: CounseleeProfile[] = [];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    // Merge with INITIAL_COUNSELEES so all 12 ashram devotees are always accessible
    const map = new Map<string, CounseleeProfile>();
    INITIAL_COUNSELEES.forEach(p => map.set(p.id, p));

    list.forEach(p => {
      // Match by id or by email
      const existingKey = Array.from(map.keys()).find(k => {
        const item = map.get(k);
        return item?.id === p.id || (item?.email && p.email && item.email.toLowerCase() === p.email.toLowerCase());
      });

      if (existingKey) {
        map.set(existingKey, { ...map.get(existingKey)!, ...p });
      } else {
        map.set(p.id, p);
      }
    });

    const mergedList = Array.from(map.values()).map(p => {
      const storedAvatar = localStorage.getItem(`voice_devotee_avatar_${p.id}`);
      const storedFlower = localStorage.getItem(`voice_devotee_flower_${p.id}`);
      const storedCounselor = localStorage.getItem(`voice_counselor_${p.id}`);
      return {
        ...p,
        avatarUrl: p.avatarUrl || storedAvatar || undefined,
        flowerAvatarId: p.flowerAvatarId || storedFlower || undefined,
        counselorName: storedCounselor || p.counselorName || PRIMARY_COUNSELOR.name
      };
    });

    saveRegisteredCounselees(mergedList);
    return mergedList;
  } catch (e) {
    console.error('Error reading counselees from localStorage', e);
  }

  return INITIAL_COUNSELEES;
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
  const trimmedEmail = newCounselee.email?.trim().toLowerCase();
  
  const existingIndex = current.findIndex(p => 
    (newCounselee.id && p.id === newCounselee.id) ||
    (trimmedEmail && p.email && p.email.toLowerCase() === trimmedEmail)
  );

  if (existingIndex >= 0) {
    const existing = current[existingIndex];
    const updatedProfile: CounseleeProfile = {
      ...existing,
      ...newCounselee,
      name: newCounselee.name || existing.name,
      email: newCounselee.email || existing.email,
      counselorName: newCounselee.counselorName || existing.counselorName
    };
    current[existingIndex] = updatedProfile;
    saveRegisteredCounselees(current);
    return updatedProfile;
  }

  const profile: CounseleeProfile = {
    id: newCounselee.id || `counselee_${Date.now()}`,
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

export const updateCounseleeProfile = (
  devoteeId: string,
  updates: Partial<CounseleeProfile>
): CounseleeProfile | null => {
  const current = getRegisteredCounselees();
  let updatedProfile: CounseleeProfile | null = null;
  const updatedList = current.map(p => {
    if (p.id === devoteeId) {
      updatedProfile = { ...p, ...updates };
      return updatedProfile;
    }
    return p;
  });
  if (updatedProfile) {
    saveRegisteredCounselees(updatedList);
    window.dispatchEvent(new CustomEvent('voice_devotees_updated', { detail: updatedProfile }));
  }
  return updatedProfile;
};

