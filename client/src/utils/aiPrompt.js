/**
 * Calculate the duration of a trip in days
 * @param {string|Date} startDate - Start date of the trip
 * @param {string|Date} endDate - End date of the trip
 * @returns {number} - Number of days in the trip
 */
export const calculateTripDuration = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  
  const timeDiff = end.getTime() - start.getTime();
  
  return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
};

/**
 * Format trip budget for display
 * @param {number|null} budget - Trip budget amount or null
 * @returns {string} - Formatted budget string
 */
export const formatBudget = (budget) => {
  return budget ? `$${budget}` : 'Flexible (no specific limit)';
};

export default {
  calculateTripDuration,
  formatBudget
}; 