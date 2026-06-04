export function formatRelativeTime(date?: string | Date | number | number[] | null): string {
  if (!date) return 'N/A'; // Debug: check if date is undefined

  let inputDate: Date;
  if (date instanceof Date) {
    inputDate = date;
  } else if (typeof date === 'number') {
    // Xử lý nếu BE trả về timestamp (milliseconds)
    inputDate = new Date(date);
  } else if (typeof date === 'string') {
    // Nếu BE trả về string dạng số (vd: "1717590000000")
    if (!isNaN(Number(date)) && date.trim() !== '') {
      inputDate = new Date(Number(date));
    } else {
      // Fix cho Hermes/JSC trên iOS/Android khi parse string có dấu cách "YYYY-MM-DD HH:mm:ss"
      const parsedStr = date.includes('T') ? date : date.replace(' ', 'T');
      inputDate = new Date(parsedStr);
    }
  } else if (Array.isArray(date)) {
    // Xử lý nếu BE (Java/Python) trả về mảng [YYYY, MM, DD, HH, mm, ss]
    const [y, m = 1, d = 1, h = 0, min = 0, s = 0] = date;
    inputDate = new Date(y, m - 1, d, h, min, s);
  } else {
    inputDate = new Date(date as any);
  }

  if (Number.isNaN(inputDate.getTime()) || inputDate.getTime() === 0) {
    // Nếu vẫn lỗi, in thẳng giá trị thật ra UI để biết BE đang trả về cái gì
    return `ERR: ${JSON.stringify(date)}`;
  }

  const now = Date.now();
  let diffMs = now - inputDate.getTime();
  
  if (diffMs < 0) {
    // Debug: Hiển thị nếu ngày ở tương lai
    return `FUT: ${String(date)}`;
  }
  
  diffMs = Math.max(0, diffMs);

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;
  const month = 30 * day;
  const year = 365 * day;

  if (diffMs < minute) {
    const s = Math.floor(diffMs / 1000);
    return `${s} giây trước`; // Debug: show exact seconds
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

  // 🔥 Nếu quá 3 năm → show date luôn cho sạch UI
  const y = Math.floor(diffMs / year);
  if (y >= 3) {
    return inputDate.toLocaleDateString('vi-VN');
  }

  return `${y} năm trước`;
}
