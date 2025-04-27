import React, { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress,
  Grid,
  InputAdornment,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Person as PersonIcon,
  AppRegistration as RegisterIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register, loading, error } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [formError, setFormError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (formData.password !== formData.confirmPassword) {
      setFormError('Passwords do not match');
      return;
    }

    try {
      await register(formData.name, formData.email, formData.password);
      navigate('/my-trips');
    } catch (err) {
      // Error is handled by the AuthContext
    }
  };

  return (
    <Container maxWidth="md">
      <Grid 
        container 
        sx={{ 
          minHeight: '100vh',
          pt: 4,
          pb: 8,
        }}
      >
        <Grid 
          item 
          md={6} 
          sx={{ 
            display: { xs: 'none', md: 'flex' },
            background: `linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(https://images.unsplash.com/photo-1490042706304-fcbc1f76fdba)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            borderRadius: '20px',
            position: 'relative',
            overflow: 'hidden',
            boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              bottom: '2rem',
              left: '2rem',
              right: '2rem',
              color: 'white',
            }}
          >
            <Typography variant="h4" sx={{ fontWeight: 600, mb: 1 }}>
              Join our travel community
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9 }}>
              Create an account to get personalized travel recommendations and plan your dream vacations with AI assistance.
            </Typography>
          </Box>
        </Grid>

        <Grid 
          item 
          xs={12} 
          md={6} 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column',
            justifyContent: 'center',
            padding: isMobile ? '2rem 1rem' : '2rem 3rem',
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(10px)',
            borderRadius: '20px',
          }}
        >
          <Box sx={{ mb: 4 }}>
            <Typography 
              variant="h3" 
              component="h1" 
              gutterBottom
              sx={{ 
                fontWeight: 700,
                color: theme.palette.primary.main,
              }}
            >
              Create Account
            </Typography>
            <Typography 
              variant="subtitle1" 
              color="text.secondary"
              sx={{ mb: 3 }}
            >
              Sign up to start planning your perfect travel experiences
            </Typography>
          </Box>

          {(error || formError) && (
            <Alert 
              severity="error" 
              sx={{ 
                mb: 3,
                borderRadius: '8px',
                '& .MuiAlert-message': {
                  fontWeight: 500,
                },
              }}
            >
              {error || formError}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              <TextField
                fullWidth
                label="Full Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                autoFocus
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Email Address"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <EmailIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                required
                helperText="Password must be at least 6 characters long"
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
              <TextField
                fullWidth
                label="Confirm Password"
                name="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon color="primary" />
                    </InputAdornment>
                  ),
                }}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: '10px',
                  },
                }}
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                size="large"
                disabled={loading}
                startIcon={loading ? null : <RegisterIcon />}
                sx={{ 
                  mt: 2,
                  py: 1.5,
                  borderRadius: '10px',
                  fontWeight: 600,
                }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Account'}
              </Button>
            </Box>
          </form>
          
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Typography variant="body1">
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline',
                  }
                }}
              >
                Sign in
              </Link>
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Register; 