import React, { useEffect, useState, useRef, useCallback, useLayoutEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  Chip,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Card,
  CardContent,
  Link,
  IconButton,
} from '@mui/material';
import {
  FlightTakeoff,
  Hotel,
  Restaurant,
  DirectionsCar,
  Event,
  AccessTime,
  LocationOn,
  AttachMoney,
  Info,
  LocalActivity,
  Warning,
  CheckCircle,
  FlightLand,
  NavigateBefore,
  NavigateNext,
  ArrowBack,
  AutoAwesome,
} from '@mui/icons-material';
import { useTrip } from '../contexts/TripContext';
import { format } from 'date-fns';

interface AdditionalInfo {
  emergencyContacts?: string[];
  localCustoms?: string[];
  packingList?: string[];
  weatherForecast?: string[];
  localEvents?: string[];
}

interface TotalCost {
  flights: number;
  accommodation: number;
  activities: number;
  transportation: number;
  meals: number;
  total: number;
}

interface Flight {
  airline: string;
  flightNumber?: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  bookingLink?: string;
  departureLocation?: string;
  arrivalLocation?: string;
}

interface Accommodation {
  name: string;
  location?: string;
  checkIn?: string;
  checkOut?: string;
  price: number;
  amenities?: string[];
  bookingLink?: string;
  type?: string;
}

interface Activity {
  time?: string;
  activity?: string;
  name?: string;
  location?: string;
  cost?: number;
  duration?: string;
  notes?: string;
}

interface Meal {
  time: string;
  restaurant: string;
  cuisine: string;
  priceRange: string;
  dietaryOptions?: string[];
}

interface Transportation {
  type: string;
  route: string;
  cost: number;
  duration?: string;
}

interface DailyItinerary {
  day: number;
  date: string;
  weather?: string;
  accommodation?: {
    name: string;
    location?: string;
    notes?: string;
  };
  activities?: Activity[];
  meals?: Meal[];
  transportation?: Transportation[];
}

interface AIGeneratedItinerary {
  flights?: Flight[];
  accommodations?: Accommodation[];
  dailyItinerary?: DailyItinerary[];
  totalCost?: TotalCost;
  additionalInfo?: AdditionalInfo;
}

