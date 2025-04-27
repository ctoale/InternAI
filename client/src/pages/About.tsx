import React from 'react';
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  useTheme,
  Link,
  Button,
} from '@mui/material';
import GitHubIcon from '@mui/icons-material/GitHub';
import selfImage from '../self.jpg';

const About: React.FC = () => {
  const theme = useTheme();

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
          About
        </Typography>
      </Box>

      <Grid container spacing={4}>
        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
              About ItinerAI
            </Typography>
            <Typography variant="body1" paragraph>
              ItinerAI is a proof-of-concept, AI-powered travel planning platform that creates personalized itineraries based on your preferences. 
              The application combines modern web technologies with artificial intelligence to simplify complex trip planning and deliver tailored recommendations.
            </Typography>
            <Typography variant="body1" paragraph>
              The platform leverages a comprehensive technology stack: a React/TypeScript frontend with Material-UI components, 
              a dual-backend architecture with Node.js/Express for user management, Python/FastAPI for AI functionality, 
              and database support via PostgreSQL (Prisma) and MongoDB.
            </Typography>
            <Typography variant="body1" paragraph>
              The application integrates with OpenAI for intelligent trip generation, creating AI-driven recommendations for 
              flights, accommodations, attractions, and local activities for users.
            </Typography>
            <Typography variant="body1">
              Key features include AI-generated travel itineraries, user profile management, trip customization, 
              weather forecasts, and a responsive design for seamless use across all devices.
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper elevation={3} sx={{ p: 4, borderRadius: 2 }}>
            <Grid container spacing={3} alignItems="center">
              <Grid item xs={12} md={4} sx={{ display: 'flex', justifyContent: 'center' }}>
                <Box
                  sx={{
                    width: 240,
                    height: 240,
                    borderRadius: '50%',
                    overflow: 'hidden',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: `3px solid ${theme.palette.primary.main}`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <img 
                    src={selfImage} 
                    alt="Connor Toale"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                  />
                </Box>
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', color: theme.palette.primary.main }}>
                  Connor Toale
                </Typography>
                <Typography variant="h6" component="p" gutterBottom color="text.secondary">
                  Creator & Developer
                </Typography>
                <Typography variant="body1" paragraph>
                  Connor Toale is a passionate developer with expertise in building AI-enhanced web applications. 
                  With a background in full stack development and B2B SaaS, Connor created ItinerAI 
                  to explore the intersection of artificial intelligence and travel planning.
                </Typography>
                <Typography variant="body1" paragraph>
                  Connor's work focuses on creating intuitive user experiences backed by powerful technology. 
                  This project represents his vision for how AI can enhance how we live and travel.
                </Typography>
                <Box sx={{ display: 'flex', mt: 2 }}>
                  <Button
                    component={Link}
                    href="https://github.com/ConnorToale"
                    target="_blank"
                    rel="noopener noreferrer"
                    startIcon={<GitHubIcon />}
                    variant="outlined"
                    color="primary"
                    sx={{ borderRadius: 2 }}
                  >
                    GitHub
                  </Button>
                </Box>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default About; 