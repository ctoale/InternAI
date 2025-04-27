import express from 'express';
import {
  createTrip,
  getTrip,
  getTrips,
  updateTrip,
  deleteTrip,
  regenerateTripPlan,
  generateDayItinerary
} from '../controllers/tripController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

router.use(authenticate as express.RequestHandler);

router.post('/', createTrip);

router.get('/', getTrips);

router.get('/:id', getTrip);

router.put('/:id', updateTrip);

router.delete('/:id', deleteTrip);

router.post('/:id/regenerate', regenerateTripPlan);

router.post('/:id/generate-day/:dayNumber', generateDayItinerary);

export default router; 