import { useEffect, useRef } from 'react';
import { supabase } from '../utils/supabase';
import { useAppStore } from './useStore';
import { Post, Bus } from '../types';

export const useRealtime = () => {
  const { setPosts, addPost } = useAppStore();

  useEffect(() => {
    const postsSubscription = supabase
      .channel('posts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'posts' },
        (payload: any) => {
          addPost(payload.new as Post);
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'posts' },
        (payload: any) => {
          // Use functional update to access latest posts without dependency
          setPosts((prevPosts) =>
            prevPosts.map(post =>
              post.id === payload.new.id ? { ...post, ...payload.new } : post
            )
          );
        }
      )
      .subscribe();

    const boostsSubscription = supabase
      .channel('boosts')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'boosts' },
        (payload: any) => {
          // Use functional update to access latest posts without dependency
          setPosts((prevPosts) =>
            prevPosts.map(post =>
              post.id === payload.new.post_id
                ? { ...post, boosts_count: post.boosts_count + 1 }
                : post
            )
          );
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(boostsSubscription);
    };
  }, [setPosts, addPost]); // Removed 'posts' from dependencies
};

export const useRealtimeRatings = () => {
  const { setBuses } = useAppStore();
  // Use ref to access latest buses without causing re-renders
  const busesRef = useRef<Bus[]>([]);

  // Keep ref in sync with store
  const buses = useAppStore(state => state.buses);
  useEffect(() => {
    busesRef.current = buses;
  }, [buses]);

  useEffect(() => {
    const ratingsSubscription = supabase
      .channel('ratings')
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ratings' },
        async (payload: any) => {
          const rating = payload.new;

          if (rating.bus_id) {
            const { data } = await supabase
              .from('ratings')
              .select('punctuality, cleanliness, comfort, behavior')
              .eq('bus_id', rating.bus_id);

            if (data && data.length > 0) {
              const avgRating = data.reduce((sum: number, r: any) =>
                sum + (r.punctuality + r.cleanliness + r.comfort + (r.behavior || 0)) / 4, 0
              ) / data.length;

              // Use ref to get latest buses without dependency
              const updatedBuses = busesRef.current.map(bus =>
                bus.id === rating.bus_id ? { ...bus, rating_avg: avgRating } : bus
              );
              setBuses(updatedBuses);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(ratingsSubscription);
    };
  }, [setBuses]); // Removed 'buses' from dependencies
};