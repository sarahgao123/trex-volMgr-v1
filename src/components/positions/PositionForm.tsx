import React from 'react';
import { FileText, Calendar, MapPin } from 'lucide-react';
import type { Position } from '../../types/position';
import { LocationPicker } from './LocationPicker';
import { toLocalDateTimeString, toUTCString } from '../../utils/dateUtils';

interface PositionFormProps {
  onSubmit: (data: Omit<Position, 'id' | 'user_id' | 'created_at' | 'volunteers_checked_in'>) => void;
  initialData?: Position;
  buttonText: string;
}

export function PositionForm({ onSubmit, initialData, buttonText }: PositionFormProps) {
  const [formData, setFormData] = React.useState({
    name: initialData?.name || '',
    start_time: initialData?.start_time ? toLocalDateTimeString(initialData.start_time) : '',
    end_time: initialData?.end_time ? toLocalDateTimeString(initialData.end_time) : '',
    volunteers_needed: initialData?.volunteers_needed || 1,
    latitude: initialData?.latitude || null,
    longitude: initialData?.longitude || null,
    address: initialData?.address || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      start_time: toUTCString(formData.start_time),
      end_time: toUTCString(formData.end_time),
      volunteers_needed: Number(formData.volunteers_needed),
      latitude: formData.latitude || null,
      longitude: formData.longitude || null,
      address: formData.address || null
    });
  };

  const handleLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setFormData(prev => ({
      ...prev,
      latitude: location.lat,
      longitude: location.lng,
      address: location.address
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Position Name
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FileText className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            id="name"
            required
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="Position Name"
          />
        </div>
      </div>

      <div>
        <LocationPicker
          onLocationSelect={handleLocationSelect}
          initialAddress={formData.address}
          initialLat={formData.latitude}
          initialLng={formData.longitude}
        />
      </div>

      <div>
        <label htmlFor="start_time" className="block text-sm font-medium text-gray-700">
          Start Time
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="datetime-local"
            id="start_time"
            required
            value={formData.start_time}
            onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="end_time" className="block text-sm font-medium text-gray-700">
          End Time
        </label>
        <div className="mt-1 relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Calendar className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="datetime-local"
            id="end_time"
            required
            value={formData.end_time}
            min={formData.start_time}
            onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>
      </div>

      <div>
        <label htmlFor="volunteers_needed" className="block text-sm font-medium text-gray-700">
          Number of Volunteers Needed
        </label>
        <input
          type="number"
          id="volunteers_needed"
          required
          min="1"
          value={formData.volunteers_needed}
          onChange={(e) => setFormData({ ...formData, volunteers_needed: Math.max(1, parseInt(e.target.value) || 1) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        {buttonText}
      </button>
    </form>
  );
}