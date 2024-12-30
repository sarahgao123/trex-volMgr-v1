import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronDown, ChevronUp, QrCode, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import type { PositionWithVolunteers } from '../../types/position';
import { SlotList } from '../slots/SlotList';
import { SlotForm } from '../slots/SlotForm';
import { PositionActions } from './PositionActions';
import { useSlotStore } from '../../store/slotStore';
import { useQRCode } from '../../hooks/useQRCode';

interface PositionListProps {
  positions: PositionWithVolunteers[];
  onEdit: (position: PositionWithVolunteers) => void;
  onDelete: (id: string) => void;
  isEventOwner: boolean;
  fetchSlots: (positionId: string) => Promise<void>;
}

export function PositionList({ positions, onEdit, onDelete, isEventOwner, fetchSlots }: PositionListProps) {
  const navigate = useNavigate();
  const { slots, createSlot } = useSlotStore();
  const { selectedQR, generateQRCode, closeQRCode } = useQRCode();
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);
  const [creatingSlotForPosition, setCreatingSlotForPosition] = useState<string | null>(null);

  const handleExpand = async (positionId: string) => {
    try {
      if (expandedPosition === positionId) {
        setExpandedPosition(null);
      } else {
        await fetchSlots(positionId);
        setExpandedPosition(positionId);
      }
    } catch (error) {
      console.error('Error fetching slots:', error);
    }
  };

  const handleCreateSlot = async (data: any) => {
    try {
      await createSlot(data);
      setCreatingSlotForPosition(null);
      if (expandedPosition) {
        await fetchSlots(expandedPosition);
      }
    } catch (error) {
      console.error('Error creating slot:', error);
    }
  };

  const handleCheckIn = (positionId: string) => {
    navigate(`/checkin/${positionId}`);
  };

  return (
    <div className="space-y-6">
      {positions.map((position) => {
        const positionSlots = slots.filter(s => s.position_id === position.id);
        const isExpanded = expandedPosition === position.id;

        return (
          <div key={position.id} className="bg-white shadow rounded-lg overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex-grow">
                  <h3 className="text-lg font-medium text-gray-900">{position.name}</h3>
                  <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                    <div>
                      {new Date(position.start_time).toLocaleString()} - 
                      {new Date(position.end_time).toLocaleString()}
                    </div>
                    <div>
                      {position.volunteers_needed} volunteers needed
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleCheckIn(position.id)}
                    className="inline-flex items-center p-2 text-gray-400 hover:text-green-600 hover:bg-gray-100 rounded-full"
                    title="Check In"
                  >
                    <CheckCircle className="h-5 w-5" />
                  </button>
                  <button
                    onClick={() => generateQRCode(position.id)}
                    className="inline-flex items-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
                    title="Show QR Code"
                  >
                    <QrCode className="h-5 w-5" />
                  </button>
                  {isEventOwner && (
                    <>
                      <button
                        onClick={() => onEdit(position)}
                        className="inline-flex items-center p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-100 rounded-full"
                        title="Edit position"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm('Are you sure you want to delete this position?')) {
                            onDelete(position.id);
                          }
                        }}
                        className="inline-flex items-center p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full"
                        title="Delete position"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleExpand(position.id)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 transition-colors"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-5 w-5 mr-2" />
                      Hide Slots
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-5 w-5 mr-2" />
                      View Slots
                    </>
                  )}
                </button>
                
                {isEventOwner && (
                  <button
                    onClick={() => setCreatingSlotForPosition(position.id)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 transition-colors"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Slot
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="border-t border-gray-200 p-6">
                {creatingSlotForPosition === position.id && (
                  <div className="mb-6">
                    <SlotForm
                      positionId={position.id}
                      position={position}
                      onSubmit={handleCreateSlot}
                      buttonText="Create Slot"
                    />
                  </div>
                )}
                <SlotList
                  positionId={position.id}
                  position={position}
                  slots={positionSlots}
                  isOwner={isEventOwner}
                />
              </div>
            )}
          </div>
        );
      })}

      {selectedQR && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-lg max-w-sm w-full">
            <img src={selectedQR} alt="QR Code" className="w-full mb-4" />
            <button
              onClick={closeQRCode}
              className="w-full inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}