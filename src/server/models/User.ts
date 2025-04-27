import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends mongoose.Document {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  trips: mongoose.Types.ObjectId[];
  bio?: string;
  departureLocation?: string;
  preferences?: {
    defaultActivities?: string[];
    defaultDietaryRestrictions?: string[];
    defaultAccommodationType?: string;
    defaultTransportationType?: string;
    defaultDepartureLocation?: string;
  };
  comparePassword(candidatePassword: string): Promise<boolean>;
  changePassword(newPassword: string): Promise<void>;
}

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  trips: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trip'
  }],
  bio: {
    type: String,
    trim: true
  },
  departureLocation: {
    type: String,
    trim: true
  },
  preferences: {
    defaultActivities: [String],
    defaultDietaryRestrictions: [String],
    defaultAccommodationType: String,
    defaultTransportationType: String,
    defaultDepartureLocation: String
  }
}, {
  timestamps: true
});

userSchema.pre('save', async function(next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 8);
  }
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  return bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.changePassword = async function(newPassword: string): Promise<void> {
  this.password = newPassword;
  await this.save();
};

export const User = mongoose.model<IUser>('User', userSchema); 