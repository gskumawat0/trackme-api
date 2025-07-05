import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with timezone plugins
dayjs.extend(utc);
dayjs.extend(timezone);

// Get the configured timezone from environment
export const getTimezone = (): string => {
  return process.env['TIMEZONE'] || 'UTC';
};

// Ensure all dates are stored in UTC
export const ensureUtc = (date: Date | string): Date => {
  return dayjs.utc(date).toDate();
};

// Convert local date to UTC for database storage
export const localToUtc = (localDate: Date | string): Date => {
  const timezone = getTimezone();
  return dayjs.tz(localDate, timezone).utc().toDate();
};

// Get current date in UTC
export const getCurrentDateUtc = (): Date => {
  const timezone = getTimezone();
  return dayjs().tz(timezone).utc().toDate();
};

// Get today's date range in UTC (for the configured timezone)
export const getTodayRangeUtc = (): { start: Date; end: Date } => {
  const timezone = getTimezone();
  const today = dayjs().tz(timezone);
  
  return {
    start: today.startOf('day').utc().toDate(),
    end: today.endOf('day').utc().toDate()
  };
};

// Format date in configured timezone
export const formatDateInTimezone = (date: Date | string, format = 'YYYY-MM-DD'): string => {
  const timezone = getTimezone();
  return dayjs.utc(date).tz(timezone).format(format);
};

// Parse a date string in configured timezone and convert to UTC
export const parseLocalToUtc = (dateString: string, format = 'YYYY-MM-DD'): Date => {
  const timezone = getTimezone();
  return dayjs.tz(dateString, format, timezone).utc().toDate();
};

// Get a dayjs object in the configured timezone
export const dayjsInTimezone = (date?: Date | string): dayjs.Dayjs => {
  const timezone = getTimezone();
  return date ? dayjs.tz(date, timezone) : dayjs().tz(timezone);
}; 