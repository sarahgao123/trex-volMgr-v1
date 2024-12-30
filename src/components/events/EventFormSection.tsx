import React from 'react';
import { EventForm } from './EventForm';
import type { Event } from '../../types/event';

interface EventFormSectionProps {
  isCreating: boolean;
  editingEvent: Event | null;
  onCreate: (data: Omit<Event, 'id' | 'user_id' | 'created_at'>) => Promise<void>;
  onUpdate: (data: Partial<Event>) => Promise<void>;
  onCancel: () => void;
}

export function EventFormSection({
  isCreating,
  editingEvent,
  onCreate,
  onUpdate,
  onCancel
}: EventFormSectionProps) {
  if (!isCreating && !editingEvent) return null;

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        {isCreating ? 'Create New Event' : 'Edit Event'}
      </h3>
      <EventForm
        onSubmit={isCreating ? onCreate : onUpdate}
        initialData={editingEvent}
        buttonText={isCreating ? 'Create Event' : 'Update Event'}
      />
      <button
        onClick={onCancel}
        className="mt-4 text-sm text-gray-500 hover:text-gray-700"
      >
        Cancel
      </button>
    </div>
  );
}