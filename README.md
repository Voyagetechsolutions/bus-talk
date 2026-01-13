# Bus Talk

A community-driven platform for South African bus enthusiasts, combining social networking, gamification, and real-time ratings.

## Features

- **User Authentication**: Sign up/in with role-based access (Admin, Verified Spotter, Regular User)
- **Trip Ratings**: Rate buses on punctuality, cleanliness, comfort, and driver behavior
- **Spotter Posts**: Verified spotters can post news and updates
- **Bus Sightings**: Share photos and locations of bus sightings
- **Gamification**: Boost posts, monthly awards, and live rankings
- **Real-time Updates**: Live feed with instant updates

## Tech Stack

- **Frontend**: React + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Supabase (PostgreSQL + Auth + Storage + Realtime)
- **State Management**: Zustand
- **Routing**: React Router

## Setup Instructions

1. **Clone and Install**
   ```bash
   cd "Bus Talk"
   npm install
   ```

2. **Supabase Setup**
   - Create a new Supabase project at https://supabase.com
   - Copy `.env.example` to `.env` and add your Supabase credentials
   - Run the database schema (see Database Schema section)

3. **Start Development Server**
   ```bash
   npm start
   ```

## Database Schema

Create these tables in your Supabase project:

```sql
-- Users table
CREATE TABLE users (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'verified_spotter', 'user')),
  spotter_status BOOLEAN DEFAULT FALSE,
  badges TEXT[] DEFAULT '{}',
  profile_pic TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Companies table
CREATE TABLE companies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo TEXT,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  buses_count INTEGER DEFAULT 0,
  routes_count INTEGER DEFAULT 0
);

-- Buses table
CREATE TABLE buses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  company_id UUID REFERENCES companies(id),
  fleet_number TEXT NOT NULL,
  route TEXT NOT NULL,
  type TEXT NOT NULL,
  year INTEGER,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  last_seen TIMESTAMP WITH TIME ZONE
);

-- Drivers table
CREATE TABLE drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  routes TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0
);

-- Posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  type TEXT CHECK (type IN ('news', 'sighting')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  media_urls TEXT[] DEFAULT '{}',
  boosts_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ratings table
CREATE TABLE ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  bus_id UUID REFERENCES buses(id),
  driver_id UUID REFERENCES drivers(id),
  trip_date DATE NOT NULL,
  punctuality INTEGER CHECK (punctuality BETWEEN 1 AND 5),
  cleanliness INTEGER CHECK (cleanliness BETWEEN 1 AND 5),
  comfort INTEGER CHECK (comfort BETWEEN 1 AND 5),
  behavior INTEGER CHECK (behavior BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Boosts table
CREATE TABLE boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- Awards table
CREATE TABLE awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  winner_id UUID NOT NULL,
  votes_total INTEGER DEFAULT 0,
  votes_weighted DECIMAL(10,2) DEFAULT 0
);
```

## Project Structure

```
src/
├── components/          # Reusable UI components
├── pages/              # Page components
├── hooks/              # Custom hooks and state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and Supabase client
└── index.css           # Global styles with Tailwind
```

## Key Features Implementation

### Authentication & Roles
- Users sign up and are assigned roles
- Verified spotters can post news and boost content
- Admins have full moderation capabilities

### Rating System
- Users rate trips on 4 categories (1-5 stars)
- Ratings are tied to specific buses and drivers
- Average ratings are calculated and displayed

### Gamification
- Verified spotters can "boost" posts to increase visibility
- Monthly awards with weighted voting system
- Live rankings and momentum tracking

### Real-time Features
- Live feed updates using Supabase Realtime
- Instant rating updates
- Boost notifications

## Next Steps

1. Implement authentication UI (sign in/up modals)
2. Add image upload functionality for sightings
3. Build admin dashboard for user verification
4. Implement voting system for monthly awards
5. Add search and filtering capabilities
6. Create mobile-responsive design improvements

## Contributing

This is a community project for South African bus enthusiasts. Feel free to contribute features, bug fixes, or improvements!