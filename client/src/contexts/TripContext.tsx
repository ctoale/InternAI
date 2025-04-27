import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Trip {
  _id: string;
  name?: string;
  destination: string;
  startDate: string;
  endDate: string;
  budget: number;
  destinations?: Array<{
    location: string;
    startDate: string;
    endDate: string;
    placesToVisit?: string[];
  }>;
  preferences: {
    accommodationType: string;
    transportationType: string;
    activities: string[];
    dietaryRestrictions: string[];
    placesToVisit?: string[];
  };
  itinerary: {
    flights: Array<{
      departure: string;
      arrival: string;
      airline: string;
      flightNumber: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
    }>;
    accommodations: Array<{
      name: string;
      checkIn: string;
      checkOut: string;
      address: string;
      price: number;
      rating?: number;
      amenities?: string[];
    }>;
    activities: Array<{
      name: string;
      date: string;
      time: string;
      location: string;
      price: number;
      description: string;
      duration?: string;
      bookingLink?: string;
    }>;
    transportation: Array<{
      type: string;
      from: string;
      to: string;
      departureTime: string;
      arrivalTime: string;
      price: number;
      bookingLink?: string;
    }>;
    restaurants: Array<{
      name: string;
      cuisine: string;
      address: string;
      priceRange: string;
      rating?: number;
      dietaryOptions: string[];
      reservationLink?: string;
    }>;
    dailyItinerary?: Array<{
      day: number;
      date: string;
      activities?: any[];
      meals?: any[];
      transportation?: any[];
    }>;
    totalCost?: {
      flights: number;
      accommodation: number;
      activities: number;
      transportation: number;
      meals: number;
      total: number;
    };
    additionalInfo?: {
      emergencyContacts?: string[];
      localCustoms?: string[];
      packingList?: string[];
      weatherForecast?: string[];
    };
  };
  status: 'planning' | 'booked' | 'completed' | 'cancelled';
}

interface TripContextType {
  trips: Trip[];
  currentTrip: Trip | null;
  loading: boolean;
  error: string | null;
  clearError: () => void;
  fetchTrips: () => Promise<void>;
  createTrip: (tripData: Partial<Trip>) => Promise<Trip>;
  getTrip: (id: string) => Promise<void>;
  updateTrip: (id: string, tripData: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;
  regenerateTripPlan: (id: string, modifications?: any) => Promise<Trip>;
  generateDayItinerary: (tripId: string, dayNumber: number, existingDays?: any[]) => Promise<Trip>;
}

const TripContext = createContext<TripContextType | undefined>(undefined);

export const TripProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentTrip, setCurrentTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  const handleFetchError = useCallback((err: any) => {
    if (err.response?.status === 401) {
      setError('Please log in to view your trips');
    } else {
      setError('Failed to fetch trips');
    }
  }, []);