const TripDetails: React.FC = () => {
  const params = useParams();
  const id = params.id;
  
  const navigate = useNavigate();
  const { currentTrip, trips, loading, error: tripError, getTrip, regenerateTripPlan, fetchTrips, generateDayItinerary } = useTrip();
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [localLoading, setLocalLoading] = useState<boolean>(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [generationStage, setGenerationStage] = useState<string>('');
  const [currentDayIndex, setCurrentDayIndex] = useState<number>(0);
  const [hasUserChosenToGenerate, setHasUserChosenToGenerate] = useState<boolean>(false);
  const [generatingDayIndex, setGeneratingDayIndex] = useState<number | null>(null);
  const [showSuccessAlert, setShowSuccessAlert] = useState<boolean>(false);
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [forceUpdate] = useState<number>(0);
  const [dailyItineraryState, setDailyItineraryState] = useState<DailyItinerary[]>([]);
  const [isFullyInitialized, setIsFullyInitialized] = useState<boolean>(false);
  
  const completeDailyItineraryRef = useRef<DailyItinerary[]>([]);
  const dayGenerationInProgress = useRef(false);
  const pageInitialized = useRef(false);
  const scrollPositionRef = useRef<number>(0);
  const initialLoadCompleted = useRef(false);
  
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return 'Not specified';
    }
    return `$${value.toLocaleString()}`;
  };
  
  const tripData = useRef({
    destination: "",
    startDate: "",
    endDate: "",
    budget: 0,
    preferences: {} as any,
    itinerary: {} as any,
    destinations: [] as any[],
    name: "",
    tripItinerary: {} as AIGeneratedItinerary
  });

  const GENERATION_STAGES = {
    FETCHING: 'Fetching current trip details...',
    CONTACTING_AI: 'Contacting AI for travel suggestions...',
    PROCESSING: 'Processing AI recommendations...',
    ANALYZING: 'Analyzing destination data...',
    CREATING_ITINERARY: 'Creating your detailed itinerary...',
    CALCULATING_COSTS: 'Calculating trip costs...',
    FINALIZING: 'Finalizing your personalized travel plan...',
    UPDATING: 'Updating your trip plan...',
    COMPLETE: 'Plan generated successfully!'
  };

  const generateCompleteDailyItinerary = useCallback(() => {
    if (!currentTrip) return [];
    
    try {
      const { startDate, endDate, destinations, tripItinerary } = tripData.current;
      
      const parseDate = (dateString: string | Date | null | undefined): Date | null => {
        if (!dateString) {
          return null;
        }
        
        try {
          if (typeof dateString === 'string') {
            const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
            if (parts) {
              const year = parseInt(parts[1], 10);
              const month = parseInt(parts[2], 10) - 1;
              const day = parseInt(parts[3], 10);
              
              return new Date(year, month, day, 12, 0, 0, 0);
            }
            
            if (dateString.includes('T')) {
              const datePart = dateString.split('T')[0];
              const [year, month, day] = datePart.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            }
          }
          
          const date = new Date(dateString as any);
          if (!isNaN(date.getTime())) {
            return new Date(
              date.getFullYear(), 
              date.getMonth(), 
              date.getDate(), 
              12, 0, 0, 0
            );
          }
          
          return null;
        } catch (err) {
          console.error("Error parsing date in daily itinerary:", dateString, err);
          return null;
        }
      };
      
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!start || !end) {
        console.error("Invalid main trip dates in daily itinerary:", startDate, endDate);
        return [];
      }
      
      let earliestStart = new Date(start);
      let latestEnd = new Date(end);
      
      if (destinations && destinations.length > 0) {
        console.log("Number of additional destinations:", destinations.length);
        
        destinations.forEach((dest, index) => {
          if (dest.startDate && dest.endDate) {
            try {
              const destStart = parseDate(dest.startDate);
              const destEnd = parseDate(dest.endDate);
              
              if (!destStart || !destEnd) {
                console.error(`Invalid dates for destination in daily itinerary:`, dest.location);
                return;
              }
              
              if (destStart.getTime() < earliestStart.getTime()) {
                earliestStart = destStart;
              }
              
              if (destEnd.getTime() > latestEnd.getTime()) {
                latestEnd = destEnd;
              }
            } catch (err) {
              console.error(`Error processing dates for destination in daily itinerary:`, err);
            }
          }
        });
      }
      
      const startTime = earliestStart.getTime();
      const endTime = latestEnd.getTime();
      const timeDiff = endTime - startTime;
      
      const tripDurationInDays = startTime === endTime 
        ? 1 
        : Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      const existingDailyItinerary = tripItinerary?.dailyItinerary || [];
      const completeItinerary: DailyItinerary[] = [];
      
      for (let i = 0; i < tripDurationInDays; i++) {
        try {
          const currentDate = new Date(earliestStart);
          currentDate.setDate(earliestStart.getDate() + i);
          
          if (isNaN(currentDate.getTime())) {
            console.error(`Invalid current date for day ${i+1}`);
            continue;
          }
          
          let existingEntry = null;
          try {
            existingEntry = existingDailyItinerary.find(
              entry => entry.day === i + 1 || 
              (entry.date && new Date(entry.date).toDateString() === currentDate.toDateString())
            );
          } catch (err) {
            console.error(`Error finding existing entry for day ${i+1}:`, err);
          }
          
          let destinationPlacesToVisit: string[] = [];
          
          if (tripData.current.preferences?.placesToVisit) {
            destinationPlacesToVisit = tripData.current.preferences.placesToVisit;
          }
          
          if (destinations && destinations.length > 0) {
            for (const dest of destinations) {
              if (dest.startDate && dest.endDate) {
                try {
                  const destStart = new Date(dest.startDate);
                  const destEnd = new Date(dest.endDate);
                  
                  if (isNaN(destStart.getTime()) || isNaN(destEnd.getTime())) {
                    console.error(`Invalid dates for additional destination check`);
                    continue;
                  }
                  
                  destStart.setHours(0, 0, 0, 0);
                  destEnd.setHours(0, 0, 0, 0);
                  
                  if (currentDate >= destStart && currentDate <= destEnd) {
                    if (dest.placesToVisit && dest.placesToVisit.length > 0) {
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      destinationPlacesToVisit = dest.placesToVisit;
                    }
                    break;
                  }
                } catch (err) {
                  console.error(`Error processing additional destination dates:`, err);
                }
              }
            }
          }
          
          if (existingEntry) {
            completeItinerary.push(existingEntry);
          } else {
            try {
              completeItinerary.push({
                day: i + 1,
                date: currentDate.toISOString().split('T')[0],
                activities: [],
                meals: [],
                transportation: []
              });
            } catch (err) {
              console.error(`Error creating ISO string for day ${i+1}:`, err);
              completeItinerary.push({
                day: i + 1,
                date: `Day ${i+1}`,
                activities: [],
                meals: [],
                transportation: []
              });
            }
          }
        } catch (err) {
          console.error(`Error processing day ${i+1}:`, err);
        }
      }
      
      return completeItinerary;
    } catch (err) {
      console.error("Error in generateCompleteDailyItinerary:", err);
      return [];
    }
  }, [currentTrip]);
  
  const generateDefaultTripName = useCallback(() => {
    const { destination, destinations } = tripData.current;
    
    let defaultName = `Trip to ${destination}`;
    
    if (destinations && destinations.length > 0) {
      if (destinations.length === 1) {
        defaultName += ` and ${destinations[0].location}`;
      } 
      else if (destinations.length > 1) {
        if (destinations.length === 2) {
          defaultName += `, ${destinations[0].location}, and ${destinations[1].location}`;
        } 
        else {
          defaultName += `, ${destinations[0].location}, and ${destinations.length - 1} other destinations`;
        }
      }
    }
    
    return defaultName;
  }, []);

  useEffect(() => {
    if (currentTrip) {
      const { 
        destination, 
        startDate, 
        endDate, 
        budget, 
        preferences, 
        itinerary, 
        destinations = [], 
        name = "" 
      } = currentTrip;
      
      tripData.current = {
        destination, 
        startDate, 
        endDate, 
        budget, 
        preferences, 
        itinerary, 
        destinations, 
        name,
        tripItinerary: itinerary as unknown as AIGeneratedItinerary
      };

      pageInitialized.current = true;
    }
  }, [currentTrip]);

  useEffect(() => {
    setHasUserChosenToGenerate(false);
    setIsFullyInitialized(false);
    initialLoadCompleted.current = false;
    pageInitialized.current = false;
  }, [id]);

  useEffect(() => {
    setCurrentDayIndex(0);
  }, [id, currentTrip]);

  useEffect(() => {
    const refreshTripsList = async () => {
      try {
        await fetchTrips();
      } catch (err) {
        console.error('Failed to pre-fetch trips:', err);
      }
    };
    
    refreshTripsList();
  }, [fetchTrips]);

  useEffect(() => {
    const fetchTripData = async () => {
      if (!id) {
        setLocalError('Trip ID is missing from URL. Please go back and try again.');
        setLocalLoading(false);
        return;
      }
      
      setLocalLoading(true);
      setIsFullyInitialized(false);
      
      try {
        await getTrip(id);
        setLocalError(null);
      } catch (err) {
        console.error(`Error fetching trip from context for ID ${id}:`, err);
        setLocalError('Trip could not be found. Please go back to My Trips.');
      } finally {
        setLocalLoading(false);
      }
    };
    
    if (trips.length > 0 || tripError) {
      fetchTripData();
    }
  }, [id, getTrip, trips, tripError, params]);

  useEffect(() => {
    if (currentTrip) {
      const { 
        destination, 
        startDate, 
        endDate, 
        budget, 
        preferences, 
        itinerary, 
        destinations = [], 
        name = "" 
      } = currentTrip;
      
      tripData.current = {
        destination, 
        startDate, 
        endDate, 
        budget, 
        preferences, 
        itinerary, 
        destinations, 
        name,
        tripItinerary: itinerary as unknown as AIGeneratedItinerary
      };

      pageInitialized.current = true;
      
      completeDailyItineraryRef.current = generateCompleteDailyItinerary();
      setDailyItineraryState(completeDailyItineraryRef.current);
      
      if (pageInitialized.current) {
        const timer = setTimeout(() => {
          setIsFullyInitialized(true);
          initialLoadCompleted.current = true;
          
          setTimeout(() => {
            setLocalLoading(false);
          }, 200);
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [currentTrip, generateCompleteDailyItinerary]);

  useEffect(() => {
    if (completeDailyItineraryRef.current.length > 0) {
      setDailyItineraryState(completeDailyItineraryRef.current);
    }
  }, [currentTrip, forceUpdate]);

  const isItineraryEmpty = (itinerary: any) => {
    if (!itinerary) return true;
    
    const hasFlights = itinerary.flights && itinerary.flights.length > 0;
    const hasAccommodations = itinerary.accommodations && itinerary.accommodations.length > 0;
    const hasDailyItinerary = itinerary.dailyItinerary && itinerary.dailyItinerary.length > 0;
    
    return !hasFlights && !hasAccommodations && !hasDailyItinerary;
  };

  const handleGeneratePlan = async (event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    if (!id) return;
    
    try {
      setHasUserChosenToGenerate(true);
      setIsGenerating(true);
      setGenerationStage(GENERATION_STAGES.FETCHING);
      
      await new Promise(resolve => setTimeout(resolve, 800));
      
      setGenerationStage(GENERATION_STAGES.CONTACTING_AI);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const progressStages = [
        GENERATION_STAGES.PROCESSING,
        GENERATION_STAGES.ANALYZING,
        GENERATION_STAGES.CREATING_ITINERARY,
        GENERATION_STAGES.CALCULATING_COSTS,
        GENERATION_STAGES.FINALIZING
      ];
      
      let progressIndex = 0;
      const progressInterval = setInterval(() => {
        if (progressIndex < progressStages.length) {
          setGenerationStage(progressStages[progressIndex]);
          progressIndex++;
        }
      }, 10000);
      
      try {
        const response = await regenerateTripPlan(id);
        
        clearInterval(progressInterval);
        setGenerationStage(GENERATION_STAGES.COMPLETE);
        
        setTimeout(() => setIsGenerating(false), 2000);
        
        return response;
      } catch (error) {
        clearInterval(progressInterval);
        console.error('Error generating trip plan:', error);
        setLocalError('Failed to generate trip plan. Please try again.');
        setTimeout(() => setLocalError(null), 5000);
      }
    } catch (err) {
      console.error('Error in generation process:', err);
      setLocalError('An unexpected error occurred. Please try again.');
      setTimeout(() => setLocalError(null), 5000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      scrollPositionRef.current = window.scrollY;
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  useLayoutEffect(() => {
    if (generatingDayIndex !== null && scrollPositionRef.current > 0) {
      window.scrollTo(0, scrollPositionRef.current);
    }
  }, [forceUpdate, generatingDayIndex]);
  
  const handleGenerateDayItinerary = async (dayIndex: number, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    
    scrollPositionRef.current = window.scrollY;
    
    const currentDayToMaintain = dayIndex;
    
    if (dayGenerationInProgress.current || !id) return;
    
    try {
      dayGenerationInProgress.current = true;

      setGeneratingDayIndex(dayIndex);
      
      const existingDailyItinerary = dailyItineraryState.filter(
        (day, idx) => idx !== dayIndex && day.activities && day.activities.length > 0
      );
      
      const result = await generateDayItinerary(
        id, 
        dailyItineraryState[dayIndex].day, 
        existingDailyItinerary
      );
      
      if (result && result.itinerary && result.itinerary.dailyItinerary) {
        const updatedItinerary = {
          ...tripData.current.itinerary
        };
        
        const generatedDay = result.itinerary.dailyItinerary.find(
          day => day.day === dailyItineraryState[dayIndex].day
        );
        
        if (generatedDay) {
          
          const existingDailyItinerary = updatedItinerary.dailyItinerary || [];
          
          const existingDayIndex = existingDailyItinerary.findIndex(
            (day: any) => day.day === generatedDay.day
          );
          
          if (existingDayIndex >= 0) {
            existingDailyItinerary[existingDayIndex] = generatedDay;
          } else {
            existingDailyItinerary.push(generatedDay);
          }
          
          existingDailyItinerary.sort((a: any, b: any) => a.day - b.day);
          
          updatedItinerary.dailyItinerary = existingDailyItinerary;
          
          tripData.current = {
            ...tripData.current,
            itinerary: updatedItinerary,
            tripItinerary: updatedItinerary as unknown as AIGeneratedItinerary
          };
        } else {
          console.warn('Generated day not found in response');
        }
        
        completeDailyItineraryRef.current = generateCompleteDailyItinerary();
        
        setDailyItineraryState(completeDailyItineraryRef.current);
      }
      
      const message = `Successfully generated activities for day ${dailyItineraryState[dayIndex].day}!`;
      
      requestAnimationFrame(() => {
        setCurrentDayIndex(currentDayToMaintain);
        
        setSuccessMessage(message);
        setShowSuccessAlert(true);
        
        window.scrollTo(0, scrollPositionRef.current);
        
        setTimeout(() => {
          setGeneratingDayIndex(null);
          dayGenerationInProgress.current = false;
        }, 0);
        
        setTimeout(() => setShowSuccessAlert(false), 5000);
      });
      
    } catch (err) {
      console.error(`Error generating day ${dayIndex + 1} itinerary:`, err);
      setLocalError(`Failed to generate itinerary for day ${dayIndex + 1}. Please try again.`);
      setTimeout(() => {
        setLocalError(null);
        setGeneratingDayIndex(null);
        dayGenerationInProgress.current = false;
      }, 5000);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '';
    try {
      const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateStr);
      if (parts) {
        const year = parseInt(parts[1], 10);
        const month = parseInt(parts[2], 10) - 1;
        const day = parseInt(parts[3], 10);
        
        const date = new Date(year, month, day, 12, 0, 0, 0);
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }
      
      if (dateStr.includes('T')) {
        const datePart = dateStr.split('T')[0];
        const [year, month, day] = datePart.split('-').map(Number);
        const date = new Date(year, month - 1, day, 12, 0, 0, 0);
        return new Intl.DateTimeFormat('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        }).format(date);
      }
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error(`Invalid date string: ${dateStr}`);
        return 'Invalid date';
      }
      
      const normalizedDate = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate(),
        12, 0, 0, 0
      );
      
      return new Intl.DateTimeFormat('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).format(normalizedDate);
    } catch (err) {
      console.error(`Error formatting date: ${dateStr}`, err);
      return 'Invalid date';
    }
  };

  const formatTime = (timeString: string | undefined): string => {
    if (!timeString) return '';
    
    try {
      if (timeString.includes('T')) {
        return format(new Date(timeString), 'h:mm a');
      }
      return timeString;
    } catch (e) {
      return String(timeString);
    }
  };
  
  const tripName = tripData.current.name.trim() !== '' 
    ? tripData.current.name 
    : generateDefaultTripName();

  const calculateTripDuration = () => {
    const { startDate, endDate, destinations } = tripData.current;
    
    try {
      const parseDate = (dateString: string | Date | null | undefined): Date | null => {
        if (!dateString) {
          console.error("Empty date provided");
          return null;
        }
        
        try {
          if (typeof dateString === 'string') {
            const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
            if (parts) {
              const year = parseInt(parts[1], 10);
              const month = parseInt(parts[2], 10) - 1;
              const day = parseInt(parts[3], 10);
              
              return new Date(year, month, day, 12, 0, 0, 0);
            }
            
            if (dateString.includes('T')) {
              const datePart = dateString.split('T')[0];
              const [year, month, day] = datePart.split('-').map(Number);
              return new Date(year, month - 1, day, 12, 0, 0, 0);
            }
          }
          
          const date = new Date(dateString as any);
          if (!isNaN(date.getTime())) {
            return new Date(
              date.getFullYear(), 
              date.getMonth(), 
              date.getDate(), 
              12, 0, 0, 0
            );
          }
          
          console.error("Failed to parse date:", dateString);
          return null;
        } catch (err) {
          console.error("Error parsing date:", dateString, err);
          return null;
        }
      };
      
      const start = parseDate(startDate);
      const end = parseDate(endDate);
      
      if (!start || !end) {
        console.error("Invalid main destination dates:", startDate, endDate);
        return {
          start: new Date(),
          end: new Date(),
          duration: 1
        };
      }
      
      const formatDateForLogging = (date: Date): string => {
        return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      };
      
      console.log("Main trip dates:", 
        formatDateForLogging(start), "(" + start.toLocaleDateString() + ")", 
        "to", 
        formatDateForLogging(end), "(" + end.toLocaleDateString() + ")"
      );
      
      let earliestStart = new Date(start);
      let latestEnd = new Date(end);
      
      if (destinations && destinations.length > 0) {
        console.log("Number of additional destinations:", destinations.length);
        
        destinations.forEach((dest, index) => {
          if (dest.startDate && dest.endDate) {
            try {
              const destStart = parseDate(dest.startDate);
              const destEnd = parseDate(dest.endDate);
              
              if (!destStart || !destEnd) {
                console.error(`Invalid dates for destination ${index}:`, dest.location, dest.startDate, dest.endDate);
                return;
              }
              
              console.log(`Destination ${index} ${dest.location}:`, 
                formatDateForLogging(destStart), "(" + destStart.toLocaleDateString() + ")", 
                "to", 
                formatDateForLogging(destEnd), "(" + destEnd.toLocaleDateString() + ")"
              );

              if (destStart.getTime() < earliestStart.getTime()) {
                console.log(`Destination ${index} has earlier start date:`, formatDateForLogging(destStart));
                earliestStart = destStart;
              }
              
              if (destEnd.getTime() > latestEnd.getTime()) {
                console.log(`Destination ${index} has later end date:`, formatDateForLogging(destEnd));
                latestEnd = destEnd;
              }
            } catch (err) {
              console.error(`Error processing dates for destination ${index}:`, dest.location, err);
            }
          }
        });
      }
      
      console.log("Final trip dates after all destinations:", 
        formatDateForLogging(earliestStart), "(" + earliestStart.toLocaleDateString() + ")", 
        "to", 
        formatDateForLogging(latestEnd), "(" + latestEnd.toLocaleDateString() + ")"
      );
      
      const startTime = earliestStart.getTime();
      const endTime = latestEnd.getTime();
      const timeDiff = endTime - startTime;
      
      const tripDurationInDays = startTime === endTime 
        ? 1 
        : Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      console.log("Calculated trip duration:", tripDurationInDays, "days");
      
      return {
        start: earliestStart,
        end: latestEnd,
        duration: tripDurationInDays
      };
    } catch (err) {
      console.error("Error calculating trip duration:", err);
      return {
        start: new Date(),
        end: new Date(),
        duration: 1
      };
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { destination, budget, tripItinerary, destinations, startDate } = tripData.current;
  const { start, end, duration } = calculateTripDuration();
  
  const formatDateSafe = (date: Date | null | undefined): string => {
    if (!date) return '';
    if (isNaN(date.getTime())) return '';
    
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return formatDate(dateStr);
  };
  
  const formattedStartDate = formatDateSafe(start);
  const formattedEndDate = formatDateSafe(end);
  const actualTotalCost = tripItinerary?.totalCost?.total || 0;
  const budgetRemaining = (budget || 0) - actualTotalCost;
  const isBudgetExceeded = budgetRemaining < 0;
  const needsPlanGeneration = isItineraryEmpty(tripItinerary);

  const renderAdditionalDestinations = () => {
    const { destinations } = tripData.current;
    
    if (!destinations || destinations.length === 0) {
      return null;
    }
    
    const parseDateSafely = (dateString: string | null | undefined): Date | null => {
      if (!dateString) return null;
      
      try {
        const parts = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateString);
        if (parts) {
          const year = parseInt(parts[1], 10);
          const month = parseInt(parts[2], 10) - 1;
          const day = parseInt(parts[3], 10);
          
          return new Date(year, month, day, 12, 0, 0, 0);
        }
        
        if (dateString.includes('T')) {
          const datePart = dateString.split('T')[0];
          const [year, month, day] = datePart.split('-').map(Number);
          return new Date(year, month - 1, day, 12, 0, 0, 0);
        }
        
        const date = new Date(dateString);
        if (!isNaN(date.getTime())) {
          return new Date(
            date.getFullYear(), 
            date.getMonth(), 
            date.getDate(), 
            12, 0, 0, 0
          );
        }
        
        console.error("Could not parse date safely:", dateString);
        return null;
      } catch (err) {
        console.error("Error parsing date safely:", dateString, err);
        return null;
      }
    };
    
    return (
      <ListItem>
        <ListItemIcon>
          <LocationOn />
        </ListItemIcon>
        <ListItemText
          primary="Additional Destinations"
          secondary={
            <Box component="span">
              {destinations.map((dest, index) => (
                <Box key={index} sx={{ mb: 0.5 }}>
                  {dest.location} • {formatDateSafe(parseDateSafely(dest.startDate))} - {formatDateSafe(parseDateSafely(dest.endDate))}
                </Box>
              ))}
            </Box>
          }
        />
      </ListItem>
    );
  };

  if ((loading || localLoading || !isFullyInitialized || !pageInitialized.current) && generatingDayIndex === null) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
        sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(18, 18, 18, 0.95)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          transition: 'opacity 0.3s ease-in-out',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            p: 4,
            borderRadius: 2,
            backgroundColor: 'rgba(30, 30, 30, 0.6)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <CircularProgress size={60} thickness={4} />
          <Typography variant="h6" sx={{ 
            mt: 3, 
            color: 'white', 
            textAlign: 'center',
            fontWeight: 'medium',
            textShadow: '0px 0px 8px rgba(0, 0, 0, 0.7), 0px 0px 16px rgba(0, 0, 0, 0.5)'
          }}>
            {generationStage || 'Loading trip details...'}
          </Typography>
        </Box>
      </Box>
    );
  }

  if (generatingDayIndex !== null && initialLoadCompleted.current) {
  }

  if (!currentTrip) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error">Trip details could not be loaded</Alert>
        <Box mt={3} display="flex" justifyContent="center">
          <Button
            variant="contained"
            onClick={() => navigate('/my-trips')}
            startIcon={<ArrowBack />}
            sx={{ 
              mr: 2,
              bgcolor: 'background.paper', 
              color: 'white',
              '&:hover': { bgcolor: 'background.default' }
            }}
          >
            Back to My Trips
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4, mt: 4 }}>
      {showSuccessAlert && (
        <Alert 
          severity="success" 
          sx={{ mb: 3, position: 'sticky', top: 20, zIndex: 1000 }}
          onClose={() => setShowSuccessAlert(false)}
        >
          {successMessage}
        </Alert>
      )}
      
      <Alert severity="info" sx={{ mb: 3 }}>
        This is an AI-generated travel plan. Information provided may be inaccurate or incomplete.
      </Alert>
      
      {localError && (
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          onClose={() => setLocalError(null)}
        >
          {localError}
        </Alert>
      )}
      
      <Paper 
        elevation={3} 
        sx={{ 
          p: 3, 
          mb: 3, 
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2
        }}
      >
        <Box>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', mb: 1 }}>
            {tripName}
          </Typography>
          <Typography variant="subtitle1" color="text.secondary">
            Destination: {destination} • {formattedStartDate} - {formattedEndDate}
          </Typography>
        </Box>
        <Box mt={3} display="flex" justifyContent="center">
          <Button
            variant="contained"
            onClick={() => navigate('/my-trips')}
            startIcon={<ArrowBack />}
            sx={{ 
              mr: 2,
              bgcolor: 'background.paper', 
              color: 'white',
              '&:hover': { bgcolor: 'background.default' }
            }}
          >
            Back to My Trips
          </Button>
        </Box>
      </Paper>

      {needsPlanGeneration && !hasUserChosenToGenerate && (
        <Alert 
          severity="info" 
          sx={{ mb: 3 }}
          action={
            <Button 
              color="inherit" 
              size="small" 
              onClick={(e) => handleGeneratePlan(e)}
              disabled={isGenerating}
            >
              Generate Now
            </Button>
          }
        >
          Your travel plan hasn't been generated yet. Click 'Generate Now' to create a detailed itinerary.
        </Alert>
      )}

      {isGenerating && (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <CircularProgress size={24} sx={{ mr: 2 }} />
            <Typography>{generationStage || 'Generating your travel plan...'}</Typography>
          </Box>
        </Alert>
      )}

      {!isItineraryEmpty(tripItinerary) && (
        <Grid container spacing={3}>
          {tripItinerary?.additionalInfo && (
            <Grid item xs={12} md={4}>
              <Paper sx={{ p: 3, height: '100%' }}>
                <Typography variant="h6" gutterBottom>
                  Trip Overview
                </Typography>
                <List>
                  <ListItem>
                    <ListItemIcon>
                      <Event />
                    </ListItemIcon>
                    <ListItemText
                      primary="Dates"
                      secondary={`${formattedStartDate} - ${formattedEndDate} (${duration} ${duration === 1 ? 'day' : 'days'})`}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <LocationOn />
                    </ListItemIcon>
                    <ListItemText
                      primary="Main Destination"
                      secondary={destination}
                    />
                  </ListItem>
                  {renderAdditionalDestinations()}
                  {tripData.current.preferences.placesToVisit && tripData.current.preferences.placesToVisit.length > 0 && (
                    <ListItem>
                      <ListItemIcon>
                        <LocalActivity />
                      </ListItemIcon>
                      <ListItemText
                        primary="Places to Visit"
                        secondary={tripData.current.preferences.placesToVisit.join(', ')}
                      />
                    </ListItem>
                  )}
                  <ListItem>
                    <ListItemIcon>
                      <AttachMoney />
                    </ListItemIcon>
                    <ListItemText
                      primary="Budget"
                      secondary={budget ? formatCurrency(budget) : 'No budget set'}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <Hotel />
                    </ListItemIcon>
                    <ListItemText
                      primary="Accommodation"
                      secondary={tripData.current.preferences.accommodationType}
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsCar />
                    </ListItemIcon>
                    <ListItemText
                      primary="Transportation"
                      secondary={tripData.current.preferences.transportationType}
                    />
                  </ListItem>
                </List>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Activities
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tripData.current.preferences.activities && tripData.current.preferences.activities.length > 0 ? (
                    tripData.current.preferences.activities.map((activity: string) => (
                      <Chip key={activity} label={activity} />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">None</Typography>
                  )}
                </Box>

                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  Dietary Restrictions
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {tripData.current.preferences.dietaryRestrictions && tripData.current.preferences.dietaryRestrictions.length > 0 ? (
                    tripData.current.preferences.dietaryRestrictions.map((restriction: string) => (
                      <Chip key={restriction} label={restriction} variant="outlined" color="secondary" />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">None</Typography>
                  )}
                </Box>

                <Box sx={{ mt: 4, p: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
                  <Typography variant="h6" gutterBottom>
                    Budget Overview
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Total Budget:</Typography>
                    <Typography>
                      {budget ? `$${budget.toLocaleString()}` : 'Not specified'}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography color="text.secondary">Estimated Cost:</Typography>
                    <Typography>
                      ${actualTotalCost.toLocaleString()}
                    </Typography>
                  </Box>
                  
                  {budget && (
                    <>
                      <Divider sx={{ my: 1 }} />
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Typography fontWeight="bold">Remaining:</Typography>
                        <Typography 
                          fontWeight="bold" 
                          color={isBudgetExceeded ? 'error.main' : 'success.main'}
                        >
                          ${budgetRemaining.toLocaleString()}
                        </Typography>
                      </Box>
                      
                      {isBudgetExceeded && (
                        <Alert severity="warning" sx={{ mt: 2, fontSize: '0.875rem' }}>
                          The estimated cost exceeds your budget.
                        </Alert>
                      )}
                    </>
                  )}
                </Box>

                {tripItinerary?.additionalInfo && (
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="h6" gutterBottom>
                      Travel Tips
                    </Typography>
                    
                    {tripItinerary.additionalInfo.emergencyContacts && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Emergency Contacts
                        </Typography>
                        <List dense disablePadding>
                          {tripItinerary.additionalInfo.emergencyContacts.map((contact: string, i: number) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Warning fontSize="small" color="error" />
                              </ListItemIcon>
                              <ListItemText primary={contact} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {tripItinerary.additionalInfo.localCustoms && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Local Customs
                        </Typography>
                        <List dense disablePadding>
                          {tripItinerary.additionalInfo.localCustoms.map((custom: string, i: number) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <Info fontSize="small" />
                              </ListItemIcon>
                              <ListItemText primary={custom} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                    
                    {tripItinerary.additionalInfo.packingList && (
                      <Box sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" fontWeight="bold">
                          Packing Recommendations
                        </Typography>
                        <List dense disablePadding>
                          {tripItinerary.additionalInfo.packingList.map((item: string, i: number) => (
                            <ListItem key={i} sx={{ py: 0.5 }}>
                              <ListItemIcon sx={{ minWidth: 36 }}>
                                <CheckCircle fontSize="small" color="success" />
                              </ListItemIcon>
                              <ListItemText primary={item} />
                            </ListItem>
                          ))}
                        </List>
                      </Box>
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          )}

          <Grid item xs={12} md={tripItinerary?.additionalInfo ? 8 : 12}>
            {tripItinerary?.flights && tripItinerary.flights.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Flight Information
                </Typography>
                {tripItinerary.flights.map((flight, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">{flight.airline}</Typography>
                        <Typography variant="subtitle1" color="primary" fontWeight="bold">
                          ${flight.price}
                        </Typography>
                      </Box>
                      
                      <Grid container spacing={2} sx={{ mt: 1 }}>
                        <Grid item xs={5}>
                          <Box display="flex" alignItems="center">
                            <FlightTakeoff sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography>{formatTime(flight.departureTime)}</Typography>
                          </Box>
                          {flight.departureLocation && (
                            <Typography variant="body2" color="text.secondary">
                              {flight.departureLocation}
                            </Typography>
                          )}
                        </Grid>
                        <Grid item xs={2} display="flex" justifyContent="center">
                          <Divider orientation="vertical" flexItem />
                        </Grid>
                        <Grid item xs={5}>
                          <Box display="flex" alignItems="center">
                            <FlightLand sx={{ mr: 1, color: 'primary.main' }} />
                            <Typography>{formatTime(flight.arrivalTime)}</Typography>
                          </Box>
                          {flight.arrivalLocation && (
                            <Typography variant="body2" color="text.secondary">
                              {flight.arrivalLocation}
                            </Typography>
                          )}
                        </Grid>
                      </Grid>
                      
                      {flight.bookingLink && (
                        <Box sx={{ mt: 2 }}>
                          <Link href={flight.bookingLink} target="_blank" rel="noopener">
                            Book Flight
                          </Link>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            )}
            
            {tripItinerary?.accommodations && tripItinerary.accommodations.length > 0 && (
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Accommodation
                </Typography>
                {tripItinerary.accommodations.map((accommodation, index) => (
                  <Card key={index} variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1">{accommodation.name}</Typography>
                        <Typography variant="subtitle1" color="primary" fontWeight="bold">
                          ${accommodation.price}
                        </Typography>
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {accommodation.location || destination}
                      </Typography>
                      
                      {accommodation.amenities && accommodation.amenities.length > 0 && (
                        <Box sx={{ mt: 1, display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          {accommodation.amenities.map((amenity, i) => (
                            <Chip key={i} label={amenity} size="small" variant="outlined" />
                          ))}
                        </Box>
                      )}
                      
                      {accommodation.bookingLink && (
                        <Box sx={{ mt: 2 }}>
                          <Link href={accommodation.bookingLink} target="_blank" rel="noopener">
                            Book Accommodation
                          </Link>
                        </Box>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </Paper>
            )}
            
            {dailyItineraryState.length > 0 && (
              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Daily Itinerary
                </Typography>
                
                <Box 
                  display="flex" 
                  justifyContent="space-between" 
                  alignItems="center" 
                  sx={{ 
                    mb: 3, 
                    borderBottom: '1px solid', 
                    borderColor: 'divider', 
                    pb: 2,
                    background: 'linear-gradient(to right, rgba(255,255,255,0.05), rgba(255,255,255,0.15), rgba(255,255,255,0.05))',
                    borderRadius: '8px 8px 0 0',
                    p: 2,
                  }}
                >
                  <IconButton 
                    onClick={() => setCurrentDayIndex(prev => Math.max(0, prev - 1))}
                    disabled={currentDayIndex === 0}
                    color="primary"
                    sx={{ 
                      boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
                      background: 'white',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      width: 40,
                      height: 40,
                      '&:hover': { 
                        boxShadow: '0 0 12px rgba(25, 118, 210, 0.4)',
                        background: 'white',
                      },
                      '&.Mui-disabled': {
                        borderColor: 'grey.400',
                        opacity: 0.5,
                      }
                    }}
                  >
                    <NavigateBefore />
                  </IconButton>
                  
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center',
                    px: 2,
                    py: 1,
                  }}>
                    <Typography 
                      variant="h6" 
                      align="center"
                      sx={{
                        fontWeight: 'bold',
                        letterSpacing: 0.5,
                      }}
                    >
                      Day {dailyItineraryState[currentDayIndex]?.day || currentDayIndex + 1}
                      <Box component="span" sx={{ color: 'primary.main', mx: 0.5 }}>•</Box>
                      {(() => {
                        const tripStartDate = new Date(startDate);
                        const currentDate = new Date(tripStartDate);
                        currentDate.setDate(tripStartDate.getDate() + currentDayIndex);
                        return formatDate(currentDate.toISOString());
                      })()}
                    </Typography>
                  </Box>
                  
                  <IconButton 
                    onClick={() => setCurrentDayIndex(prev => 
                      Math.min(dailyItineraryState.length - 1, prev + 1)
                    )}
                    disabled={currentDayIndex === dailyItineraryState.length - 1}
                    color="primary"
                    sx={{ 
                      boxShadow: '0 0 8px rgba(0, 0, 0, 0.2)',
                      background: 'white',
                      border: '2px solid',
                      borderColor: 'primary.main',
                      width: 40,
                      height: 40,
                      '&:hover': { 
                        boxShadow: '0 0 12px rgba(25, 118, 210, 0.4)',
                        background: 'white',
                      },
                      '&.Mui-disabled': {
                        borderColor: 'grey.400',
                        opacity: 0.5,
                      }
                    }}
                  >
                    <NavigateNext />
                  </IconButton>
                </Box>
                
                {(() => {
                  const day = dailyItineraryState[currentDayIndex];
                  if (!day) {
                    return (
                      <Box 
                        textAlign="center" 
                        py={4} 
                        display="flex" 
                        flexDirection="column" 
                        alignItems="center"
                        position="relative"
                      >
                        <Typography 
                          variant="body1" 
                          color="text.secondary" 
                          mb={2}
                        >
                          No activities planned for this day.
                        </Typography>
                        <Button
                          variant="contained"
                          color="primary"
                          startIcon={generatingDayIndex === currentDayIndex ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                          onClick={(e) => handleGenerateDayItinerary(currentDayIndex, e)}
                          disabled={generatingDayIndex === currentDayIndex}
                          sx={{ mt: 1 }}
                        >
                          {generatingDayIndex === currentDayIndex ? 'Generating...' : 'Generate Some?'}
                        </Button>
                      </Box>
                    );
                  }
                  
                  return (
                    <Box sx={{ mb: 4 }}>
                      {day.activities && day.activities.length > 0 && (
                        <>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              mb: 4,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ 
                              bgcolor: 'primary.main', 
                              py: 1, 
                              px: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                              <LocalActivity sx={{ color: 'white' }} />
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                sx={{ 
                                  color: 'white',
                                  letterSpacing: 1,
                                }}
                              >
                                ACTIVITIES
                              </Typography>
                            </Box>
                            
                            <List sx={{ bgcolor: 'background.paper' }}>
                              {day.activities.map((activity, actIndex) => (
                                <React.Fragment key={actIndex}>
                                  <ListItem alignItems="flex-start" sx={{ py: 2 }}>
                                    <ListItemIcon>
                                      <LocalActivity color="primary" />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Box display="flex" justifyContent="space-between">
                                          <Typography variant="subtitle1">
                                            {activity.activity || activity.name}
                                          </Typography>
                                          {activity.cost && activity.cost > 0 && (
                                            <Typography variant="subtitle1" color="primary.main">
                                              ${activity.cost}
                                            </Typography>
                                          )}
                                        </Box>
                                      }
                                      secondary={
                                        <>
                                          <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                            <AccessTime fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                            <Typography variant="body2" component="span">
                                              {activity.time} {activity.duration && `(${activity.duration})`}
                                            </Typography>
                                          </Box>
                                          {activity.location && (
                                            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                                              <LocationOn fontSize="small" sx={{ mr: 0.5, fontSize: '0.875rem' }} />
                                              <Typography variant="body2" component="span">
                                                {activity.location}
                                              </Typography>
                                            </Box>
                                          )}
                                          {activity.notes && (
                                            <Typography variant="body2" sx={{ mt: 0.5 }}>
                                              {activity.notes}
                                            </Typography>
                                          )}
                                        </>
                                      }
                                    />
                                  </ListItem>
                                  {actIndex < (day.activities?.length ?? 0) - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                              ))}
                            </List>
                          </Paper>
                        </>
                      )}
                      
                      {day.accommodation && (
                        <>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              mb: 4,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ 
                              bgcolor: '#9c27b0',
                              py: 1, 
                              px: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                              <Hotel sx={{ color: 'white' }} />
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                sx={{ 
                                  color: 'white',
                                  letterSpacing: 1,
                                }}
                              >
                                ACCOMMODATION
                              </Typography>
                            </Box>
                            
                            <Box sx={{ p: 2, bgcolor: 'background.paper' }}>
                              <Typography variant="h6">
                                {day.accommodation.name}
                              </Typography>
                              
                              {day.accommodation.location && (
                                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                                  <LocationOn fontSize="small" sx={{ mr: 0.5, color: '#9c27b0' }} />
                                  <Typography variant="body2">
                                    {day.accommodation.location}
                                  </Typography>
                                </Box>
                              )}
                              
                              {day.accommodation.notes && (
                                <Box sx={{ mt: 1, p: 1, bgcolor: 'rgba(156, 39, 176, 0.1)', borderRadius: 1 }}>
                                  <Typography variant="body2">
                                    {day.accommodation.notes}
                                  </Typography>
                                </Box>
                              )}
                            </Box>
                          </Paper>
                        </>
                      )}
                      
                      {day.meals && day.meals.length > 0 && (
                        <>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              mb: 4,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ 
                              bgcolor: '#ff9800', 
                              py: 1, 
                              px: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                              <Restaurant sx={{ color: 'white' }} />
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                sx={{ 
                                  color: 'white',
                                  letterSpacing: 1,
                                }}
                              >
                                MEALS
                              </Typography>
                            </Box>
                            
                            <List sx={{ bgcolor: 'background.paper' }}>
                              {day.meals.map((meal, mealIndex) => (
                                <React.Fragment key={mealIndex}>
                                  <ListItem alignItems="flex-start">
                                    <ListItemIcon>
                                      <Restaurant sx={{ color: '#ff9800' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={meal.restaurant}
                                      secondary={
                                        <>
                                          <Typography variant="body2" component="span">
                                            {meal.time} • {meal.cuisine}
                                          </Typography>
                                          <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                            {meal.priceRange}
                                          </Typography>
                                        </>
                                      }
                                    />
                                  </ListItem>
                                  {mealIndex < (day.meals?.length ?? 0) - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                              ))}
                            </List>
                          </Paper>
                        </>
                      )}
                      
                      {day.transportation && day.transportation.length > 0 && (
                        <>
                          <Paper 
                            elevation={0} 
                            sx={{ 
                              mb: 4,
                              borderRadius: 2,
                              overflow: 'hidden',
                              border: '1px solid',
                              borderColor: 'divider',
                            }}
                          >
                            <Box sx={{ 
                              bgcolor: '#4caf50', 
                              py: 1, 
                              px: 2,
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}>
                              <DirectionsCar sx={{ color: 'white' }} />
                              <Typography 
                                variant="subtitle1" 
                                fontWeight="bold" 
                                sx={{ 
                                  color: 'white',
                                  letterSpacing: 1,
                                }}
                              >
                                TRANSPORTATION
                              </Typography>
                            </Box>
                            
                            <List sx={{ bgcolor: 'background.paper' }}>
                              {day.transportation.map((transport, tIndex) => (
                                <React.Fragment key={tIndex}>
                                  <ListItem alignItems="flex-start">
                                    <ListItemIcon>
                                      <DirectionsCar sx={{ color: '#4caf50' }} />
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={transport.type}
                                      secondary={
                                        <>
                                          <Typography variant="body2" component="span">
                                            {transport.route}
                                          </Typography>
                                          {transport.cost > 0 && (
                                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                              • ${transport.cost}
                                            </Typography>
                                          )}
                                          {transport.duration && (
                                            <Typography variant="body2" component="span" sx={{ ml: 1 }}>
                                              • {transport.duration}
                                            </Typography>
                                          )}
                                        </>
                                      }
                                    />
                                  </ListItem>
                                  {tIndex < (day.transportation?.length ?? 0) - 1 && <Divider variant="inset" component="li" />}
                                </React.Fragment>
                              ))}
                            </List>
                          </Paper>
                        </>
                      )}

                      {(!day.activities || day.activities.length === 0) && 
                       (!day.meals || day.meals.length === 0) && 
                       (!day.transportation || day.transportation.length === 0) && (
                        <Box 
                          textAlign="center" 
                          py={4} 
                          display="flex" 
                          flexDirection="column" 
                          alignItems="center"
                          position="relative"
                        >
                          <Typography 
                            variant="body1" 
                            color="text.secondary" 
                            mb={2}
                          >
                            No activities planned for this day.
                          </Typography>
                          <Button
                            variant="contained"
                            color="primary"
                            startIcon={generatingDayIndex === currentDayIndex ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                            onClick={(e) => handleGenerateDayItinerary(currentDayIndex, e)}
                            disabled={generatingDayIndex === currentDayIndex}
                            sx={{ mt: 1 }}
                          >
                            {generatingDayIndex === currentDayIndex ? 'Generating...' : 'Generate Some?'}
                          </Button>
                        </Box>
                      )}

                      {((day.activities && day.activities.length > 0) || 
                        (day.meals && day.meals.length > 0) || 
                        (day.transportation && day.transportation.length > 0)) && (
                        <Box 
                          textAlign="center" 
                          mt={4}
                          py={2}
                          display="flex" 
                          flexDirection="column" 
                          alignItems="center"
                          position="relative"
                          sx={{
                            borderTop: '1px dashed',
                            borderColor: 'divider',
                          }}
                        >
                          <Button
                            variant="outlined"
                            color="secondary"
                            startIcon={generatingDayIndex === currentDayIndex ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                            onClick={(e) => handleGenerateDayItinerary(currentDayIndex, e)}
                            disabled={generatingDayIndex === currentDayIndex}
                            sx={{ 
                              mt: 1,
                              borderRadius: '20px',
                              px: 3,
                            }}
                          >
                            {generatingDayIndex === currentDayIndex ? 'Regenerating...' : "Don't like the plan? Click here to regenerate"}
                          </Button>
                        </Box>
                      )}
                    </Box>
                  );
                })()}

                <Box display="flex" justifyContent="center" gap={1} mt={3} mb={1}>
                  {dailyItineraryState.map((day, index) => (
                    <Box
                      key={index}
                      sx={{
                        width: 10,
                        height: 10,
                        borderRadius: '50%',
                        bgcolor: index === currentDayIndex ? 'primary.main' : 'grey.400',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        opacity: index === currentDayIndex ? 1 : 0.5,
                        transform: index === currentDayIndex ? 'scale(1.2)' : 'scale(1)',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.1)',
                          bgcolor: index === currentDayIndex ? 'primary.main' : 'grey.500',
                        },
                        boxShadow: index === currentDayIndex ? '0 0 5px rgba(25, 118, 210, 0.5)' : 'none',
                      }}
                      onClick={() => setCurrentDayIndex(index)}
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default TripDetails; 