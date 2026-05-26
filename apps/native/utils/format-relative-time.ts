export function formatRelativeTime(date: string | Date): string {
  const inputDate = date instanceof Date ? date : new Date(date);
  if (Number.isNaN(inputDate.getTime()) || inputDate.getTime() === 0) {
    return 'Vừa đây';
  }

  const now = Date.now();
  const diffMs = Math.max(0, now - inputDate.getTime());

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) return 'Vừa đây';

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

  // 🔥 Nếu quá 3 năm → show date luôn cho sạch UI
  const y = Math.floor(diffMs / year);
  if (y >= 3) {
    return inputDate.toLocaleDateString('vi-VN');
  }

  return `${y} năm trước`;
}
