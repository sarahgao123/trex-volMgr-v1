import { create } from 'zustand';
import { supabase } from '../lib/supabase';

interface VolunteerState {
  loading: boolean;
  error: string | null;
  checkIn: (slotId: string, email: string, name: string) => Promise<void>;
}

export const useVolunteerStore = create<VolunteerState>((set) => ({
  loading: false,
  error: null,

  checkIn: async (slotId: string, email: string, name: string) => {
    set({ loading: true, error: null });
    try {
      // First verify the slot exists and is active
      const { data: slotData, error: slotError } = await supabase
        .from('slot_details')
        .select('*')
        .eq('id', slotId)
        .single();

      if (slotError) throw new Error('Invalid slot');

      // Get existing volunteer
      const { data: existingVolunteer } = await supabase
        .from('volunteers')
        .select('id')
        .eq('email', email.toLowerCase())
        .maybeSingle();

      let volunteerId: string;

      if (existingVolunteer) {
        // Update existing volunteer if name is provided
        if (name) {
          await supabase
            .from('volunteers')
            .update({ name })
            .eq('id', existingVolunteer.id);
        }
        volunteerId = existingVolunteer.id;
      } else {
        // Create new volunteer
        const { data: newVolunteer, error: createError } = await supabase
          .from('volunteers')
          .insert([{
            email: email.toLowerCase(),
            name: name || null
          }])
          .select('id')
          .single();

        if (createError) throw createError;
        volunteerId = newVolunteer.id;
      }

      // Verify slot assignment
      const { data: slotVolunteer, error: verifyError } = await supabase
        .from('slot_volunteers')
        .select('checked_in')
        .eq('slot_id', slotId)
        .eq('volunteer_id', volunteerId)
        .single();

      if (verifyError || !slotVolunteer) {
        throw new Error('No registration found for this email address');
      }

      if (slotVolunteer.checked_in) {
        throw new Error('You have already checked in for this slot');
      }

      // Update check-in status
      const { error: updateError } = await supabase
        .from('slot_volunteers')
        .update({ 
          checked_in: true,
          check_in_time: new Date().toISOString()
        })
        .eq('slot_id', slotId)
        .eq('volunteer_id', volunteerId);

      if (updateError) throw updateError;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'An error occurred';
      set({ error: message });
      throw new Error(message);
    } finally {
      set({ loading: false });
    }
  },
}));