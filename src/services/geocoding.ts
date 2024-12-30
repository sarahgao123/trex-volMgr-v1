import { RateLimiter } from '../utils/rateLimiter';
import { GEOCODING_CONFIG } from '../config/geocoding';
import type { GeocodeResult } from '../types/geocoding';

const rateLimiter = new RateLimiter(GEOCODING_CONFIG.rateLimit.minInterval);

async function makeRequest(url: string, retries = 0): Promise<any> {
  try {
    await rateLimiter.acquire();
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), GEOCODING_CONFIG.timeout);

    const response = await fetch(url, { 
      headers: {
        ...GEOCODING_CONFIG.headers,
        'Accept': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!data) {
      throw new Error('No data received');
    }
    
    return data;
  } catch (error) {
    if (retries < GEOCODING_CONFIG.rateLimit.maxRetries) {
      await new Promise(resolve => 
        setTimeout(resolve, GEOCODING_CONFIG.rateLimit.retryDelay * (retries + 1))
      );
      return makeRequest(url, retries + 1);
    }
    throw error;
  }
}

export async function geocodeAddress(address: string): Promise<GeocodeResult | null> {
  if (!address.trim()) return null;

  try {
    const data = await makeRequest(
      `${GEOCODING_CONFIG.baseUrl}/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    
    if (!Array.isArray(data) || data.length === 0) {
      return null;
    }

    const { lat, lon: lng, display_name: displayName } = data[0];
    const parsedLat = parseFloat(lat);
    const parsedLng = parseFloat(lng);

    if (isNaN(parsedLat) || isNaN(parsedLng)) {
      return null;
    }

    return {
      lat: parsedLat,
      lng: parsedLng,
      address: displayName
    };
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

export async function reverseGeocode(lat: number, lng: number): Promise<string | null> {
  try {
    const data = await makeRequest(
      `${GEOCODING_CONFIG.baseUrl}/reverse?format=json&lat=${lat}&lon=${lng}`
    );

    return data?.display_name || null;
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return null;
  }
}