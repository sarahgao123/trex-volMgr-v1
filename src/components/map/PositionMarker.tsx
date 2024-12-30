import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import type { Position } from '../../types/position';
import { getMarkerIcon } from '../../utils/mapUtils';

interface PositionMarkerProps {
  position: Position;
  index: number;
}

export function PositionMarker({ position, index }: PositionMarkerProps) {
  if (!position.latitude || !position.longitude) return null;

  return (
    <Marker
      position={[position.latitude, position.longitude]}
      icon={getMarkerIcon(index)}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-medium text-gray-900">{position.name}</h3>
          {position.address && (
            <p className="text-sm text-gray-600 mt-1">{position.address}</p>
          )}
          <p className="text-sm text-gray-500 mt-1">
            {new Date(position.start_time).toLocaleString()} - 
            {new Date(position.end_time).toLocaleString()}
          </p>
          <p className="text-sm text-gray-500">
            {position.volunteers_needed} volunteers needed
          </p>
        </div>
      </Popup>
    </Marker>
  );
}