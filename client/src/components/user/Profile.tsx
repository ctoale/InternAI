import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Alert,
  Tab,
  Tabs,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  OutlinedInput,
  SelectChangeEvent
} from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profile-tabpanel-${index}`}
      aria-labelledby={`profile-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
};

interface PreferencesData {
  defaultActivities: string[];
  defaultDietaryRestrictions: string[];
  defaultAccommodationType: string;
  defaultTransportationType: string;
  defaultDepartureLocation: string;
}

const Profile: React.FC = () => {
  const { user, updateProfile, changePassword, getUserPreferences, updateUserPreferences } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  
  const [profileData, setProfileData] = useState({
    email: ''
  });
  
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const [preferencesData, setPreferencesData] = useState<PreferencesData>({
    defaultActivities: [],
    defaultDietaryRestrictions: [],
    defaultAccommodationType: '',
    defaultTransportationType: '',
    defaultDepartureLocation: ''
  });
  
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [preferencesError, setPreferencesError] = useState<string | null>(null);
  const [preferencesSuccess, setPreferencesSuccess] = useState(false);

  const activityOptions = [
    'Sightseeing', 'Museums', 'Hiking', 'Beach', 'Shopping', 
    'Food Tours', 'Adventure Sports', 'Historical Sites', 'Nightlife',
    'Nature', 'Cultural Experiences'
  ];
  
  const dietaryOptions = [
    'Vegan', 'Gluten-Free', 'Dairy-Free', 
    'Halal', 'Kosher', 'Nut-Free', 'Seafood-Free'
  ];
  
  const accommodationOptions = [
    'Hotel', 'Hostel', 'Resort', 'Apartment', 
    'Guesthouse', 'Camping', 'Luxury'
  ];
  
  const transportationOptions = [
    'Walking', 'Public Transit', 'Rental Car', 'Taxi/Uber', 
    'Bicycle', 'Private Driver'
  ];

  useEffect(() => {
    if (user) {
      setProfileData({
        email: user.email || ''
      });
      
      getUserPreferences()
        .then(prefsData => {
          setPreferencesData(prefsData);
        })
        .catch(err => {
          console.error('Failed to fetch preferences:', err);
        });
    }
  }, [user, getUserPreferences]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updateProfileData();
  };

  const updateProfileData = async () => {
    try {
      await updateProfile(profileData);
      setProfileSuccess(true);
      setProfileError(null);
      
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'Failed to update profile');
      setProfileSuccess(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updatePasswordData();
  };

  const updatePasswordData = async () => {
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }
    
    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setPasswordSuccess(true);
      setPasswordError(null);
      
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.response?.data?.message || 'Failed to update password');
      setPasswordSuccess(false);
    }
  };

  const handlePreferencesSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    updatePreferencesData();
  };

  const updatePreferencesData = async () => {
    try {
      await updateUserPreferences(preferencesData);
      setPreferencesSuccess(true);
      setPreferencesError(null);
      
      setTimeout(() => setPreferencesSuccess(false), 3000);
    } catch (err) {
      setPreferencesError(err instanceof Error ? err.message : 'Failed to update preferences');
      setPreferencesSuccess(false);
    }
  };

  const handleMultiSelectChange = (event: SelectChangeEvent<string[]>, field: string) => {
    const value = event.target.value;
    setPreferencesData({
      ...preferencesData,
      [field]: typeof value === 'string' ? value.split(',') : value
    });
  };

  return (
    <Box sx={{ maxWidth: 800, mx: 'auto', p: 3, mt: 5 }}>
      <Paper elevation={3} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Account Settings</Typography>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={handleTabChange} aria-label="profile tabs">
            <Tab label="Profile" id="profile-tab-0" aria-controls="profile-tabpanel-0" />
            <Tab label="Password" id="profile-tab-1" aria-controls="profile-tabpanel-1" />
            <Tab label="Travel Preferences" id="profile-tab-2" aria-controls="profile-tabpanel-2" />
          </Tabs>
        </Box>

        <TabPanel value={activeTab} index={0}>
          {profileError && <Alert severity="error" sx={{ mb: 2 }}>{profileError}</Alert>}
          {profileSuccess && <Alert severity="success" sx={{ mb: 2 }}>Profile updated successfully!</Alert>}

          <form onSubmit={handleProfileSubmit}>
            <TextField
              fullWidth
              label="Email"
              type="email"
              value={profileData.email}
              onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
              margin="normal"
            />
            <Button
              type="button"
              variant="contained"
              onClick={updateProfileData}
              fullWidth
              sx={{ mt: 2 }}
            >
              Update Email
            </Button>
          </form>
        </TabPanel>

        <TabPanel value={activeTab} index={1}>
          {passwordError && <Alert severity="error" sx={{ mb: 2 }}>{passwordError}</Alert>}
          {passwordSuccess && <Alert severity="success" sx={{ mb: 2 }}>Password updated successfully!</Alert>}

          <form onSubmit={handlePasswordSubmit}>
            <TextField
              fullWidth
              label="Current Password"
              type="password"
              value={passwordData.currentPassword}
              onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="New Password"
              type="password"
              value={passwordData.newPassword}
              onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
              margin="normal"
              required
            />
            <TextField
              fullWidth
              label="Confirm New Password"
              type="password"
              value={passwordData.confirmPassword}
              onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
              margin="normal"
              required
            />
            <Button
              type="button"
              variant="contained"
              onClick={updatePasswordData}
              fullWidth
              sx={{ mt: 2 }}
            >
              Change Password
            </Button>
          </form>
        </TabPanel>

        <TabPanel value={activeTab} index={2}>
          {preferencesError && <Alert severity="error" sx={{ mb: 2 }}>{preferencesError}</Alert>}
          {preferencesSuccess && <Alert severity="success" sx={{ mb: 2 }}>Travel preferences updated successfully!</Alert>}

          <Typography variant="h6" sx={{ mb: 2 }}>
            Default Travel Preferences
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            These preferences will be pre-filled when you create new trip plans.
          </Typography>

          <form onSubmit={handlePreferencesSubmit}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="activities-label">Preferred Activities</InputLabel>
                  <Select
                    labelId="activities-label"
                    multiple
                    value={preferencesData.defaultActivities}
                    onChange={(e) => handleMultiSelectChange(e, 'defaultActivities')}
                    input={<OutlinedInput label="Preferred Activities" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
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
                    {activityOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="dietary-label">Dietary Restrictions</InputLabel>
                  <Select
                    labelId="dietary-label"
                    multiple
                    value={preferencesData.defaultDietaryRestrictions}
                    onChange={(e) => handleMultiSelectChange(e, 'defaultDietaryRestrictions')}
                    input={<OutlinedInput label="Dietary Restrictions" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
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
                    {dietaryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="accommodation-label">Preferred Accommodation</InputLabel>
                  <Select
                    labelId="accommodation-label"
                    value={preferencesData.defaultAccommodationType}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      defaultAccommodationType: e.target.value
                    })}
                    input={<OutlinedInput label="Preferred Accommodation" />}
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
                    <MenuItem value="">None</MenuItem>
                    {accommodationOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="transportation-label">Preferred Transportation</InputLabel>
                  <Select
                    labelId="transportation-label"
                    value={preferencesData.defaultTransportationType}
                    onChange={(e) => setPreferencesData({
                      ...preferencesData,
                      defaultTransportationType: e.target.value
                    })}
                    input={<OutlinedInput label="Preferred Transportation" />}
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
                    <MenuItem value="">None</MenuItem>
                    {transportationOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Default Departure Location"
                  value={preferencesData.defaultDepartureLocation}
                  onChange={(e) => setPreferencesData({
                    ...preferencesData,
                    defaultDepartureLocation: e.target.value
                  })}
                  margin="normal"
                  placeholder="e.g., JFK, New York, or SFO"
                  helperText="Your default departure location for all trips"
                />
              </Grid>
            </Grid>

            <Button
              type="button"
              variant="contained"
              onClick={updatePreferencesData}
              fullWidth
              sx={{ mt: 3 }}
            >
              Save Preferences
            </Button>
          </form>
        </TabPanel>
      </Paper>
    </Box>
  );
};

export default Profile; 