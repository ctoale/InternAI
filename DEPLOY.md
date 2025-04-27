# Deployment Guide

## Deploying to Render (Free Option)

1. Create a Render account at https://render.com if you don't have one already.

2. From your Render dashboard, click on "New" and select "Web Service".

3. Connect your GitHub repository or select "Deploy from public Git repository" and enter your GitHub repo URL.

4. Configure your service with the following settings:
   - **Name**: itinerai-backend (or your preferred name)
   - **Environment**: Node
   - **Region**: Choose the closest region to your users
   - **Branch**: main (or your default branch)
   - **Build Command**: `npm install && npm run build:server`
   - **Start Command**: `npm start`

5. Under "Advanced" settings, add the following environment variables:
   - `NODE_ENV`: production
   - `PORT`: 10000 (Render will override this with their PORT)
   - `MONGODB_URI`: Your MongoDB connection string
   - `JWT_SECRET`: A secure random string for JWT encryption
   - `OPENAI_API_KEY`: Your OpenAI API key

6. Click "Create Web Service" and wait for the deployment to complete.

7. Once deployed, Render will provide you with a URL (e.g., `https://itinerai-backend.onrender.com`).

8. Update your frontend client to use this URL by setting it in an environment variable on Vercel:
   - Go to your Vercel project settings
   - Click on "Environment Variables"
   - Add a variable named `REACT_APP_API_URL` with the value of your Render URL

## Alternative: Deploying to Firebase (Free Tier)

If you prefer using Firebase:

1. Install the Firebase CLI if you haven't already:
   ```
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```
   firebase login
   ```

3. Initialize your project:
   ```
   firebase init
   ```
   - Select "Functions" and "Hosting" options
   - Choose your Firebase project
   - Use TypeScript for Functions
   - Say yes to ESLint
   - Install dependencies when prompted

4. Modify the Functions code to work with your Express app by creating a proxy in `functions/src/index.ts`:

   ```typescript
   import * as functions from 'firebase-functions';
   import * as express from 'express';
   import * as cors from 'cors';
   
   // Import your server routes
   import tripRoutes from './routes/tripRoutes';
   import userRoutes from './routes/userRoutes';
   import authRoutes from './routes/newauth';
   import connectToMongoDB from './db/mongoose';
   
   // Connect to MongoDB
   connectToMongoDB();
   
   const app = express();
   
   // Middleware
   app.use(cors({ origin: true }));
   app.use(express.json());
   
   // Routes
   app.use('/api/trips', tripRoutes);
   app.use('/api/users', userRoutes);
   app.use('/api/auth', authRoutes);
   
   // Export the Express app as a Firebase Function
   export const api = functions.https.onRequest(app);
   ```

5. Modify your frontend to use the Firebase Functions URL.

6. Deploy your Firebase project:
   ```
   firebase deploy
   ```

Note that Firebase Functions has usage limits on the free plan, but they should be sufficient for development and small applications.

## Connecting Frontend to Backend

After deploying your backend, update your frontend code to use the deployed API URL:

1. Create a `.env` file in your client directory:
   ```
   REACT_APP_API_URL=https://your-backend-url.onrender.com
   ```

2. Update your API client code to use this environment variable (which you've already done).

3. Redeploy your frontend to Vercel to apply these changes. 