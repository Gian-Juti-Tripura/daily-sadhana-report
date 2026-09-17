import React from 'react';

interface YesNoToggleProps {
  value: boolean;
  onChange: (val: boolean) => void;
  yesLabel?: string;
  noLabel?: string;
  size?: 'sm' | 'md';
  disabled?: boolean;
  id?: string;
}

export const YesNoToggle: React.FC<YesNoToggleProps> = ({
  value,
  onChange,
  yesLabel = 'YES',
  noLabel = 'NO',
  size = 'md',
  disabled = false,
  id
}) => {
  const isSm = size === 'sm';

  return (
    <div
      id={id}
      className={`inline-flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 shrink-0 select-none ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      role="group"
      aria-label="Yes or No toggle"
    >
      {/* YES Button (clean, simple, no tick mark) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(true)}
        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
          isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs'
        } ${
          value
            ? 'bg-emerald-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {yesLabel}
      </button>

      {/* NO Button (clean, simple, no cross sign) */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => onChange(false)}
        className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
          isSm ? 'px-2.5 py-0.5 text-[11px]' : 'px-3.5 py-1 text-xs'
        } ${
          !value
            ? 'bg-rose-600 text-white shadow-xs'
            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
        }`}
      >
        {noLabel}
      </button>
    </div>
  );
};
