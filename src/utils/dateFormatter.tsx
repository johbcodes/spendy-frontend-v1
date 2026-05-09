/**
 * Format datetime string to display date and time separately in required format
 * Converts to dd-mm-yyyy format with 24-hour time in Nairobi timezone
 */
export const formatDateTime = (dateTimeString: string): { date: string; time: string } => {
  if (!dateTimeString) {
    return { date: '', time: '' };
  }

  // Parse the date string to a Date object
  const dateObj = new Date(dateTimeString);

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return { date: '', time: '' };
  }

  // Use Intl.DateTimeFormat to get individual components in Nairobi timezone
  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(dateObj);

  // Extract individual components
  const day = parts.find(p => p.type === 'day')?.value || '00';
  const month = parts.find(p => p.type === 'month')?.value || '00';
  const year = parts.find(p => p.type === 'year')?.value || '0000';
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';

  const dateStr = `${day}-${month}-${year}`;
  const timeStr = `${hour}:${minute}`;

  return { date: dateStr, time: timeStr };
};

/**
 * Format datetime for display in a single line with proper formatting (dd-mm-yyyy HH:MM)
 */
export const formatDateTimeDisplay = (dateTimeString: string): string => {
  const { date, time } = formatDateTime(dateTimeString);
  if (time) {
    return `${date} ${time}`;
  }
  return date;
};

/**
 * Component to display date and time in a stacked layout
 */
export const DateTimeDisplay = ({ dateTime }: { dateTime: string }) => {
  const { date, time } = formatDateTime(dateTime);
  
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-dark-gray">{date}</span>
      {time && <span className="text-xs text-gray-500">{time}</span>}
    </div>
  );
};

/**
 * Check if a date string is in the past
 * Returns true if the date/time is before current date/time
 */
export const isPastDate = (dateTimeString: string): boolean => {
  if (!dateTimeString) return false;
  
  const inputDate = new Date(dateTimeString);
  const now = new Date();
  
  return inputDate < now;
};

/**
 * Get validation error message for past dates
 */
export const getPastDateErrorMessage = (): string => {
  return 'You cannot create or edit events/expenses with dates in the past. Please select a future date.';
};

/**
 * Get current datetime in Nairobi timezone formatted for database storage
 * Returns format: yyyy-mm-ddTHH:MM (compatible with datetime-local input)
 */
export const getCurrentNairobiDateTime = (): string => {
  const now = new Date();

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Africa/Nairobi',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const parts = formatter.formatToParts(now);

  const day = parts.find(p => p.type === 'day')?.value || '00';
  const month = parts.find(p => p.type === 'month')?.value || '00';
  const year = parts.find(p => p.type === 'year')?.value || '0000';
  const hour = parts.find(p => p.type === 'hour')?.value || '00';
  const minute = parts.find(p => p.type === 'minute')?.value || '00';

  // Return in ISO-like format: yyyy-mm-ddTHH:MM
  return `${year}-${month}-${day}T${hour}:${minute}`;
};
