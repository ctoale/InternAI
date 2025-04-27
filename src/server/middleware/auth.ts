import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User';
import mongoose from 'mongoose';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.header('Authorization');
    
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      throw new Error('No token provided');
    }

    const secret = process.env.JWT_SECRET || 'your-secret-key';
    try {
      const decoded = jwt.verify(token, secret) as { id: string };
      
      const user = await User.findById(decoded.id);

      if (!user) {
        throw new Error('User not found');
      }

      const userId = user._id ? user._id.toString() : '';
      
      req.user = {
        _id: userId,
        id: userId,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
      };
      next();
    } catch (jwtError) {
      throw jwtError;
    }
  } catch (error) {
    console.error('Authentication failed:', error instanceof Error ? error.message : 'Unknown reason');
    res.status(401).json({ message: 'Please authenticate' });
  }
}; 