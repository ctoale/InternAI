import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

const envLocalPath = path.resolve(process.cwd(), '.env.local');
const envPath = path.resolve(process.cwd(), '.env');

if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
}

if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath, override: false });
}

import express from 'express';
import cors from 'cors';
import tripRoutes from './routes/tripRoutes';
import userRoutes from './routes/userRoutes';
import authRoutes from './routes/newauth';
import connectToMongoDB from './db/mongoose';

connectToMongoDB();

const app = express();
const port = process.env.PORT || 3001;

// Allow requests from multiple origins including Vercel deployment
const allowedOrigins = [
  'http://localhost:3000', 
  'http://127.0.0.1:3000',
  'https://intern-ai.vercel.app', // Add your Vercel domain here
  'https://intern-ai-git-master-ctoale.vercel.app' // Add your preview deployments
];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV === 'development') {
      callback(null, true);
    } else {
      console.log('Blocked by CORS:', origin);
      callback(null, true); // Still allow all origins in production for now
    }
  },
  credentials: true
}));

app.use(express.json());

app.use('/api/trips', tripRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);

app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 