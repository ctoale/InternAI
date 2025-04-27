class AIService {
  /**
   * Generates a comprehensive travel plan based on trip details
   * @param {Object} tripData - Trip data including destination, dates, preferences, etc.
   * @returns {Promise<Object>} - AI-generated travel itinerary
   */
  async generateTravelPlan(tripData) {
    try {
      if (!tripData.id) {
        throw new Error('Trip ID is required to generate a travel plan');
      }
      
      const response = await fetch(`/api/trips/${tripData.id}/regenerate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ tripData }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to generate travel plan');
      }
      
      const data = await response.json();
      
      this.validateAIResponse(data.itinerary, tripData);
      
      return data;
    } catch (error) {
      console.error('Plan Generation Error:', error);
      throw error;
    }
  }
  
  /**
   * Validates that the AI response has the required structure
   * @param {Object} itinerary - The generated itinerary
   * @param {Object} tripData - Original trip data with dates
   * @throws {Error} If validation fails
   */
  validateAIResponse(itinerary, tripData) {
    if (!itinerary) {
      throw new Error('Response missing itinerary data');
    }
    
    const requiredProperties = ['dailyItinerary', 'totalCost'];
    for (const prop of requiredProperties) {
      if (!itinerary[prop]) {
        throw new Error(`Response missing required property: ${prop}`);
      }
    }
    
    if (!Array.isArray(itinerary.dailyItinerary) || itinerary.dailyItinerary.length === 0) {
      throw new Error('Response has invalid or empty dailyItinerary');
    }
    
    const expectedDays = this.calculateTripDuration(tripData.startDate, tripData.endDate);
    
    if (itinerary.dailyItinerary.length < expectedDays) {
      console.warn(`Generated ${itinerary.dailyItinerary.length} days instead of expected ${expectedDays}`);
    }
    
    itinerary.dailyItinerary.forEach((day, index) => {
      if (!day.day || !day.date) {
        console.warn(`Day ${index + 1} is missing day number or date`);
      }
      
      if (!day.accommodation) {
        console.warn(`Day ${index + 1} missing accommodation information`);
      }
      
      if (!day.activities || !Array.isArray(day.activities) || day.activities.length < 3) {
        console.warn(`Day ${index + 1} has fewer than 3 activities`);
      }
      
      if (!day.meals || !Array.isArray(day.meals) || day.meals.length < 3) {
        console.warn(`Day ${index + 1} has fewer than 3 meals`);
      }
    });
    
    if (typeof itinerary.totalCost !== 'object' || itinerary.totalCost === null || 
        typeof itinerary.totalCost.total !== 'number') {
      throw new Error('Response has invalid totalCost structure');
    }
    
    return true;
  }
  
  /**
   * Calculate the duration of a trip in days
   * @param {string} startDate - Start date of the trip
   * @param {string} endDate - End date of the trip
   * @returns {number} - Number of days in the trip
   */
  calculateTripDuration(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const timeDiff = end.getTime() - start.getTime();
    
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1;
  }
}

export default new AIService(); 