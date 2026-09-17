import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { 
  X, BookOpen, Tent, User, Phone, Mail, 
  GraduationCap, CheckCircle2, ShieldCheck, Sparkles, Edit3, Save, Plus,
  Home, Users, Check, Clock
} from 'lucide-react';
import {
  VOICE_SYLLABUS_YEARS,
  ALL_VOICE_SYLLABUS_COURSES,
  ALL_VOICE_SYLLABUS_CAMPS,
} from '../../data/campsData';

import type { CounseleeProfile } from '../../types/sadhana';
import { getRegisteredCounselees, saveRegisteredCounselees, PRIMARY_COUNSELOR, COUNSELORS_LIST } from '../../data/counseleesData';
import { DevoteeAvatar } from '../shared/DevoteeAvatar';
import { toast } from 'react-hot-toast';

interface DevoteeProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDevotee: CounseleeProfile;
  onSelectDevotee: (devotee: CounseleeProfile) => void;
}

export const DevoteeProfileModal: React.FC<DevoteeProfileModalProps> = ({
  isOpen,
  onClose,
  selectedDevotee,
  onSelectDevotee,
}) => {
  const { language } = useLanguage();
  const { styles } = useTheme();

  const [allCounselees, setAllCounselees] = useState<CounseleeProfile[]>(getRegisteredCounselees());
  const [formData, setFormData] = useState<CounseleeProfile>(selectedDevotee);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'SYLLABUS' | 'COURSES' | 'CAMPS' | 'DEVOTEES_LIST'>('OVERVIEW');
  const [syllabusFilterYear, setSyllabusFilterYear] = useState<'ALL' | 1 | 2 | 3 | 4>('ALL');
  const [isEditing, setIsEditing] = useState(false);
  const [newDevoteeName, setNewDevoteeName] = useState('');
  const [newDevoteeNameBn, setNewDevoteeNameBn] = useState('');

  useEffect(() => {
    setFormData(selectedDevotee);
    setIsEditing(false);
  }, [selectedDevotee, isOpen]);

  // Keep list updated if updated from another tab or component
  useEffect(() => {
    const handleUpdate = () => {
      setAllCounselees(getRegisteredCounselees());
    };
    window.addEventListener('voice_devotees_updated', handleUpdate);
    return () => window.removeEventListener('voice_devotees_updated', handleUpdate);
  }, []);

  if (!isOpen) return null;

  const handleSaveProfile = () => {
    const updatedList = allCounselees.map(d => d.id === formData.id ? formData : d);
    saveRegisteredCounselees(updatedList);
    setAllCounselees(updatedList);
    onSelectDevotee(formData);
    if (formData.counselorName) {
      localStorage.setItem(`voice_counselor_${formData.id}`, formData.counselorName);
      localStorage.setItem('voice_selected_counselor', formData.counselorName);
      window.dispatchEvent(new CustomEvent('voice_counselor_changed', { detail: formData.counselorName }));
    }
    window.dispatchEvent(new CustomEvent('voice_devotees_updated', { detail: formData }));
    setIsEditing(false);
    toast.success(language === 'bn' ? 'প্রোফাইল তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Profile updated successfully!');
  };

  const handleAddNewDevotee = () => {
    if (!newDevoteeName.trim()) {
      toast.error(language === 'bn' ? 'দয়া করে ভক্তের নাম লিখুন।' : 'Please enter devotee name.');
      return;
    }
    const newProfile: CounseleeProfile = {
      id: `counselee_${Date.now()}`,
      name: newDevoteeName.trim(),
      nameBn: newDevoteeNameBn.trim() || newDevoteeName.trim(),
      spiritualName: '',
      spiritualNameBn: '',
      phone: '',
      email: '',
      roomNo: '',
      department: '',
      institution: 'University of Chittagong',
      scaleId: 2,
      counselorName: formData.counselorName || PRIMARY_COUNSELOR.name,
      completedCourses: ['course_1'],
      completedCamps: ['camp_1'],
      spiritualTitle: 'Bhakti Candidate',
      joinDate: new Date().toISOString().split('T')[0]
    };
    const updated = [...allCounselees, newProfile];
    saveRegisteredCounselees(updated);
    setAllCounselees(updated);
    onSelectDevotee(newProfile);
    setFormData(newProfile);
    setNewDevoteeName('');
    setNewDevoteeNameBn('');
    setActiveTab('OVERVIEW');
    toast.success(language === 'bn' ? 'নতুন ভক্ত সফলভাবে নিবন্ধিত হয়েছে!' : 'New devotee profile registered!');
  };

  const isCourseCompleted = (courseId: string, code?: string) => {
    const completed = formData.completedCourses || [];
    if (completed.includes(courseId)) return true;
    if (courseId === 'dys' && (completed.includes('course_1') || completed.includes('DYS'))) return true;
    if (courseId === 'ss' && (completed.includes('course_2') || completed.includes('SS'))) return true;
    if (courseId === 'pt' && (completed.includes('course_3') || completed.includes('PT'))) return true;
    if (courseId === 'sm' && (completed.includes('course_4') || completed.includes('SM'))) return true;
    if (courseId === 'sp_100' && (completed.includes('course_5') || completed.includes('SP-100'))) return true;
    if (code && completed.includes(code)) return true;
    return false;
  };

  const isCampCompleted = (campId: string) => {
    const completed = formData.completedCamps || [];
    if (completed.includes(campId)) return true;
    if (campId === 'camp_sankalpa' && completed.includes('camp_1')) return true;
    if (campId === 'camp_sphurti' && completed.includes('camp_2')) return true;
    if (campId === 'camp_utsaha' && completed.includes('camp_3')) return true;
    if (campId === 'camp_utkarsha' && completed.includes('camp_4')) return true;
    return false;
  };

  const toggleCourse = (courseId: string) => {
    const currentCourses = formData.completedCourses || [];
    const currentlyDone = isCourseCompleted(courseId);
    let updated: string[];
    if (currentlyDone) {
      updated = currentCourses.filter(id => id !== courseId && id !== `course_${courseId}`);
      toast.success(language === 'bn' ? 'কোর্স অপেক্ষমাণ অবস্থায় ফিরিয়ে আনা হয়েছে।' : 'Course marked as Pending.');
    } else {
      updated = [...currentCourses, courseId];
      toast.success(language === 'bn' ? 'কোর্স সফলভাবে সম্পন্ন হয়েছে!' : 'Course marked as Completed!');
    }
    const updatedDevotee = { ...formData, completedCourses: updated };
    setFormData(updatedDevotee);
    
    const updatedList = allCounselees.map(d => d.id === formData.id ? updatedDevotee : d);
    saveRegisteredCounselees(updatedList);
    setAllCounselees(updatedList);
    onSelectDevotee(updatedDevotee);
  };

  const toggleCamp = (campId: string) => {
    const currentCamps = formData.completedCamps || [];
    const currentlyDone = isCampCompleted(campId);
    let updated: string[];
    if (currentlyDone) {
      updated = currentCamps.filter(id => id !== campId && id !== `camp_${campId}`);
      toast.success(language === 'bn' ? 'ক্যাম্প অপেক্ষমাণ অবস্থায় ফিরিয়ে আনা হয়েছে।' : 'Camp marked as Pending.');
    } else {
      updated = [...currentCamps, campId];
      toast.success(language === 'bn' ? 'ক্যাম্পে উপস্থিতি চিহ্নিত হয়েছে!' : 'Camp marked as Attended!');
    }
    const updatedDevotee = { ...formData, completedCamps: updated };
    setFormData(updatedDevotee);

    const updatedList = allCounselees.map(d => d.id === formData.id ? updatedDevotee : d);
    saveRegisteredCounselees(updatedList);
    setAllCounselees(updatedList);
    onSelectDevotee(updatedDevotee);
  };

  // High-visibility, crisp Completed and Pending status buttons
  const renderStatusButton = (isCompleted: boolean, onToggle: () => void, isCamp: boolean = false) => {
    if (isCompleted) {
      return (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5 transition-all border border-emerald-400 cursor-pointer shrink-0 active:scale-95"
          title={language === 'bn' ? 'সম্পন্ন চিহ্নিত করা আছে (পরিবর্তন করতে ক্লিক করুন)' : 'Marked as Completed (Click to toggle)'}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-100 shrink-0" />
          <span>{language === 'bn' ? (isCamp ? '✓ উপস্থিত' : '✓ সম্পন্ন') : (isCamp ? '✓ Attended' : '✓ Completed')}</span>
        </button>
      );
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onToggle();
        }}
        className="px-3 sm:px-3.5 py-1.5 rounded-xl text-xs font-black bg-amber-50 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-amber-900 dark:text-amber-200 border-2 border-amber-400 dark:border-amber-500 shadow-2xs flex items-center gap-1.5 transition-all cursor-pointer shrink-0 active:scale-95"
        title={language === 'bn' ? 'অপেক্ষমাণ আছে (সম্পন্ন করতে ক্লিক করুন)' : 'Marked as Pending (Click to toggle)'}
      >
        <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
        <span>{language === 'bn' ? '⏳ অপেক্ষমাণ' : '⏳ Pending'}</span>
      </button>
    );
  };

  const handleAvatarChange = (newUrl: string | null, newFlowerId?: string) => {
    const updatedDevotee = {
      ...formData,
      avatarUrl: newUrl || undefined,
      flowerAvatarId: newFlowerId || formData.flowerAvatarId
    };
    setFormData(updatedDevotee);
    onSelectDevotee(updatedDevotee);
  };

  // Display names with Bangla support
  const displayName = language === 'bn' ? (formData.nameBn || formData.name) : formData.name;
  const displaySecondaryName = language === 'bn' ? formData.name : (formData.nameBn || '');
  const displaySpiritualName = language === 'bn' ? (formData.spiritualNameBn || formData.spiritualName) : formData.spiritualName;

  return (
    <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-2 sm:p-4 py-3 sm:py-6 bg-black/60 backdrop-blur-md animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white dark:bg-slate-900 rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 dark:border-slate-800 overflow-hidden max-h-[calc(100dvh-1.5rem)] sm:max-h-[92vh] flex flex-col transition-all">
        
        {/* =========================================================================
            HEADER: Luxurious Devotional Gradient with Flower Avatar & Profile Details
           ========================================================================= */}
        <div className={`relative bg-gradient-to-r ${styles.bannerGradient} p-3.5 sm:p-6 text-white shrink-0 overflow-hidden shadow-md`}>
          
          {/* Subtle spiritual ambient background decorations */}
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-black/15 blur-2xl pointer-events-none" />

          <div className="relative z-10 flex items-start justify-between gap-3">
            
            {/* Devotee Info Section with Avatar */}
            <div className="flex items-center gap-3 sm:gap-4 min-w-0">
              
              {/* Profile Avatar with Sacred Flower default + permanent upload button */}
              <div className="relative shrink-0">
                <DevoteeAvatar
                  devotee={formData}
                  size="lg"
                  editable={true}
                  language={language}
                  onAvatarChange={handleAvatarChange}
                  className="shadow-xl ring-3 ring-white/50 dark:ring-white/30"
                />
              </div>

              {/* Devotee Names, Spiritual Name & Scale Title */}
              <div className="min-w-0">
                <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                  <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight leading-tight truncate">
                    {displayName}
                  </h2>
                  {displaySpiritualName && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] sm:text-xs font-bold bg-white/20 backdrop-blur-md border border-white/30 text-white shadow-xs">
                      ({displaySpiritualName})
                    </span>
                  )}
                </div>

                {displaySecondaryName && displaySecondaryName !== displayName && (
                  <p className="text-[10px] sm:text-xs text-white/80 font-medium mt-0.5 truncate">
                    {displaySecondaryName}
                  </p>
                )}

                <div className="flex items-center flex-wrap gap-1.5 mt-1.5">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/25 backdrop-blur-xs text-[10px] sm:text-xs font-bold text-white/95 border border-white/20">
                    <Sparkles className="w-3 h-3 text-amber-300" />
                    <span>{formData.spiritualTitle || 'Bhakti Aspirant'}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-lg bg-white/20 backdrop-blur-xs text-[10px] sm:text-xs font-bold text-white border border-white/20">
                    {language === 'bn' ? `স্কেল ${formData.scaleId}` : `Scale ${formData.scaleId}`}
                  </span>
                </div>
              </div>

            </div>

            {/* Close Modal Button */}
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all shadow-sm shrink-0 cursor-pointer"
              title={language === 'bn' ? 'বন্ধ করুন' : 'Close'}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* =========================================================================
              NAVIGATION TABS: Sleek 1-Row Scrollable Pill Bar
             ========================================================================= */}
          <div className="relative z-10 flex items-center gap-1.5 sm:gap-2 mt-3.5 sm:mt-4 overflow-x-auto no-scrollbar py-0.5 text-xs sm:text-sm font-bold">
            
            <button
              type="button"
              onClick={() => setActiveTab('OVERVIEW')}
              className={`px-3 py-1.5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'OVERVIEW'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-transparent'
                  : 'bg-black/20 hover:bg-black/35 text-white/95 border border-white/15'
              }`}
            >
              <User className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>{language === 'bn' ? 'সারসংক্ষেপ' : 'Overview'}</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('COURSES')}
              className={`px-3 py-1.5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'COURSES'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-transparent'
                  : 'bg-black/20 hover:bg-black/35 text-white/95 border border-white/15'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>
                {language === 'bn' ? '৬টি ভয়েস কোর্স' : '6 Courses'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold">
                ({formData.completedCourses?.length || 0}/6)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('CAMPS')}
              className={`px-3 py-1.5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'CAMPS'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-transparent'
                  : 'bg-black/20 hover:bg-black/35 text-white/95 border border-white/15'
              }`}
            >
              <Tent className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>
                {language === 'bn' ? '১৩টি ইয়ুথ ক্যাম্প' : '13 Camps'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold">
                ({formData.completedCamps?.length || 0}/13)
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('DEVOTEES_LIST')}
              className={`px-3 py-1.5 sm:py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 shrink-0 cursor-pointer ${
                activeTab === 'DEVOTEES_LIST'
                  ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-md border border-transparent'
                  : 'bg-black/20 hover:bg-black/35 text-white/95 border border-white/15'
              }`}
            >
              <Users className="w-3.5 h-3.5 shrink-0 text-amber-500" />
              <span>
                {language === 'bn' ? 'সকল ভক্তবৃন্দ' : 'All Counselees'}
              </span>
              <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-600 dark:text-amber-300 font-extrabold">
                ({allCounselees.length})
              </span>
            </button>

          </div>

        </div>

        {/* =========================================================================
            MODAL BODY
           ========================================================================= */}
        <div className="p-4 sm:p-7 overflow-y-auto flex-1 space-y-6 bg-slate-50/40 dark:bg-slate-950/40">

          {/* =======================================================================
              TAB 1: OVERVIEW & PROFILE CARDS
             ======================================================================= */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Section Header with Edit / Save Action */}
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? 'ব্যক্তিগত ও পারমার্থিক পরিচয়' : 'Personal & Spiritual Profile'}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {language === 'bn' ? 'ভক্তের যোগাযোগের তথ্য ও পারমার্থিক বিবরণ' : 'Contact coordinates and devotional records'}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (isEditing) handleSaveProfile();
                    else setIsEditing(true);
                  }}
                  className={`px-4 py-2 rounded-xl ${styles.btnPrimary} text-xs sm:text-sm font-bold flex items-center gap-2 transition-all shadow-sm cursor-pointer`}
                >
                  {isEditing ? <Save className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
                  <span>{isEditing ? (language === 'bn' ? 'সংরক্ষণ করুন' : 'Save Changes') : (language === 'bn' ? 'সম্পাদনা' : 'Edit Profile')}</span>
                </button>
              </div>

              {/* Profile Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                
                {/* 1. Full Name (English & Bangla) */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <User className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'পূর্ণ নাম (Full Name)' : 'Full Name'}
                    </label>
                  </div>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="English Name"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={formData.nameBn || ''}
                        onChange={(e) => setFormData({ ...formData, nameBn: e.target.value })}
                        placeholder="বাংলায় পূর্ণ নাম (যেমন: জ্ঞান জ্যোতি ত্রিপুরা)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {displayName}
                      </p>
                      {displaySecondaryName && displaySecondaryName !== displayName && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {displaySecondaryName}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Spiritual / Diksha Name */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <Sparkles className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'দীক্ষাপ্রাপ্ত / আধ্যাত্মিক নাম' : 'Spiritual / Diksha Name'}
                    </label>
                  </div>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={formData.spiritualName || ''}
                        onChange={(e) => setFormData({ ...formData, spiritualName: e.target.value })}
                        placeholder="e.g. Gianjyoti Das"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={formData.spiritualNameBn || ''}
                        onChange={(e) => setFormData({ ...formData, spiritualNameBn: e.target.value })}
                        placeholder="বাংলায় আধ্যাত্মিক নাম (যেমন: জ্ঞানজ্যোতি দাস)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-base text-slate-900 dark:text-slate-100">
                        {displaySpiritualName || '—'}
                      </p>
                      {formData.spiritualName && formData.spiritualNameBn && language === 'bn' && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                          {formData.spiritualName}
                        </p>
                      )}
                    </div>
                  )}
                </div>

                {/* 3. Mobile Number */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <Phone className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'মোবাইল নম্বর' : 'Phone Number'}
                    </label>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+8801..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                    />
                  ) : (
                    formData.phone ? (
                      <a 
                        href={`tel:${formData.phone}`} 
                        className="font-bold text-base text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-2 transition-colors"
                      >
                        <span>{formData.phone}</span>
                      </a>
                    ) : (
                      <p className="text-slate-400 font-medium">—</p>
                    )
                  )}
                </div>

                {/* 4. Email */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <Mail className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}
                    </label>
                  </div>
                  {isEditing ? (
                    <input
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="devotee@gmail.com"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                    />
                  ) : (
                    formData.email ? (
                      <a 
                        href={`mailto:${formData.email}`} 
                        className="font-bold text-sm text-slate-900 dark:text-slate-100 hover:text-amber-600 dark:hover:text-amber-400 truncate block transition-colors"
                      >
                        {formData.email}
                      </a>
                    ) : (
                      <p className="text-slate-400 font-medium">—</p>
                    )
                  )}
                </div>

                {/* 5. Department & Campus */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <GraduationCap className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'বিভাগ ও শিক্ষাপ্রতিষ্ঠান' : 'Department & Institution'}
                    </label>
                  </div>
                  {isEditing ? (
                    <div className="space-y-1.5">
                      <input
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        placeholder="Department (e.g. CSE, CU)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                      <input
                        type="text"
                        value={formData.institution || ''}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        placeholder="University (e.g. University of Chittagong)"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                      />
                    </div>
                  ) : (
                    <div>
                      <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                        {formData.department || 'Student'}
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                        {formData.institution || 'University of Chittagong'}
                      </p>
                    </div>
                  )}
                </div>

                {/* 6. Room No / Ashram */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:border-amber-300 transition-colors">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="p-1 rounded-lg bg-amber-50 dark:bg-amber-950 text-amber-600">
                      <Home className="w-3.5 h-3.5" />
                    </div>
                    <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      {language === 'bn' ? 'আশ্রম রুম নম্বর' : 'Room Number'}
                    </label>
                  </div>
                  {isEditing ? (
                    <input
                      type="text"
                      value={formData.roomNo || ''}
                      onChange={(e) => setFormData({ ...formData, roomNo: e.target.value })}
                      placeholder="e.g. Room 302"
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                    />
                  ) : (
                    <p className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {formData.roomNo || 'VOICE Ashram'}
                    </p>
                  )}
                </div>

                {/* 7. Counselor & Sadhana Scale */}
                <div className="bg-white dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs sm:col-span-2">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 rounded-lg bg-amber-100 dark:bg-amber-950 text-amber-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                          {language === 'bn' ? 'দায়িত্বপ্রাপ্ত কাউন্সেলর' : 'Assigned Counselor'}
                        </label>
                        {isEditing ? (
                          <select
                            value={formData.counselorName}
                            onChange={(e) => setFormData({ ...formData, counselorName: e.target.value })}
                            className="mt-1 px-2.5 py-1 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100"
                          >
                            {COUNSELORS_LIST.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                            {!COUNSELORS_LIST.includes(formData.counselorName) && formData.counselorName && (
                              <option value={formData.counselorName}>{formData.counselorName}</option>
                            )}
                          </select>
                        ) : (
                          <p className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                            {formData.counselorName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <label className="text-xs font-bold text-slate-500 dark:text-slate-400">
                        {language === 'bn' ? 'সাধনা স্কেল:' : 'Scale:'}
                      </label>
                      {isEditing ? (
                        <select
                          value={formData.scaleId}
                          onChange={(e) => setFormData({ ...formData, scaleId: parseInt(e.target.value, 10) as 1 | 2 | 3 | 4 })}
                          className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                        >
                          <option value={1}>Scale 1 (Newcomer / ১-৬ মাস)</option>
                          <option value={2}>Scale 2 (Regular Student / ভয়েস শিক্ষার্থী)</option>
                          <option value={3}>Scale 3 (Advanced Student / সিনিয়র শিক্ষার্থী)</option>
                          <option value={4}>Scale 4 (Candidate / আশ্রমে পূর্ণকালীন সেবক)</option>
                        </select>
                      ) : (
                        <span className="px-3 py-1 rounded-xl text-xs font-extrabold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300/80 dark:border-amber-700">
                          Scale {formData.scaleId} ({formData.scaleId === 1 ? 'Newcomer' : formData.scaleId === 2 ? 'Student' : formData.scaleId === 3 ? 'Advanced' : 'Ashramite'})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

              </div>

              {/* Milestones Card */}
              <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 dark:from-slate-800/80 dark:to-slate-800/80 p-5 rounded-3xl border border-amber-200 dark:border-slate-700 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    <h4 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-slate-100">
                      {language === 'bn' ? 'পারমার্থিক অগ্রগতি ও কোর্স স্বীকৃতি' : 'Spiritual Progress & Course Badges'}
                    </h4>
                  </div>
                  <span className="text-xs font-bold text-amber-700 dark:text-amber-400">
                    VOICE Excellence
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center font-bold">
                        🎓
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {language === 'bn' ? 'সম্পন্ন ভয়েস কোর্স' : 'VOICE Courses'}
                        </p>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {formData.completedCourses?.length || 0} / 10 Courses Passed
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('COURSES')}
                      className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'দেখুন' : 'View'}
                    </button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold">
                        ⛺
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {language === 'bn' ? 'উপস্থিত ইয়ুথ ক্যাম্প' : 'Youth Camps'}
                        </p>
                        <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100">
                          {formData.completedCamps?.length || 0} / 13 Camps Attended
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('CAMPS')}
                      className="text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                    >
                      {language === 'bn' ? 'দেখুন' : 'View'}
                    </button>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* =======================================================================
              TAB 2: VOICE 4-YEAR SYLLABUS (Exact Replica of Physical Card)
             ======================================================================= */}
          {activeTab === 'SYLLABUS' && (
            <div className="space-y-4 animate-fade-in">
              {/* Header Box matching physical card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-700 via-cyan-700 to-sky-700 text-white shadow-md text-center space-y-1.5">
                <div className="flex items-center justify-center gap-2">
                  <span className="px-4 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-white/20 border border-white/30 backdrop-blur-xs shadow-2xs">
                    Voice Syllabus
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-cyan-100 font-medium max-w-2xl mx-auto leading-relaxed">
                  Introducing Krishna Conciousness to Youths by one time seminars on Art of Mind Control, Power of Habit, Stress Management etc.
                </p>
                <div className="flex items-center justify-center gap-3 pt-1 text-xs font-bold text-white/90 flex-wrap">
                  <span className="bg-black/20 px-2.5 py-0.5 rounded-md">
                    🎓 {ALL_VOICE_SYLLABUS_COURSES.length} {language === 'bn' ? 'কোর্স মাইলফলক' : 'Course Milestones'}
                  </span>
                  <span>•</span>
                  <span className="bg-black/20 px-2.5 py-0.5 rounded-md">
                    ⛺ {ALL_VOICE_SYLLABUS_CAMPS.length} {language === 'bn' ? 'আবাসিক যুব সম্মেলন ও ক্যাম্প' : 'Youth Retreat Camps'}
                  </span>
                </div>
              </div>

              {/* Year Filter Pills */}
              <div className="flex items-center justify-between gap-2 flex-wrap pb-1">
                <div className="flex items-center gap-1.5 overflow-x-auto">
                  {(['ALL', 1, 2, 3, 4] as const).map(y => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => setSyllabusFilterYear(y)}
                      className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        syllabusFilterYear === y
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                      }`}
                    >
                      {y === 'ALL' ? (language === 'bn' ? 'সকল ৪টি বর্ষ' : 'All 4 Years') : (language === 'bn' ? `${y}ম বর্ষ` : `Year ${y}`)}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  {language === 'bn' ? 'সম্পন্ন বা অপেক্ষমাণ বোতামে ক্লিক করে স্থিতি পরিবর্তন করুন' : 'Click status buttons to toggle completed/pending'}
                </span>
              </div>

              {/* 4 Years Container */}
              <div className="space-y-4">
                {VOICE_SYLLABUS_YEARS
                  .filter(yg => syllabusFilterYear === 'ALL' || yg.year === syllabusFilterYear)
                  .map(yearGroup => (
                    <div key={yearGroup.year} className="rounded-2xl border border-slate-200 dark:border-slate-700/80 overflow-hidden bg-white dark:bg-slate-900 shadow-xs">
                      
                      {/* Year Header Banner (Matching teal card) */}
                      <div className="bg-gradient-to-r from-sky-700 via-teal-700 to-cyan-700 px-4 py-2.5 text-white flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-full bg-white/20 text-white font-black text-xs flex items-center justify-center border border-white/30">
                            {yearGroup.year}
                          </span>
                          <h4 className="font-black text-xs sm:text-sm uppercase tracking-wider">
                            {yearGroup.yearNameEn} {language === 'bn' ? `(${yearGroup.yearNameBn})` : ''}
                          </h4>
                        </div>
                        <span className="text-[11px] font-bold text-cyan-100 bg-black/20 px-2.5 py-0.5 rounded-full">
                          {yearGroup.courses.length} {language === 'bn' ? 'কোর্স' : 'Courses'} • {yearGroup.camps.length} {language === 'bn' ? 'ক্যাম্প' : 'Camps'}
                        </span>
                      </div>

                      {/* 2-Column Grid: Left is COURSE, Right is CAMP */}
                      <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-slate-800">
                        
                        {/* Column 1: COURSE */}
                        <div className="p-3 sm:p-4 space-y-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-black uppercase tracking-wider text-sky-700 dark:text-sky-400 flex items-center gap-1.5">
                              <BookOpen className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'কোর্স (COURSE)' : 'COURSE'}</span>
                            </span>
                          </div>

                          <div className="space-y-2">
                            {yearGroup.courses.map(course => {
                              const completed = isCourseCompleted(course.id, course.code);
                              return (
                                <div
                                  key={course.id}
                                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                                    completed
                                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                        {course.titleEn}
                                      </h5>
                                      {course.code && (
                                        <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                                          {course.code}
                                        </span>
                                      )}
                                    </div>
                                    {language === 'bn' && course.titleBn && (
                                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                        {course.titleBn}
                                      </p>
                                    )}
                                    {course.descEn && (
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                        {language === 'bn' ? course.descBn : course.descEn}
                                      </p>
                                    )}
                                  </div>

                                  {renderStatusButton(completed, () => toggleCourse(course.id), false)}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Column 2: CAMP */}
                        <div className="p-3 sm:p-4 space-y-2.5 bg-slate-50/40 dark:bg-slate-900/30">
                          <div className="flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-800">
                            <span className="text-xs font-black uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                              <Tent className="w-3.5 h-3.5" />
                              <span>{language === 'bn' ? 'ক্যাম্প (CAMP)' : 'CAMP'}</span>
                            </span>
                          </div>

                          <div className="space-y-2">
                            {yearGroup.camps.map(camp => {
                              const attended = isCampCompleted(camp.id);
                              return (
                                <div
                                  key={camp.id}
                                  className={`p-2.5 rounded-xl border transition-all flex items-center justify-between gap-2.5 ${
                                    attended
                                      ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                      : 'bg-white dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/70'
                                  }`}
                                >
                                  <div className="min-w-0">
                                    <h5 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                      {camp.titleEn}
                                    </h5>
                                    {language === 'bn' && camp.titleBn && (
                                      <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                        {camp.titleBn}
                                      </p>
                                    )}
                                    {camp.descEn && (
                                      <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                                        {language === 'bn' ? camp.descBn : camp.descEn}
                                      </p>
                                    )}
                                  </div>

                                  {renderStatusButton(attended, () => toggleCamp(camp.id), true)}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                      </div>

                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* =======================================================================
              TAB 3: 10 VOICE COURSES (Categorized by 4 Years)
             ======================================================================= */}
          {activeTab === 'COURSES' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-amber-500" />
                    <span>{language === 'bn' ? 'ভয়েস ১০টি পাঠ্যক্রমিক মাইলফলক (৪-বর্ষ)' : '10 VOICE Course Milestones (4 Years)'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'সম্পন্ন বা অপেক্ষমাণ বোতামে ক্লিক করে স্থিতি পরিবর্তন করুন।' : 'Click completed or pending button to update milestone status.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('SYLLABUS')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer hover:bg-amber-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সম্পূর্ণ সিলেবাস যৌথ ছক' : 'View Full 4-Year Syllabus'}</span>
                </button>
              </div>

              {/* Course items grouped by Year */}
              <div className="space-y-4">
                {VOICE_SYLLABUS_YEARS.map(yg => (
                  <div key={yg.year} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="uppercase tracking-wider">{yg.yearNameEn} — {language === 'bn' ? yg.yearNameBn : ''}</span>
                      <span className="text-slate-500 font-semibold">{yg.courses.length} {language === 'bn' ? 'কোর্স' : 'Courses'}</span>
                    </div>
                    <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {yg.courses.map(course => {
                        const completed = isCourseCompleted(course.id, course.code);
                        return (
                          <div
                            key={course.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              completed
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                  {course.titleEn}
                                </h4>
                                {course.code && (
                                  <span className="px-1.5 py-0.2 rounded text-[10px] font-bold bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300">
                                    {course.code}
                                  </span>
                                )}
                              </div>
                              {language === 'bn' && course.titleBn && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                  {course.titleBn}
                                </p>
                              )}
                              {course.descEn && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                  {language === 'bn' ? course.descBn : course.descEn}
                                </p>
                              )}
                            </div>

                            {renderStatusButton(completed, () => toggleCourse(course.id), false)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =======================================================================
              TAB 4: 13 YOUTH CAMPS (Categorized by 4 Years)
             ======================================================================= */}
          {activeTab === 'CAMPS' && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-slate-100 flex items-center gap-2">
                    <Tent className="w-5 h-5 text-amber-500" />
                    <span>{language === 'bn' ? '১৩টি ভয়েস ও আইওয়াইএফ যুব সম্মেলন ও ক্যাম্প' : '13 VOICE & IYF Residential Youth Camps'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {language === 'bn' ? 'উপস্থিত বা অপেক্ষমাণ বোতামে ক্লিক করে উপস্থিতি চিহ্নিত করুন।' : 'Click attended or pending button to update camp participation.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('SYLLABUS')}
                  className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-xs font-bold flex items-center gap-1.5 self-start sm:self-auto cursor-pointer hover:bg-amber-100"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{language === 'bn' ? 'সম্পূর্ণ সিলেবাস যৌথ ছক' : 'View Full 4-Year Syllabus'}</span>
                </button>
              </div>

              {/* Camps grouped by Year */}
              <div className="space-y-4">
                {VOICE_SYLLABUS_YEARS.map(yg => (
                  <div key={yg.year} className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
                    <div className="bg-slate-100 dark:bg-slate-800/80 px-4 py-2 text-xs font-black text-slate-800 dark:text-slate-200 flex items-center justify-between">
                      <span className="uppercase tracking-wider">{yg.yearNameEn} — {language === 'bn' ? yg.yearNameBn : ''}</span>
                      <span className="text-slate-500 font-semibold">{yg.camps.length} {language === 'bn' ? 'ক্যাম্প' : 'Camps'}</span>
                    </div>
                    <div className="p-3 sm:p-4 grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {yg.camps.map(camp => {
                        const attended = isCampCompleted(camp.id);
                        return (
                          <div
                            key={camp.id}
                            className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                              attended
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-800/60'
                                : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700'
                            }`}
                          >
                            <div className="min-w-0">
                              <h4 className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                                {camp.titleEn}
                              </h4>
                              {language === 'bn' && camp.titleBn && (
                                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                                  {camp.titleBn}
                                </p>
                              )}
                              {camp.descEn && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 line-clamp-1">
                                  {language === 'bn' ? camp.descBn : camp.descEn}
                                </p>
                              )}
                            </div>

                            {renderStatusButton(attended, () => toggleCamp(camp.id), true)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* =======================================================================
              TAB 4: DEVOTEES DIRECTORY (WITH AVATARS)
             ======================================================================= */}
          {activeTab === 'DEVOTEES_LIST' && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Register New Devotee Box */}
              <div className="bg-white dark:bg-slate-800/80 p-4 sm:p-5 rounded-3xl border border-slate-200/90 dark:border-slate-700/80 shadow-xs space-y-3">
                <h4 className="font-extrabold text-sm text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'নতুন ভক্ত নিবন্ধন করুন' : 'Register New Devotee Profile'}</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={newDevoteeName}
                    onChange={(e) => setNewDevoteeName(e.target.value)}
                    placeholder={language === 'bn' ? 'ভক্তের ইংরেজি নাম (যেমন: Krishna Das)...' : 'Enter devotee name in English...'}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                  />
                  <input
                    type="text"
                    value={newDevoteeNameBn}
                    onChange={(e) => setNewDevoteeNameBn(e.target.value)}
                    placeholder={language === 'bn' ? 'ভক্তের বাংলা নাম (যেমন: কৃষ্ণ দাস)...' : 'Devotee name in Bengali...'}
                    className="px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-sm font-bold text-slate-900 dark:text-slate-100"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleAddNewDevotee}
                    className={`px-5 py-2 ${styles.btnPrimary} text-white rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm cursor-pointer`}
                  >
                    {language === 'bn' ? '+ ভক্ত যোগ করুন' : '+ Add Devotee'}
                  </button>
                </div>
              </div>

              {/* Devotees Grid */}
              <div>
                <h4 className="font-extrabold text-sm text-slate-800 dark:text-slate-200 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" />
                  <span>{language === 'bn' ? 'নিবন্ধিত ভক্তদের তালিকা (ক্লিক করে প্রোফাইল পরিবর্তন করুন):' : 'Registered Counselees (Click to switch active profile):'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {allCounselees.map((dev) => {
                    const isSelected = dev.id === formData.id;
                    const dName = language === 'bn' ? (dev.nameBn || dev.name) : dev.name;
                    const dSpiritual = language === 'bn' ? (dev.spiritualNameBn || dev.spiritualName) : dev.spiritualName;

                    return (
                      <div
                        key={dev.id}
                        onClick={() => {
                          onSelectDevotee(dev);
                          setFormData(dev);
                          setActiveTab('OVERVIEW');
                          toast.success(`${language === 'bn' ? 'সক্রিয় ভক্ত:' : 'Active profile:'} ${dName}`);
                        }}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                          isSelected
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-400 dark:border-amber-600 shadow-md ring-2 ring-amber-400/40'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700/80 hover:border-amber-300 hover:bg-slate-50'
                        }`}
                      >
                        {/* Devotee Sacred Flower / Photo Avatar */}
                        <DevoteeAvatar
                          devotee={dev}
                          size="sm"
                          language={language}
                          className="shrink-0"
                        />

                        <div className="truncate flex-1 min-w-0">
                          <p className="font-extrabold text-sm text-slate-900 dark:text-slate-100 truncate">
                            {dName}
                          </p>
                          {dSpiritual && (
                            <p className="text-[11px] text-amber-600 dark:text-amber-400 font-bold truncate">
                              ({dSpiritual})
                            </p>
                          )}
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium truncate">
                            Scale {dev.scaleId} • {dev.spiritualTitle || 'Bhakti Aspirant'}
                          </p>
                        </div>

                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <Check className="w-3 h-3 stroke-[3]" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          )}

        </div>

      </div>
    </div>
  );
};
