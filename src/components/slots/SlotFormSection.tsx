import React from 'react';
import { SlotForm } from './SlotForm';
import { InfoBox } from '../common/InfoBox';
import type { Position } from '../../types/position';
import type { SlotWithVolunteers } from '../../types/slot';

interface SlotFormSectionProps {
  position: Position;
  positionId: string;
  editingSlot: SlotWithVolunteers | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function SlotFormSection({
  position,
  positionId,
  editingSlot,
  onSubmit,
  onCancel
}: SlotFormSectionProps) {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h4 className="text-lg font-medium text-gray-900 mb-3">
        {editingSlot ? 'Edit Time Slot' : 'Create New Time Slot'}
      </h4>

      <InfoBox>
        <h4 className="font-medium mb-2">Time Slot Rules:</h4>
        <ul className="list-disc list-inside space-y-1">
          <li>Time slots must be within the position's time range</li>
          <li>Time slots cannot overlap with other slots</li>
          <li>End time must be after start time</li>
          <li>At least one volunteer is required per slot</li>
          <li>Add volunteer emails to enable check-in</li>
        </ul>
      </InfoBox>

      <SlotForm
        positionId={positionId}
        position={position}
        initialData={editingSlot}
        onSubmit={onSubmit}
        buttonText={editingSlot ? 'Update Slot' : 'Create Slot'}
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