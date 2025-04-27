import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Box,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider,
  Card,
  CardContent,
  CardActions,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import { useAuth } from '../contexts/AuthContext';
import GenerateTripPlanCard from '../components/GenerateTripPlanCard';
import { LocationOn, Event, LocalActivity, AutoAwesome, AttachMoney, Hotel, FlightTakeoff, Restaurant } from '@mui/icons-material';


const accommodationTypes = ['Hotel', 'Hostel', 'Resort', 'Apartment', 'Guesthouse', 'Camping', 'Luxury'];
const transportationTypes = ['Walking', 'Public Transit', 'Rental Car', 'Taxi/Uber', 'Bicycle', 'Private Driver'];
const activities = [
  'Sightseeing',
  'Museums',
  'Hiking',
  'Beach',
  'Shopping',
  'Food Tours',
  'Adventure Sports',
  'Historical Sites',
  'Nightlife',
  'Nature',
  'Cultural Experiences',
];
const dietaryRestrictions = [
  'Vegan',
  'Gluten-Free', 
  'Dairy-Free',
  'Kosher',
  'Halal',
  'Nut-Free',
  'Seafood-Free',
];

const steps = ['Trip Details', 'Preferences', 'Review & Generate'];


interface AdditionalDestination {
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  placesToVisit: string[];
}