  const fetchTrips = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }
      
      try {
        const response = await axios<Trip[]>({
          method: 'get',
          url: '/api/trips',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        setTrips(response.data);
      } catch (initialErr) {
        setTimeout(async () => {
          try {
            const retryResponse = await axios<Trip[]>({
              method: 'get',
              url: '/api/trips',
              headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            });
            
            setTrips(retryResponse.data);
          } catch (retryErr: any) {
            handleFetchError(retryErr);
          }
        }, 1000);
      }
    } catch (err: any) {
      handleFetchError(err);
    } finally {
      setLoading(false);
    }
  }, [handleFetchError]);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchTrips();
    } else {
      setTrips([]);
      setCurrentTrip(null);
    }
  }, [isAuthenticated, user, fetchTrips]);

  const createTrip = async (tripData: Partial<Trip>) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        throw new Error('Authentication required');
      }
      
      const response = await axios<any>({
        method: 'post',
        url: '/api/trips',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        data: tripData
      });
      
      const newTrip = response.data.trip || response.data;
      setTrips([...trips, newTrip]);
      setCurrentTrip(newTrip);
      return newTrip;
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to create a trip');
      } else {
        setError('Failed to create trip');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrip = async (id: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        throw new Error('Authentication required');
      }
      
      const existingTrip = trips.find(trip => trip._id === id);
      if (existingTrip) {
        setCurrentTrip(existingTrip);
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get<Trip>(`/api/trips/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setCurrentTrip(response.data);
      } catch (initialErr: any) {
        try {
          await fetchTrips();
          
          const refreshedTrip = trips.find(trip => trip._id === id);
          if (refreshedTrip) {
            setCurrentTrip(refreshedTrip);
            return;
          }
          
          const retryResponse = await axios.get<Trip>(`/api/trips/${id}`, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          
          setCurrentTrip(retryResponse.data);
        } catch (retryErr: any) {
          handleTripFetchError(retryErr);
          throw retryErr;
        }
      }
    } catch (err: any) {
      handleTripFetchError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleTripFetchError = (err: any) => {
    if (err.response?.status === 401) {
      setError('Please log in to view trip details');
    } else {
      setError('Failed to fetch trip');
    }
  };

  const updateTrip = async (id: string, tripData: Partial<Trip>) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        throw new Error('Authentication required');
      }
      
      const response = await axios.put<Trip>(`/api/trips/${id}`, tripData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTrips(trips.map(trip => trip._id === id ? response.data : trip));
      setCurrentTrip(response.data);
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to update trip');
      } else {
        setError('Failed to update trip');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteTrip = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        throw new Error('Authentication required');
      }
      
      await axios.delete(`/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setTrips(trips.filter(trip => trip._id !== id));
      if (currentTrip?._id === id) {
        setCurrentTrip(null);
      }
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to delete trip');
      } else {
        setError('Failed to delete trip');
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const regenerateTripPlan = async (id: string, modifications?: any) => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        setLoading(false);
        throw new Error('Authentication required');
      }
      
      const tripResponse = await axios.get<Trip>(`/api/trips/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const currentTripData = tripResponse.data;
      
      const response = await axios.post<Trip>(`/api/trips/${id}/regenerate`, 
        { 
          modifications,
          tripData: currentTripData
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 180000
        }
      );
      
      const updatedTrip = response.data;
      
      setTrips(trips.map(trip => trip._id === id ? updatedTrip : trip));
      setCurrentTrip(updatedTrip);
      
      return updatedTrip;
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to regenerate trip plan');
      } else if (err.code === 'ECONNABORTED') {
        setError('Trip plan generation timed out. Please try again');
      } else {
        setError('Failed to regenerate trip plan: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      }
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const generateDayItinerary = async (tripId: string, dayNumber: number, existingDays?: any[]) => {
    try {
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        throw new Error('Authentication required');
      }
      
      const tripResponse = await axios.get<Trip>(`/api/trips/${tripId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const currentTripData = tripResponse.data;
      
      const response = await axios.post<Trip>(
        `/api/trips/${tripId}/generate-day/${dayNumber}`, 
        { 
          tripData: currentTripData,
          existingDays: existingDays || [] 
        }, 
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          timeout: 90000
        }
      );
      
      const updatedTrip = response.data;
      
      setTrips(trips.map(trip => trip._id === tripId ? updatedTrip : trip));
      setCurrentTrip(updatedTrip);
      
      return updatedTrip;
    } catch (err: any) {
      if (err.response?.status === 401) {
        setError('Please log in to generate itinerary');
      } else if (err.code === 'ECONNABORTED') {
        setError('Itinerary generation timed out. Please try again');
      } else {
        setError('Failed to generate itinerary: ' + (err.response?.data?.message || err.message || 'Unknown error'));
      }
      throw err;
    }
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <TripContext.Provider
      value={{
        trips,
        currentTrip,
        loading,
        error,
        clearError,
        fetchTrips,
        createTrip,
        getTrip,
        updateTrip,
        deleteTrip,
        regenerateTripPlan,
        generateDayItinerary
      }}
    >
      {children}
    </TripContext.Provider>
  );
};

export const useTrip = () => {
  const context = useContext(TripContext);
  if (context === undefined) {
    throw new Error('useTrip must be used within a TripProvider');
  }
  return context;
}; 