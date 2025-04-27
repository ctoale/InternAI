import os
import json
import asyncio
from typing import Dict, List, Any, Optional
from datetime import datetime, timedelta
import openai
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class AIService:
    """
    Service for handling interactions with AI and search services to generate 
    comprehensive travel plans.
    """

    def __init__(self):
        # Initialize API key from environment variable
        self.openai_api_key = os.getenv("OPENAI_API_KEY")
        
        # Set up OpenAI client
        self.openai_client = openai.OpenAI(api_key=self.openai_api_key)
        
        # Maximum token count for GPT-3.5-Turbo
        self.max_tokens = 4096
        
    async def generate_trip_plan(self, trip_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate a comprehensive trip plan based on user preferences.
        
        Args:
            trip_data (Dict[str, Any]): User's trip preferences and details
            
        Returns:
            Dict[str, Any]: Complete trip itinerary
        """
        try:
            # Create a structured prompt for the AI based on trip data
            prompt = self._create_trip_plan_prompt(trip_data)
            
            # Get AI response with trip plan
            ai_response = await self._get_ai_response(prompt)
            
            # Parse the AI response to extract JSON
            itinerary = self._parse_ai_response(ai_response)
            
            return itinerary
            
        except Exception as e:
            print(f"Error generating trip plan: {str(e)}")
            raise e
    
    async def regenerate_trip_plan(self, trip_id: str, modifications: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Regenerate a trip plan with specified modifications.
        
        Args:
            trip_id (str): ID of the trip to regenerate
            modifications (Dict[str, Any], optional): Specific changes to make
            
        Returns:
            Dict[str, Any]: Updated trip itinerary
        """
        try:
            # Here you would typically retrieve the existing trip from a database
            # For now, we'll assume modifications contains all necessary trip data
            if not modifications:
                raise ValueError("Modifications are required for trip regeneration")
            
            return await self.generate_trip_plan(modifications)
            
        except Exception as e:
            print(f"Error regenerating trip plan: {str(e)}")
            raise e
    
    async def generate_day_itinerary(self, trip_data: Dict[str, Any], day_number: int) -> Dict[str, Any]:
        """
        Generate an itinerary for a specific day of a trip.
        
        Args:
            trip_data (Dict[str, Any]): Trip details and preferences
            day_number (int): The day number to generate an itinerary for
            
        Returns:
            Dict[str, Any]: The daily itinerary for the specified day
        """
        try:
            # Create a prompt for generating just the specified day's itinerary
            prompt = self._create_day_itinerary_prompt(trip_data, day_number)
            
            # Get AI response with day plan
            ai_response = await self._get_ai_response(prompt)
            
            # Parse the AI response to extract JSON
            day_itinerary = self._parse_ai_response(ai_response)
            
            return day_itinerary
            
        except Exception as e:
            print(f"Error generating day itinerary: {str(e)}")
            raise e
    
    async def get_travel_recommendations(self, query: str) -> Dict[str, Any]:
        """
        Get travel recommendations based on a natural language query.
        
        Args:
            query (str): Natural language query about travel plans
            
        Returns:
            Dict[str, Any]: Travel recommendations in structured format
        """
        try:
            # Create a prompt for the AI based on the query
            prompt = self._create_recommendations_prompt(query)
            
            # Get AI response with recommendations
            ai_response = await self._get_ai_response(prompt)
            
            # Parse the AI response to extract JSON
            recommendations = self._parse_ai_response(ai_response)
            
            return recommendations
            
        except Exception as e:
            print(f"Error getting travel recommendations: {str(e)}")
            raise e
    
    async def _get_ai_response(self, prompt: str) -> str:
        """
        Get a response from the OpenAI API.
        
        Args:
            prompt (str): The prompt to send to OpenAI
            
        Returns:
            str: The AI response
        """
        try:
            # Use the new OpenAI client API format (v1.0.0+)
            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[
                    {"role": "system", "content": "You are a travel planning expert that always responds in valid JSON format."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=self.max_tokens,
                temperature=0.7
            )
            
            # Access content from the new format
            return response.choices[0].message.content
            
        except Exception as e:
            print(f"Error getting AI response: {str(e)}")
            raise e
    
    def _parse_ai_response(self, response: str) -> Dict[str, Any]:
        """
        Parse the AI response to extract JSON.
        
        Args:
            response (str): AI response text
            
        Returns:
            Dict[str, Any]: Parsed JSON data
        """
        try:
            # Extract JSON from the response (handles cases where AI might include explanatory text)
            json_start = response.find('{')
            json_end = response.rfind('}') + 1
            
            if json_start >= 0 and json_end > json_start:
                json_str = response[json_start:json_end]
                return json.loads(json_str)
            
            # If no JSON format detected, try to parse the entire response
            return json.loads(response)
            
        except json.JSONDecodeError:
            print(f"Error parsing AI response: {response[:100]}...")
            # Return a minimal valid structure if parsing fails
            return {
                "flights": [],
                "accommodations": [],
                "dailyItinerary": [],
                "totalCost": {
                    "flights": 0,
                    "accommodation": 0,
                    "activities": 0,
                    "transportation": 0,
                    "meals": 0,
                    "total": 0
                },
                "additionalInfo": {
                    "emergencyContacts": [],
                    "localCustoms": [],
                    "packingList": []
                }
            }
    
    def _create_trip_plan_prompt(self, trip_data: Dict[str, Any]) -> str:
        """
        Create a detailed prompt for trip plan generation.
        
        Args:
            trip_data (Dict[str, Any]): Trip details and preferences
            
        Returns:
            str: Formatted prompt
        """
        destination = trip_data.get("destination", "Unknown")
        start_date = trip_data.get("startDate", "")
        end_date = trip_data.get("endDate", "")
        budget = trip_data.get("budget", 0)
        departure_location = trip_data.get("departureLocation", "")
        number_of_travelers = trip_data.get("travelers", 1) or trip_data.get("numberOfTravelers", 1)
        
        # Get additional destinations
        additional_destinations = trip_data.get("destinations", [])
        
        # Find the earliest start date and latest end date considering all destinations
        earliest_start = None
        latest_end = None
        
        if start_date and end_date:
            try:
                earliest_start = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if 'Z' in start_date else datetime.fromisoformat(start_date)
                latest_end = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if 'Z' in end_date else datetime.fromisoformat(end_date)
                
                # Check additional destinations for earlier start or later end dates
                for dest in additional_destinations:
                    dest_start = dest.get("startDate", "")
                    dest_end = dest.get("endDate", "")
                    
                    if dest_start and dest_end:
                        try:
                            dest_start_date = datetime.fromisoformat(dest_start.replace('Z', '+00:00')) if 'Z' in dest_start else datetime.fromisoformat(dest_start)
                            dest_end_date = datetime.fromisoformat(dest_end.replace('Z', '+00:00')) if 'Z' in dest_end else datetime.fromisoformat(dest_end)
                            
                            earliest_start = min(earliest_start, dest_start_date)
                            latest_end = max(latest_end, dest_end_date)
                        except:
                            pass
            except:
                pass
        
        # Calculate trip duration
        trip_duration = "unknown duration"
        if earliest_start and latest_end:
            days = (latest_end - earliest_start).days + 1
            trip_duration = f"{days} days"
            
            # Update start_date and end_date to use the full trip duration
            start_date = earliest_start.isoformat()
            end_date = latest_end.isoformat()
        
        # Extract preferences
        preferences = trip_data.get("preferences", {})
        accommodation_type = preferences.get("accommodationType", "Any")
        transportation_type = preferences.get("transportationType", "Any")
        activities = ", ".join(preferences.get("activities", []))
        dietary_restrictions = ", ".join(preferences.get("dietaryRestrictions", []))
        places_to_visit = ", ".join(preferences.get("placesToVisit", []))
        
        # Format additional destinations for the prompt
        additional_destinations_text = ""
        if additional_destinations:
            additional_destinations_text = "\n\n## Additional Destinations\n"
            for i, dest in enumerate(additional_destinations):
                dest_location = dest.get("location", "Unknown")
                dest_start = dest.get("startDate", "")
                dest_end = dest.get("endDate", "")
                dest_places = ", ".join(dest.get("placesToVisit", []))
                
                additional_destinations_text += f"- Destination {i+1}: {dest_location}\n"
                additional_destinations_text += f"  - Dates: {dest_start} to {dest_end}\n"
                if dest_places:
                    additional_destinations_text += f"  - Places to Visit: {dest_places}\n"
        
        # Build the prompt
        prompt = f"""
# TRAVEL ITINERARY GENERATION REQUEST

## Trip Overview
- Main Destination: {destination}
- Dates: {start_date} to {end_date} ({trip_duration})
- Total Budget: ${budget}
- Accommodation Preference: {accommodation_type}
- Transportation Preference: {transportation_type}
- Departure Location: {departure_location}
- Number of Travelers: {number_of_travelers}

## Preferences
- Activities of Interest: {activities}
- Places to Visit: {places_to_visit}
- Dietary Restrictions: {dietary_restrictions}{additional_destinations_text}

## REQUIRED OUTPUT FORMAT
You MUST provide a complete travel itinerary in valid JSON format matching the following structure. Do not include any explanations or text outside of the JSON structure.

```json
{{
  "flights": [
    {{
      "airline": "Real Airline Name (not 'Sample Airlines' or 'Example Airlines')",
      "flightNumber": "AA123",
      "departureTime": "YYYY-MM-DDTHH:MM:SS",
      "arrivalTime": "YYYY-MM-DDTHH:MM:SS",
      "price": 0,
      "bookingLink": "https://example.com",
      "departureLocation": "Airport Code - City/Region (e.g., JFK - New York)",
      "arrivalLocation": "Airport Code - City/Region (e.g., CDG - Paris)"
    }}
  ],
  "accommodations": [
    {{
      "name": "Real Hotel or Accommodation Name",
      "location": "Address or Area",
      "checkIn": "YYYY-MM-DDTHH:MM:SS",
      "checkOut": "YYYY-MM-DDTHH:MM:SS",
      "price": 0,
      "amenities": ["Amenity 1", "Amenity 2"],
      "bookingLink": "https://example.com",
      "type": "Hotel/Hostel/Airbnb/etc."
    }}
  ],
  "dailyItinerary": [
    {{
      "day": 1,
      "date": "YYYY-MM-DD",
      "accommodation": {{
        "name": "Real Accommodation Name",
        "location": "Address",
        "notes": "Any special notes about the stay"
      }},
      "activities": [
        {{
          "time": "HH:MM AM/PM",
          "activity": "Description of activity",
          "name": "Real Attraction or Activity Name",
          "location": "Specific Location",
          "cost": 0,
          "duration": "X hours",
          "notes": "Any additional information"
        }}
      ],
      "meals": [
        {{
          "time": "HH:MM AM/PM",
          "restaurant": "Real Restaurant Name",
          "cuisine": "Type of cuisine",
          "priceRange": "$-$$$",
          "dietaryOptions": ["Option 1", "Option 2"]
        }}
      ],
      "transportation": [
        {{
          "type": "Specific Transportation Type",
          "route": "From A to B",
          "cost": 0,
          "duration": "X minutes/hours"
        }}
      ]
    }}
  ],
  "totalCost": {{
    "flights": 0,
    "accommodation": 0,
    "activities": 0,
    "transportation": 0,
    "meals": 0,
    "total": 0
  }},
  "additionalInfo": {{
    "emergencyContacts": ["Contact 1", "Contact 2"],
    "localCustoms": ["Custom 1", "Custom 2"],
    "packingList": ["Item 1", "Item 2"]
  }}
}}
```

## GENERATION GUIDELINES
1. Include 2-3 activities per day.
2. Include 2-3 meal locations per day.
3. Ensure all activities are appropriate for the destination and preferences.
4. Include realistic cost estimates for all items.
5. Provide emergency contacts specific to the destination.
6. Include accommodation details suitable for the budget and preferences.
7. Provide 2-3 packing recommendations appropriate for the destination.
8. Include 2-3 local customs or cultural norms to be aware of.
9. Provide detailed transportation options based on preferences.
10. ALWAYS use real airline names (Delta, United, American Airlines, British Airways, Air France, etc.) instead of generic names like "Sample Airlines" or "Example Airlines".
11. ALWAYS use real hotel chains, restaurant names, and attraction names when available.
12. When planning flights, use the provided departure location as the origin, NOT the destination. This should be the user's home airport/city.
13. If the user provided a city name or region rather than an airport code, select the most appropriate major airport serving that location (e.g., "JFK" or "LaGuardia" if user provided "New York").
14. For flights, clearly include both the airport code and city name in both departure and arrival locations.
15. IMPORTANT: For multi-destination trips, plan activities appropriate for each destination during the dates specified.
16. CRITICAL: If the trip includes multiple destinations, plan daily itineraries for ALL destinations based on their respective date ranges.
17. Make sure to include transportation between different destinations in the itinerary.
"""
        
        return prompt
    
    def _create_day_itinerary_prompt(self, trip_data: Dict[str, Any], day_number: int) -> str:
        """
        Create a prompt for generating a specific day's itinerary.
        
        Args:
            trip_data (Dict[str, Any]): Trip details and preferences
            day_number (int): The day number to generate an itinerary for
            
        Returns:
            str: Formatted prompt
        """
        destination = trip_data.get("destination", "Unknown")
        start_date = trip_data.get("startDate", "")
        budget = trip_data.get("budget", 0)
        
        # Calculate the date for the specific day
        specific_date = ""
        try:
            start = datetime.fromisoformat(start_date.replace('Z', '+00:00')) if 'Z' in start_date else datetime.fromisoformat(start_date)
            target_date = start + timedelta(days=day_number - 1)
            specific_date = target_date.strftime('%Y-%m-%d')
        except:
            specific_date = "Unknown Date"
        
        # Extract preferences
        preferences = trip_data.get("preferences", {})
        transportation_type = preferences.get("transportationType", "Any")
        activities = ", ".join(preferences.get("activities", []))
        dietary_restrictions = ", ".join(preferences.get("dietaryRestrictions", []))
        places_to_visit = ", ".join(preferences.get("placesToVisit", []))
        
        # Handle additional destinations
        destinations = trip_data.get("destinations", [])
        current_destination = destination
        
        # Check if this day falls into an additional destination's date range
        for dest in destinations:
            dest_start = dest.get("startDate", "")
            dest_end = dest.get("endDate", "")
            
            if dest_start and dest_end:
                try:
                    dest_start_date = datetime.fromisoformat(dest_start.replace('Z', '+00:00')) if 'Z' in dest_start else datetime.fromisoformat(dest_start)
                    dest_end_date = datetime.fromisoformat(dest_end.replace('Z', '+00:00')) if 'Z' in dest_end else datetime.fromisoformat(dest_end)
                    
                    if dest_start_date <= target_date <= dest_end_date:
                        current_destination = dest.get("location", destination)
                        if "placesToVisit" in dest and dest["placesToVisit"]:
                            places_to_visit = ", ".join(dest["placesToVisit"])
                        break
                except:
                    pass
        
        # Get existing days' activities to avoid duplication
        existing_activities = []
        existing_restaurants = []
        
        # Process existing days from the input
        if "existingDays" in trip_data and trip_data["existingDays"]:
            for day in trip_data["existingDays"]:
                if "activities" in day and day["activities"]:
                    for activity in day["activities"]:
                        if "name" in activity and activity["name"]:
                            existing_activities.append(activity["name"])
                        if "activity" in activity and activity["activity"]:
                            existing_activities.append(activity["activity"])
                
                if "meals" in day and day["meals"]:
                    for meal in day["meals"]:
                        if "restaurant" in meal and meal["restaurant"]:
                            existing_restaurants.append(meal["restaurant"])
        
        # Format existing activities and restaurants for the prompt
        existing_activities_str = ", ".join(existing_activities) if existing_activities else "None"
        existing_restaurants_str = ", ".join(existing_restaurants) if existing_restaurants else "None"
        
        # Build the prompt
        prompt = f"""
# DAILY ITINERARY GENERATION REQUEST

## Day Overview
- Day Number: {day_number}
- Date: {specific_date}
- Current Destination: {current_destination}
- Daily Budget: Approximately ${budget / 10} (portion of total budget)
- Transportation Preference: {transportation_type}

## Preferences
- Activities of Interest: {activities}
- Places to Visit: {places_to_visit}
- Dietary Restrictions: {dietary_restrictions}

## Previously Recommended (AVOID DUPLICATING THESE)
- Activities/Attractions: {existing_activities_str}
- Restaurants: {existing_restaurants_str}

## REQUIRED OUTPUT FORMAT
You MUST provide a daily itinerary in valid JSON format matching the following structure. Do not include any explanations or text outside of the JSON structure.

```json
{{
  "dayItinerary": {{
    "day": {day_number},
    "date": "{specific_date}",
    "activities": [
      {{
        "time": "HH:MM AM/PM",
        "activity": "Description of activity",
        "name": "Real Attraction or Activity Name",
        "location": "Specific Location",
        "cost": 0,
        "duration": "X hours",
        "notes": "Any additional information"
      }}
    ],
    "meals": [
      {{
        "time": "HH:MM AM/PM",
        "restaurant": "Real Restaurant Name",
        "cuisine": "Type of cuisine",
        "priceRange": "$-$$$",
        "dietaryOptions": ["Option 1", "Option 2"]
      }}
    ],
    "transportation": [
      {{
        "type": "Specific Transportation Type",
        "route": "From A to B",
        "cost": 0,
        "duration": "X minutes/hours"
      }}
    ]
  }}
}}
```

## GENERATION GUIDELINES
1. Include EXACTLY 3 specific activities for this day - do NOT use generic placeholders.
2. Include EXACTLY 3 meal locations (breakfast, lunch, dinner) - always use real restaurant names.
3. All activities MUST be real, well-known attractions or experiences in {current_destination}.
4. Include specific and realistic cost estimates for all items.
5. Provide detailed transportation details between activities with exact routes.
6. All activities and restaurants MUST be specific to {current_destination} - research real places.
7. For restaurants, include specific cuisine types that honor these dietary restrictions: {dietary_restrictions}.
8. All times should be realistic and allow for proper travel time between locations.
9. Focus only on this specific day's itinerary - be thorough and detailed.
10. DO NOT use generic descriptions like "Local Museum" or "City Park" - always use real, specific names.
11. DO NOT recommend any activities or restaurants already recommended in previous days.
12. DO NOT duplicate any of the previously recommended activities or restaurants listed above.
13. IMPORTANT: Activity and restaurant names should be specific and identifiable (e.g., "The Louvre Museum" not "Art Museum", "Café de Flore" not "Local Café").
14. Include highly specific details in all descriptions - mention specific exhibits, dishes, routes, etc.
15. Every restaurant must be a real establishment that exists in {current_destination}.
"""
        
        return prompt
    
    def _create_recommendations_prompt(self, query: str) -> str:
        """
        Create a prompt for travel recommendations.
        
        Args:
            query (str): User's query
            
        Returns:
            str: Formatted prompt
        """
        prompt = f"""
# TRAVEL RECOMMENDATIONS REQUEST

## User Query
{query}

## REQUIRED OUTPUT FORMAT
Provide travel recommendations in valid JSON format matching the following structure:

```json
{{
  "flights": [],
  "accommodations": [],
  "dailyItinerary": [],
  "totalCost": {{
    "flights": 0,
    "accommodation": 0,
    "activities": 0,
    "transportation": 0,
    "meals": 0,
    "total": 0
  }},
  "additionalInfo": {{
    "emergencyContacts": [],
    "localCustoms": [],
    "packingList": []
  }}
}}
```

## IMPORTANT GUIDELINES:
1. Include as much detailed information as possible based on the user's query.
2. Only include sections that are relevant to the query.
3. ALWAYS use real airline names (Delta, United, American Airlines, British Airways, Air France, etc.) instead of generic names like "Sample Airlines" or "Example Airlines".
4. ALWAYS use real hotel chains, restaurant names, and attraction names when available.
5. Be specific and detailed in your recommendations rather than using generic placeholders.
"""
        
        return prompt
