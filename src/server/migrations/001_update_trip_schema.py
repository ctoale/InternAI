import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

async def migrate_trips():
    # Connect to MongoDB
    client = AsyncIOMotorClient(os.getenv('MONGODB_URI'))
    db = client[os.getenv('MONGODB_DB_NAME')]
    trips_collection = db.trips

    # Get all trips
    trips = await trips_collection.find({}).to_list(length=None)
    print(f"Found {len(trips)} trips to migrate")

    for trip in trips:
        try:
            # Create new itinerary structure if it doesn't exist
            if 'itinerary' not in trip:
                trip['itinerary'] = {
                    'flights': [],
                    'accommodations': [],
                    'dailyItinerary': [],
                    'totalCost': {
                        'flights': 0,
                        'accommodation': 0,
                        'activities': 0,
                        'transportation': 0,
                        'meals': 0,
                        'total': 0
                    },
                    'additionalInfo': {
                        'emergencyContacts': [],
                        'localCustoms': [],
                        'packingList': [],
                        'weatherForecast': []
                    }
                }

            # Convert old itinerary structure to new format if it exists
            if 'itinerary' in trip and isinstance(trip['itinerary'], dict):
                old_itinerary = trip['itinerary']
                new_itinerary = {
                    'flights': [],
                    'accommodations': [],
                    'dailyItinerary': [],
                    'totalCost': {
                        'flights': 0,
                        'accommodation': 0,
                        'activities': 0,
                        'transportation': 0,
                        'meals': 0,
                        'total': 0
                    },
                    'additionalInfo': {
                        'emergencyContacts': [],
                        'localCustoms': [],
                        'packingList': [],
                        'weatherForecast': []
                    }
                }

                # Convert flights
                if 'flights' in old_itinerary:
                    for flight in old_itinerary['flights']:
                        new_flight = {
                            'airline': flight.get('airline', ''),
                            'price': flight.get('price', 0),
                            'bookingLink': flight.get('bookingLink', ''),
                            'departureTime': flight.get('departureTime', ''),
                            'arrivalTime': flight.get('arrivalTime', '')
                        }
                        new_itinerary['flights'].append(new_flight)
                        new_itinerary['totalCost']['flights'] += flight.get('price', 0)

                # Convert accommodations
                if 'accommodations' in old_itinerary:
                    for acc in old_itinerary['accommodations']:
                        new_acc = {
                            'name': acc.get('name', ''),
                            'type': acc.get('type', 'hotel'),
                            'price': acc.get('price', 0),
                            'bookingLink': acc.get('bookingLink', ''),
                            'amenities': acc.get('amenities', []),
                            'location': acc.get('location', '')
                        }
                        new_itinerary['accommodations'].append(new_acc)
                        new_itinerary['totalCost']['accommodation'] += acc.get('price', 0)

                # Convert activities to daily itinerary
                if 'activities' in old_itinerary:
                    activities_by_date = {}
                    for activity in old_itinerary['activities']:
                        date = activity.get('date', datetime.now()).strftime('%Y-%m-%d')
                        if date not in activities_by_date:
                            activities_by_date[date] = []
                        
                        new_activity = {
                            'time': activity.get('time', ''),
                            'activity': activity.get('name', ''),
                            'location': activity.get('location', ''),
                            'cost': activity.get('price', 0),
                            'duration': activity.get('duration', ''),
                            'notes': activity.get('description', '')
                        }
                        activities_by_date[date].append(new_activity)
                        new_itinerary['totalCost']['activities'] += activity.get('price', 0)

                    # Create daily itinerary entries
                    for date, activities in activities_by_date.items():
                        day_entry = {
                            'day': len(new_itinerary['dailyItinerary']) + 1,
                            'date': date,
                            'activities': activities,
                            'meals': [],
                            'transportation': []
                        }
                        new_itinerary['dailyItinerary'].append(day_entry)

                # Convert transportation
                if 'transportation' in old_itinerary:
                    for transport in old_itinerary['transportation']:
                        new_transport = {
                            'type': transport.get('type', ''),
                            'route': f"{transport.get('from', '')} to {transport.get('to', '')}",
                            'cost': transport.get('price', 0),
                            'duration': transport.get('duration', '')
                        }
                        # Add to appropriate day in dailyItinerary
                        date = transport.get('departureTime', datetime.now()).strftime('%Y-%m-%d')
                        for day in new_itinerary['dailyItinerary']:
                            if day['date'] == date:
                                day['transportation'].append(new_transport)
                                break
                        new_itinerary['totalCost']['transportation'] += transport.get('price', 0)

                # Update total cost
                new_itinerary['totalCost']['total'] = (
                    new_itinerary['totalCost']['flights'] +
                    new_itinerary['totalCost']['accommodation'] +
                    new_itinerary['totalCost']['activities'] +
                    new_itinerary['totalCost']['transportation'] +
                    new_itinerary['totalCost']['meals']
                )

                trip['itinerary'] = new_itinerary

            # Update the trip in the database
            await trips_collection.update_one(
                {'_id': trip['_id']},
                {'$set': trip}
            )
            print(f"Successfully migrated trip {trip['_id']}")

        except Exception as e:
            print(f"Error migrating trip {trip.get('_id', 'unknown')}: {str(e)}")

    print("Migration completed")
    client.close()

if __name__ == "__main__":
    asyncio.run(migrate_trips()) 