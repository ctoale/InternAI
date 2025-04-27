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

app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
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