import React from 'react';
import { Container, Typography, Button, Grid, Paper, Box, useTheme, useMediaQuery } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import FlightTakeoffIcon from '@mui/icons-material/FlightTakeoff';
import HotelIcon from '@mui/icons-material/Hotel';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import ExploreIcon from '@mui/icons-material/Explore';
import { useAuth } from '../contexts/AuthContext';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FlightTakeoffIcon fontSize="large" />,
      title: 'Flight Planning',
      description: 'Find the best flights for your trip with AI-powered recommendations'
    },
    {
      icon: <HotelIcon fontSize="large" />,
      title: 'Hotel Booking',
      description: 'Discover perfect accommodations based on your preferences and budget'
    },
    {
      icon: <RestaurantIcon fontSize="large" />,
      title: 'Dining Guide',
      description: 'Get personalized restaurant recommendations for your destination'
    },
    {
      icon: <DirectionsCarIcon fontSize="large" />,
      title: 'Transportation',
      description: 'Plan your local transportation with ease'
    }
  ];

  return (
    <Box sx={{ overflow: 'hidden' }}>
      <Box
        sx={{
          position: 'relative',
          height: isMobile ? '80vh' : '90vh',
          display: 'flex',
          alignItems: 'center',
          color: 'white',
          overflow: 'hidden',
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            background: 'linear-gradient(to right, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%)',
            zIndex: -1,
          }}
        />

        <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
          <Box
            sx={{
              maxWidth: isMobile ? '100%' : '60%',
              animation: 'fadeIn 1.5s ease-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'translateY(20px)' },
                '100%': { opacity: 1, transform: 'translateY(0)' }
              }
            }}
          >
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                mb: 3,
                fontSize: isMobile ? '2.5rem' : '3.5rem',
              }}
            >
              Your Dream Vacation, Planned by AI
            </Typography>
            <Typography
              variant="h5"
              component="h2"
              gutterBottom
              sx={{
                mb: 4,
                fontWeight: 400,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                lineHeight: 1.4,
              }}
            >
              Let our intelligent travel assistant create the perfect personalized itinerary tailored to your interests, budget and travel style.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              startIcon={<ExploreIcon />}
              sx={{
                px: 4,
                py: 1.5,
                fontSize: '1.1rem',
                borderRadius: '30px',
                boxShadow: '0 4px 14px 0 rgba(0,0,0,0.25)',
                transition: 'all 0.3s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.3)',
                }
              }}
              onClick={() => navigate('/plan-trip')}
            >
              Start Planning
            </Button>
          </Box>
        </Container>
      </Box>

      <Box sx={{ py: 10, background: 'rgba(255, 255, 255, 0.9)', backdropFilter: 'blur(10px)' }}>
        <Container maxWidth="lg">
          <Typography
            variant="h3"
            component="h2"
            align="center"
            gutterBottom
            sx={{
              mb: 6,
              position: 'relative',
              fontWeight: 600,
              '&:after': {
                content: '""',
                position: 'absolute',
                width: '80px',
                height: '4px',
                bottom: '-15px',
                left: 'calc(50% - 40px)',
                backgroundColor: theme.palette.secondary.main,
                borderRadius: '2px'
              }
            }}
          >
            Everything You Need for Your Trip
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  elevation={3}
                  sx={{
                    p: 4,
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    textAlign: 'center',
                    borderRadius: '16px',
                    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 20px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <Box
                    sx={{
                      mb: 3,
                      p: 2,
                      borderRadius: '50%',
                      backgroundColor: `${theme.palette.primary.main}15`,
                      color: theme.palette.primary.main,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center'
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography
                    variant="h5"
                    component="h3"
                    gutterBottom
                    sx={{ mb: 2, fontWeight: 600 }}
                  >
                    {feature.title}
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.6 }}>
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {!isAuthenticated && (
        <Box
          sx={{
            py: 8,
            my: 4,
            mx: { xs: 2, md: 6 },
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
            color: 'white',
            textAlign: 'center'
          }}
        >
          <Container maxWidth="md">
            <Typography variant="h4" component="h2" gutterBottom fontWeight={500}>
              Ready to explore the world?
            </Typography>
            <Typography variant="body1" paragraph sx={{ mb: 4, maxWidth: '700px', mx: 'auto' }}>
              Join thousands of travelers who've discovered the easiest way to plan their trips with AI.
            </Typography>
            <Button
              variant="contained"
              color="secondary"
              size="large"
              sx={{
                px: 4,
                py: 1.5,
                borderRadius: '30px',
                fontWeight: 500
              }}
              onClick={() => navigate('/register')}
            >
              Create Your Free Account
            </Button>
          </Container>
        </Box>
      )}
    </Box>
  );
};

export default Home; 