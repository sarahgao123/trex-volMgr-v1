import { GEOCODING_CONFIG } from '../../config/geocoding';
import { GeocodingCache } from './cache';
import { RequestQueue } from './queue';
import { validateCoordinates } from '../../utils/geocodingUtils';
import type { GeocodeResult } from '../../types/geocoding';

class GeocodingClient {
  private cache: GeocodingCache;
  private queue: RequestQueue;
  private lastRequestTime: number = 0;

  constructor() {
    this.cache = new GeocodingCache(
      GEOCODING_CONFIG.cache.maxAge,
      GEOCODING_CONFIG.cache.maxSize
    );
    this.queue = new RequestQueue(GEOCODING_CONFIG.rateLimit.maxConcurrent);
  }

  private async throttleRequest(): Promise<void> {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    if (timeSinceLastRequest < GEOCODING_CONFIG.rateLimit.minInterval) {
      await new Promise(resolve => 
        setTimeout(resolve, GEOCODING_CONFIG.rateLimit.minInterval - timeSinceLastRequest)
      );
    }
    this.lastRequestTime = Date.now();
  }

  private async makeRequest(url: string, retries = 0): Promise<any> {
    const cacheKey = url;
    const cachedResult = this.cache.get(cacheKey);
    if (cachedResult) return cachedResult;

    await this.throttleRequest();

    try {
      const result = await this.queue.enqueue(async () => {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), GEOCODING_CONFIG.timeout);

        try {
          const response = await fetch(url, {
            headers: GEOCODING_CONFIG.headers,
            signal: controller.signal
          });

          clearTimeout(timeoutId);

          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }

          const data = await response.json();
          if (!data) throw new Error('No data received');
          
          return data;
        } finally {
          clearTimeout(timeoutId);
        }
      });

      this.cache.set(cacheKey, result);
      return result;
    } catch (error) {
      if (retries < GEOCODING_CONFIG.rateLimit.maxRetries) {
        await new Promise(resolve => 
          setTimeout(resolve, GEOCODING_CONFIG.rateLimit.retryDelay * Math.pow(2, retries))
        );
        return this.makeRequest(url, retries + 1);
      }
      throw error;
    }
  }

  async geocodeAddress(address: string): Promise<GeocodeResult | null> {
    if (!address.trim()) return null;

    // Check if input looks like coordinates
    const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (validateCoordinates(lat, lng)) {
        const displayName = await this.reverseGeocode(lat, lng);
        return {
          lat,
          lng,
          address: displayName || `${lat}, ${lng}`
        };
      }
    }

    try {
      const data = await this.makeRequest(
        `${GEOCODING_CONFIG.baseUrl}/search?` + new URLSearchParams({
          format: 'json',
          q: address,
          limit: '1',
          addressdetails: '1'
        })
      );

      if (!Array.isArray(data) || data.length === 0) {
        return null;
      }

      const { lat, lon: lng, display_name: displayName } = data[0];
      const parsedLat = parseFloat(lat);
      const parsedLng = parseFloat(lng);

      if (!validateCoordinates(parsedLat, parsedLng)) {
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

  async reverseGeocode(lat: number, lng: number): Promise<string | null> {
    if (!validateCoordinates(lat, lng)) {
      return null;
    }

    try {
      const data = await this.makeRequest(
        `${GEOCODING_CONFIG.baseUrl}/reverse?` + new URLSearchParams({
          format: 'json',
          lat: lat.toString(),
          lon: lng.toString()
        })
      );

      return data?.display_name || null;
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      return null;
    }
  }
}

export const geocodingClient = new GeocodingClient();