const TripPreferencesSection = React.memo(({ 
  initialValues, 
  onChange 
}: { 
  initialValues: { 
    accommodationType: string;
    transportationType: string;
    selectedActivities: string[];
    dietaryRestrictions: string[];
  },
  onChange: (values: {
    accommodationType: string;
    transportationType: string;
    selectedActivities: string[];
    dietaryRestrictions: string[];
  }) => void
}) => {
  const [localValues, setLocalValues] = useState({...initialValues});
  
  const initialValuesKey = React.useMemo(() => {
    return JSON.stringify(initialValues);
  }, [initialValues]);
  
  const localValuesKey = React.useMemo(() => {
    return JSON.stringify(localValues);
  }, [localValues]);
  
  useEffect(() => {
    setLocalValues(initialValues);
  }, [initialValues, initialValuesKey]);
  
  useEffect(() => {
    if (localValuesKey !== initialValuesKey) {
      onChange(localValues);
    }
  }, [localValues, localValuesKey, initialValuesKey, onChange]);

  const handleAccommodationChange = (e: React.ChangeEvent<{ value: unknown }> | any) => {
    setLocalValues(prev => ({
      ...prev,
      accommodationType: e.target.value as string
    }));
  };

  const handleTransportationChange = (e: React.ChangeEvent<{ value: unknown }> | any) => {
    setLocalValues(prev => ({
      ...prev,
      transportationType: e.target.value as string
    }));
  };

  const handleActivityToggle = (activity: string) => {
    setLocalValues(prev => {
      const newActivities = prev.selectedActivities.includes(activity)
        ? prev.selectedActivities.filter(a => a !== activity)
        : [...prev.selectedActivities, activity];
      
      return {
        ...prev,
        selectedActivities: newActivities
      };
    });
  };

  const handleDietaryToggle = (restriction: string) => {
    setLocalValues(prev => {
      const newRestrictions = prev.dietaryRestrictions.includes(restriction)
        ? prev.dietaryRestrictions.filter(r => r !== restriction)
        : [...prev.dietaryRestrictions, restriction];
      
      return {
        ...prev,
        dietaryRestrictions: newRestrictions
      };
    });
  };

  return (
    <Box sx={{ 
      background: 'linear-gradient(145deg, #f8faff 0%, #f0f7ff 100%)',
      borderRadius: 4,
      p: { xs: 2, md: 4 },
      boxShadow: '0 10px 40px rgba(0, 0, 0, 0.06)',
      position: 'relative',
      overflow: 'hidden',
      minHeight: '600px'
    }}>
      <Box sx={{
        position: 'absolute',
        right: -100,
        top: -100,
        width: 300,
        height: 300,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(25, 118, 210, 0.05) 0%, rgba(25, 118, 210, 0) 70%)',
        zIndex: 0
      }} />
      <Box sx={{
        position: 'absolute',
        left: -50,
        bottom: -50,
        width: 200,
        height: 200,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(156, 39, 176, 0.05) 0%, rgba(156, 39, 176, 0) 70%)',
        zIndex: 0
      }} />
      
      <Typography variant="h4" component="h2" sx={{
        position: 'relative',
        zIndex: 1,
        fontWeight: 700,
        mb: 4,
        color: '#1e293b',
        textAlign: 'center',
        fontSize: { xs: '1.5rem', md: '2rem' }
      }}>
        Customize Your Experience
      </Typography>
      
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        gap: 5,
        position: 'relative',
        zIndex: 1
      }}>
        <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            display: 'flex',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'rgba(25, 118, 210, 0.04)'
          }}>
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              color: '#1976d2',
              borderBottom: '2px solid #1976d2'
            }}>
              <Hotel sx={{ mr: 1, fontSize: '1.2rem' }} /> 
              Where & How You'll Travel
            </Box>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 500, color: '#64748b', mb: 2 }}>
                  Where would you like to stay?
                </Typography>
                <Box sx={{ 
                  height: '56px',
                  position: 'relative',
                }}>
                  <FormControl 
                    fullWidth 
                    variant="outlined" 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      '& .MuiOutlinedInput-root': {
                        height: '56px'
                      },
                      '& .MuiInputLabel-root': {
                        transform: 'translate(14px, 16px) scale(1)'
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -6px) scale(0.75)'
                      }
                    }}
                  >
                    <InputLabel id="accommodation-type-label">Accommodation Type</InputLabel>
                    <Select
                      labelId="accommodation-type-label"
                      value={localValues.accommodationType}
                      onChange={handleAccommodationChange}
                      label="Accommodation Type"
                      MenuProps={{
                        disableScrollLock: true,
                        transitionDuration: 0, 
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        PaperProps: {
                          sx: {
                            position: 'absolute',
                            maxHeight: '300px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          }
                        },
                        
                        slotProps: {
                          paper: {
                            style: {
                              position: 'absolute',
                              zIndex: 1300
                            }
                          }
                        }
                      }}
                    >
                      {accommodationTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Typography sx={{ fontWeight: 500, color: '#64748b', mb: 2 }}>
                  How will you get around?
                </Typography>
                <Box sx={{ 
                  height: '56px',
                  position: 'relative',
                }}>
                  <FormControl 
                    fullWidth 
                    variant="outlined" 
                    sx={{ 
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      '& .MuiOutlinedInput-root': {
                        height: '56px'
                      },
                      '& .MuiInputLabel-root': {
                        transform: 'translate(14px, 16px) scale(1)'
                      },
                      '& .MuiInputLabel-shrink': {
                        transform: 'translate(14px, -6px) scale(0.75)'
                      }
                    }}
                  >
                    <InputLabel id="transportation-type-label">Transportation Type</InputLabel>
                    <Select
                      labelId="transportation-type-label"
                      value={localValues.transportationType}
                      onChange={handleTransportationChange}
                      label="Transportation Type"
                      MenuProps={{
                        disableScrollLock: true,
                        transitionDuration: 0, 
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'left',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'left',
                        },
                        PaperProps: {
                          sx: {
                            position: 'absolute',
                            maxHeight: '300px',
                            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                          }
                        },
                        
                        slotProps: {
                          paper: {
                            style: {
                              position: 'absolute',
                              zIndex: 1300
                            }
                          }
                        }
                      }}
                    >
                      {transportationTypes.map(type => (
                        <MenuItem key={type} value={type}>
                          {type}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>

        <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            display: 'flex',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'rgba(156, 39, 176, 0.04)'
          }}>
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              color: '#9c27b0',
              borderBottom: '2px solid #9c27b0'
            }}>
              <LocalActivity sx={{ mr: 1, fontSize: '1.2rem' }} /> 
              Activities You'll Enjoy
            </Box>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 500, color: '#64748b', mb: 3 }}>
              Select the activities that interest you most:
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {activities.map(activity => (
                <Button 
                  key={activity}
                  onClick={() => handleActivityToggle(activity)}
                  variant={localValues.selectedActivities.includes(activity) ? "contained" : "outlined"}
                  color="secondary"
                  sx={{
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    py: 0.8,
                    px: 2,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontWeight: 500,
                    m: 0.5
                  }}
                >
                  {activity}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>

        <Box sx={{ 
          background: 'rgba(255, 255, 255, 0.9)',
          borderRadius: 3,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          overflow: 'hidden'
        }}>
          <Box sx={{ 
            display: 'flex',
            borderBottom: '1px solid rgba(0, 0, 0, 0.08)',
            background: 'rgba(211, 47, 47, 0.04)'
          }}>
            <Box sx={{
              p: 2,
              display: 'flex',
              alignItems: 'center',
              fontWeight: 600,
              color: '#d32f2f',
              borderBottom: '2px solid #d32f2f'
            }}>
              <Restaurant sx={{ mr: 1, fontSize: '1.2rem' }} /> 
              Dietary Preferences
            </Box>
          </Box>
          
          <Box sx={{ p: 3 }}>
            <Typography sx={{ fontWeight: 500, color: '#64748b', mb: 3 }}>
              Do you have any dietary restrictions?
            </Typography>
            
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1.5 }}>
              {dietaryRestrictions.map(restriction => (
                <Button
                  key={restriction}
                  onClick={() => handleDietaryToggle(restriction)}
                  variant={localValues.dietaryRestrictions.includes(restriction) ? "contained" : "outlined"}
                  color="error"
                  sx={{
                    borderRadius: 10,
                    fontSize: '0.9rem',
                    py: 0.8,
                    px: 2,
                    minWidth: 'auto',
                    textTransform: 'none',
                    fontWeight: 500,
                    m: 0.5
                  }}
                >
                  {restriction}
                </Button>
              ))}
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.initialValues) === JSON.stringify(nextProps.initialValues);
});

