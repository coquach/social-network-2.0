'use client';

import { Search, X } from '@/lib/icons';
import clsx from 'clsx';

interface SearchInputBasicProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  onClear?: () => void;
}

/**
 * SearchInputBasic - Basic search input with search icon
 * Used for standard search scenarios
 */
export const SearchInputBasic: React.FC<SearchInputBasicProps> = ({
  value,
  onChange,
  placeholder = 'Tìm kiếm...',
  className,
  onClear,
}) => {
  const hasValue = (value ?? '').trim().length > 0;

  return (
    <div className={clsx('relative w-full', className)}>
      <Search
        size={16}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
      />

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
