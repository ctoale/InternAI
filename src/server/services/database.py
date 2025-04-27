from typing import List, Optional
from datetime import datetime
from pymongo import MongoClient
from pymongo.collection import Collection
from bson import ObjectId
import os
from dotenv import load_dotenv

load_dotenv()

class DatabaseService:
    def __init__(self):
        self.client = MongoClient(os.getenv('MONGODB_URI'))
        self.db = self.client[os.getenv('MONGODB_DB_NAME', 'travel_ai_planner')]
        self.trips: Collection = self.db.trips
        self.users: Collection = self.db.users

    async def create_trip(self, trip_data: dict) -> dict:
        """Create a new trip in the database"""
        trip_data['created_at'] = datetime.utcnow()
        trip_data['updated_at'] = datetime.utcnow()
        result = self.trips.insert_one(trip_data)
        return self.get_trip(str(result.inserted_id))

    async def get_trip(self, trip_id: str) -> Optional[dict]:
        """Get a trip by ID"""
        try:
            trip = self.trips.find_one({'_id': ObjectId(trip_id)})
            if trip:
                trip['_id'] = str(trip['_id'])
            return trip
        except:
            return None

    async def get_user_trips(self, user_id: str) -> List[dict]:
        """Get all trips for a user"""
        trips = self.trips.find({'user_id': user_id})
        return [{**trip, '_id': str(trip['_id'])} for trip in trips]

    async def update_trip(self, trip_id: str, updates: dict) -> Optional[dict]:
        """Update a trip"""
        updates['updated_at'] = datetime.utcnow()
        result = self.trips.update_one(
            {'_id': ObjectId(trip_id)},
            {'$set': updates}
        )
        if result.modified_count > 0:
            return await self.get_trip(trip_id)
        return None

    async def delete_trip(self, trip_id: str) -> bool:
        """Delete a trip"""
        result = self.trips.delete_one({'_id': ObjectId(trip_id)})
        return result.deleted_count > 0

    async def create_user(self, user_data: dict) -> dict:
        """Create a new user"""
        user_data['created_at'] = datetime.utcnow()
        result = self.users.insert_one(user_data)
        user = self.users.find_one({'_id': result.inserted_id})
        user['_id'] = str(user['_id'])
        return user

    async def get_user(self, user_id: str) -> Optional[dict]:
        """Get a user by ID"""
        try:
            user = self.users.find_one({'_id': ObjectId(user_id)})
            if user:
                user['_id'] = str(user['_id'])
            return user
        except:
            return None

    async def get_user_by_email(self, email: str) -> Optional[dict]:
        """Get a user by email"""
        user = self.users.find_one({'email': email})
        if user:
            user['_id'] = str(user['_id'])
        return user

    async def update_user(self, user_id: str, updates: dict) -> Optional[dict]:
        """Update a user"""
        result = self.users.update_one(
            {'_id': ObjectId(user_id)},
            {'$set': updates}
        )
        if result.modified_count > 0:
            return await self.get_user(user_id)
        return None 