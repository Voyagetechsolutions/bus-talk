-- Bus Talk Database Schema
-- Run this in your Supabase SQL editor

-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (extends Supabase auth.users)
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
  routes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  last_seen TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Drivers table
CREATE TABLE drivers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  company_id UUID REFERENCES companies(id),
  routes TEXT[] DEFAULT '{}',
  experience_years INTEGER DEFAULT 0,
  rating_avg DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, bus_id, trip_date) -- Prevent duplicate ratings per trip
);

-- Boosts table
CREATE TABLE boosts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id),
  user_id UUID REFERENCES users(id),
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Prevent duplicate boosts
);

-- Awards table
CREATE TABLE awards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  category TEXT NOT NULL,
  winner_id UUID NOT NULL,
  votes_total INTEGER DEFAULT 0,
  votes_weighted DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Votes table for awards
CREATE TABLE votes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  category TEXT NOT NULL,
  nominee_id UUID NOT NULL,
  month INTEGER NOT NULL,
  year INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, category, month, year) -- One vote per category per month
);

-- Comments table
CREATE TABLE comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Spotter applications table
CREATE TABLE spotter_applications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  reason TEXT NOT NULL,
  experience TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  reviewed_by UUID REFERENCES users(id),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Likes table
CREATE TABLE likes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(post_id, user_id) -- Prevent duplicate likes
);

-- Create storage bucket for media
INSERT INTO storage.buckets (id, name, public) VALUES ('media', 'media', true);

-- RLS Policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE buses ENABLE ROW LEVEL SECURITY;
ALTER TABLE drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE boosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE awards ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Enable RLS for new tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE spotter_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE likes ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view all profiles" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Companies policies
CREATE POLICY "Anyone can view companies" ON companies FOR SELECT USING (true);
CREATE POLICY "Only admins can modify companies" ON companies FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Buses policies
CREATE POLICY "Anyone can view buses" ON buses FOR SELECT USING (true);
CREATE POLICY "Only admins can modify buses" ON buses FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Drivers policies
CREATE POLICY "Anyone can view drivers" ON drivers FOR SELECT USING (true);
CREATE POLICY "Only admins can modify drivers" ON drivers FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Posts policies
CREATE POLICY "Anyone can view posts" ON posts FOR SELECT USING (true);
CREATE POLICY "Users can create posts" ON posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admins can delete posts" ON posts FOR DELETE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Ratings policies
CREATE POLICY "Anyone can view ratings" ON ratings FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create ratings" ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ratings" ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- Boosts policies
CREATE POLICY "Anyone can view boosts" ON boosts FOR SELECT USING (true);
CREATE POLICY "Verified spotters can create boosts" ON boosts FOR INSERT WITH CHECK (
  auth.uid() = user_id AND 
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND spotter_status = true)
);

-- Awards policies
CREATE POLICY "Anyone can view awards" ON awards FOR SELECT USING (true);
CREATE POLICY "Only admins can manage awards" ON awards FOR ALL USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Votes policies
CREATE POLICY "Users can view votes" ON votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can vote" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Comments policies
CREATE POLICY "Anyone can view comments" ON comments FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create comments" ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comments" ON comments FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comments" ON comments FOR DELETE USING (auth.uid() = user_id);

-- Spotter applications policies
CREATE POLICY "Users can view own applications" ON spotter_applications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can view all applications" ON spotter_applications FOR SELECT USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can create applications" ON spotter_applications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can update applications" ON spotter_applications FOR UPDATE USING (
  EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Likes policies
CREATE POLICY "Anyone can view likes" ON likes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can create likes" ON likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own likes" ON likes FOR DELETE USING (auth.uid() = user_id);

-- Storage policies
CREATE POLICY "Anyone can view media" ON storage.objects FOR SELECT USING (bucket_id = 'media');
CREATE POLICY "Authenticated users can upload media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.role() = 'authenticated'
);

