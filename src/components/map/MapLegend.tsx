import React from 'react';
import type { Position } from '../../types/position';

const COLORS = [
  '#EF4444', // red
  '#F59E0B', // amber
  '#10B981', // emerald
  '#3B82F6', // blue
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#6366F1', // indigo
  '#14B8A6', // teal
];

interface MapLegendProps {
  positions: Position[];
}

export function MapLegend({ positions }: MapLegendProps) {
  const validPositions = positions.filter(p => p.latitude && p.longitude);

  if (validPositions.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mt-4">
      <h3 className="text-sm font-medium text-gray-900 mb-2">Position Locations</h3>
      <div className="space-y-2">
        {validPositions.map((position, index) => (
          <div key={position.id} className="flex items-center space-x-2">
            <div 
              className="w-4 h-4 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-sm text-gray-600">{position.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}