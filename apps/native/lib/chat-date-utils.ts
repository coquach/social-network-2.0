import { format, isToday, isYesterday } from "date-fns";
import { vi } from "date-fns/locale";

export type ChatDateValue = Date | string | number | null | undefined;

export const coerceChatDate = (value: ChatDateValue): Date | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "object") {
    const candidate = value as {
      $date?: Date | string | number;
      date?: Date | string | number;
      toDate?: () => Date;
      seconds?: number;
      _seconds?: number;
    };

    if (typeof candidate.toDate === "function") {
      return coerceChatDate(candidate.toDate());
    }

    if (candidate.$date !== undefined) {
      return coerceChatDate(candidate.$date);
    }

    if (candidate.date !== undefined) {
      return coerceChatDate(candidate.date);
    }

    if (typeof candidate.seconds === "number") {
      return new Date(candidate.seconds * 1000);
    }

    if (typeof candidate._seconds === "number") {
      return new Date(candidate._seconds * 1000);
    }
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date;
};

export const getChatDateMs = (value: ChatDateValue) => {
  return coerceChatDate(value)?.getTime() ?? 0;
};

export const getChatDayKey = (value: ChatDateValue) => {
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

  return format(date, "yyyy-MM-dd");
};

export const formatMessageDateLabel = (value?: ChatDateValue) => {
  const date = coerceChatDate(value);

  if (!date) {
    return "";
  }

  if (isToday(date)) {
    return "Hôm nay";
  }

  if (isYesterday(date)) {
    return "Hôm qua";
  }

  return format(date, "EEEE, dd 'tháng' MM, yyyy", {
    locale: vi,
  });
};
