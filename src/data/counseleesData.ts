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

export const INITIAL_COUNSELEES: CounseleeProfile[] = [];

const LOCAL_STORAGE_KEY = 'voice_countrywide_devotees_v3';

export const getRegisteredCounselees = (): CounseleeProfile[] => {
  try {
    // Purge legacy demo lists containing mock members
    localStorage.removeItem('counselor_registered_counselees_v1');
    localStorage.removeItem('counselor_registered_counselees_v2');
    localStorage.removeItem('voice_registered_counselees_v2');

    const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
    let list: CounseleeProfile[] = [];
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        list = parsed;
      }
    }

    return list.map(p => {
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
  } catch (e) {
    console.error('Error reading counselees from localStorage', e);
  }

  return [];
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