-- Functions to update rating averages
CREATE OR REPLACE FUNCTION update_bus_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buses 
  SET rating_avg = (
    SELECT AVG((punctuality + cleanliness + comfort + COALESCE(behavior, 0)) / 4.0)
    FROM ratings 
    WHERE bus_id = NEW.bus_id
  )
  WHERE id = NEW.bus_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_driver_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_id IS NOT NULL THEN
    UPDATE drivers 
    SET rating_avg = (
      SELECT AVG((punctuality + cleanliness + comfort + COALESCE(behavior, 0)) / 4.0)
      FROM ratings 
      WHERE driver_id = NEW.driver_id
    )
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_bus_rating_trigger
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_bus_rating_avg();

CREATE TRIGGER update_driver_rating_trigger
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_driver_rating_avg();

-- Function to calculate monthly awards with weighted voting
CREATE OR REPLACE FUNCTION calculate_monthly_awards(target_month INTEGER, target_year INTEGER)
RETURNS VOID AS $$
DECLARE
  category_name TEXT;
  winner_record RECORD;
BEGIN
  -- Categories to calculate
  FOR category_name IN SELECT UNNEST(ARRAY['buses', 'drivers', 'companies', 'spotters']) LOOP
    
    -- Calculate weighted votes for this category
    SELECT 
      nominee_id,
      COUNT(*) as total_votes,
      SUM(CASE 
        WHEN u.spotter_status = true THEN 0.5  -- Spotter weight: 50%
        ELSE 0.3  -- Regular user weight: 30%
      END) + 
      -- System metrics weight: 20% (based on ratings/activity)
      COALESCE((
        CASE category_name
          WHEN 'buses' THEN (SELECT rating_avg FROM buses WHERE id = nominee_id::uuid) * 0.2 / 5.0
          WHEN 'drivers' THEN (SELECT rating_avg FROM drivers WHERE id = nominee_id::uuid) * 0.2 / 5.0
          WHEN 'companies' THEN (SELECT rating_avg FROM companies WHERE id = nominee_id::uuid) * 0.2 / 5.0
          ELSE 0.2
        END
      ), 0) as weighted_score
    INTO winner_record
    FROM votes v
    JOIN users u ON v.user_id = u.id
    WHERE v.category = category_name 
      AND v.month = target_month 
      AND v.year = target_year
    GROUP BY nominee_id
    ORDER BY weighted_score DESC
    LIMIT 1;
    
    -- Insert or update award
    IF winner_record.nominee_id IS NOT NULL THEN
      INSERT INTO awards (month, year, category, winner_id, votes_total, votes_weighted)
      VALUES (target_month, target_year, category_name, winner_record.nominee_id, 
              winner_record.total_votes, winner_record.weighted_score)
      ON CONFLICT (month, year, category) 
      DO UPDATE SET 
        winner_id = EXCLUDED.winner_id,
        votes_total = EXCLUDED.votes_total,
        votes_weighted = EXCLUDED.votes_weighted;
    END IF;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get Post of the Week
CREATE OR REPLACE FUNCTION get_post_of_week()
RETURNS UUID AS $$
DECLARE
  winner_id UUID;
BEGIN
  SELECT p.id INTO winner_id
  FROM posts p
  WHERE p.timestamp >= NOW() - INTERVAL '7 days'
  ORDER BY (p.likes_count * 0.4 + p.boosts_count * 0.6) DESC
  LIMIT 1;
  
  RETURN winner_id;
END;
$$ LANGUAGE plpgsql;

-- Function to update post like count
CREATE OR REPLACE FUNCTION update_post_likes()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for automatic like count updates
CREATE TRIGGER update_post_likes_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_likes();

-- Sample data
INSERT INTO companies (name, logo, rating_avg, buses_count, routes_count) VALUES
('Golden Arrow', null, 4.2, 150, 25),
('Intercape', null, 4.5, 200, 35),
('Greyhound', null, 4.1, 180, 30),
('Translux', null, 4.3, 120, 20);

