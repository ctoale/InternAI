from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import date
import sys
import os
import importlib.util

src_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(src_dir)

ai_service_path = os.path.join(src_dir, 'server', 'ai_service.py')
spec = importlib.util.spec_from_file_location("ai_service", ai_service_path)
ai_service_module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(ai_service_module)
AIService = ai_service_module.AIService

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ai_service = AIService()

class TripPreferences(BaseModel):
    destination: str
    start_date: date
    end_date: date
    budget: float
    accommodation_type: str
    transportation_type: str
    activities: List[str]
    dietary_restrictions: List[str]

class TripPreferencesRequest(BaseModel):
    tripPreferences: Dict

@app.get("/")
async def root():
    return {"message": "ItinerAI API"}

@app.post("/api/generate-travel-plan")
async def generate_travel_plan(request: TripPreferencesRequest):
    try:
        print(f"[Python Backend] Received request to generate travel plan")
        preferences = request.tripPreferences
        
        query = f"Plan a trip to {preferences.get('destination', 'Unknown')} for "
        
        if preferences.get('startDate') and preferences.get('endDate'):
            from datetime import datetime
            start = datetime.fromisoformat(preferences['startDate'].replace('Z', '+00:00')) if 'Z' in preferences['startDate'] else datetime.fromisoformat(preferences['startDate'])
            end = datetime.fromisoformat(preferences['endDate'].replace('Z', '+00:00')) if 'Z' in preferences['endDate'] else datetime.fromisoformat(preferences['endDate'])
            days = (end - start).days + 1
            query += f"{days} days "
        
        if preferences.get('preferences', {}).get('dietaryRestrictions'):
            dietary = ", ".join(preferences['preferences']['dietaryRestrictions'])
            query += f"with {dietary} dietary requirements "
        
        if preferences.get('preferences', {}).get('activities'):
            activities = ", ".join(preferences['preferences']['activities'])
            query += f"including {activities} activities"
        
        print(f"[Python Backend] Calling AI service with query: {query}")
        
        recommendations = await ai_service.get_travel_recommendations(query)
        
        print(f"[Python Backend] Received recommendations from AI service")
        
        formatted_response = {
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
                "packingList": [],
                "weatherForecast": []
            }
        }
        
        for rec in recommendations:
            rec_type = rec.get("type")
            content = rec.get("content", {})
            
            if rec_type == "accommodation":
                formatted_response["accommodations"].append({
                    "name": content.get("name", ""),
                    "checkIn": preferences.get('startDate', ""),
                    "checkOut": preferences.get('endDate', ""),
                    "address": content.get("location", ""),
                    "price": 100, # Default placeholder
                    "rating": 4.5, # Default placeholder
                    "amenities": content.get("highlights", [])
                })
            elif rec_type == "itinerary":
                formatted_response["dailyItinerary"].append({
                    "day": content.get("day", 0),
                    "date": content.get("date", ""),
                    "activities": [
                        {
                            "name": content.get("morning", "Morning activity"),
                            "time": "09:00",
                            "description": "Morning activity"
                        },
                        {
                            "name": content.get("afternoon", "Afternoon activity"),
                            "time": "14:00",
                            "description": "Afternoon activity"
                        },
                        {
                            "name": content.get("evening", "Evening activity"),
                            "time": "19:00",
                            "description": "Evening activity"
                        }
                    ]
                })
            elif rec_type == "transportation":
                formatted_response["flights"].append({
                    "departure": preferences.get('destination', ""),
                    "arrival": preferences.get('destination', ""),
                    "airline": "Airline",
                    "flightNumber": "AB123",
                    "departureTime": preferences.get('startDate', ""),
                    "arrivalTime": preferences.get('endDate', ""),
                    "price": 300 # Default placeholder
                })
            elif rec_type == "tips":
                formatted_response["additionalInfo"]["localCustoms"] = content.get("tips", [])
        
        return formatted_response
    except Exception as e:
        print(f"[Python Backend] Error generating travel plan: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error generating travel plan: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001) 