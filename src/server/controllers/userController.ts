import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

export const registerUser = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = new User({
      email,
      password,
      firstName,
      lastName
    });

    await user.save();

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || '',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ message: 'Error registering user' });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET || '',
      { expiresIn: '7d' }
    );

    res.json({
      user: {
        _id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      },
      token
    });
  } catch (error) {
    console.error('Error logging in user:', error);
    res.status(500).json({ message: 'Error logging in user' });
  }
};

export const logoutUser = async (req: Request, res: Response) => {
  try {
    res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('Error logging out user:', error);
    res.status(500).json({ message: 'Error logging out user' });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Error fetching user' });
  }
};

export const updateUserProfile = async (req: Request, res: Response) => {
  try {
    const { currentPassword, newPassword, email, departureLocation } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (currentPassword && newPassword) {
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Current password is incorrect' });
      }
      
      await user.changePassword(newPassword);
      
      const updatedUser = await User.findById(req.user._id).select('-password');
      return res.json(updatedUser);
    }
    
    let updates: {email?: string, departureLocation?: string} = {};
    if (email) updates.email = email;
    if (departureLocation !== undefined) updates.departureLocation = departureLocation;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user profile:', error);
    res.status(500).json({ message: 'Error updating user profile' });
  }
};

export const getUserPreferences = async (req: Request, res: Response) => {
  try {
    const user = await User.findById(req.user._id).select('preferences');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json(user.preferences || {});
  } catch (error) {
    console.error('Error fetching user preferences:', error);
    res.status(500).json({ message: 'Error fetching user preferences' });
  }
};

export const updateUserPreferences = async (req: Request, res: Response) => {
  try {
    const { 
      defaultActivities, 
      defaultDietaryRestrictions, 
      defaultAccommodationType, 
      defaultTransportationType,
      defaultDepartureLocation
    } = req.body;
    
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    if (!user.preferences) {
      user.preferences = {};
    }
    
    if (defaultActivities) user.preferences.defaultActivities = defaultActivities;
    if (defaultDietaryRestrictions) user.preferences.defaultDietaryRestrictions = defaultDietaryRestrictions;
    if (defaultAccommodationType) user.preferences.defaultAccommodationType = defaultAccommodationType;
    if (defaultTransportationType) user.preferences.defaultTransportationType = defaultTransportationType;
    if (defaultDepartureLocation !== undefined) user.preferences.defaultDepartureLocation = defaultDepartureLocation;
    
    await user.save();
    
    res.json(user.preferences);
  } catch (error) {
    console.error('Error updating user preferences:', error);
    res.status(500).json({ message: 'Error updating user preferences' });
  }
}; 