import { Request, Response } from 'express';
import { Trip, ITrip, TripDocument } from '../models/Trip';
import { User } from '../models/User';
import { AIService } from '../services/AIService';

declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
        id: string;
        email?: string;
        firstName?: string;
        lastName?: string;
      };
    }
  }
}

const aiService = new AIService();

const hasPermission = (trip: TripDocument | ITrip, userId: string, requiredRole: 'owner' | 'editor' | 'viewer') => {
  if (!trip.collaborators) {
    return false;
  }
  
  const collaborator = trip.collaborators.find(
    (c: { user: any; role: string }) => 
      (c.user.toString ? c.user.toString() : c.user) === userId
  );
  
  if (!collaborator) return false;
  
  const roleHierarchy: { [key: string]: number } = { owner: 3, editor: 2, viewer: 1 };
  return roleHierarchy[collaborator.role] >= roleHierarchy[requiredRole];
};

export const createTrip = async (req: Request, res: Response) => {
  try {
    const { destination, name, startDate, endDate, budget, preferences, destinations, numberOfTravelers } = req.body;
    const userId = req.user._id;

    const trip = new Trip({
      userId,
      destination,
      name,
      startDate,
      endDate,
      budget: budget !== undefined ? budget : undefined,
      travelers: numberOfTravelers || 1,
      destinations,
      preferences,
      status: 'planning',
      collaborators: [{ user: userId, role: 'owner' }],
      createdBy: userId,
      activities: [],
      itinerary: {
        flights: [],
        accommodations: [],
        dailyItinerary: [],
        totalCost: {
          flights: 0,
          accommodation: 0,
          activities: 0,
          transportation: 0,
          meals: 0,
          total: 0
        },
        additionalInfo: {
          emergencyContacts: [],
          localCustoms: [],
          packingList: [],
          weatherForecast: []
        }
      }
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (error) {
    console.error('Error creating trip:', error);
    res.status(500).json({ message: 'Error creating trip' });
  }
};

export const getTrips = async (req: Request, res: Response) => {
  try {
    const userId = req.user._id;
    const trips = await Trip.find({
      $or: [
        { createdBy: userId },
        { 'collaborators.user': userId }
      ]
    }).populate('createdBy', 'name email')
      .populate('collaborators.user', 'name email');

    res.json(trips);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching trips', error });
  }
};

export const getTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error fetching trip:', error);
    res.status(500).json({ message: 'Error fetching trip' });
  }
};

export const updateTrip = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const trip = await Trip.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      updates,
      { new: true }
    );

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json(trip);
  } catch (error) {
    console.error('Error updating trip:', error);
    res.status(500).json({ message: 'Error updating trip' });
  }
};

export const deleteTrip = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findOneAndDelete({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }

    res.json({ message: 'Trip deleted successfully' });
  } catch (error) {
    console.error('Error deleting trip:', error);
    res.status(500).json({ message: 'Error deleting trip' });
  }
};

export const regenerateTripPlan = async (req: Request, res: Response) => {
  try {
    const trip = await Trip.findOne({
      _id: req.params.id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const clientTripData = req.body.tripData;
    
    const tripDataForAI = {
      destination: clientTripData?.destination || trip.destination,
      startDate: clientTripData?.startDate || trip.startDate,
      endDate: clientTripData?.endDate || trip.endDate,
      budget: clientTripData?.budget !== undefined ? clientTripData.budget : trip.budget,
      numberOfTravelers: clientTripData?.numberOfTravelers || trip.travelers || 1,
      preferences: clientTripData?.preferences || trip.preferences,
      destinations: clientTripData?.destinations || trip.destinations
    };

    const aiGeneratedPlan = await aiService.generateTravelPlan(tripDataForAI);

    trip.itinerary = aiGeneratedPlan.itinerary || trip.itinerary;
    await trip.save();

    res.json(trip);
  } catch (error) {
    res.status(500).json({ message: 'Error regenerating trip plan' });
  }
};

export const generateDayItinerary = async (req: Request, res: Response) => {
  try {
    const { id, dayNumber } = req.params;
    const day = parseInt(dayNumber);
    
    const trip = await Trip.findOne({
      _id: id,
      userId: req.user._id
    });

    if (!trip) {
      return res.status(404).json({ message: 'Trip not found' });
    }
    
    const clientTripData = req.body.tripData;
    const existingDays = req.body.existingDays || [];
    
    if (!clientTripData) {
      return res.status(400).json({ message: 'Trip data is required in the request body' });
    }
    
    const tripDataForAI = {
      destination: clientTripData.destination,
      startDate: clientTripData.startDate,
      endDate: clientTripData.endDate,
      budget: clientTripData.budget,
      preferences: clientTripData.preferences,
      destinations: clientTripData.destinations,
      itinerary: clientTripData.itinerary,
      existingDays: existingDays
    };
    
    const dayItinerary = await aiService.generateDayItinerary(tripDataForAI, day);
    
    if (!dayItinerary || !dayItinerary.dayItinerary) {
      return res.status(500).json({ message: 'Failed to generate day itinerary' });
    }
    
    const freshTrip = await Trip.findOne({
      _id: id,
      userId: req.user._id
    });
    
    if (!freshTrip) {
      return res.status(404).json({ message: 'Trip not found during final update' });
    }
    
    const updatedItinerary = JSON.parse(JSON.stringify(freshTrip.itinerary || {}));
    
    if (!updatedItinerary.dailyItinerary) {
      updatedItinerary.dailyItinerary = [];
    }
    
    const existingDayIndex = updatedItinerary.dailyItinerary.findIndex(
      (dayEntry: any) => dayEntry.day === day
    );
    
    if (existingDayIndex >= 0) {
      updatedItinerary.dailyItinerary[existingDayIndex] = dayItinerary.dayItinerary;
    } else {
      updatedItinerary.dailyItinerary.push(dayItinerary.dayItinerary);
    }
    
    updatedItinerary.dailyItinerary.sort((a: any, b: any) => a.day - b.day);
    
    const updatedTrip = await Trip.findOneAndUpdate(
      { _id: id, userId: req.user._id },
      { $set: { itinerary: updatedItinerary } },
      { new: true }
    );
    
    if (!updatedTrip) {
      return res.status(500).json({ message: 'Failed to update trip with new itinerary' });
    }
    
    res.json(updatedTrip);
  } catch (error) {
    res.status(500).json({ message: 'Error generating day itinerary' });
  }
}; 