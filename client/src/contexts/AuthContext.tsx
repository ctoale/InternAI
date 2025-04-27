import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

interface User {
  _id: string;
  email: string;
  name?: string;
  bio?: string;
  departureLocation?: string;
}

interface PreferencesData {
  defaultActivities: string[];
  defaultDietaryRestrictions: string[];
  defaultAccommodationType: string;
  defaultTransportationType: string;
  defaultDepartureLocation: string;
}

interface AuthResponse {
  token: string;
  user: User;
}

interface ValidateResponse {
  user: User;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateProfile: (data: { email: string; departureLocation?: string }) => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  getUserPreferences: () => Promise<PreferencesData>;
  updateUserPreferences: (preferences: PreferencesData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      validateToken(token);
    } else {
      setLoading(false);
    }
  }, []);

  const validateToken = async (token: string) => {
    try {
      const response = await axios.get<ValidateResponse>('/api/auth/validate', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setUser(response.data.user);
    } catch (err) {
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.post<AuthResponse>('/api/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const nameParts = name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      const response = await axios.post<AuthResponse>('/api/auth/register', { 
        email, 
        password, 
        firstName, 
        lastName 
      });
      
      const { token, user } = response.data;
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
  };

  const updateProfile = async (data: { email: string; departureLocation?: string }) => {
    try {
      setLoading(true);
      setError(null);
      const response = await axios.put<User>('/api/users/profile', data);
      
      setUser({ ...user, ...response.data });
      return;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put('/api/users/profile', { currentPassword, newPassword });
      return;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to change password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getUserPreferences = async (): Promise<PreferencesData> => {
    try {
      setError(null);
      const response = await axios.get<PreferencesData>('/api/users/preferences');
      
      const preferences = {
        ...response.data,
        defaultDepartureLocation: response.data.defaultDepartureLocation || ''
      };
      
      return preferences;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to get preferences');
      return {
        defaultActivities: [],
        defaultDietaryRestrictions: [],
        defaultAccommodationType: '',
        defaultTransportationType: '',
        defaultDepartureLocation: ''
      };
    }
  };

  const updateUserPreferences = async (preferences: PreferencesData) => {
    try {
      setLoading(true);
      setError(null);
      await axios.put<PreferencesData>('/api/users/preferences', preferences);
      return;
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update preferences');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        error,
        login,
        register,
        logout,
        updateProfile,
        changePassword,
        getUserPreferences,
        updateUserPreferences
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 