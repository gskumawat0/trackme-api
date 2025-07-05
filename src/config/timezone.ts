// Timezone configuration for the backend using dayjs
// All dates are stored in UTC in the database

export { 
  getTimezone, 
  ensureUtc, 
  localToUtc, 
  getCurrentDateUtc, 
  getTodayRangeUtc 
} from '../utils/dayjs'; 