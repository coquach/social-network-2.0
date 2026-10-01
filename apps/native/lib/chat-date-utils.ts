import { parseSafeDate } from "@repo/shared";
import { format, isSameYear } from "date-fns";
import { vi } from "date-fns/locale";

export type ChatDateValue = Date | string | number | null | undefined;

export const coerceChatDate = (value: ChatDateValue): Date => {
  return parseSafeDate(value as any);
};

export const getChatDateMs = (value: ChatDateValue) => {
  return coerceChatDate(value).getTime();
};

export const getChatDayKey = (value: ChatDateValue) => {
  const date = coerceChatDate(value);
  return format(date, "yyyy-MM-dd");
};

export const formatMessageTimestamp = (value?: ChatDateValue) => {
  if (!value) return "";
  return format(coerceChatDate(value), "HH:mm");
};

export const formatConversationTime = (value?: ChatDateValue) => {
  if (!value) return "";
  const date = coerceChatDate(value);
  const now = new Date();

  const dateStr = format(date, "yyyy-MM-dd");
  const nowStr = format(now, "yyyy-MM-dd");
  if (dateStr === nowStr) return "Hôm nay";

  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");
  if (dateStr === yesterdayStr) return "Hôm qua";

  return format(date, isSameYear(date, now) ? "dd/MM" : "dd/MM/yy");
};

export const formatMessageDateLabel = (value?: ChatDateValue) => {
  if (!value) return "";
  const date = coerceChatDate(value);
  const now = new Date();

  const dateStr = format(date, "yyyy-MM-dd");
  const nowStr = format(now, "yyyy-MM-dd");
  if (dateStr === nowStr) return "Hôm nay";

  const yesterday = new Date(now.getTime() - 24 * 3600 * 1000);
  const yesterdayStr = format(yesterday, "yyyy-MM-dd");
  if (dateStr === yesterdayStr) return "Hôm qua";

  return format(date, "EEEE, dd 'tháng' MM, yyyy", { locale: vi });
};
