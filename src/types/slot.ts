import { User } from '@supabase/supabase-js';

export interface Slot {
  id: string;
  position_id: string;
  start_time: string | null;
  end_time: string | null;
  capacity: number;
  created_at: string;
  checked_in_count: number;
}

export interface SlotWithVolunteers extends Slot {
  volunteer_list: Array<{
    user: Pick<User, 'id' | 'email'> & { created_at: string };
    checked_in: boolean;
    check_in_time?: string;
    name?: string;
  }>;
}