INSERT INTO buses (company_id, fleet_number, route, type, year, rating_avg) VALUES
((SELECT id FROM companies WHERE name = 'Golden Arrow'), 'GA-2024', 'Cape Town - Bellville', 'Mercedes Sprinter', 2020, 4.8),
((SELECT id FROM companies WHERE name = 'Intercape'), 'IC-156', 'Johannesburg - Pretoria', 'Scania Touring', 2019, 4.6),
((SELECT id FROM companies WHERE name = 'Greyhound'), 'GH-089', 'Durban - Pietermaritzburg', 'Volvo 9700', 2021, 4.4),
((SELECT id FROM companies WHERE name = 'Translux'), 'TL-234', 'Cape Town - Johannesburg', 'Mercedes Tourismo', 2018, 4.7);

INSERT INTO drivers (name, company_id, routes, experience_years, rating_avg) VALUES
('John Mthembu', (SELECT id FROM companies WHERE name = 'Golden Arrow'), ARRAY['Cape Town - Bellville', 'Cape Town - Wynberg'], 8, 4.9),
('Sarah Nkomo', (SELECT id FROM companies WHERE name = 'Intercape'), ARRAY['Johannesburg - Pretoria', 'Johannesburg - Sandton'], 12, 4.7),
('David van der Merwe', (SELECT id FROM companies WHERE name = 'Greyhound'), ARRAY['Durban - Pietermaritzburg'], 15, 4.8),
('Nomsa Dlamini', (SELECT id FROM companies WHERE name = 'Translux'), ARRAY['Cape Town - Johannesburg'], 10, 4.6);

-- Add unique constraint for awards
ALTER TABLE awards ADD CONSTRAINT unique_monthly_award UNIQUE (month, year, category);media" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'media' AND auth.role() = 'authenticated'
);

-- Functions to update rating averages
CREATE OR REPLACE FUNCTION update_bus_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buses 
  SET rating_avg = (
    SELECT AVG((punctuality + cleanliness + comfort + COALESCE(behavior, 0)) / 4.0)
    FROM ratings 
    WHERE bus_id = NEW.bus_id
  )
  WHERE id = NEW.bus_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_driver_rating_avg()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.driver_id IS NOT NULL THEN
    UPDATE drivers 
    SET rating_avg = (
      SELECT AVG((punctuality + cleanliness + comfort + COALESCE(behavior, 0)) / 4.0)
      FROM ratings 
      WHERE driver_id = NEW.driver_id
    )
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql; (
      SELECT AVG((punctuality + cleanliness + comfort + COALESCE(behavior, 0)) / 4.0)
      FROM ratings 
      WHERE driver_id = NEW.driver_id
    )
    WHERE id = NEW.driver_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_bus_rating_trigger
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_bus_rating_avg();

CREATE TRIGGER update_driver_rating_trigger
  AFTER INSERT OR UPDATE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_driver_rating_avg();

-- Function to calculate monthly awards with weighted voting
CREATE OR REPLACE FUNCTION calculate_monthly_awards(target_month INTEGER, target_year INTEGER)
RETURNS VOID AS $$
DECLARE
  category_name TEXT;
  winner_record RECORD;
