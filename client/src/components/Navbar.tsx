import React, { useState, useEffect } from 'react';
import { useNavigate, Link as RouterLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Tooltip,
  Container,
  useTheme,
  useMediaQuery,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  AccountCircle as AccountIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  FlightTakeoff as FlightIcon,
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuth();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/login');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const navbarStyle = {
    background: isHomePage && !scrolled 
      ? 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)' 
      : 'linear-gradient(90deg, #1e3c72 0%, #2a5298 100%)',
    backdropFilter: isHomePage && !scrolled ? 'blur(8px)' : 'none',
    boxShadow: isHomePage && !scrolled 
      ? '0 4px 12px rgba(0, 0, 0, 0.08)' 
      : '0 4px 12px rgba(0, 0, 0, 0.12)',
    transition: 'all 0.3s ease',
    borderBottom: isHomePage && !scrolled ? '1px solid rgba(255,255,255,0.1)' : 'none',
  };

  return (
    <AppBar position="fixed" sx={navbarStyle} elevation={isHomePage && !scrolled ? 0 : 4}>
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ py: 0.5 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              flexGrow: 1,
              '&:hover': {
                '& .logo-icon': {
                  transform: 'translateY(-2px) rotate(-10deg)',
                },
                '& .logo-text': {
                  color: '#ffffff',
                  textShadow: '0 0 8px rgba(255,255,255,0.4)',
                }
              }
            }}
          >
            <FlightIcon 
              className="logo-icon"
              sx={{ 
                mr: 1, 
                fontSize: '2rem',
                color: '#fff',
                transition: 'all 0.3s ease',
              }} 
            />
            <Typography
              className="logo-text"
              variant="h6"
              component={RouterLink}
              to="/"
              sx={{
                textDecoration: 'none',
                color: '#fff',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                fontSize: '1.3rem',
                transition: 'all 0.3s ease',
                textShadow: '0 1px 3px rgba(0,0,0,0.15)',
              }}
            >
              ItinerAI
            </Typography>
          </Box>

          {!isMobile ? (
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button
                color="inherit"
                component={RouterLink}
                to="/about"
                sx={{ 
                  mx: 1,
                  position: 'relative',
                  color: '#fff',
                  fontWeight: 500,
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.15)',
                    color: '#ffffff',
                    '&::after': {
                      width: '50%',
                      opacity: 1,
                    }
                  },
                  '&:after': location.pathname === '/about' ? {
                    content: '""',
                    position: 'absolute',
                    width: '50%',
                    height: '3px',
                    bottom: '5px',
                    left: '25%',
                    backgroundColor: 'white',
                    borderRadius: '2px'
                  } : {
                    content: '""',
                    position: 'absolute',
                    width: '0%',
                    height: '2px',
                    bottom: '5px',
                    left: '25%',
                    backgroundColor: 'white',
                    borderRadius: '2px',
                    opacity: 0,
                    transition: 'all 0.3s ease',
                  }
                }}
              >
                About
              </Button>
              {isAuthenticated ? (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/my-trips"
                    sx={{ 
                      mx: 1,
                      position: 'relative',
                      color: '#fff',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        '&::after': {
                          width: '50%',
                          opacity: 1,
                        }
                      },
                      '&:after': location.pathname === '/my-trips' ? {
                        content: '""',
                        position: 'absolute',
                        width: '50%',
                        height: '3px',
                        bottom: '5px',
                        left: '25%',
                        backgroundColor: 'white',
                        borderRadius: '2px'
                      } : {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: '5px',
                        left: '25%',
                        backgroundColor: 'white',
                        borderRadius: '2px',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                      }
                    }}
                  >
                    My Trips
                  </Button>
                  <Tooltip title="Account settings">
                    <IconButton
                      size="large"
                      onClick={handleMenu}
                      color="inherit"
                      sx={{ 
                        ml: 1,
                        '&:hover': {
                          backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        }
                      }}
                    >
                      {user?.name ? (
                        <Avatar 
                          sx={{ 
                            width: 36, 
                            height: 36,
                            bgcolor: 'rgba(255, 255, 255, 0.9)',
                            color: '#1e3c72',
                            fontWeight: 'bold',
                            fontSize: '1rem',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                          }}
                        >
                          {user.name.charAt(0).toUpperCase()}
                        </Avatar>
                      ) : (
                        <AccountIcon />
                      )}
                    </IconButton>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    anchorOrigin={{
                      vertical: 'bottom',
                      horizontal: 'right',
                    }}
                    keepMounted
                    transformOrigin={{
                      vertical: 'top',
                      horizontal: 'right',
                    }}
                    open={Boolean(anchorEl)}
                    onClose={handleClose}
                    disableScrollLock={true}
                    transitionDuration={0}
                    PaperProps={{
                      elevation: 3,
                      sx: {
                        mt: 1.5,
                        borderRadius: '8px',
                        minWidth: '180px',
                        position: 'absolute',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                        border: '1px solid rgba(0,0,0,0.05)',
                      }
                    }}
                    slotProps={{
                      paper: {
                        style: {
                          position: 'absolute',
                          zIndex: 1300
                        }
                      }
                    }}
                  >
                    <MenuItem
                      component={RouterLink}
                      to="/profile"
                      onClick={handleClose}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(30, 60, 114, 0.08)',
                        }
                      }}
                    >
                      Profile
                    </MenuItem>
                    <Divider />
                    <MenuItem 
                      onClick={handleLogout}
                      sx={{
                        py: 1.5,
                        '&:hover': {
                          backgroundColor: 'rgba(244, 67, 54, 0.08)',
                          color: theme.palette.error.main,
                        }
                      }}
                    >
                      Logout
                    </MenuItem>
                  </Menu>
                </>
              ) : (
                <>
                  <Button
                    color="inherit"
                    component={RouterLink}
                    to="/login"
                    sx={{ 
                      mx: 1,
                      position: 'relative',
                      color: '#fff',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.15)',
                        color: '#ffffff',
                        '&::after': {
                          width: '50%',
                          opacity: 1,
                        }
                      },
                      '&:after': location.pathname === '/login' ? {
                        content: '""',
                        position: 'absolute',
                        width: '50%',
                        height: '3px',
                        bottom: '5px',
                        left: '25%',
                        backgroundColor: 'white',
                        borderRadius: '2px'
                      } : {
                        content: '""',
                        position: 'absolute',
                        width: '0%',
                        height: '2px',
                        bottom: '5px',
                        left: '25%',
                        backgroundColor: 'white',
                        borderRadius: '2px',
                        opacity: 0,
                        transition: 'all 0.3s ease',
                      }
                    }}
                  >
                    Login
                  </Button>
                  <Button
                    component={RouterLink}
                    to="/register"
                    variant="contained"
                    color="secondary"
                    sx={{ 
                      ml: 1,
                      px: 3,
                      py: 0.8,
                      borderRadius: '20px',
                      fontWeight: 500,
                      '&:hover': {
                        backgroundColor: '#c51162',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      }
                    }}
                  >
                    Register
                  </Button>
                </>
              )}
            </Box>
          ) : (
            <>
              <IconButton 
                color="inherit" 
                onClick={toggleMobileMenu} 
                size="large"
                sx={{
                  color: '#fff',
                }}
              >
                <MenuIcon />
              </IconButton>
              
              <Drawer
                anchor="right"
                open={mobileMenuOpen}
                onClose={toggleMobileMenu}
                disableScrollLock={true}
                transitionDuration={0}
                PaperProps={{
                  sx: {
                    width: '75%',
                    maxWidth: '320px',
                    pt: 2,
                    background: 'linear-gradient(135deg, #f5f7fa 0%, #e4e8f0 100%)',
                  }
                }}
              >
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlightIcon sx={{ mr: 1, color: '#1e3c72' }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold', color: '#1e3c72' }}>
                      Travel AI
                    </Typography>
                  </Box>
                  <IconButton onClick={toggleMobileMenu}>
                    <CloseIcon />
                  </IconButton>
                </Box>
                
                <Divider sx={{ mb: 2 }} />
                
                <List>
                  <ListItem 
                    button 
                    component={RouterLink} 
                    to="/"
                    onClick={toggleMobileMenu}
                    sx={{ 
                      py: 1.5,
                      backgroundColor: location.pathname === '/' ? 'rgba(30, 60, 114, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(30, 60, 114, 0.05)',
                      }
                    }}
                  >
                    <ListItemText primary="Home" />
                  </ListItem>
                  
                  <ListItem 
                    button 
                    component={RouterLink} 
                    to="/about"
                    onClick={toggleMobileMenu}
                    sx={{ 
                      py: 1.5,
                      backgroundColor: location.pathname === '/about' ? 'rgba(30, 60, 114, 0.08)' : 'transparent',
                      '&:hover': {
                        backgroundColor: 'rgba(30, 60, 114, 0.05)',
                      }
                    }}
                  >
                    <ListItemText primary="About" />
                  </ListItem>
                  
                  {isAuthenticated ? (
                    <>
                      <ListItem 
                        button 
                        component={RouterLink} 
                        to="/my-trips"
                        onClick={toggleMobileMenu}
                        sx={{ 
                          py: 1.5,
                          backgroundColor: location.pathname === '/my-trips' ? 'rgba(30, 60, 114, 0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 60, 114, 0.05)',
                          }
                        }}
                      >
                        <ListItemText primary="My Trips" />
                      </ListItem>
                      <ListItem 
                        button 
                        component={RouterLink} 
                        to="/profile"
                        onClick={toggleMobileMenu}
                        sx={{ 
                          py: 1.5,
                          backgroundColor: location.pathname === '/profile' ? 'rgba(30, 60, 114, 0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 60, 114, 0.05)',
                          }
                        }}
                      >
                        <ListItemText primary="Profile" />
                      </ListItem>
                      <Divider sx={{ my: 1.5 }} />
                      <ListItem 
                        button 
                        onClick={() => {
                          handleLogout();
                          toggleMobileMenu();
                        }}
                        sx={{ 
                          py: 1.5,
                          color: theme.palette.error.main,
                          '&:hover': {
                            backgroundColor: 'rgba(244, 67, 54, 0.05)',
                          }
                        }}
                      >
                        <ListItemText primary="Logout" />
                      </ListItem>
                    </>
                  ) : (
                    <>
                      <ListItem 
                        button 
                        component={RouterLink} 
                        to="/login"
                        onClick={toggleMobileMenu}
                        sx={{ 
                          py: 1.5,
                          backgroundColor: location.pathname === '/login' ? 'rgba(30, 60, 114, 0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 60, 114, 0.05)',
                          }
                        }}
                      >
                        <ListItemText primary="Login" />
                      </ListItem>
                      <ListItem 
                        button 
                        component={RouterLink} 
                        to="/register"
                        onClick={toggleMobileMenu}
                        sx={{ 
                          py: 1.5,
                          backgroundColor: location.pathname === '/register' ? 'rgba(30, 60, 114, 0.08)' : 'transparent',
                          '&:hover': {
                            backgroundColor: 'rgba(30, 60, 114, 0.05)',
                          }
                        }}
                      >
                        <ListItemText primary="Register" />
                      </ListItem>
                    </>
                  )}
                </List>
              </Drawer>
            </>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar; 