const TripPlanner: React.FC = () => {
  const { createTrip, loading, error, clearError, regenerateTripPlan } = useTrip();
  const { user, getUserPreferences } = useAuth();
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    destination: '',
    name: '',
    startDate: null as Date | null,
    endDate: null as Date | null,
    budget: '',
    departureLocation: '',
    numberOfTravelers: '',
    accommodationType: 'Hotel',
    transportationType: 'Rental Car',
    selectedActivities: [] as string[],
    dietaryRestrictions: [] as string[],
    placesToVisit: [] as string[],
  });
  const [newPlace, setNewPlace] = useState('');
  const [isLoadingPreferences, setIsLoadingPreferences] = useState(false);
  const [preferencesLoaded, setPreferencesLoaded] = useState(false);
  
  const [additionalDestinations, setAdditionalDestinations] = useState<AdditionalDestination[]>([]);
  const [newDestination, setNewDestination] = useState<AdditionalDestination>({
    location: '',
    startDate: null,
    endDate: null,
    placesToVisit: [],
  });
  const [newDestinationPlace, setNewDestinationPlace] = useState('');
  const [formErrors, setFormErrors] = useState<string | null>(null);
  const [destinationError, setDestinationError] = useState<string | null>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const loadUserPreferences = useCallback(async () => {
    if (!user || isLoadingPreferences || preferencesLoaded) return;
    
    try {
      setIsLoadingPreferences(true);
      const userPrefs = await getUserPreferences();
      
      setFormData(prev => {
        try {
          const validAccommodationType = userPrefs.defaultAccommodationType && 
            accommodationTypes.includes(userPrefs.defaultAccommodationType) 
              ? userPrefs.defaultAccommodationType 
              : prev.accommodationType;
              
          const validTransportationType = userPrefs.defaultTransportationType && 
            transportationTypes.includes(userPrefs.defaultTransportationType) 
              ? userPrefs.defaultTransportationType 
              : prev.transportationType;
              
          const validActivities = Array.isArray(userPrefs.defaultActivities) 
            ? userPrefs.defaultActivities.filter(activity => activities.includes(activity))
            : prev.selectedActivities;
            
          const validDietaryRestrictions = Array.isArray(userPrefs.defaultDietaryRestrictions)
            ? userPrefs.defaultDietaryRestrictions.filter(restriction => dietaryRestrictions.includes(restriction))
            : prev.dietaryRestrictions;
              
          const updatedData = {
            ...prev,
            departureLocation: userPrefs.defaultDepartureLocation || prev.departureLocation,
            accommodationType: validAccommodationType,
            transportationType: validTransportationType,
            selectedActivities: validActivities,
            dietaryRestrictions: validDietaryRestrictions
          };
          
          return updatedData;
        } catch (formUpdateError) {
          console.error('Error while updating form with preferences:', formUpdateError);
          return prev;
        }
      });
      
      setPreferencesLoaded(true);
    } catch (err) {
      console.error('Failed to load user preferences:', err);
    } finally {
      setIsLoadingPreferences(false);
    }
  }, [user, isLoadingPreferences, getUserPreferences, preferencesLoaded]);

  useEffect(() => {
    if (user && !isLoadingPreferences && !preferencesLoaded) {
      loadUserPreferences();
    }
  }, [user, loadUserPreferences, isLoadingPreferences, preferencesLoaded]);

  const handleAddPlace = () => {
    if (newPlace.trim()) {
      setFormData({
        ...formData,
        placesToVisit: [...formData.placesToVisit, newPlace.trim()],
      });
      setNewPlace('');
    }
  };

  const handleRemovePlace = (placeToRemove: string) => {
    setFormData({
      ...formData,
      placesToVisit: formData.placesToVisit.filter(place => place !== placeToRemove),
    });
  };

  const handleChange = (field: string) => (event: any) => {
    setFormData({ ...formData, [field]: event.target.value });
  };

  const handleNewPlaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewPlace(event.target.value);
  };

  const handleDateChange = (field: string) => (date: Date | null) => {
    setFormData({ ...formData, [field]: date });
  };

  const handleNewDestinationChange = (field: string) => (event: any) => {
    setNewDestination({ ...newDestination, [field]: event.target.value });
  };

  const handleNewDestinationDateChange = (field: string) => (date: Date | null) => {
    setDestinationError(null);
    
    if (date && formData.endDate && date < formData.endDate) {
      setDestinationError(`Additional destination ${field === 'startDate' ? 'start' : 'end'} date must be after main destination's end date`);
      return;
    }
    
    if (field === 'startDate' && date && newDestination.endDate && date > newDestination.endDate) {
      setDestinationError('Start date cannot be after end date');
      return;
    }
    
    if (field === 'endDate' && date && newDestination.startDate && date < newDestination.startDate) {
      setDestinationError('End date cannot be before start date');
      return;
    }
    
    setNewDestination({ ...newDestination, [field]: date });
  };

  const handleNewDestinationPlaceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewDestinationPlace(event.target.value);
  };

  const handleAddDestinationPlace = () => {
    if (newDestinationPlace.trim()) {
      setNewDestination({
        ...newDestination,
        placesToVisit: [...newDestination.placesToVisit, newDestinationPlace.trim()],
      });
      setNewDestinationPlace('');
    }
  };

  const handleRemoveNewDestinationPlace = (placeToRemove: string) => {
    setNewDestination({
      ...newDestination,
      placesToVisit: newDestination.placesToVisit.filter(place => place !== placeToRemove),
    });
  };

  const handleAddDestination = () => {
    if (!newDestination.location || !newDestination.startDate || !newDestination.endDate) {
      setDestinationError('Destination, start date, and end date are required');
      return;
    }
    
    if (formData.endDate && newDestination.startDate < formData.endDate) {
      setDestinationError('Additional destination start date must be after main destination\'s end date');
      return;
    }
    
    if (newDestination.startDate > newDestination.endDate) {
      setDestinationError('Start date cannot be after end date');
      return;
    }
    
    setAdditionalDestinations([...additionalDestinations, { ...newDestination }]);
    setNewDestination({
      location: '',
      startDate: null,
      endDate: null,
      placesToVisit: [],
    });
    setDestinationError(null);
  };

  const handleRemoveDestination = (index: number) => {
    setAdditionalDestinations(additionalDestinations.filter((_, i) => i !== index));
  };

  const handleRemoveExistingDestinationPlace = (destIndex: number, placeToRemove: string) => {
    const updatedDestinations = [...additionalDestinations];
    updatedDestinations[destIndex].placesToVisit = updatedDestinations[destIndex].placesToVisit.filter(
      place => place !== placeToRemove
    );
    setAdditionalDestinations(updatedDestinations);
  };

  const handleNext = () => {
    if (activeStep === 0) {
      if (!formData.destination || !formData.destination.trim()) {
        setFormErrors('Destination is required');
        return;
      }
      if (!formData.startDate) {
        setFormErrors('Start date is required');
        return;
      }
      if (!formData.endDate) {
        setFormErrors('End date is required');
        return;
      }
      
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      
      if (formData.startDate < currentDate) {
        setFormErrors('Start date cannot be in the past');
        return;
      }
      
      if (formData.endDate < formData.startDate) {
        setFormErrors('End date cannot be earlier than start date');
        return;
      }
      
      setFormErrors(null);
    }

    setActiveStep((prevStep) => prevStep + 1);
    window.scrollTo(0, 0);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
    window.scrollTo(0, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (!formData.destination || !formData.startDate || !formData.endDate) {
        console.error('Missing required trip details');
        return;
      }

      const tripBudget = formData.budget ? parseFloat(formData.budget) : undefined;
      
      const travelers = formData.numberOfTravelers ? parseInt(formData.numberOfTravelers) : 1;
      
      const normalizeDate = (date: Date) => {
        const normalized = new Date(date);
        normalized.setHours(0, 0, 0, 0);
        return new Date(normalized.getFullYear(), normalized.getMonth(), normalized.getDate(), 0, 0, 0, 0);
      };
      
      const formattedDestinations = additionalDestinations
        .filter(dest => dest.startDate && dest.endDate)
        .map(dest => ({
          location: dest.location,
          startDate: normalizeDate(dest.startDate!).toISOString().split('T')[0],
          endDate: normalizeDate(dest.endDate!).toISOString().split('T')[0],
          placesToVisit: dest.placesToVisit,
        }));
      
      const tripData = {
        destination: formData.destination,
        name: formData.name,
        startDate: normalizeDate(formData.startDate).toISOString().split('T')[0],
        endDate: normalizeDate(formData.endDate).toISOString().split('T')[0],
        budget: tripBudget,
        travelers,
        departureLocation: formData.departureLocation,
        destinations: formattedDestinations,
        preferences: {
          accommodationType: formData.accommodationType,
          transportationType: formData.transportationType,
          activities: formData.selectedActivities,
          dietaryRestrictions: formData.dietaryRestrictions,
          placesToVisit: formData.placesToVisit,
        },
      };

      const result = await createTrip(tripData);
      
      if (result && result._id) {
        await regenerateTripPlan(result._id);
        
        navigate(`/trip/${result._id}`);
      } else {
        navigate('/my-trips');
      }
    } catch (err) {
      console.error('Failed to create and generate trip plan:', err);
    }
  };

  const renderStepContent = (step: number) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Main Destination
              </Typography>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Destination"
                value={formData.destination}
                onChange={handleChange('destination')}
                required
                placeholder="e.g. Paris, France"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Trip Name (optional)"
                value={formData.name}
                onChange={handleChange('name')}
                placeholder="e.g. Summer in Paris, Anniversary Trip"
                helperText="Give your trip a custom name (if left blank, destination will be used)"
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Specific Places to Visit
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    fullWidth
                    label="Add a place to visit"
                    value={newPlace}
                    onChange={handleNewPlaceChange}
                    placeholder="e.g. Eiffel Tower, Louvre Museum"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddPlace}
                    startIcon={<AddIcon />}
                  >
                    Add
                  </Button>
                </Box>
                {formData.placesToVisit.length > 0 && (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {formData.placesToVisit.map((place, index) => (
                      <Chip
                        key={index}
                        label={place}
                        onDelete={() => handleRemovePlace(place)}
                        color="primary"
                        variant="outlined"
                      />
                    ))}
                  </Box>
                )}
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="Start Date"
                value={formData.startDate}
                onChange={handleDateChange('startDate')}
                slotProps={{ textField: { fullWidth: true, required: true } }}
                minDate={new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <DatePicker
                label="End Date"
                value={formData.endDate}
                onChange={handleDateChange('endDate')}
                slotProps={{ textField: { fullWidth: true, required: true } }}
                minDate={formData.startDate || new Date()}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Budget ($)"
                type="number"
                value={formData.budget}
                onChange={handleChange('budget')}
                placeholder="Leave empty for no budget limit"
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Number of Travelers"
                type="number"
                value={formData.numberOfTravelers}
                onChange={handleChange('numberOfTravelers')}
                placeholder="Default: 1"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Departure Location"
                value={formData.departureLocation}
                onChange={handleChange('departureLocation')}
                placeholder="e.g. JFK, New York, or your home airport"
                helperText="Where will you be traveling from?"
              />
            </Grid>

            <Grid item xs={12} sx={{ mt: 4 }}>
              <Divider />
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
                Additional Destinations
              </Typography>
            </Grid>

            {additionalDestinations.length > 0 && (
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Your Additional Destinations
                </Typography>
                <Grid container spacing={2}>
                  {additionalDestinations.map((dest, index) => (
                    <Grid item xs={12} md={6} key={index}>
                      <Card variant="outlined">
                        <CardContent>
                          <Typography variant="h6">{dest.location}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {dest.startDate?.toLocaleDateString()} - {dest.endDate?.toLocaleDateString()}
                          </Typography>
                          {dest.placesToVisit.length > 0 && (
                            <>
                              <Typography variant="body2" sx={{ mt: 1 }}>
                                Places to Visit:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 0.5 }}>
                                {dest.placesToVisit.map((place, placeIndex) => (
                                  <Chip
                                    key={placeIndex}
                                    label={place}
                                    size="small"
                                    onDelete={() => handleRemoveExistingDestinationPlace(index, place)}
                                    color="primary"
                                    variant="outlined"
                                  />
                                ))}
                              </Box>
                            </>
                          )}
                        </CardContent>
                        <CardActions>
                          <Button 
                            size="small" 
                            color="error" 
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveDestination(index)}
                          >
                            Remove
                          </Button>
                        </CardActions>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
            )}

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Add Another Destination
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Destination"
                    value={newDestination.location}
                    onChange={handleNewDestinationChange('location')}
                    placeholder="e.g. Barcelona, Spain"
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="Start Date"
                    value={newDestination.startDate}
                    onChange={handleNewDestinationDateChange('startDate')}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={formData.endDate ? new Date(formData.endDate.getTime() + 86400000) : undefined}
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <DatePicker
                    label="End Date"
                    value={newDestination.endDate}
                    onChange={handleNewDestinationDateChange('endDate')}
                    slotProps={{ textField: { fullWidth: true } }}
                    minDate={newDestination.startDate || (formData.endDate ? new Date(formData.endDate.getTime() + 86400000) : undefined)}
                  />
                </Grid>
                {destinationError && (
                  <Grid item xs={12}>
                    <Alert severity="error" onClose={() => setDestinationError(null)}>
                      {destinationError}
                    </Alert>
                  </Grid>
                )}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Places to Visit
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <TextField
                      fullWidth
                      label="Add a place to visit"
                      value={newDestinationPlace}
                      onChange={handleNewDestinationPlaceChange}
                      placeholder="e.g. Sagrada Familia, Park Güell"
                    />
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleAddDestinationPlace}
                      startIcon={<AddIcon />}
                    >
                      Add
                    </Button>
                  </Box>
                  {newDestination.placesToVisit.length > 0 && (
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 1 }}>
                      {newDestination.placesToVisit.map((place, index) => (
                        <Chip
                          key={index}
                          label={place}
                          onDelete={() => handleRemoveNewDestinationPlace(place)}
                          color="primary"
                          variant="outlined"
                          size="small"
                        />
                      ))}
                    </Box>
                  )}
                </Grid>
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddDestination}
                    disabled={!newDestination.location || !newDestination.startDate || !newDestination.endDate}
                    startIcon={<AddIcon />}
                  >
                    Add Destination
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        );
      case 1:
        return (
          <TripPreferencesSection
            initialValues={{
              accommodationType: formData.accommodationType,
              transportationType: formData.transportationType,
              selectedActivities: formData.selectedActivities,
              dietaryRestrictions: formData.dietaryRestrictions
            }}
            onChange={(values) => {
              setFormData(prev => ({
                ...prev,
                accommodationType: values.accommodationType,
                transportationType: values.transportationType,
                selectedActivities: values.selectedActivities,
                dietaryRestrictions: values.dietaryRestrictions
              }));
            }}
          />
        );
      case 2:
        return (
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Paper elevation={6} sx={{ 
                p: { xs: 3, md: 4 }, 
                borderRadius: 3, 
                mb: 4, 
                background: 'linear-gradient(145deg, #ffffff, #f8faff)',
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.08)',
                transform: 'perspective(1000px) rotateX(1deg)',
                border: '1px solid rgba(65, 105, 225, 0.1)',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Box
                  sx={{
                    position: 'absolute',
                    top: -70,
                    right: -70,
                    width: 200,
                    height: 200,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(65, 105, 225, 0.05) 0%, rgba(65, 105, 225, 0) 70%)',
                    zIndex: 0,
                  }}
                />
                <Box
                  sx={{
                    position: 'absolute',
                    bottom: -100,
                    left: -100,
                    width: 250,
                    height: 250,
                    borderRadius: '50%',
                    background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%)',
                    zIndex: 0,
                  }}
                />
                
                <Box sx={{ position: 'relative', zIndex: 1 }}>
                  <Typography variant="h5" gutterBottom sx={{ 
                    fontWeight: 800, 
                    color: '#2D3748',
                    borderBottom: '2px solid #4169e1',
                    pb: 1,
                    mb: 4,
                    display: 'flex',
                    alignItems: 'center'
                  }}>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #4169e1 0%, #3b5bdb 100%)',
                        mr: 1.5,
                        boxShadow: '0 4px 8px rgba(65, 105, 225, 0.2)',
                      }}
                    >
                      <AutoAwesome sx={{ color: 'white' }} />
                    </Box>
                Trip Summary
              </Typography>
                  
                  <Grid container spacing={4}>
                    <Grid item xs={12} md={additionalDestinations.length > 0 ? 6 : 6}>
                      <Box sx={{ 
                        p: { xs: 2.5, md: 3.5 }, 
                        bgcolor: 'rgba(65, 105, 225, 0.03)', 
                        borderRadius: 3,
                        border: '1px solid rgba(65, 105, 225, 0.15)',
                        boxShadow: '0 6px 16px rgba(65, 105, 225, 0.1)',
                        height: '100%',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 24px rgba(65, 105, 225, 0.15)'
                        },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            width: '40%',
                            height: '100%',
                            background: 'linear-gradient(135deg, rgba(65, 105, 225, 0) 0%, rgba(65, 105, 225, 0.03) 100%)',
                            zIndex: 0,
                            borderTopRightRadius: 3,
                            borderBottomRightRadius: 3,
                          }}
                        />
                        
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: '#4169e1',
                            display: 'flex',
                            alignItems: 'center',
                            mb: 2.5
                          }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(65, 105, 225, 0.1) 0%, rgba(65, 105, 225, 0.2) 100%)',
                                mr: 1.5,
                              }}
                            >
                              <LocationOn sx={{ color: '#4169e1' }} />
                            </Box>
                Main Destination
              </Typography>
                          
                          <Box sx={{ pl: 1.5 }}>
                            <Typography variant="h5" sx={{ 
                              fontWeight: 800, 
                              color: '#2D3748',
                              mb: 2,
                              borderBottom: '2px dashed rgba(65, 105, 225, 0.2)',
                              pb: 1,
                              display: 'inline-block'
                            }}>
                              {formData.destination}
              </Typography>
                            
                            <Typography sx={{ 
                              mt: 1, 
                              display: 'flex', 
                              alignItems: 'center', 
                              color: '#4A5568',
                              fontWeight: 600,
                              bgcolor: 'rgba(65, 105, 225, 0.05)',
                              py: 0.8,
                              px: 1.5,
                              borderRadius: 2,
                              width: 'fit-content'
                            }}>
                              <Event sx={{ mr: 1, fontSize: '1rem', color: '#4169e1' }} />
                              {formData.startDate?.toLocaleDateString()} - {formData.endDate?.toLocaleDateString()}
                            </Typography>
                            
              {formData.placesToVisit.length > 0 && (
                              <Box sx={{ mt: 2.5 }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  mb: 1.5,
                                  display: 'flex',
                                  alignItems: 'center',
                                  color: '#4169e1'
                                }}>
                                  <LocalActivity sx={{ mr: 0.8, fontSize: '1rem', color: '#4169e1' }} />
                                  Places to Visit:
                </Typography>
                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                  {formData.placesToVisit.map((place, idx) => (
                                    <Chip
                                      key={idx}
                                      size="small"
                                      label={place}
                                      sx={{ 
                                        bgcolor: 'rgba(65, 105, 225, 0.08)',
                                        border: '1px solid rgba(65, 105, 225, 0.2)', 
                                        fontWeight: 600,
                                        color: '#2D3748',
                                        py: 1.5,
                                        '&:hover': {
                                          bgcolor: 'rgba(65, 105, 225, 0.12)',
                                        }
                                      }}
                                    />
                                  ))}
                                </Box>
                              </Box>
                            )}
                          </Box>
                        </Box>
                      </Box>
                    </Grid>

              {additionalDestinations.length > 0 && (
                      <Grid item xs={12} md={6}>
                        <Box sx={{ 
                          p: { xs: 2.5, md: 3.5 }, 
                          bgcolor: 'rgba(156, 39, 176, 0.03)', 
                          borderRadius: 3,
                          border: '1px solid rgba(156, 39, 176, 0.15)',
                          boxShadow: '0 6px 16px rgba(156, 39, 176, 0.1)',
                          height: '100%',
                          transition: 'all 0.3s ease-in-out',
                          '&:hover': {
                            transform: 'translateY(-5px)',
                            boxShadow: '0 12px 24px rgba(156, 39, 176, 0.15)'
                          },
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <Box
                            sx={{
                              position: 'absolute',
                              top: 0,
                              left: 0,
                              width: '40%',
                              height: '100%',
                              background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.03) 0%, rgba(156, 39, 176, 0) 100%)',
                              zIndex: 0,
                              borderTopLeftRadius: 3,
                              borderBottomLeftRadius: 3,
                            }}
                          />
                          
                          <Box sx={{ position: 'relative', zIndex: 1 }}>
                            <Typography variant="h6" sx={{ 
                              fontWeight: 700, 
                              color: '#9c27b0',
                              display: 'flex',
                              alignItems: 'center',
                              mb: 2.5
                            }}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  width: 36,
                                  height: 36,
                                  borderRadius: '50%',
                                  background: 'linear-gradient(135deg, rgba(156, 39, 176, 0.1) 0%, rgba(156, 39, 176, 0.2) 100%)',
                                  mr: 1.5,
                                }}
                              >
                                <LocalActivity sx={{ color: '#9c27b0' }} />
                              </Box>
                    Additional Destinations
                  </Typography>
                            
                            <Box sx={{ 
                              maxHeight: 240, 
                              overflowY: 'auto', 
                              pl: 1.5,
                              pr: 1.5,
                              '&::-webkit-scrollbar': {
                                width: '6px',
                              },
                              '&::-webkit-scrollbar-track': {
                                background: 'rgba(156, 39, 176, 0.05)',
                                borderRadius: '10px',
                              },
                              '&::-webkit-scrollbar-thumb': {
                                background: 'rgba(156, 39, 176, 0.2)',
                                borderRadius: '10px',
                              }
                            }}>
                  {additionalDestinations.map((dest, index) => (
                                <Box key={index} sx={{ 
                                  mb: 2,
                                  p: 2,
                                  borderRadius: 2,
                                  backgroundColor: 'rgba(156, 39, 176, 0.03)',
                                  border: '1px solid rgba(156, 39, 176, 0.1)',
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    boxShadow: '0 4px 12px rgba(156, 39, 176, 0.1)',
                                  }
                                }}>
                                  <Typography variant="subtitle1" sx={{ 
                                    fontWeight: 700, 
                                    color: '#2D3748',
                                    borderBottom: '2px dashed rgba(156, 39, 176, 0.2)',
                                    pb: 0.8,
                                    display: 'inline-block',
                                    mb: 1
                                  }}>
                                    {dest.location}
                                  </Typography>
                                  <Typography variant="body2" sx={{ 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    color: '#4A5568',
                                    bgcolor: 'rgba(156, 39, 176, 0.05)',
                                    py: 0.6,
                                    px: 1.2,
                                    borderRadius: 1.5,
                                    width: 'fit-content',
                                    mt: 1,
                                    fontWeight: 600
                                  }}>
                                    <Event sx={{ mr: 0.8, fontSize: '0.8rem', color: '#9c27b0' }} />
                                    {dest.startDate?.toLocaleDateString()} - {dest.endDate?.toLocaleDateString()}
                      </Typography>
                      {dest.placesToVisit.length > 0 && (
                                    <Box sx={{ mt: 1.5 }}>
                                      <Typography variant="caption" sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        fontWeight: 700,
                                        color: '#9c27b0',
                                        mb: 1
                                      }}>
                                        <LocalActivity sx={{ mr: 0.5, fontSize: '0.8rem', color: '#9c27b0' }} />
                                        Places to visit:
                        </Typography>
                                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.8, mt: 0.5 }}>
                                        {dest.placesToVisit.map((place, placeIdx) => (
                                          <Chip
                                            key={placeIdx}
                                            size="small"
                                            label={place}
                                            sx={{ 
                                              bgcolor: 'rgba(156, 39, 176, 0.08)',
                                              fontSize: '0.75rem',
                                              height: '24px',
                                              fontWeight: 600,
                                              border: '1px solid rgba(156, 39, 176, 0.15)',
                                              '&:hover': {
                                                bgcolor: 'rgba(156, 39, 176, 0.12)',
                                              }
                                            }}
                                          />
                                        ))}
                                      </Box>
                                    </Box>
                      )}
                    </Box>
                  ))}
                            </Box>
                          </Box>
                        </Box>
                      </Grid>
                    )}

                    <Grid item xs={12}>
                      <Box sx={{ 
                        p: { xs: 2.5, md: 3.5 }, 
                        mt: additionalDestinations.length > 0 ? 0 : 3,
                        bgcolor: 'rgba(16, 185, 129, 0.03)', 
                        borderRadius: 3,
                        border: '1px solid rgba(16, 185, 129, 0.15)',
                        boxShadow: '0 6px 16px rgba(16, 185, 129, 0.1)',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: '0 12px 24px rgba(16, 185, 129, 0.15)'
                        },
                        position: 'relative',
                        overflow: 'hidden'
                      }}>
                        <Box
                          sx={{
                            position: 'absolute',
                            bottom: 0,
                            right: 0,
                            width: '50%',
                            height: '50%',
                            background: 'radial-gradient(circle, rgba(16, 185, 129, 0.05) 0%, rgba(16, 185, 129, 0) 70%)',
                            zIndex: 0,
                          }}
                        />
                        
                        <Box sx={{ position: 'relative', zIndex: 1 }}>
                          <Typography variant="h6" sx={{ 
                            fontWeight: 700, 
                            color: '#10b981',
                            display: 'flex',
                            alignItems: 'center',
                            mb: 3
                          }}>
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.1) 0%, rgba(16, 185, 129, 0.2) 100%)',
                                mr: 1.5,
                              }}
                            >
                              <AutoAwesome sx={{ color: '#10b981' }} />
                            </Box>
                            Preferences & Requirements
              </Typography>
                          
                          <Grid container spacing={3} sx={{ pl: { xs: 0, md: 1.5 } }}>
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                backgroundColor: 'rgba(16, 185, 129, 0.02)',
                                transition: 'all 0.2s ease-in-out',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                                }
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <AttachMoney sx={{ mr: 0.8, fontSize: '1.1rem' }} />
                                  Budget:
              </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, color: '#2D3748' }}>
                                  {formData.budget ? `$${formData.budget}` : 'No budget limit'}
              </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                backgroundColor: 'rgba(16, 185, 129, 0.02)',
                                transition: 'all 0.2s ease-in-out',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                                }
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <Hotel sx={{ mr: 0.8, fontSize: '1.1rem' }} />
                                  Accommodation:
              </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, color: '#2D3748' }}>
                                  {formData.accommodationType}
              </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={4}>
                              <Box sx={{ 
                                p: 2, 
                                borderRadius: 2,
                                border: '1px solid rgba(16, 185, 129, 0.2)',
                                backgroundColor: 'rgba(16, 185, 129, 0.02)',
                                transition: 'all 0.2s ease-in-out',
                                height: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                '&:hover': {
                                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
                                  backgroundColor: 'rgba(16, 185, 129, 0.04)',
                                }
                              }}>
                                <Typography variant="body2" sx={{ 
                                  fontWeight: 700, 
                                  color: '#10b981',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}>
                                  <FlightTakeoff sx={{ mr: 0.8, fontSize: '1.1rem' }} />
                                  Transportation:
              </Typography>
                                <Typography variant="h6" sx={{ fontWeight: 800, mt: 1, color: '#2D3748' }}>
                                  {formData.transportationType}
              </Typography>
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700, 
                                mb: 1.2,
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <LocalActivity sx={{ mr: 0.8, fontSize: '1.1rem' }} />
                                Activities:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.selectedActivities.length > 0 ? formData.selectedActivities.map((activity, idx) => (
                                  <Chip
                                    key={idx}
                                    size="small"
                                    label={activity}
                                    sx={{ 
                                      bgcolor: 'rgba(16, 185, 129, 0.08)',
                                      border: '1px solid rgba(16, 185, 129, 0.2)',
                                      fontWeight: 600,
                                      color: '#2D3748',
                                      py: 1.5,
                                      '&:hover': {
                                        bgcolor: 'rgba(16, 185, 129, 0.12)',
                                      }
                                    }}
                                  />
                                )) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No activities selected
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                            
                            <Grid item xs={12} sm={6}>
                              <Typography variant="body2" sx={{ 
                                fontWeight: 700, 
                                mb: 1.2,
                                color: '#10b981',
                                display: 'flex',
                                alignItems: 'center'
                              }}>
                                <Restaurant sx={{ mr: 0.8, fontSize: '1.1rem' }} />
                                Dietary Restrictions:
                              </Typography>
                              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                {formData.dietaryRestrictions.length > 0 ? formData.dietaryRestrictions.map((restriction, idx) => (
                                  <Chip
                                    key={idx}
                                    size="small"
                                    label={restriction}
                                    sx={{ 
                                      bgcolor: 'rgba(245, 158, 11, 0.08)',
                                      border: '1px solid rgba(245, 158, 11, 0.15)',
                                      fontWeight: 600,
                                      color: '#2D3748',
                                      py: 1.5,
                                      '&:hover': {
                                        bgcolor: 'rgba(245, 158, 11, 0.12)',
                                      }
                                    }}
                                  />
                                )) : (
                                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                                    No dietary restrictions
                                  </Typography>
                                )}
                              </Box>
                            </Grid>
                          </Grid>
                        </Box>
                      </Box>
                    </Grid>
                  </Grid>
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12}>
              <Box sx={{ 
                width: '100%',
                px: { xs: 0, md: 2 },
                mb: 2
              }}>
                <GenerateTripPlanCard 
                  onGeneratePlan={handleSubmit} 
                  isLoading={loading} 
                />
              </Box>
            </Grid>
          </Grid>
        );
      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 4, mt: 4 }}>
      <Paper elevation={3} sx={{ 
        p: 4, 
        borderRadius: 2, 
        minHeight: '650px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Plan Your Trip
        </Typography>
        {(error || formErrors) && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }} 
            onClose={error ? clearError : () => setFormErrors(null)}
          >
            {error || formErrors}
          </Alert>
        )}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <form onSubmit={handleSubmit}>
          {renderStepContent(activeStep)}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
            {activeStep !== 0 && (
              <Button onClick={handleBack} sx={{ mr: 1 }}>
                Back
              </Button>
            )}
            {activeStep === steps.length - 1 ? (
              <Box display="flex" justifyContent="flex-end">
              </Box>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                disabled={loading}
              >
                Next
              </Button>
            )}
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default TripPlanner; 
