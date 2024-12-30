import { supabase } from '../lib/supabase';
import type { Event } from '../types/event';

export class EventService {
  /**
   * Verify that a user owns an event and it exists
   */
  static async verifyEventOwnership(eventId: string, userId: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('user_id')
        .eq('id', eventId)
        .maybeSingle();

      if (error) throw error;
      if (!data) throw new Error('Event not found');
      
      return data.user_id === userId;
    } catch (error) {
      console.error('Error verifying event ownership:', error);
      throw new Error('Failed to verify event ownership');
    }
  }

  /**
   * Delete an event and all associated data
   */
  static async deleteEvent(eventId: string): Promise<void> {
    try {
      // First verify the event exists
      const { data: event, error: checkError } = await supabase
        .from('events')
        .select('id')
        .eq('id', eventId)
        .maybeSingle();

      if (checkError) throw checkError;
      if (!event) throw new Error('Event not found');

      // Delete event (cascade will handle related records)
      const { error: deleteError } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);

      if (deleteError) {
        console.error('Delete error:', deleteError);
        throw new Error('Failed to delete event');
      }
    } catch (error) {
      console.error('Error deleting event:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to delete event and associated data');
    }
  }
}