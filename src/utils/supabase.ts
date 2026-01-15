import { createClient } from '@supabase/supabase-js';
import { User } from '../types';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error('Missing REACT_APP_SUPABASE_URL environment variable');
}

if (!supabaseKey) {
  throw new Error('Missing REACT_APP_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  },
  global: {
    headers: {
      'x-client-info': 'bus-talk-app'
    }
  }
});

export const signUp = async (email: string, password: string, username: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username }
    }
  });
  
  // Don't manually insert - the trigger will handle it
  return { data, error };
};

export const signIn = async (email: string, password: string) => {
  try {
    const { data, error } = await Promise.race([
      supabase.auth.signInWithPassword({ email, password }),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 10000)
      )
    ]) as any;
    
    if (error) {
      console.error('Sign in error:', error);
    }
    
    return { data, error };
  } catch (error) {
    console.error('Sign in timeout or network error:', error);
    return { 
      data: null, 
      error: { message: 'Connection timeout. Please check your internet connection.' }
    };
  }
};

export const signOut = async () => {
  return await supabase.auth.signOut();
};

export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const { data: { user }, error } = await Promise.race([
      supabase.auth.getUser(),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]) as any;
    
    if (error || !user) {
      console.error('Auth error:', error);
      return null;
    }
    
    const { data, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();
      
    if (userError) {
      console.error('User fetch error:', userError);
      return null;
    }
      
    return data;
  } catch (error) {
    console.error('getCurrentUser timeout or network error:', error);
    return null;
  }
};