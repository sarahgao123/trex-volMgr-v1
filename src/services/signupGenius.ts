import { supabase } from '../lib/supabase';
import type { Event } from '../types/event';
import type { SignUpGeniusEvent } from '../types/signupGenius';

const SIGNUP_GENIUS_API = {
  baseUrl: 'https://api.signupgenius.com/v2',
  clientId: import.meta.env.VITE_SIGNUP_GENIUS_CLIENT_ID,
  clientSecret: import.meta.env.VITE_SIGNUP_GENIUS_CLIENT_SECRET
};

async function getAccessToken(): Promise<string> {
  const response = await fetch(`${SIGNUP_GENIUS_API.baseUrl}/auth/oauth2/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: SIGNUP_GENIUS_API.clientId ?? '',
      client_secret: SIGNUP_GENIUS_API.clientSecret ?? '',
    }),
  });

  if (!response.ok) {
    throw new Error('Failed to get access token');
  }

  const data = await response.json();
  return data.access_token;
}

async function fetchSignUpGeniusEvent(eventId: string): Promise<SignUpGeniusEvent> {
  const token = await getAccessToken();
  
  const response = await fetch(`${SIGNUP_GENIUS_API.baseUrl}/signups/${eventId}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch event data');
  }

  const data = await response.json();
  return transformApiResponse(data);
}

function transformApiResponse(apiData: any): SignUpGeniusEvent {
  return {
    title: apiData.title,
    description: apiData.description || '',
    location: apiData.location || '',
    startDate: apiData.startDateTime,
    endDate: apiData.endDateTime,
    slots: apiData.slots.map((slot: any) => ({
      title: slot.title,
      startDate: slot.startDateTime,
      endDate: slot.endDateTime,
      volunteers: slot.signups.map((signup: any) => ({
        email: signup.email,
        firstName: signup.firstName,
        lastName: signup.lastName
      }))
    }))
  };
}

export async function importSignUpGeniusEvent(signupUrl: string): Promise<Event> {
  try {
    const eventId = extractEventId(signupUrl);
    if (!eventId) {
      throw new Error('Invalid SignUpGenius URL');
    }

    const eventData = await fetchSignUpGeniusEvent(eventId);

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error('Authentication required');

    const { data: event, error: eventError } = await supabase
      .from('events')
      .insert([{
        user_id: user.id,
        name: eventData.title,
        description: eventData.description,
        location: eventData.location,
        event_time: eventData.startDate
      }])
      .select()
      .single();

    if (eventError) throw eventError;

    await Promise.all(eventData.slots.map(async (slot) => {
      const { data: position, error: positionError } = await supabase
        .from('positions')
        .insert([{
          event_id: event.id,
          name: slot.title,
          start_time: slot.startDate,
          end_time: slot.endDate,
          volunteers_needed: slot.volunteers.length
        }])
        .select()
        .single();

      if (positionError) throw positionError;

      const { error: slotError } = await supabase
        .from('position_slots')
        .insert([{
          position_id: position.id,
          start_time: slot.startDate,
          end_time: slot.endDate,
          capacity: slot.volunteers.length,
          volunteers: slot.volunteers.map(v => ({
            email: v.email,
            name: `${v.firstName} ${v.lastName}`.trim()
          }))
        }]);

      if (slotError) throw slotError;
    }));

    return event;
  } catch (error) {
    console.error('Import error:', error);
    throw error;
  }
}

function extractEventId(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const match = urlObj.pathname.match(/\/go\/([A-Za-z0-9]+)/);
    return match ? match[1] : null;
  } catch {
    return null;
  }
}