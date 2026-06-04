import { formatDistanceToNow, parseISO, isValid } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format a date to a relative string (e.g., "5 phút trước", "Vừa xong")
 * Safe against null, undefined, 0, and invalid dates (which often cause 1/1/1970).
 */
export const getRelativeTime = (dateInput?: string | number | Date | null): string => {
  if (!dateInput) return 'Vừa xong';
  
  if (dateInput === 0 || dateInput === '0') return 'Vừa xong';

  let date: Date;

  try {
    if (dateInput instanceof Date) {
      date = dateInput;
    } else if (typeof dateInput === 'number') {
      date = new Date(dateInput);
    } else if (typeof dateInput === 'string') {
      // Check if purely numeric string
      if (/^\d+$/.test(dateInput)) {
        date = new Date(parseInt(dateInput, 10));
      } else {
        // React Native (Hermes/JSC) often fails on dates with spaces instead of T
        const normalized = dateInput.replace(' ', 'T');
        date = new Date(normalized);
        
        // Ultimate fallback using date-fns parseISO
        if (!isValid(date)) {
          date = parseISO(normalized);
        }
      }
    } else {
      date = new Date(dateInput as any);
    }

    if (!isValid(date) || date.getTime() === 0) {
      return 'Vừa xong';
    }

    return formatDistanceToNow(date, { addSuffix: true, locale: vi });
  } catch (error) {
    return 'Vừa xong';
  }
};
