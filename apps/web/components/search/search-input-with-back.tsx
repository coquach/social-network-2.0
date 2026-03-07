'use client';

import { ArrowLeft, X } from '@/lib/icons';
import clsx from 'clsx';

interface SearchInputWithBackProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onBack: () => void;
  onClear?: () => void;
}

/**
 * SearchInputWithBack - Search input with back button
 * Used in modal/overlay search contexts where user can go back
 */
export const SearchInputWithBack: React.FC<SearchInputWithBackProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
  onBack,
  onClear,
}) => {
  const hasValue = (value ?? '').trim().length > 0;

  return (
    <div className={clsx('relative w-full', className)}>
      <button
        type="button"
        onClick={onBack}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full p-2 hover:bg-slate-100 transition"
        aria-label="Quay lại"
      >
        <ArrowLeft size={18} className="text-slate-600" />
      </button>

      <input
        type="text"
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        className={clsx(
          'w-full pr-10 py-2 border border-gray-300 rounded-lg text-sm',
          'pl-10',
          'focus:outline-none focus:ring-1 focus:ring-sky-400'
        )}
      />

      {hasValue && (
        <button
          type="button"
          onClick={onClear}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-2 hover:bg-slate-100 transition"
          aria-label="Xoá"
        >
          <X size={18} className="text-slate-600" />
        </button>
      )}
    </div>
  );
};
