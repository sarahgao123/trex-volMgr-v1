export const GEOCODING_CONFIG = {
  baseUrl: 'https://nominatim.openstreetmap.org',
  headers: {
    'Accept': 'application/json',
    'Accept-Language': 'en',
    'User-Agent': 'VolunteerEventManager/1.0'
  },
  rateLimit: {
    minInterval: 1100, // Nominatim requires 1 request per second
    maxRetries: 3,
    retryDelay: 2000,
    maxConcurrent: 1
  },
  timeout: 10000,
  cache: {
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    maxSize: 100
  }
};