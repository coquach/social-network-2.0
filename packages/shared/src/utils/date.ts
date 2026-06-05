import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Core utility to safely parse any weird Date format from the backend.
 * Handles ISO strings, Timestamps, and Java/Python LocalDateTime Arrays.
 */
export const parseSafeDate = (
  date?: string | Date | number | number[] | null,
): Date => {
  if (!date) return new Date();

  let parsed: Date;

  if (date instanceof Date) {
    parsed = date;
  } else if (Array.isArray(date)) {
    const [y, m = 1, d = 1, h = 0, min = 0, s = 0] = date;
    // Backend (Java/Python) usually serializes LocalDateTime in UTC
    parsed = new Date(Date.UTC(y, m - 1, d, h, min, s));
  } else if (typeof date === 'number') {
    parsed = date < 100000000000 ? new Date(date * 1000) : new Date(date);
  } else if (typeof date === 'string') {
    if (!isNaN(Number(date)) && date.trim() !== '') {
      const num = Number(date);
      parsed = num < 100000000000 ? new Date(num * 1000) : new Date(num);
    } else {
      // Fix cho Hermes/JSC trên iOS/Android: dùng parseISO của date-fns cho chuẩn
      let normalized = date.includes('T') ? date : date.replace(' ', 'T');
      
      // PostgreSQL/Python thường trả về 6 số lẻ (microseconds), date-fns và Hermes chỉ hỗ trợ tối đa 3 số lẻ (milliseconds)
      normalized = normalized.replace(/(\.\d{3})\d+/, '$1');

      // Nếu backend trả string không kèm timezone, mặc định là UTC
      if (!normalized.endsWith('Z') && !normalized.includes('+') && !normalized.match(/-\d\d:\d\d$/)) {
        normalized += 'Z';
      }
      parsed = parseISO(normalized);
      
      // Nếu parseISO vẫn trả về invalid date, thử new Date fallback với chuỗi gốc
      if (!isValid(parsed)) {
        parsed = new Date(date);
      }
    }
  } else if (typeof date === 'object' && date !== null) {
    const candidate = date as any;
    if (typeof candidate.toDate === 'function') {
      parsed = candidate.toDate();
    } else if (candidate.$date !== undefined) {
      let innerDate = candidate.$date;
      if (typeof innerDate === 'object' && innerDate !== null && innerDate.$numberLong !== undefined) {
        innerDate = Number(innerDate.$numberLong);
      }
      parsed = parseSafeDate(innerDate);
    } else if (candidate.date !== undefined) {
      parsed = parseSafeDate(candidate.date);
    } else if (typeof candidate.seconds === 'number') {
      parsed = new Date(candidate.seconds * 1000);
    } else if (typeof candidate._seconds === 'number') {
      parsed = new Date(candidate._seconds * 1000);
    } else {
      parsed = new Date(date as any);
    }
  } else {
    parsed = new Date(date as any);
  }

  // Fallback nếu parse lỗi, trả về null thay vì new Date() để UI có thể handle
  // Hoặc ở đây ta có thể trả về một mốc thời gian quá khứ, nhưng tốt nhất trả về new Date(0) hoặc giữ nguyên Date hiện tại.
  // Vấn đề cũ: trả về new Date() làm UI luôn hiện "Vừa xong". 
  // Sửa thành trả về new Date(0) (1/1/1970) để lộ ra lỗi parse hoặc fallback an toàn hơn.
  if (!isValid(parsed) || isNaN(parsed.getTime())) {
    // Trả về một mốc thời gian an toàn không phải hiện tại (để khỏi hiện Vừa xong)
    return new Date(0); 
  }

  return parsed;
};

/**
 * Format relative time ("1 giờ trước", "Vừa xong").
 * Dùng logic manual để có UI ngắn gọn nhất.
 */
export const formatRelativeTime = (
  dateInput?: string | Date | number | number[] | null,
): string => {
  const date = parseSafeDate(dateInput);
  const now = Date.now();
  let diffMs = now - date.getTime();

  if (diffMs < 0) diffMs = 0;

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) {
    const s = Math.floor(diffMs / 1000);
    return s > 5 ? `${s} giây trước` : 'Vừa xong';
  }

  if (diffMs < hour) {
    const m = Math.floor(diffMs / minute);
    return `${m} phút trước`;
  }

  if (diffMs < day) {
    const h = Math.floor(diffMs / hour);
    return `${h} giờ trước`;
  }

  if (diffMs < 2 * day) {
    return 'Hôm qua';
  }

  if (diffMs < month) {
    const d = Math.floor(diffMs / day);
    return `${d} ngày trước`;
  }

  if (diffMs < year) {
    const mo = Math.floor(diffMs / month);
    return `${mo} tháng trước`;
  }

  // Quá 3 năm thì hiện ngày luôn
  const y = Math.floor(diffMs / year);
  if (y >= 3) {
    return format(date, 'dd/MM/yyyy', { locale: vi });
  }

  return `${y} năm trước`;
};

/**
 * Alias cho những chỗ cũ đang dùng `getRelativeTime`.
 */
export const getRelativeTime = formatRelativeTime;

/**
 * Format absolute time (VD: "24/05/2026 15:30").
 */
export const formatAbsoluteTime = (
  dateInput?: string | Date | number | number[] | null,
  formatStr: string = 'dd/MM/yyyy HH:mm',
): string => {
  const date = parseSafeDate(dateInput);
  return format(date, formatStr, { locale: vi });
};
