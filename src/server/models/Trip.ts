import mongoose, { Schema, Document } from 'mongoose';

interface Destination {
  location: string;
  startDate: Date;
  endDate: Date;
  placesToVisit?: string[];
}

export interface TripDocument extends Document {
  userId: string;
  name?: string;
  destination: string;
  startDate: Date;
  endDate: Date;
  budget?: number;
  travelers?: number;
  destinations?: Destination[];
  preferences: {
    accommodationType: string;
    transportationType: string;
    activities: string[];
    dietaryRestrictions: string[];
    placesToVisit?: string[];
  };
  itinerary: any;
  status: 'planning' | 'booked' | 'completed' | 'cancelled';
  collaborators: Array<{
    user: mongoose.Types.ObjectId | string;
    role: 'owner' | 'editor' | 'viewer';
  }>;
  createdBy: mongoose.Types.ObjectId | string;
  activities: any[];
  createdAt: Date;
  updatedAt: Date;
}

// This is an alias for TripDocument kept for backward compatibility
// Used by AIService.ts and tripController.ts
export interface ITrip extends TripDocument {}

const DestinationSchema: Schema = new Schema({
  location: { type: String, required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  placesToVisit: [{ type: String }]
});

const TripSchema: Schema = new Schema(
  {
    userId: { type: String, required: true },
    name: { type: String },
    destination: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    budget: { type: Number },
    travelers: { type: Number, default: 1 },
    destinations: [DestinationSchema],
    preferences: {
      accommodationType: { type: String, required: true },
      transportationType: { type: String, required: true },
      activities: [{ type: String }],
      dietaryRestrictions: [{ type: String }],
      placesToVisit: [{ type: String }]
    },
    itinerary: { type: Schema.Types.Mixed },
    status: {
      type: String,
      enum: ['planning', 'booked', 'completed', 'cancelled'],
      default: 'planning'
    },
    collaborators: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },
      role: {
        type: String,
        enum: ['owner', 'editor', 'viewer'],
        default: 'viewer'
      }
    }],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    activities: [{ type: mongoose.Schema.Types.Mixed }]
  },
  { timestamps: true }
);

const TripModel = mongoose.model<TripDocument>('Trip', TripSchema);

export const Trip = TripModel; 