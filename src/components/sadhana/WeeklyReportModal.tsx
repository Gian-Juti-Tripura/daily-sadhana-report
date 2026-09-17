import React, { useState, useEffect } from 'react';
import { X, Copy, Check, Send, Sparkles } from 'lucide-react';
import { toast } from 'react-hot-toast';

export interface WeeklyReportStats {
  matHours: string;
  bodyPct: string;
  soulPct: string;
  spHours: string;
  spBookRef: string;
  lectHours: string;
  slokaText: string;
}

interface WeeklyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  devoteeName: string;
  weekDateStr: string;
  stats: WeeklyReportStats;
  language: 'bn' | 'en';
}

export const WeeklyReportModal: React.FC<WeeklyReportModalProps> = ({
  isOpen,
  onClose,
  devoteeName,
  weekDateStr,
  stats,
  language
}) => {
  const [copied, setCopied] = useState(false);
  const [formData, setFormData] = useState<WeeklyReportStats>(stats);

  useEffect(() => {
    setFormData(stats);
  }, [stats]);

  if (!isOpen) return null;

  const generateReportMessage = () => {
    return `🌿 Hare Krishna. 🙏

This is *${devoteeName}.* Here is my weekly report for ${weekDateStr}:

📚 *Material Study:* ${formData.matHours} hours
💪 *Body:* ${formData.bodyPct}%
🕉️ *Soul:* ${formData.soulPct}%
📖 *Śrīla Prabhupāda Study:* ${formData.spHours} hours (${formData.spBookRef})
🎧 *Lecture Hearing:* ${formData.lectHours} hours
🪷 *Śloka Memorization:* ${formData.slokaText}

🌸 Hare Krishna. 🙏`;
  };

  const handleCopy = () => {
    const text = generateReportMessage();
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success(language === 'bn' ? 'সাপ্তাহিক রিপোর্ট কপি করা হয়েছে!' : 'Weekly report copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsApp = () => {
    const text = generateReportMessage();
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div 
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-4 sm:p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white shadow-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black text-slate-800 dark:text-slate-100">
                {language === 'bn' ? 'সাপ্তাহিক সাধনা রিপোর্ট' : 'Weekly Sadhana Report'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {devoteeName} • {weekDateStr}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Live Preview Box */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 p-3.5 sm:p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              {language === 'bn' ? 'মেসেজ প্রিভিউ (হোয়াটসঅ্যাপ)' : 'Message Preview (WhatsApp)'}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-200/50 dark:border-emerald-800/50">
              {language === 'bn' ? 'স্বয়ংক্রিয়ভাবে তৈরি' : 'Auto-computed'}
            </span>
          </div>
          <pre className="text-xs sm:text-[13px] text-slate-800 dark:text-slate-200 font-sans leading-relaxed whitespace-pre-wrap select-all">
            {generateReportMessage()}
          </pre>
        </div>

        {/* Quick Edit Fields Accordion */}
        <details className="group rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-3">
          <summary className="text-xs font-bold text-slate-600 dark:text-slate-400 cursor-pointer list-none flex items-center justify-between">
            <span>{language === 'bn' ? 'তথ্য পরিবর্তন / কাস্টমাইজ করুন' : 'Edit / Customize Details'}</span>
            <span className="text-[10px] text-amber-600 dark:text-amber-400 group-open:rotate-180 transition-transform">▼</span>
          </summary>
          <div className="grid grid-cols-2 gap-2.5 pt-3">
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Material Study (hrs)</label>
              <input
                type="text"
                value={formData.matHours}
                onChange={(e) => setFormData({ ...formData, matHours: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Body %</label>
              <input
                type="text"
                value={formData.bodyPct}
                onChange={(e) => setFormData({ ...formData, bodyPct: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Soul %</label>
              <input
                type="text"
                value={formData.soulPct}
                onChange={(e) => setFormData({ ...formData, soulPct: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Lecture (hrs)</label>
              <input
                type="text"
                value={formData.lectHours}
                onChange={(e) => setFormData({ ...formData, lectHours: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">SP Study (hrs)</label>
              <input
                type="text"
                value={formData.spHours}
                onChange={(e) => setFormData({ ...formData, spHours: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-500 uppercase">Book / Verse Ref</label>
              <input
                type="text"
                value={formData.spBookRef}
                onChange={(e) => setFormData({ ...formData, spBookRef: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
            <div className="col-span-2">
              <label className="text-[10px] font-bold text-slate-500 uppercase">Śloka Text</label>
              <input
                type="text"
                value={formData.slokaText}
                onChange={(e) => setFormData({ ...formData, slokaText: e.target.value })}
                className="w-full text-xs px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-100"
              />
            </div>
          </div>
        </details>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button
            type="button"
            onClick={handleCopy}
            className="w-full py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <Copy className="w-4 h-4 text-slate-600 dark:text-slate-300 shrink-0" />}
            <span>{copied ? (language === 'bn' ? 'কপি সম্পন্ন!' : 'Copied!') : (language === 'bn' ? 'রিপোর্ট কপি করুন' : 'Copy Report')}</span>
          </button>

          <button
            type="button"
            onClick={handleWhatsApp}
            className="w-full py-2.5 px-3 rounded-xl bg-[#25D366] hover:bg-[#1ebe59] text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm shadow-emerald-600/20 cursor-pointer"
          >
            <Send className="w-4 h-4 shrink-0" />
            <span>{language === 'bn' ? 'হোয়াটসঅ্যাপ পাঠান' : 'Send WhatsApp'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
