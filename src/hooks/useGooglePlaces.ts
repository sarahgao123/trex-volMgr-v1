import { useEffect, useRef, useState } from 'react';
import { scriptLoader } from '../utils/scriptLoader';
import { SCRIPT_CONFIG } from '../config/scripts';

interface GooglePlacesHookResult {
  autocompleteInput: React.RefObject<HTMLInputElement>;
  isLoaded: boolean;
  error: string | null;
}

export function useGooglePlaces(
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
): GooglePlacesHookResult {
  const autocompleteInput = useRef<HTMLInputElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const autocompleteInstance = useRef<google.maps.places.Autocomplete | null>(null);

  useEffect(() => {
    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      setError('Google Maps API key is missing');
      return;
    }

    async function initializeGoogleMaps() {
      try {
        await scriptLoader.loadScript(
          SCRIPT_CONFIG.googleMaps.id,
          SCRIPT_CONFIG.googleMaps.getUrl(apiKey)
        );
        setIsLoaded(true);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
        setIsLoaded(false);
      }
    }

    if (!scriptLoader.isLoaded(SCRIPT_CONFIG.googleMaps.id)) {
      initializeGoogleMaps();
    } else {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!isLoaded || !autocompleteInput.current || autocompleteInstance.current) return;

    autocompleteInstance.current = new window.google.maps.places.Autocomplete(
      autocompleteInput.current,
      { types: ['address'] }
    );

    autocompleteInstance.current.addListener('place_changed', () => {
      const place = autocompleteInstance.current?.getPlace();
      if (place?.geometry?.location) {
        onPlaceSelect(place);
      }
    });

    // Prevent form submission on enter
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
      }
    };

    autocompleteInput.current.addEventListener('keydown', handleKeyDown);

    return () => {
      if (autocompleteInput.current) {
        autocompleteInput.current.removeEventListener('keydown', handleKeyDown);
      }
      if (autocompleteInstance.current) {
        google.maps.event.clearInstanceListeners(autocompleteInstance.current);
        autocompleteInstance.current = null;
      }
    };
  }, [isLoaded, onPlaceSelect]);

  return { autocompleteInput, isLoaded, error };
}