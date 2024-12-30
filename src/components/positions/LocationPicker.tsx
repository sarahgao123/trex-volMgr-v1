import React, { useState } from 'react';
import { MapPin, Loader2, Navigation } from 'lucide-react';
import { useLocationPicker } from '../../hooks/useLocationPicker';
import { validateCoordinates } from '../../utils/geocodingUtils';
import { HelpText } from '../common/HelpText';

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
}

export function LocationPicker({ onLocationSelect, initialAddress, initialLat, initialLng }: LocationPickerProps) {
  const [showCoordinates, setShowCoordinates] = useState(false);
  const [manualCoordinates, setManualCoordinates] = useState({
    lat: initialLat?.toString() || '',
    lng: initialLng?.toString() || ''
  });

  const {
    address,
    coordinates,
    isLoading,
    error,
    handleAddressChange,
    handleCurrentLocation
  } = useLocationPicker(onLocationSelect, initialAddress, initialLat, initialLng);

  const handleManualCoordinateSubmit = () => {
    const lat = parseFloat(manualCoordinates.lat);
    const lng = parseFloat(manualCoordinates.lng);

    if (!validateCoordinates(lat, lng)) {
      return;
    }

    onLocationSelect({
      lat,
      lng,
      address: `${lat}, ${lng}`
    });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <button
          type="button"
          onClick={() => setShowCoordinates(!showCoordinates)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {showCoordinates ? 'Enter Address' : 'Enter Coordinates'}
        </button>
      </div>

      {showCoordinates ? (
        <div className="space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label htmlFor="latitude" className="block text-xs text-gray-500">Latitude</label>
              <input
                type="text"
                id="latitude"
                value={manualCoordinates.lat}
                onChange={(e) => setManualCoordinates(prev => ({ ...prev, lat: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="-90 to 90"
              />
            </div>
            <div>
              <label htmlFor="longitude" className="block text-xs text-gray-500">Longitude</label>
              <input
                type="text"
                id="longitude"
                value={manualCoordinates.lng}
                onChange={(e) => setManualCoordinates(prev => ({ ...prev, lng: e.target.value }))}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                placeholder="-180 to 180"
              />
            </div>
          </div>
          <button
            type="button"
            onClick={handleManualCoordinateSubmit}
            disabled={!manualCoordinates.lat || !manualCoordinates.lng}
            className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Set Location
          </button>
        </div>
      ) : (
        <div className="space-y-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={address}
                onChange={(e) => handleAddressChange(e.target.value)}
                className={`
                  block w-full pl-10 pr-3 py-2 sm:text-sm rounded-md
                  ${error 
                    ? 'border-red-300 focus:ring-red-500 focus:border-red-500' 
                    : 'border-gray-300 focus:ring-indigo-500 focus:border-indigo-500'
                  }
                `}
                placeholder="Enter address or coordinates"
                disabled={isLoading}
              />
            </div>
            <button
              type="button"
              onClick={handleCurrentLocation}
              disabled={isLoading}
              className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Navigation className="h-4 w-4" />
              )}
            </button>
          </div>

          <HelpText>
            Enter an address or coordinates (e.g. "37.7749, -122.4194")
          </HelpText>
        </div>
      )}

      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}

      {coordinates && (
        <p className="text-sm text-gray-500">
          Selected location: {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
        </p>
      )}
    </div>
  );
}