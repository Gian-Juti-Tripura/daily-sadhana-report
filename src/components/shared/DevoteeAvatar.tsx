import React, { useState, useRef, useEffect } from 'react';
import { Camera, Flower2, Upload, Trash2, Check } from 'lucide-react';
import type { CounseleeProfile } from '../../types/sadhana';
import { updateDevoteeAvatar } from '../../data/counseleesData';
import { toast } from 'react-hot-toast';

export interface FlowerOption {
  id: string;
  nameEn: string;
  nameBn: string;
  meaningEn: string;
  meaningBn: string;
  bgGradient: string;
  ringColor: string;
}

export const SACRED_FLOWERS: FlowerOption[] = [
  {
    id: 'pink_lotus',
    nameEn: 'Sacred Pink Lotus',
    nameBn: 'গোলাপী পদ্ম (পবিত্র পদ্মফুল)',
    meaningEn: 'Offered to Sri Sri Radha-Krishna & Srila Prabhupada',
    meaningBn: 'শ্রীশ্রী রাধাকৃষ্ণ ও শ্রীল প্রভুপাদের শ্রীপাদপদ্মে নিবেদিত',
    bgGradient: 'from-pink-500 via-rose-500 to-amber-500',
    ringColor: 'ring-pink-400'
  },
  {
    id: 'golden_marigold',
    nameEn: 'Golden Marigold',
    nameBn: 'স্বর্ণালী গাঁদা (গাঁদা ফুল)',
    meaningEn: 'Traditional temple Mangala-arati garland flower',
    meaningBn: 'মঙ্গল আরতির মনোহর মালা ও বৈষ্ণব সেবা ফুল',
    bgGradient: 'from-amber-400 via-orange-500 to-amber-600',
    ringColor: 'ring-amber-400'
  },
  {
    id: 'kadamba',
    nameEn: 'Vrindavan Kadamba',
    nameBn: 'বৃন্দাবন কদম্ব (শ্রীকৃষ্ণ প্রিয়)',
    meaningEn: 'Sacred blossom of Sri Krishna\'s Vraja pastimes',
    meaningBn: 'শ্রীকৃষ্ণের ব্রজলীলার পরম সুশোভিত কদম্ব পুষ্প',
    bgGradient: 'from-yellow-400 via-amber-500 to-orange-600',
    ringColor: 'ring-yellow-400'
  },
  {
    id: 'blue_lotus',
    nameEn: 'Celestial Blue Lotus',
    nameBn: 'নীলপদ্ম (ইন্দীবর)',
    meaningEn: 'Reflecting the enchanting bodily hue of Lord Shyamsundar',
    meaningBn: 'শ্যামসুন্দর শ্রীকৃষ্ণের শ্রীঅঙ্গকান্তি রূপ নীলপদ্ম',
    bgGradient: 'from-cyan-500 via-blue-600 to-indigo-700',
    ringColor: 'ring-cyan-400'
  },
  {
    id: 'divine_rose',
    nameEn: 'Temple Rose',
    nameBn: 'সুরভিত গোলাপ',
    meaningEn: 'Fragrant velvety rose for the lotus feet of the Lord',
    meaningBn: 'সুগন্ধি রক্তগোলাপ, ভগবান ও বৈষ্ণবদের চরণে নিবেদিত',
    bgGradient: 'from-rose-500 via-red-600 to-rose-800',
    ringColor: 'ring-rose-400'
  },
  {
    id: 'white_champa',
    nameEn: 'White Champa & Parijata',
    nameBn: 'শ্বেত চাঁপা ও পারিজাত',
    meaningEn: 'Celestial heavenly fragrance in Goloka Vrindavana',
    meaningBn: 'গোলোক বৃন্দাবনের স্বর্গীয় সৌরভময় পারিজাত ও চাঁপা',
    bgGradient: 'from-emerald-400 via-teal-500 to-cyan-700',
    ringColor: 'ring-teal-400'
  }
];

// Deterministically get default flower based on devotee ID or name
export const getDefaultFlowerForDevotee = (idOrName?: string): string => {
  if (!idOrName) return 'pink_lotus';
  let hash = 0;
  for (let i = 0; i < idOrName.length; i++) {
    hash = (hash << 5) - hash + idOrName.charCodeAt(i);
    hash |= 0;
  }
  const index = Math.abs(hash) % SACRED_FLOWERS.length;
  return SACRED_FLOWERS[index].id;
};

