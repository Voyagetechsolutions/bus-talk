-- Bus Talk Database Updates
-- Run this after the initial schema to add missing functions and fixes

-- Function to automatically create user profile when auth user is created
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, username, email, role, spotter_status, badges)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user',
    false,
    '{}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile on auth signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add missing functions for automatic calculations
CREATE OR REPLACE FUNCTION update_bus_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE buses SET rating_avg = (
    SELECT ROUND(AVG((punctuality + cleanliness + comfort + behavior) / 4.0), 2)
    FROM ratings WHERE bus_id = COALESCE(NEW.bus_id, OLD.bus_id)
  ) WHERE id = COALESCE(NEW.bus_id, OLD.bus_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_driver_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE drivers SET rating_avg = (
    SELECT ROUND(AVG(behavior), 2)
    FROM ratings WHERE driver_id = COALESCE(NEW.driver_id, OLD.driver_id)
  ) WHERE id = COALESCE(NEW.driver_id, OLD.driver_id);
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_TABLE_NAME = 'boosts' THEN
    UPDATE posts SET boosts_count = (
      SELECT COUNT(*) FROM boosts WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    ) WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  ELSIF TG_TABLE_NAME = 'likes' THEN
    UPDATE posts SET likes_count = (
      SELECT COUNT(*) FROM likes WHERE post_id = COALESCE(NEW.post_id, OLD.post_id)
    ) WHERE id = COALESCE(NEW.post_id, OLD.post_id);
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create triggers (will replace if they exist)
DROP TRIGGER IF EXISTS update_bus_rating_trigger ON ratings;
CREATE TRIGGER update_bus_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_bus_rating();

DROP TRIGGER IF EXISTS update_driver_rating_trigger ON ratings;
CREATE TRIGGER update_driver_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW EXECUTE FUNCTION update_driver_rating();

DROP TRIGGER IF EXISTS update_boosts_count_trigger ON boosts;
CREATE TRIGGER update_boosts_count_trigger
  AFTER INSERT OR DELETE ON boosts
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

DROP TRIGGER IF EXISTS update_likes_count_trigger ON likes;
CREATE TRIGGER update_likes_count_trigger
  AFTER INSERT OR DELETE ON likes
  FOR EACH ROW EXECUTE FUNCTION update_post_counts();

-- Add some buses for testing (only if they don't exist)
INSERT INTO buses (company_id, fleet_number, route, type, year) 
SELECT 
  c.id,
  'GA001',
  'Route 1 - Cape Town CBD',
  'Standard Bus',
  2020
FROM companies c 
WHERE c.name = 'Golden Arrow Bus Services'
AND NOT EXISTS (SELECT 1 FROM buses WHERE fleet_number = 'GA001');

INSERT INTO buses (company_id, fleet_number, route, type, year) 
SELECT 
  c.id,
  'MC101',
  'A01 - Airport Shuttle',
  'BRT Bus',
  2021
FROM companies c 
WHERE c.name = 'MyCiTi'
AND NOT EXISTS (SELECT 1 FROM buses WHERE fleet_number = 'MC101');

INSERT INTO buses (company_id, fleet_number, route, type, year) 
SELECT 
  c.id,
  'IC500',
  'Cape Town - Johannesburg',
  'Luxury Coach',
  2019
FROM companies c 
WHERE c.name = 'Intercape'
AND NOT EXISTS (SELECT 1 FROM buses WHERE fleet_number = 'IC500');

-- Update company bus counts
UPDATE companies SET buses_count = (
  SELECT COUNT(*) FROM buses WHERE company_id = companies.id
);

-- Complete the push_subscriptions policy that was cut off
DROP POLICY IF EXISTS "Users can manage own subscriptions" ON push_subscriptions;
CREATE POLICY "Users can manage own subscriptions" ON push_subscriptions 
FOR ALL USING (auth.uid() = user_id);