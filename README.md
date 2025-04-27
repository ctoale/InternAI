# ItinerAI

An AI-powered travel planning platform that generates personalized trip itineraries based on user preferences. The application combines a Node.js backend, Python AI service, PostgreSQL (Prisma) and MongoDB database support, and React frontend to deliver a seamless travel planning experience.

## Features

- AI-generated personalized travel itineraries
- Day-by-day activity planning
- Trip saving and management
- User authentication and profile management
- Interactive and responsive UI with Material-UI components

## Tech Stack

### Backend
- **Node.js/Express**: TypeScript-based API server
- **MongoDB**: Database for user and trip storage
- **Prisma ORM**: For database operations
- **JWT**: Authentication and authorization

### AI Service
- **Python/FastAPI**: Separate service for AI operations
- **OpenAI API**: Powers the AI recommendation engine

### Frontend
- **React**: Built with TypeScript
- **Material-UI**: Component library for UI
- **React Router**: Navigation and routing
- **Axios**: API client for server communication

## Prerequisites

- Node.js (v14 or higher)
- Python (v3.8 or higher)
- MongoDB database
- OpenAI API key

## Installation

1. Clone the repository:
```bash
git clone https://github.com/ctoale/itinerai.git
cd itinerai
```

2. Install Node.js dependencies:
```bash
npm install
cd client
npm install
cd ..
```

3. Install Python dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the root directory with the following variables:
```
# MongoDB Connection
DATABASE_URL=mongodb+srv://...
PORT=3001

# Authentication
JWT_SECRET=your_jwt_secret

# OpenAI API
OPENAI_API_KEY=your_openai_api_key
```

5. Generate Prisma client:
```bash
npx prisma generate
```

## Running the Application

### Development Mode

Start all services concurrently:
```bash
npm run start:all
```

Or start each service separately:

1. Node.js server:
```bash
npm run dev
```

2. Python AI service:
```bash
python src/python/server.py
```

3. React client:
```bash
cd client
npm start
```

### Access Points
- Frontend: http://localhost:3000
- Node.js API: http://localhost:3001
- Python AI Service: http://localhost:8001

## API Routes

### Authentication
- `POST /api/auth` - Login user
- `POST /api/users` - Register new user
- `GET /api/users/me` - Get user profile

### Trips
- `POST /api/trips` - Create new trip
- `GET /api/trips` - Get all user trips
- `GET /api/trips/:id` - Get specific trip
- `PUT /api/trips/:id` - Update trip
- `DELETE /api/trips/:id` - Delete trip
- `POST /api/trips/:id/regenerate` - Regenerate trip plan using AI
- `POST /api/trips/:id/generate-day/:dayNumber` - Generate itinerary for specific day

## Project Structure

```
itinerai/
├── client/               # React frontend
│   └── src/
│       ├── components/   # Reusable UI components
│       ├── pages/        # Page components
│       ├── services/     # API clients
│       └── contexts/     # React contexts
├── prisma/               # Prisma ORM schema
├── src/
│   ├── server/           # Node.js backend
│   │   ├── controllers/  # Route handlers
│   │   ├── middleware/   # Express middleware
│   │   ├── routes/       # API routes
│   │   └── db/           # Database connections
│   ├── python/           # Python services
│   │   └── server.py     # FastAPI server
│   └── ai/               # AI service modules
└── requirements.txt      # Python dependencies
```

## License

This project is licensed under the MIT License - see the LICENSE file for details. 