// High-detail SVG illustrations of sacred flowers
export const SacredFlowerSvg: React.FC<{ flowerId: string; className?: string }> = ({ flowerId, className = "w-full h-full" }) => {
  switch (flowerId) {
    case 'golden_marigold':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#F59E0B" fillOpacity="0.25" />
          <g transform="translate(50, 50)">
            {/* Outer ruffled petals */}
            {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
              <path
                key={`outer-${deg}`}
                d="M 0,-38 C 12,-38 16,-20 0,-15 C -16,-20 -12,-38 0,-38 Z"
                fill="#F59E0B"
                transform={`rotate(${deg})`}
                stroke="#D97706"
                strokeWidth="1"
              />
            ))}
            {/* Mid ring petals */}
            {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((deg) => (
              <path
                key={`mid-${deg}`}
                d="M 0,-28 C 9,-28 12,-14 0,-10 C -12,-14 -9,-28 0,-28 Z"
                fill="#FBBF24"
                transform={`rotate(${deg})`}
                stroke="#F59E0B"
                strokeWidth="0.8"
              />
            ))}
            {/* Inner dense ruffled center */}
            {[0, 40, 80, 120, 160, 200, 240, 280, 320].map((deg) => (
              <circle
                key={`in-${deg}`}
                cx="0"
                cy="-12"
                r="7"
                fill="#EA580C"
                transform={`rotate(${deg})`}
                fillOpacity="0.85"
              />
            ))}
            <circle cx="0" cy="0" r="11" fill="#B45309" />
            <circle cx="0" cy="0" r="6" fill="#78350F" />
            <circle cx="-2" cy="-2" r="2" fill="#FDE68A" />
          </g>
        </svg>
      );

    case 'kadamba':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#FBBF24" fillOpacity="0.25" />
          <g transform="translate(50, 50)">
            {/* Radial golden spikes/stamens of Kadamba */}
            {Array.from({ length: 36 }).map((_, i) => {
              const deg = i * 10;
              return (
                <g key={`spike-${deg}`} transform={`rotate(${deg})`}>
                  <line x1="0" y1="-20" x2="0" y2="-40" stroke="#FDE68A" strokeWidth="1.8" strokeLinecap="round" />
                  <circle cx="0" cy="-41" r="2.2" fill="#F59E0B" />
                </g>
              );
            })}
            {/* Mid ball */}
            <circle cx="0" cy="0" r="24" fill="#F59E0B" />
            <circle cx="0" cy="0" r="20" fill="#D97706" />
            <circle cx="0" cy="0" r="14" fill="#B45309" />
            <circle cx="-5" cy="-5" r="5" fill="#FBBF24" fillOpacity="0.7" />
          </g>
        </svg>
      );

    case 'blue_lotus':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#3B82F6" fillOpacity="0.25" />
          <g transform="translate(50, 50)">
            {/* Back petals */}
            {[-60, -40, -20, 0, 20, 40, 60].map((deg) => (
              <path
                key={`bpetal-${deg}`}
                d="M 0,-40 C 14,-32 16,-10 0,0 C -16,-10 -14,-32 0,-40 Z"
                fill="#2563EB"
                transform={`rotate(${deg})`}
                stroke="#1D4ED8"
                strokeWidth="1"
              />
            ))}
            {/* Mid petals */}
            {[-45, -25, 0, 25, 45].map((deg) => (
              <path
                key={`mpetal-${deg}`}
                d="M 0,-34 C 12,-26 12,-8 0,0 C -12,-8 -12,-26 0,-34 Z"
                fill="#38BDF8"
                transform={`rotate(${deg})`}
                stroke="#0284C7"
                strokeWidth="0.8"
              />
            ))}
            {/* Front petals */}
            {[-25, 0, 25].map((deg) => (
              <path
                key={`fpetal-${deg}`}
                d="M 0,-26 C 9,-18 9,-6 0,0 C -9,-6 -9,-18 0,-26 Z"
                fill="#BAE6FD"
                transform={`rotate(${deg})`}
                stroke="#38BDF8"
                strokeWidth="0.8"
              />
            ))}
            {/* Golden pericarp */}
            <circle cx="0" cy="0" r="8" fill="#F59E0B" />
            <circle cx="0" cy="0" r="4" fill="#FDE68A" />
          </g>
        </svg>
      );

    case 'divine_rose':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#E11D48" fillOpacity="0.25" />
          <g transform="translate(50, 50)">
            {/* Outer rose petals */}
            {[0, 72, 144, 216, 288].map((deg) => (
              <path
                key={`r-out-${deg}`}
                d="M -22,-20 C -18,-38 18,-38 22,-20 C 26,-4 14,14 0,20 C -14,14 -26,-4 -22,-20 Z"
                fill="#BE123C"
                transform={`rotate(${deg})`}
                fillOpacity="0.9"
              />
            ))}
            {/* Mid swirl */}
            {[36, 108, 180, 252, 324].map((deg) => (
              <path
                key={`r-mid-${deg}`}
                d="M -16,-15 C -12,-28 12,-28 16,-15 C 18,-3 10,10 0,14 C -10,10 -18,-3 -16,-15 Z"
                fill="#E11D48"
                transform={`rotate(${deg})`}
              />
            ))}
            {/* Core spiral */}
            <circle cx="0" cy="0" r="12" fill="#9F1239" />
            <path
              d="M -6,-6 C 0,-10 6,-8 6,-3 C 6,3 1,6 -3,4 C -6,2 -5,-3 0,-4"
              stroke="#FDA4AF"
              strokeWidth="2.2"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        </svg>
      );

    case 'white_champa':
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#10B981" fillOpacity="0.25" />
          <g transform="translate(50, 50)">
            {/* 5 graceful spiraling white petals */}
            {[0, 72, 144, 216, 288].map((deg) => (
              <path
                key={`champa-${deg}`}
                d="M 0,0 C 14,-14 26,-32 8,-42 C -2,-45 -8,-32 0,0 Z"
                fill="#FFFFFF"
                transform={`rotate(${deg})`}
                stroke="#E2E8F0"
                strokeWidth="1"
              />
            ))}
            {/* Warm golden nectar center */}
            <circle cx="0" cy="0" r="14" fill="#FBBF24" fillOpacity="0.85" />
            <circle cx="0" cy="0" r="8" fill="#F59E0B" />
            <circle cx="0" cy="0" r="3" fill="#FFFBEB" />
          </g>
        </svg>
      );

    case 'pink_lotus':
    default:
      return (
        <svg viewBox="0 0 100 100" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="50" cy="50" r="48" fill="#EC4899" fillOpacity="0.25" />
          <g transform="translate(50, 50)">
            {/* Lily pad base */}
            <path d="M -35,28 C -20,38 20,38 35,28 C 38,32 30,42 0,42 C -30,42 -38,32 -35,28 Z" fill="#10B981" />
            {/* Outer lotus petals */}
            {[-55, -35, -15, 0, 15, 35, 55].map((deg) => (
              <path
                key={`lotus-out-${deg}`}
                d="M 0,-40 C 14,-32 15,-10 0,6 C -15,-10 -14,-32 0,-40 Z"
                fill="#DB2777"
                transform={`rotate(${deg})`}
                stroke="#BE185D"
                strokeWidth="0.8"
              />
            ))}
            {/* Mid lotus petals */}
            {[-40, -20, 0, 20, 40].map((deg) => (
              <path
                key={`lotus-mid-${deg}`}
                d="M 0,-34 C 11,-26 12,-8 0,4 C -12,-8 -11,-26 0,-34 Z"
                fill="#F472B6"
                transform={`rotate(${deg})`}
                stroke="#DB2777"
                strokeWidth="0.6"
              />
            ))}
            {/* Front petals */}
            {[-20, 0, 20].map((deg) => (
              <path
                key={`lotus-in-${deg}`}
                d="M 0,-26 C 9,-18 9,-4 0,4 C -9,-4 -9,-18 0,-26 Z"
                fill="#FCE7F3"
                transform={`rotate(${deg})`}
                stroke="#F472B6"
                strokeWidth="0.6"
              />
            ))}
            {/* Golden pericarp center */}
            <circle cx="0" cy="2" r="8" fill="#F59E0B" />
            <circle cx="0" cy="2" r="4" fill="#FDE68A" />
          </g>
        </svg>
      );
  }
};

