import { create } from 'zustand';
import { User, Post, Bus, Driver, Company } from '../types';
import { supabase, getCurrentUser } from '../utils/supabase';

interface AppState {
  user: User | null;
  posts: Post[];
  buses: Bus[];
  drivers: Driver[];
  companies: Company[];
  loading: boolean;
  
  // Actions
  setUser: (user: User | null) => void;
  initializeAuth: () => Promise<void>;
  setPosts: (posts: Post[] | ((prev: Post[]) => Post[])) => void;
  addPost: (post: Post) => void;
  boostPost: (postId: string) => void;
  setBuses: (buses: Bus[]) => void;
  setDrivers: (drivers: Driver[]) => void;
  setCompanies: (companies: Company[]) => void;
  setLoading: (loading: boolean) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  user: null,
  posts: [],
  buses: [],
  drivers: [],
  companies: [],
  loading: false,

  setUser: (user) => set({ user }),
  
  initializeAuth: async () => {
    try {
      const user = await getCurrentUser();
      set({ user });
      
      // Listen for auth changes (only set up once)
      supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          const userData = await getCurrentUser();
          set({ user: userData });
        } else if (event === 'SIGNED_OUT') {
          set({ user: null });
        }
      });
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ user: null });
    }
  },
  
  setPosts: (posts) => {
    if (typeof posts === 'function') {
      set((state) => ({ posts: posts(state.posts) }));
    } else {
      set({ posts });
    }
  },
  
  addPost: (post) => set((state) => ({ 
    posts: [post, ...state.posts] 
  })),
  
  boostPost: (postId) => set((state) => ({
    posts: state.posts.map(post => 
      post.id === postId 
        ? { ...post, boosts_count: post.boosts_count + 1 }
        : post
    )
  })),
  
  setBuses: (buses) => set({ buses }),
  setDrivers: (drivers) => set({ drivers }),
  setCompanies: (companies) => set({ companies }),
  setLoading: (loading) => set({ loading })
}));