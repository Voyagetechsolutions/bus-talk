export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'verified_spotter' | 'user';
  spotter_status: boolean;
  badges: string[];
  profile_pic?: string;
  created_at: string;
}

export interface Company {
  id: string;
  name: string;
  logo?: string;
  rating_avg: number;
  buses_count: number;
  routes_count: number;
}

export interface Bus {
  id: string;
  company_id: string;
  fleet_number: string;
  route: string;
  type: string;
  year?: number;
  rating_avg: number;
  last_seen?: string;
  company?: Partial<Company>;
}

export interface Driver {
  id: string;
  name: string;
  company_id: string;
  routes: string[];
  experience_years: number;
  rating_avg: number;
  company?: Company;
}

export interface Post {
  id: string;
  user_id: string;
  type: 'news' | 'sighting';
  title: string;
  content: string;
  media_urls: string[];
  boosts_count: number;
  likes_count: number;
  timestamp: string;
  user?: User;
}

export interface Rating {
  id: string;
  user_id: string;
  bus_id: string;
  driver_id?: string;
  trip_date: string;
  punctuality: number;
  cleanliness: number;
  comfort: number;
  behavior?: number;
  comment?: string;
}

export interface Boost {
  id: string;
  post_id: string;
  user_id: string;
  timestamp: string;
}

export interface Award {
  id: string;
  month: number;
  year: number;
  category: string;
  winner_id: string;
  votes_total: number;
  votes_weighted: number;
}

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user?: User;
}

export interface SpotterApplication {
  id: string;
  user_id: string;
  reason: string;
  experience?: string;
  status: 'pending' | 'approved' | 'rejected';
  reviewed_by?: string;
  reviewed_at?: string;
  created_at: string;
  user?: User;
}