interface DevoteeAvatarProps {
  devotee?: CounseleeProfile;
  devoteeId?: string;
  devoteeName?: string;
  avatarUrl?: string;
  flowerAvatarId?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  editable?: boolean;
  onAvatarChange?: (newAvatarUrl: string | null, newFlowerId?: string) => void;
  className?: string;
  language?: 'bn' | 'en';
}

const SIZE_CLASSES = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 text-2xl',
  '2xl': 'w-24 h-24 text-3xl'
};

export const DevoteeAvatar: React.FC<DevoteeAvatarProps> = ({
  devotee,
  devoteeId,
  devoteeName,
  avatarUrl: explicitAvatar,
  flowerAvatarId: explicitFlower,
  size = 'md',
  editable = false,
  onAvatarChange,
  className = '',
  language = 'bn'
}) => {
  const effectiveId = devotee?.id || devoteeId || 'devotee';
  const effectiveName = devotee?.name || devoteeName || 'Devotee';
  
  // Local state for immediate responsiveness
  const [currentAvatarUrl, setCurrentAvatarUrl] = useState<string | null>(() => {
    return explicitAvatar || devotee?.avatarUrl || localStorage.getItem(`voice_devotee_avatar_${effectiveId}`) || null;
  });

  const [currentFlowerId, setCurrentFlowerId] = useState<string>(() => {
    return explicitFlower || devotee?.flowerAvatarId || localStorage.getItem(`voice_devotee_flower_${effectiveId}`) || getDefaultFlowerForDevotee(effectiveId);
  });

  const [isFlowerPickerOpen, setIsFlowerPickerOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Synchronize if prop changes or global update event occurs
  useEffect(() => {
    const syncAvatar = () => {
      const savedAvatar = localStorage.getItem(`voice_devotee_avatar_${effectiveId}`);
      const savedFlower = localStorage.getItem(`voice_devotee_flower_${effectiveId}`);
      setCurrentAvatarUrl(savedAvatar || explicitAvatar || devotee?.avatarUrl || null);
      setCurrentFlowerId(savedFlower || explicitFlower || devotee?.flowerAvatarId || getDefaultFlowerForDevotee(effectiveId));
    };

    syncAvatar();
    window.addEventListener('voice_devotees_updated', syncAvatar);
    window.addEventListener('storage', syncAvatar);
    return () => {
      window.removeEventListener('voice_devotees_updated', syncAvatar);
      window.removeEventListener('storage', syncAvatar);
    };
  }, [devotee, explicitAvatar, explicitFlower, effectiveId]);

  // Handle client-side image compression & permanent save
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB source)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(language === 'bn' ? 'ছবির সাইজ ৫ মেগাবাইটের বেশি হতে পারবে না।' : 'Image size must be under 5MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        // Downscale image via canvas to max 400x400 to save space in localStorage & maintain crispness
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 400;
        const MAX_HEIGHT = 400;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.85);

          // Permanently update storage
          updateDevoteeAvatar(effectiveId, compressedDataUrl, currentFlowerId);
          setCurrentAvatarUrl(compressedDataUrl);

          if (onAvatarChange) {
            onAvatarChange(compressedDataUrl, currentFlowerId);
          }

          toast.success(language === 'bn' ? 'প্রোফাইল ছবি সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile picture permanently saved!');
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
    // Reset file input value so re-uploading same file triggers change
    e.target.value = '';
  };

  const handleSelectFlower = (flowerId: string) => {
    // Setting flower clears custom image and activates chosen flower permanently
    updateDevoteeAvatar(effectiveId, null, flowerId);
    setCurrentAvatarUrl(null);
    setCurrentFlowerId(flowerId);
    setIsFlowerPickerOpen(false);

    if (onAvatarChange) {
      onAvatarChange(null, flowerId);
    }

    const flw = SACRED_FLOWERS.find(f => f.id === flowerId);
    const flowerName = language === 'bn' ? flw?.nameBn : flw?.nameEn;
    toast.success(language === 'bn' ? `${flowerName} প্রোফাইল ছবি হিসেবে সংরক্ষিত হয়েছে!` : `${flowerName} set as profile flower!`);
  };

  const handleRemovePhoto = (e: React.MouseEvent) => {
    e.stopPropagation();
    updateDevoteeAvatar(effectiveId, null, currentFlowerId);
    setCurrentAvatarUrl(null);
    if (onAvatarChange) {
      onAvatarChange(null, currentFlowerId);
    }
    toast.success(language === 'bn' ? 'ছবি সরানো হয়েছে, ডিফল্ট ফুল প্রদর্শিত হচ্ছে।' : 'Photo removed, default flower restored.');
  };

  const activeFlowerObj = SACRED_FLOWERS.find(f => f.id === currentFlowerId) || SACRED_FLOWERS[0];
  const sizeClass = SIZE_CLASSES[size] || SIZE_CLASSES.md;

  return (
    <div 
      className={`relative inline-block select-none ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Avatar Container */}
      <div 
        className={`rounded-2xl sm:rounded-3xl overflow-hidden shadow-md flex items-center justify-center transition-transform duration-300 ring-2 ring-white/60 dark:ring-slate-700/80 ${sizeClass} ${
          !currentAvatarUrl ? `bg-gradient-to-tr ${activeFlowerObj.bgGradient}` : 'bg-slate-100 dark:bg-slate-800'
        }`}
      >
        {currentAvatarUrl ? (
          <img
            src={currentAvatarUrl}
            alt={effectiveName}
            className="w-full h-full object-cover"
            onError={() => setCurrentAvatarUrl(null)}
          />
        ) : (
          <div className="w-full h-full p-1 sm:p-1.5 flex items-center justify-center">
            <SacredFlowerSvg flowerId={currentFlowerId} className="w-full h-full drop-shadow-sm transition-transform hover:scale-110" />
          </div>
        )}

        {/* Hover/Edit Overlay */}
        {editable && (
          <div 
            onClick={() => fileInputRef.current?.click()}
            className={`absolute inset-0 bg-black/50 backdrop-blur-xs flex flex-col items-center justify-center text-white cursor-pointer transition-opacity duration-200 ${
              isHovered ? 'opacity-100' : 'opacity-0'
            }`}
            title={language === 'bn' ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
          >
            <Camera className="w-5 h-5 text-amber-200 animate-pulse" />
            <span className="text-[9px] font-bold mt-0.5">{language === 'bn' ? 'আপলোড' : 'Upload'}</span>
          </div>
        )}
      </div>

      {/* Single Sleek Action Control for Editable Mode */}
      {editable && (
        <>
          <button
            type="button"
            onClick={() => setIsFlowerPickerOpen(true)}
            className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white dark:bg-slate-800 text-amber-600 dark:text-amber-400 shadow-md border border-slate-200 dark:border-slate-700 flex items-center justify-center transition-transform hover:scale-110 cursor-pointer z-10"
            title={language === 'bn' ? 'ছবি আপলোড বা ফুল পরিবর্তন করুন' : 'Upload photo or choose flower'}
          >
            <Camera className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </>
      )}

      {/* Sacred Flower Picker Popup Modal / Popover */}
      {isFlowerPickerOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-amber-300/70 dark:border-slate-700 p-5 space-y-4">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-pink-100 dark:bg-pink-950/70 text-pink-600">
                  <Flower2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-800 dark:text-slate-100">
                    {language === 'bn' ? 'পবিত্র পুষ্প অবতার নির্বাচন' : 'Choose Sacred Flower Avatar'}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'ভক্তের প্রোফাইলের জন্য একটি ঐশ্বরিক ফুল পছন্দ করুন' : 'Select a divine flower for devotee profile'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsFlowerPickerOpen(false)}
                className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Flowers Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-[60vh] overflow-y-auto p-1">
              {SACRED_FLOWERS.map((flw) => {
                const isSelected = !currentAvatarUrl && currentFlowerId === flw.id;
                return (
                  <button
                    key={flw.id}
                    type="button"
                    onClick={() => handleSelectFlower(flw.id)}
                    className={`p-3 rounded-2xl border flex flex-col items-center text-center transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 ring-2 ring-amber-400 shadow-md'
                        : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-amber-300 hover:bg-slate-100'
                    }`}
                  >
                    <div className={`w-14 h-14 rounded-2xl p-1.5 mb-2 bg-gradient-to-tr ${flw.bgGradient} shadow-sm group-hover:scale-105 transition-transform relative`}>
                      <SacredFlowerSvg flowerId={flw.id} />
                      {isSelected && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 text-white rounded-full flex items-center justify-center shadow-sm">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-100 leading-tight">
                      {language === 'bn' ? flw.nameBn : flw.nameEn}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {language === 'bn' ? flw.meaningBn : flw.meaningEn}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Custom Photo Upload Shortcut */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 flex-wrap sm:flex-nowrap">
              <button
                type="button"
                onClick={() => {
                  setIsFlowerPickerOpen(false);
                  fileInputRef.current?.click();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{language === 'bn' ? 'ছবি আপলোড' : 'Upload Photo'}</span>
              </button>

              {currentAvatarUrl && (
                <button
                  type="button"
                  onClick={(e) => {
                    handleRemovePhoto(e);
                    setIsFlowerPickerOpen(false);
                  }}
                  className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center justify-center gap-1.5 transition-all border border-rose-200 dark:border-rose-800"
                  title={language === 'bn' ? 'ছবি মুছে ডিফল্ট ফুলে ফিরে যান' : 'Remove photo & restore flower'}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'ছবি মুছুন' : 'Remove'}</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsFlowerPickerOpen(false)}
                className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                {language === 'bn' ? 'সম্পন্ন' : 'Done'}
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
