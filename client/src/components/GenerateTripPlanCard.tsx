import React, { memo, useRef, useMemo } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { AutoAwesome, Send, Flight, LocalActivity } from '@mui/icons-material';
import { createPortal } from 'react-dom';
import { keyframes, styled } from '@mui/system';

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 25px rgba(255, 255, 255, 0.8); }
  50% { transform: scale(1.1); box-shadow: 0 0 35px rgba(255, 255, 255, 0.9); }
  100% { transform: scale(1); box-shadow: 0 0 25px rgba(255, 255, 255, 0.8); }
`;

const fadeIn = keyframes`
  0% { opacity: 0.7; }
  100% { opacity: 1; }
`;

const SpinnerBox = styled(Box)`
  position: absolute;
  width: 110px;
  height: 110px;
  border-radius: 50%;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top: 3px solid #4169e1;
  animation: ${spin} 1.5s linear infinite;
`;

const PulseBox = styled(Box)`
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 50%;
  width: 90px;
  height: 90px;
  background-color: white;
  color: #4169e1;
  box-shadow: 0 0 25px rgba(255, 255, 255, 0.8);
  animation: ${pulse} 2s infinite ease-in-out;
  position: relative;
  z-index: 1;
`;

const FadeText = styled(Typography)`
  color: white;
  margin-bottom: 24px;
  text-align: center;
  font-weight: 500;
  animation: ${fadeIn} 1.5s infinite alternate;
`;

const PulsingCircle = styled(Box)`
  position: absolute;
  top: -30px;
  right: -30px;
  width: 150px;
  height: 150px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  z-index: 0;
  animation: ${keyframes`
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.1); }
  `} 8s infinite ease-in-out;
`;

const FloatingCircle = styled(Box)`
  position: absolute;
  bottom: -40px;
  left: -40px;
  width: 180px;
  height: 180px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  z-index: 0;
  animation: ${keyframes`
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-15px); }
  `} 10s infinite ease-in-out;
`;

const FloatingIcon1 = styled(Box)`
  position: absolute;
  top: 20%;
  left: 12%;
  color: rgba(255, 255, 255, 0.1);
  z-index: 0;
  animation: ${keyframes`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-10px) rotate(10deg); }
  `} 15s infinite ease-in-out;
`;

const FloatingIcon2 = styled(Box)`
  position: absolute;
  bottom: 15%;
  right: 15%;
  color: rgba(255, 255, 255, 0.07);
  z-index: 0;
  animation: ${keyframes`
    0%, 100% { transform: translateY(0) rotate(0deg); }
    50% { transform: translateY(-8px) rotate(-5deg); }
  `} 12s infinite ease-in-out 1s;
