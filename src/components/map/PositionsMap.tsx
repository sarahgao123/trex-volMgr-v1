import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Position } from '../../types/position';
import { MapWrapper } from './MapWrapper';
import { getMarkerIcon } from '../../utils/mapUtils';
import { formatLocalDateTime } from '../../utils/dateUtils';

interface PositionsMapProps {
  positions: Position[];
}

export function PositionsMap({ positions }: PositionsMapProps) {
  const validPositions = positions.filter(p => p.latitude && p.longitude);

  if (validPositions.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-4 text-center text-gray-500">
        No position locations available
      </div>
    );
  }

  // Calculate center point from valid positions
  const center = validPositions.reduce(
    (acc, pos) => ({
      lat: acc.lat + (pos.latitude || 0) / validPositions.length,
      lng: acc.lng + (pos.longitude || 0) / validPositions.length
    }),
    { lat: 0, lng: 0 }
  );

  // Calculate appropriate zoom level based on position spread
  const bounds = validPositions.reduce(
    (acc, pos) => ({
      minLat: Math.min(acc.minLat, pos.latitude || 0),
      maxLat: Math.max(acc.maxLat, pos.latitude || 0),
      minLng: Math.min(acc.minLng, pos.longitude || 0),
      maxLng: Math.max(acc.maxLng, pos.longitude || 0),
    }),
    {
      minLat: 90,
      maxLat: -90,
      minLng: 180,
      maxLng: -180,
    }
  );

  // Use a higher default zoom level of 15 for single position, or calculate based on spread
  const zoom = validPositions.length === 1 ? 15 : 
    Math.min(
      Math.floor(
        Math.log2(
          360 / Math.max(
            bounds.maxLat - bounds.minLat,
            bounds.maxLng - bounds.minLng
          )
        )
      ) + 1, // Add 1 to increase zoom level
      15 // Maximum zoom level
    );

  return (
    <MapWrapper center={[center.lat, center.lng]} zoom={zoom}>
      {validPositions.map((position, index) => (
        <Marker
          key={position.id}
          position={[position.latitude!, position.longitude!]}
          icon={getMarkerIcon(index)}
        >
          <Popup>
            <div className="p-2">
              <h3 className="font-medium text-gray-900">{position.name}</h3>
              {position.address && (
                <p className="text-sm text-gray-600 mt-1">{position.address}</p>
              )}
              <p className="text-sm text-gray-500 mt-1">
                {formatLocalDateTime(position.start_time)} - 
                {formatLocalDateTime(position.end_time)}
              </p>
              <p className="text-sm text-gray-500">
                {position.volunteers_needed} volunteers needed
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapWrapper>
  );
}