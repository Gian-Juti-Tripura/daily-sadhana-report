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
  }
];

const LOCAL_STORAGE_KEY = 'counselor_registered_counselees_v2';

export const getRegisteredCounselees = (): CounseleeProfile[] => {
  try {
    // Purge legacy demo list containing mock members
    localStorage.removeItem('counselor_registered_counselees_v1');

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((p: CounseleeProfile) => {
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
      }
    }
  } catch (e) {
    console.error('Error reading counselees from localStorage', e);
  }

  // Initialize with strictly registered primary members
  const freshList: CounseleeProfile[] = INITIAL_COUNSELEES.map(p => ({
    ...p,
    avatarUrl: localStorage.getItem(`voice_devotee_avatar_${p.id}`) || p.avatarUrl || undefined,
    flowerAvatarId: localStorage.getItem(`voice_devotee_flower_${p.id}`) || p.flowerAvatarId || undefined,
    counselorName: localStorage.getItem(`voice_counselor_${p.id}`) || p.counselorName || PRIMARY_COUNSELOR.name
  }));
  saveRegisteredCounselees(freshList);
  return freshList;
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

