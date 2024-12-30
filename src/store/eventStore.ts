import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { EventService } from '../services/eventService';
import type { Event } from '../types/event';

interface EventState {
  events: Event[];
  loading: boolean;
  error: string | null;
  fetchEvents: () => Promise<void>;
  createEvent: (event: Omit<Event, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  updateEvent: (id: string, event: Partial<Event>) => Promise<void>;
  deleteEvent: (id: string) => Promise<void>;
}

export const useEventStore = create<EventState>((set, get) => ({
  events: [],
  loading: false,
  error: null,

  fetchEvents: async () => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('event_time', { ascending: true });
      
      if (error) throw error;
      set({ events: data });
    } catch (error) {
      console.error('Error fetching events:', error);
      set({ error: error instanceof Error ? error.message : 'Failed to fetch events' });
    } finally {
      set({ loading: false });
    }
  },

  deleteEvent: async (id: string) => {
    set({ loading: true, error: null });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Verify ownership before deletion
      const isOwner = await EventService.verifyEventOwnership(id, user.id);
      if (!isOwner) throw new Error('You do not have permission to delete this event');

      // Delete event and associated data
      await EventService.deleteEvent(id);

      // Update local state after successful deletion
      set(state => ({
        events: state.events.filter(e => e.id !== id),
        error: null
      }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete event';
      set({ error: message });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  // ... rest of the store implementation remains the same
}));