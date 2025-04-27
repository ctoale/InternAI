import React, { useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip,
  CardMedia,
  CardHeader,
  Button,
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTrip } from '../contexts/TripContext';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, differenceInDays } from 'date-fns';
import { 
  LocationOn, 
  CalendarToday, 
  AccountBalance, 
  Place
} from '@mui/icons-material';

const getDestinationImage = (destination: string) => {
  const destinations: Record<string, string> = {
    'Paris': 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34',
    'London': 'https://images.unsplash.com/photo-1505761671935-60b3a7427bad',
    'New York': 'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9',
    'Tokyo': 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26',
    'Rome': 'https://images.unsplash.com/photo-1552832230-c0197dd311b5',
    'Barcelona': 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4',
    'Amsterdam': 'https://images.unsplash.com/photo-1512470876302-972faa2aa9a4',
    'Dubai': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd',
    'Sydney': 'https://images.unsplash.com/photo-1506973035872-a4ec16b8e8d9',
  };
  
  for (const key in destinations) {
    if (destination.toLowerCase().includes(key.toLowerCase())) {
      return destinations[key];
    }
  }
  
  // Default image for unknown destinations - generic travel image
  return 'https://images.unsplash.com/photo-1503220317375-aaad61436b1b';
};

const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const { trips, loading, error, deleteTrip, clearError } = useTrip();
  
  const formatCurrency = (value: number | undefined | null): string => {
    if (value === undefined || value === null) {
      return 'Not specified';
    }
    return `$${value.toLocaleString()}`;
  };
  
  const generateDefaultTripName = (trip: any): string => {
    const { destination, destinations } = trip;
    
    if (!destination) return "Trip";
    
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
  };
  
  const parseDate = (dateString: string): Date => {
    if (dateString.length === 10 && dateString.includes('-')) {
      const [year, month, day] = dateString.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
    
    if (dateString.includes('T')) {
      const datePart = dateString.split('T')[0];
      const [year, month, day] = datePart.split('-').map(Number);
      return new Date(year, month - 1, day, 12, 0, 0, 0);
    }
    
    const date = new Date(dateString);
    return new Date(
      date.getFullYear(),
      date.getMonth(),
      date.getDate(),
      12, 0, 0, 0
    );
  };
  
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const formatDateSafe = (dateString: string, formatStr: string): string => {
    try {
      const date = parseDate(dateString);
      return format(date, formatStr);
    } catch (err) {
      console.error("Error formatting date:", dateString, err);
      return "Invalid date";
    }
  };
  
  useEffect(() => {
  }, []);

  const handleViewTrip = (tripId: string) => {
    navigate(`/trip/${tripId}`);
  };

  const handleDeleteTrip = async (tripId: string) => {
    if (window.confirm(`Are you sure you want to delete this trip? This action cannot be undone and all trip details will be permanently removed.`)) {
      try {
        await deleteTrip(tripId);
      } catch (err) {
        console.error('Failed to delete trip:', err);
      }
    }
  };

  const getTripDateRange = (trip: any) => {
    try {
      const start = parseDate(trip.startDate);
      const end = parseDate(trip.endDate);
      
      let earliestDate = new Date(start);
      let latestDate = new Date(end);
      
      if (trip.destinations && trip.destinations.length > 0) {
        trip.destinations.forEach((dest: any) => {
          if (dest.startDate && dest.endDate) {
            const destStart = parseDate(dest.startDate);
            const destEnd = parseDate(dest.endDate);
            
            if (destStart < earliestDate) {
              earliestDate = destStart;
            }
            
            if (destEnd > latestDate) {
              latestDate = destEnd;
            }
          }
        });
      }
      
      return { earliest: earliestDate, latest: latestDate };
    } catch (err) {
      console.error('Error calculating trip date range:', err);
      return { earliest: parseDate(trip.startDate), latest: parseDate(trip.endDate) };
    }
  };

  const getTripDuration = (trip: any) => {
    try {
      const { earliest, latest } = getTripDateRange(trip);
      return differenceInDays(latest, earliest) + 1;
    } catch (err) {
      console.error('Error calculating trip duration:', err);
      return 0;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 5 }}>
      <Box 
        sx={{ 
          mb: 4, 
          mt: 3,
          display: 'flex', 
          flexDirection: { xs: 'column', md: 'row' }, 
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          gap: 2,
          borderBottom: '2px solid', 
          borderColor: '#ffffff',
          pb: 3
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          sx={{ 
            fontWeight: 'bold',
            color: '#ffffff',
            textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
            letterSpacing: '0.5px'
          }}
        >
          My Trips
        </Typography>
        <Box>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/plan-trip')}
            sx={{
              px: 3,
              py: 1,
              fontWeight: 500,
              borderRadius: '8px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15)',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            Plan New Trip
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => clearError()}>
          {error}
        </Alert>
      )}

      {trips.length === 0 ? (
        <Box textAlign="center" py={8}>
          <Typography 
            variant="h5" 
            sx={{ 
              color: 'white', 
              textShadow: '0px 0px 8px rgba(0, 0, 0, 0.7), 0px 0px 16px rgba(0, 0, 0, 0.5)',
              mb: 2
            }}
          >
            You haven't planned any trips yet.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            size="large"
            sx={{ mt: 2 }}
            onClick={() => navigate('/plan-trip')}
          >
            Plan Your First Trip
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {trips.map((trip) => (
            <Grid item xs={12} sm={6} md={4} key={trip._id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'all 0.3s ease',
                  '&:hover': {
                    transform: 'translateY(-5px)',
                    boxShadow: '0 12px 20px rgba(0, 0, 0, 0.15)',
                  },
                  borderRadius: '12px',
                  overflow: 'hidden',
                }}
                onClick={() => handleViewTrip(trip._id)}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={getDestinationImage(trip.destination)}
                  alt={trip.destination}
                  sx={{ objectFit: 'cover' }}
                />
                
                <CardHeader
                  title={
                    <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                      {trip.name || generateDefaultTripName(trip)}
                    </Typography>
                  }
                  subheader={
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                      <LocationOn sx={{ fontSize: 18, mr: 0.5, color: 'primary.main' }} />
                      <Typography variant="body2" color="text.secondary">
                        {trip.destination}
                      </Typography>
                    </Box>
                  }
                  sx={{ pb: 0 }}
                />
                
                <CardContent sx={{ pt: 1, flexGrow: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <CalendarToday sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {(() => {
                        const { earliest, latest } = getTripDateRange(trip);
                        return (
                          <>
                            {format(earliest, 'MMM d')} - {format(latest, 'MMM d, yyyy')}
                            <Typography component="span" variant="body2" sx={{ ml: 0.5, fontWeight: 500 }}>
                              ({getTripDuration(trip)} days)
                            </Typography>
                          </>
                        );
                      })()}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <AccountBalance sx={{ fontSize: 18, mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {formatCurrency(trip.budget)}
                    </Typography>
                  </Box>

                  {trip.destinations && trip.destinations.length > 0 && (
                    <Box sx={{ mt: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.8 }}>
                        <Place sx={{ fontSize: 18, mr: 0.5, color: 'primary.light' }} />
                        <Typography variant="body2" fontWeight={500}>
                          Additional stops:
                        </Typography>
                      </Box>
                      <Box sx={{ pl: 1.5 }}>
                        {trip.destinations.slice(0, 2).map((dest, index) => (
                          <Box key={index} sx={{ display: 'flex', mb: 0.5 }}>
                            <Typography variant="body2" color="text.secondary" noWrap>
                              • {dest.location}
                            </Typography>
                          </Box>
                        ))}
                        {trip.destinations.length > 2 && (
                          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: 'italic' }}>
                            +{trip.destinations.length - 2} more stops
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  )}
                </CardContent>
                
                <Box sx={{ 
                  display: 'flex', 
                  justifyContent: 'flex-end', 
                  alignItems: 'center', 
                  p: 2, 
                  pt: 0,
                  mt: 'auto'
                }}>
                  <Tooltip title="Delete Trip">
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTrip(trip._id);
                      }}
                      sx={{ 
                        color: 'error.main',
                        '&:hover': {
                          backgroundColor: 'rgba(211, 47, 47, 0.04)',
                        }
                      }}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default MyTrips; 