`;

const travelQuotes = [
  {
    quote: "The world is a book, and those who do not travel read only one page.",
    author: "Saint Augustine"
  },
  {
    quote: "Travel makes one modest. You see what a tiny place you occupy in the world.",
    author: "Gustave Flaubert"
  },
  {
    quote: "Not all those who wander are lost.",
    author: "J.R.R. Tolkien"
  },
  {
    quote: "Travel far, travel wide, travel deep.",
    author: "Anita Desai"
  },
  {
    quote: "The journey of a thousand miles begins with a single step.",
    author: "Lao Tzu"
  },
  {
    quote: "Travel is the only thing you buy that makes you richer.",
    author: "Anonymous"
  },
  {
    quote: "To travel is to live.",
    author: "Hans Christian Andersen"
  },
  {
    quote: "Life is either a daring adventure or nothing at all.",
    author: "Helen Keller"
  },
  {
    quote: "Travel isn't always pretty. It isn't always comfortable. But that's okay. The journey changes you.",
    author: "Anthony Bourdain"
  },
  {
    quote: "Wherever you go, go with all your heart.",
    author: "Confucius"
  }
];

const GenerationOverlay = memo(({ isLoading, generationStage }: { 
  isLoading: boolean; 
  generationStage: string 
}) => {
  const { quote, author } = useMemo(() => {
    const randomIndex = Math.floor(Math.random() * travelQuotes.length);
    return travelQuotes[randomIndex];
  }, []);
  
  if (!isLoading) return null;
  
  return createPortal(
    <Box 
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backdropFilter: 'blur(5px)',
      }}
    >
      <Box sx={{ width: '70%', maxWidth: 600, mb: 2, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Box sx={{ 
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          mb: 2,
          width: 140,
          height: 140,
        }}>
          <SpinnerBox />
          
          <PulseBox>
            <AutoAwesome sx={{ fontSize: 50 }} />
          </PulseBox>
        </Box>
        
        <FadeText variant="h6" sx={{ mb: 1 }}>
          {generationStage}
        </FadeText>
      </Box>
      
      <Typography 
        variant="body1" 
        sx={{ 
          color: 'white',
          textAlign: 'center',
          maxWidth: '70%',
          opacity: 0.8
        }}
      >
        We're creating a personalized travel plan just for you, including flights, accommodations, 
        activities, and more. This process usually takes 1-2 minutes.
      </Typography>
      
      <Box sx={{ 
        mt: 5,
        p: 3,
        bgcolor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 2,
        maxWidth: '70%'
      }}>
        <Typography 
          variant="body2" 
          sx={{ 
            color: 'white',
            textAlign: 'center',
            fontStyle: 'italic'
          }}
        >
          "{quote}" — {author}
        </Typography>
      </Box>
    </Box>,
    document.body
  );
});

GenerationOverlay.displayName = 'GenerationOverlay';

interface GenerateTripPlanCardProps {
  onGeneratePlan: any;
  isLoading: boolean;
  generationStage?: string;
}

const GenerateTripPlanCard: React.FC<GenerateTripPlanCardProps> = ({ 
  onGeneratePlan, 
  isLoading,
  generationStage = "Generating your travel plan..." 
}) => {
  const overlayProps = useRef({ isLoading, generationStage });
  
  if (overlayProps.current.isLoading !== isLoading || 
      overlayProps.current.generationStage !== generationStage) {
    overlayProps.current = { isLoading, generationStage };
  }

  return (
    <>
      <Card
        elevation={6}
        sx={{
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          background: 'linear-gradient(135deg, #4169e1 0%, #3b5bdb 100%)',
          transition: 'transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out',
          my: 2,
          border: '1px solid rgba(255, 255, 255, 0.2)',
        }}
      >
        <PulsingCircle />
        <FloatingCircle />
        
        <FloatingIcon1>
          <Flight sx={{ fontSize: '4rem' }} />
        </FloatingIcon1>
        
        <FloatingIcon2>
          <LocalActivity sx={{ fontSize: '3rem' }} />
        </FloatingIcon2>
        
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: 'center',
            justifyContent: 'space-between',
            p: { xs: 4, md: 5 },
            position: 'relative',
            zIndex: 1,
          }}
        >
          <Box sx={{ mb: { xs: 3, md: 0 }, maxWidth: { md: '65%' } }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 50,
                  height: 50,
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.2)',
                  mr: 2,
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                }}
              >
                <AutoAwesome sx={{ color: '#FFD700', fontSize: '2rem' }} />
              </Box>
              <Typography 
                variant="h4" 
                component="h2" 
                sx={{ 
                  color: 'white',
                  fontWeight: 800,
                  textShadow: '0 2px 6px rgba(0,0,0,0.2)',
                  letterSpacing: '0.5px',
                }}
              >
                Ready for your adventure?
              </Typography>
            </Box>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.9)',
                lineHeight: 1.7,
                mb: 1.5,
                textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                pl: 1,
              }}
            >
              Click the button to generate your personalized travel plan based on your preferences.
            </Typography>
            <Typography 
              variant="body2" 
              sx={{ 
                color: 'rgba(255, 255, 255, 0.7)',
                fontStyle: 'italic',
                pl: 1,
                position: 'relative',
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  left: -5,
                  top: 0,
                  height: '100%',
                  width: 3,
                  background: 'rgba(255, 255, 255, 0.4)',
                  borderRadius: 4,
                }
              }}
            >
              Our AI will create a detailed itinerary tailored just for you!
            </Typography>
          </Box>
          
          <Button
            variant="contained"
            size="large"
            disabled={isLoading}
            onClick={onGeneratePlan}
            startIcon={<Send />}
            sx={{
              bgcolor: '#4169e1',
              color: 'white',
              fontSize: '1.1rem',
              fontWeight: 700,
              px: 4,
              py: 1.8,
              borderRadius: 3,
              boxShadow: '0 6px 16px 0 rgba(0,0,0,0.2)',
              '&:hover': {
                bgcolor: '#3258d8',
                boxShadow: '0 8px 24px 0 rgba(0,0,0,0.25)',
              },
              transition: 'all 0.3s ease',
              minWidth: 220,
              position: 'relative',
              overflow: 'hidden',
              '&::after': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                background: 'linear-gradient(120deg, rgba(255,255,255,0) 30%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 70%)',
                transform: 'translateX(-100%)',
                transition: 'all 0.6s ease',
              },
              '&:hover::after': {
                transform: 'translateX(100%)',
              },
              '&:disabled': {
                bgcolor: 'rgba(65, 105, 225, 0.7)',
                color: 'rgba(255, 255, 255, 0.8)',
              },
              border: '2px solid rgba(255, 255, 255, 0.3)',
              backdropFilter: 'blur(5px)',
            }}
          >
            Generate My Trip Plan
          </Button>
        </Box>
      </Card>
      
      <GenerationOverlay
        isLoading={overlayProps.current.isLoading}
        generationStage={overlayProps.current.generationStage}
      />
    </>
  );
};

export default memo(GenerateTripPlanCard); 