BEGIN
  -- Categories to calculate
  FOR category_name IN SELECT UNNEST(ARRAY['buses', 'drivers', 'companies', 'spotters']) LOOP
    
    -- Calculate weighted votes for this category
    SELECT 
      nominee_id,
      COUNT(*) as total_votes,
      SUM(CASE 
        WHEN u.spotter_status = true THEN 0.5  -- Spotter weight: 50%
        ELSE 0.3  -- Regular user weight: 30%
      END) + 
      -- System metrics weight: 20% (based on ratings/activity)
      COALESCE((
        CASE category_name
          WHEN 'buses' THEN (SELECT rating_avg FROM buses WHERE id = nominee_id::uuid) * 0.2 / 5.0
          WHEN 'drivers' THEN (SELECT rating_avg FROM drivers WHERE id = nominee_id::uuid) * 0.2 / 5.0
          WHEN 'companies' THEN (SELECT rating_avg FROM companies WHERE id = nominee_id::uuid) * 0.2 / 5.0
          ELSE 0.2
        END
      ), 0) as weighted_score
    INTO winner_record
    FROM votes v
    JOIN users u ON v.user_id = u.id
    WHERE v.category = category_name 
      AND v.month = target_month 
      AND v.year = target_year
    GROUP BY nominee_id
    ORDER BY weighted_score DESC
    LIMIT 1;
    
    -- Insert or update award
    IF winner_record.nominee_id IS NOT NULL THEN
      INSERT INTO awards (month, year, category, winner_id, votes_total, votes_weighted)
      VALUES (target_month, target_year, category_name, winner_record.nominee_id, 
              winner_record.total_votes, winner_record.weighted_score)
      ON CONFLICT (month, year, category) 
      DO UPDATE SET 
        winner_id = EXCLUDED.winner_id,
        votes_total = EXCLUDED.votes_total,
        votes_weighted = EXCLUDED.votes_weighted;
    END IF;
    
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to get Post of the Week
CREATE OR REPLACE FUNCTION get_post_of_week()
RETURNS UUID AS $$
DECLARE
  winner_id UUID;
BEGIN
  SELECT p.id INTO winner_id
  FROM posts p
  WHERE p.timestamp >= NOW() - INTERVAL '7 days'
  ORDER BY (p.likes_count * 0.4 + p.boosts_count * 0.6) DESC
  LIMIT 1;
  
  RETURN winner_id;
END;
$$ LANGUAGE plpgsql;

-- Sample data
INSERT INTO companies (name, logo, rating_avg, buses_count, routes_count) VALUES
('Golden Arrow', null, 4.2, 150, 25),
('Intercape', null, 4.5, 200, 35),
('Greyhound', null, 4.1, 180, 30),
('Translux', null, 4.3, 120, 20);

INSERT INTO buses (company_id, fleet_number, route, type, year, rating_avg) VALUES
((SELECT id FROM companies WHERE name = 'Golden Arrow'), 'GA-2024', 'Cape Town - Bellville', 'Mercedes Sprinter', 2020, 4.8),
((SELECT id FROM companies WHERE name = 'Intercape'), 'IC-156', 'Johannesburg - Pretoria', 'Scania Touring', 2019, 4.6),
((SELECT id FROM companies WHERE name = 'Greyhound'), 'GH-089', 'Durban - Pietermaritzburg', 'Volvo 9700', 2021, 4.4),
((SELECT id FROM companies WHERE name = 'Translux'), 'TL-234', 'Cape Town - Johannesburg', 'Mercedes Tourismo', 2018, 4.7);

INSERT INTO drivers (name, company_id, routes, experience_years, rating_avg) VALUES
('John Mthembu', (SELECT id FROM companies WHERE name = 'Golden Arrow'), ARRAY['Cape Town - Bellville', 'Cape Town - Wynberg'], 8, 4.9),
('Sarah Nkomo', (SELECT id FROM companies WHERE name = 'Intercape'), ARRAY['Johannesburg - Pretoria', 'Johannesburg - Sandton'], 12, 4.7),
('David van der Merwe', (SELECT id FROM companies WHERE name = 'Greyhound'), ARRAY['Durban - Pietermaritzburg'], 15, 4.8),
('Nomsa Dlamini', (SELECT id FROM companies WHERE name = 'Translux'), ARRAY['Cape Town - Johannesburg'], 10, 4.6);

-- Add unique constraint for awards
ALTER TABLE awards ADD CONSTRAINT unique_monthly_award UNIQUE (month, year, category);