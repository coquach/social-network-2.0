'use client';

import { useMemo, useState } from 'react';
import { cn } from '@/lib/utils';

type TextCollapseProps = {
  text?: string | null;

  /** cắt theo ký tự */
  maxLength?: number;

  /** label nút */
  moreLabel?: string;
  lessLabel?: string;

  /** class wrapper / text / button */
  className?: string;
  textClassName?: string;
  buttonClassName?: string;

  /** thêm dấu … khi bị cắt */
  ellipsis?: boolean;

  /** mặc định mở rộng */
  defaultExpanded?: boolean;
};

export function TextCollapse({
  text,
  maxLength = 220,
  moreLabel = 'Xem thêm',
  lessLabel = 'Thu gọn',
  className,
  textClassName,
  buttonClassName,
  ellipsis = true,
  defaultExpanded = false,
}: TextCollapseProps) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const { hasContent, isLong, display } = useMemo(() => {
    const t = (text ?? '').toString();
    const has = t.trim().length > 0;
    const long = t.length > maxLength;

    return {
      hasContent: has,
      isLong: long,
      display: expanded || !long ? t : t.slice(0, maxLength),
    };
  }, [text, expanded, maxLength]);

  if (!hasContent) return null;

  return (
    <div className={cn('min-w-0', className)}>
      <p
        className={cn(
          // xuống dòng chuẩn + không tràn ngang
          'whitespace-pre-wrap break-normal wrap-normal break-keep [hyphens:none]',
          textClassName
        )}
      >
        {display}
        {!expanded && isLong && ellipsis ? '…' : ''}
      </p>

      {isLong && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={cn(
            'mt-1 text-xs font-medium text-sky-600 hover:underline underline-offset-2',
            buttonClassName
          )}
        >
          {expanded ? lessLabel : moreLabel}
        </button>
      )}
    </div>
  );
}
