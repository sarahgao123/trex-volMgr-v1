import { useState, useCallback } from 'react';
import { useDebounce } from './useDebounce';
import { geocodingClient } from '../services/geocoding/client';
import { validateCoordinates } from '../utils/geocodingUtils';
import type { GeocodeResult } from '../types/geocoding';

interface LocationState {
  address: string;
  coordinates: { lat: number; lng: number } | null;
  isLoading: boolean;
  error: string | null;
}

export function useLocationPicker(
  onLocationSelect: (location: GeocodeResult) => void,
  initialAddress?: string,
  initialLat?: number,
  initialLng?: number
) {
  const [state, setState] = useState<LocationState>({
    address: initialAddress || '',
    coordinates: initialLat && initialLng ? { lat: initialLat, lng: initialLng } : null,
    isLoading: false,
    error: null
  });

  const debouncedAddress = useDebounce(state.address, 500);

  const handleAddressChange = useCallback(async (address: string) => {
    setState(prev => ({ ...prev, address, error: null }));

    // Handle direct coordinate input
    const coordMatch = address.match(/^(-?\d+\.?\d*),\s*(-?\d+\.?\d*)$/);
    if (coordMatch) {
      const lat = parseFloat(coordMatch[1]);
      const lng = parseFloat(coordMatch[2]);
      if (validateCoordinates(lat, lng)) {
        const location = {
          lat,
          lng,
          address: `${lat}, ${lng}`
        };
        setState(prev => ({
          ...prev,
          coordinates: { lat, lng },
          isLoading: false
        }));
        onLocationSelect(location);
        return;
      }
    }

    if (!address.trim()) {
      setState(prev => ({ ...prev, coordinates: null }));
      return;
    }

    if (address === debouncedAddress) {
      setState(prev => ({ ...prev, isLoading: true }));
      
      try {
        const result = await geocodingClient.geocodeAddress(address);
        
        if (result) {
          setState(prev => ({ 
            ...prev, 
            coordinates: { lat: result.lat, lng: result.lng },
            address: result.address,
            isLoading: false
          }));
          onLocationSelect(result);
        } else {
          setState(prev => ({ 
            ...prev,
            coordinates: null,
            isLoading: false,
            error: 'Location not found. Please try a different address.'
          }));
        }
      } catch (error) {
        setState(prev => ({
          ...prev,
          coordinates: null,
          isLoading: false,
          error: 'Unable to find location. Please try again.'
        }));
      }
    }
  }, [debouncedAddress, onLocationSelect]);

  const handleCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({ 
        ...prev,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        });
      });

      const { latitude: lat, longitude: lng } = position.coords;
      const address = await geocodingClient.reverseGeocode(lat, lng);
      
      const location = {
        lat,
        lng,
        address: address || `${lat}, ${lng}`
      };

      setState(prev => ({
        ...prev,
        address: location.address,
        coordinates: { lat, lng },
        isLoading: false
      }));
      onLocationSelect(location);
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof GeolocationPositionError 
          ? 'Unable to get your location. Please check your device settings.'
          : 'Failed to get location. Please try again or enter address manually.'
      }));
    }
  }, [onLocationSelect]);

  return {
    ...state,
    handleAddressChange,
    handleCurrentLocation
  };
}