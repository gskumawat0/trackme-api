import { Frequency, Activity } from '@/types';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(weekOfYear);
dayjs.extend(isSameOrBefore);

/**
 * Check if a daily activity should appear today
 */
export const shouldDailyActivityAppear = (activity: Activity): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Check if activity has start date and we're before it
  if (activity.startDate) {
    const startDate = new Date(activity.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (today < startDate) return false;
  }

  // Check if activity has end date and we're after it
  if (activity.endDate) {
    const endDate = new Date(activity.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (today > endDate) return false;
  }

  return true;
};

/**
 * Check if a weekly activity should appear this week (Sunday is start of week)
 */
export const shouldWeeklyActivityAppear = (activity: Activity): boolean => {
  const today = new Date();
  const currentDay = today.getDay(); // 0 = Sunday, 1 = Monday, etc.

  // Get the start of this week (Sunday)
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - currentDay);
  weekStart.setHours(0, 0, 0, 0);

  // Check if activity has start date and we're before it
  if (activity.startDate) {
    const startDate = new Date(activity.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (weekStart < startDate) return false;
  }

  // Check if activity has end date and we're after it
  if (activity.endDate) {
    const endDate = new Date(activity.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (weekStart > endDate) return false;
  }

  return true;
};

/**
 * Check if a monthly activity should appear this month
 */
export const shouldMonthlyActivityAppear = (activity: Activity): boolean => {
  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  // Get the start of this month
  const monthStart = new Date(currentYear, currentMonth, 1);
  monthStart.setHours(0, 0, 0, 0);

  // Check if activity has start date and we're before it
  if (activity.startDate) {
    const startDate = new Date(activity.startDate);
    startDate.setHours(0, 0, 0, 0);
    if (monthStart < startDate) return false;
  }

  // Check if activity has end date and we're after it
  if (activity.endDate) {
    const endDate = new Date(activity.endDate);
    endDate.setHours(0, 0, 0, 0);
    if (monthStart > endDate) return false;
  }

  return true;
};

/**
 * Get activities that should appear today/this week/this month based on their frequency
 */
export const getActivitiesForDisplay = (activities: Activity[]): Activity[] => {
  const today = dayjs();
  const currentWeekStart = today.startOf('week');
  const currentMonthStart = today.startOf('month');

  return activities.filter(activity => {
    // Check if activity is within its date range
    if (activity.startDate && dayjs(activity.startDate).isAfter(today)) {
      return false;
    }
    if (activity.endDate && dayjs(activity.endDate).isBefore(today)) {
      return false;
    }

    switch (activity.frequency) {
      case Frequency.DAILY:
        return true; // Daily activities always appear
      case Frequency.WEEKLY:
        return dayjs(activity.startDate || activity.createdAt).isSameOrBefore(
          currentWeekStart
        );
      case Frequency.MONTHLY:
        return dayjs(activity.startDate || activity.createdAt).isSameOrBefore(
          currentMonthStart
        );
      default:
        return false;
    }
  });
};

/**
 * Get activities grouped by frequency
 */
export const getActivitiesByFrequency = (activities: Activity[]) => {
  const grouped = {
    daily: activities.filter(a => a.frequency === Frequency.DAILY),
    weekly: activities.filter(a => a.frequency === Frequency.WEEKLY),
    monthly: activities.filter(a => a.frequency === Frequency.MONTHLY),
  };

  return grouped;
};


/**
 * Get activities that should appear today based on their frequency
 */
export const getDailyActivities = (activities: Activity[]): Activity[] => {
  return activities.filter(activity => {
    if (activity.frequency !== Frequency.DAILY) return false;

    const today = dayjs();
    if (activity.startDate && dayjs(activity.startDate).isAfter(today))
      return false;
    if (activity.endDate && dayjs(activity.endDate).isBefore(today))
      return false;

    return true;
  });
};

/**
 * Get activities that should appear this week based on their frequency
 */
export const getWeeklyActivities = (activities: Activity[]): Activity[] => {
  return activities.filter(activity => {
    if (activity.frequency !== Frequency.WEEKLY) return false;

    const today = dayjs();
    const currentWeekStart = today.startOf('week');

    if (activity.startDate && dayjs(activity.startDate).isAfter(today))
      return false;
    if (activity.endDate && dayjs(activity.endDate).isBefore(today))
      return false;

    return dayjs(activity.startDate || activity.createdAt).isSameOrBefore(
      currentWeekStart
    );
  });
};

/**
 * Get activities that should appear this month based on their frequency
 */
export const getMonthlyActivities = (activities: Activity[]): Activity[] => {
  return activities.filter(activity => {
    if (activity.frequency !== Frequency.MONTHLY) return false;

    const today = dayjs();
    const currentMonthStart = today.startOf('month');

    if (activity.startDate && dayjs(activity.startDate).isAfter(today))
      return false;
    if (activity.endDate && dayjs(activity.endDate).isBefore(today))
      return false;

    return dayjs(activity.startDate || activity.createdAt).isSameOrBefore(
      currentMonthStart
    );
  });
};
