# Database Migrations

This directory contains database migration scripts for the ItinerAI application.

## Current Migration

### 001_update_trip_schema.py

This migration updates the trip schema to include the new itinerary structure with:
- Enhanced flight information
- Detailed accommodation details
- Daily itinerary with activities, meals, and transportation
- Total cost breakdown
- Additional information (emergency contacts, local customs, etc.)

## Running the Migration

1. Make sure you have the required dependencies installed:
   ```bash
   pip install -r requirements.txt
   ```

2. Ensure your `.env` file contains the necessary MongoDB connection details:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=your_database_name
   ```

3. Run the migration script:
   ```bash
   python 001_update_trip_schema.py
   ```

## What the Migration Does

1. Connects to your MongoDB database
2. Finds all existing trips
3. For each trip:
   - Creates a new itinerary structure if it doesn't exist
   - Converts old itinerary data to the new format
   - Updates the trip in the database
4. Provides progress updates and error reporting

## Rollback

This migration is designed to be non-destructive. If you need to rollback:
1. The old data structure is preserved in the `itinerary` field
2. You can restore from a backup if needed

## Notes

- The migration is idempotent, meaning you can run it multiple times safely
- It includes error handling to prevent data loss
- Progress is logged to the console
- Each trip is processed independently, so a failure in one won't affect others 