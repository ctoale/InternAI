#!/usr/bin/env python

import sys
import json
import os
import asyncio

current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
sys.path.append(parent_dir)

from server.ai_service import AIService

async def async_main():
    if len(sys.argv) < 2:
        print('Error: Missing command', file=sys.stderr)
        sys.exit(1)

    command = sys.argv[1]
    print(f"Command: {command}", file=sys.stderr)
    
    try:
        service = AIService()
        
        if command == 'generate_trip_plan':
            if len(sys.argv) < 3:
                print('Error: Missing trip data', file=sys.stderr)
                sys.exit(1)
            
            trip_data = json.loads(sys.argv[2])
            itinerary = await service.generate_trip_plan(trip_data)
            print(json.dumps(itinerary))
            
        elif command == 'generate_day_itinerary':
            if len(sys.argv) < 3:
                print('Error: Missing data for day itinerary generation', file=sys.stderr)
                sys.exit(1)
                
            data = json.loads(sys.argv[2])
            trip_data = data.get('tripData')
            day_number = data.get('dayNumber')
            
            if not trip_data or day_number is None:
                print('Error: Missing trip data or day number', file=sys.stderr)
                sys.exit(1)
                
            day_itinerary = await service.generate_day_itinerary(trip_data, day_number)
            print(json.dumps(day_itinerary))
            
        else:
            print(f'Error: Unknown command: {command}', file=sys.stderr)
            sys.exit(1)
            
    except Exception as e:
        print(f'Error: {str(e)}', file=sys.stderr)
        sys.exit(1)

def main():
    asyncio.run(async_main())

if __name__ == '__main__':
    main() 