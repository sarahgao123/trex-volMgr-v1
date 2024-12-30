export const SCRIPT_CONFIG = {
  timeout: 10000, // 10 seconds
  googleMaps: {
    id: 'google-maps',
    getUrl: (apiKey: string) => 
      `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
  }
};