export const reportSchemas = {
  dateRange: {
    startDate: {
      required: false,
      message: 'Start date must be valid'
    },
    endDate: {
      required: false,
      message: 'End date must be valid'
    }
  }
};

export function validateDateRange(startDate?: string, endDate?: string): { valid: boolean; error?: string } {
  if (!startDate || !endDate) {
    return { valid: true }; // Optional dates
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime())) {
    return { valid: false, error: 'Invalid start date' };
  }

  if (isNaN(end.getTime())) {
    return { valid: false, error: 'Invalid end date' };
  }

  if (start > end) {
    return { valid: false, error: 'Start date must be before end date' };
  }

  return { valid: true };
}
