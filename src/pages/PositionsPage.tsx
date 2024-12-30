import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Breadcrumb } from '../components/common/Breadcrumb';
import { TabNavigation } from '../components/common/TabNavigation';
import { PositionList } from '../components/positions/PositionList';
import { PositionFormSection } from '../components/positions/PositionFormSection';
import { PositionsMap } from '../components/map/PositionsMap';
import { MapLegend } from '../components/map/MapLegend';
import { usePositions } from '../hooks/usePositions';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';

export default function PositionsPage() {
  const { eventId } = useParams<{ eventId: string }>();
  const location = useLocation();
  
  const { 
    positions,
    event,
    loading,
    error,
    isCreating,
    editingPosition,
    isEventOwner,
    setIsCreating,
    setEditingPosition,
    handleCreate,
    handleUpdate,
    handleDelete,
    fetchSlots
  } = usePositions(eventId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  const tabs = [
    {
      label: 'Positions',
      href: `/events/${eventId}/positions`,
      active: location.pathname === `/events/${eventId}/positions`
    },
    {
      label: 'Check-in Report',
      href: `/events/${eventId}/report`,
      active: location.pathname === `/events/${eventId}/report`
    }
  ];

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Events', href: '/' },
          { label: event.name }
        ]}
      />

      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{event.name}</h2>
          <p className="mt-1 text-sm text-gray-500">{event.description}</p>
        </div>
        {isEventOwner && (
          <button
            onClick={() => setIsCreating(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Create Position
          </button>
        )}
      </div>

      <TabNavigation tabs={tabs} />

      <div className="space-y-6">
        <PositionsMap positions={positions} />
        <MapLegend positions={positions} />

        {isCreating && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Create New Position</h3>
            <PositionFormSection
              isCreating={isCreating}
              editingPosition={editingPosition}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
            />
          </div>
        )}

        {editingPosition && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Edit Position</h3>
            <PositionFormSection
              isCreating={isCreating}
              editingPosition={editingPosition}
              onCreate={handleCreate}
              onUpdate={handleUpdate}
            />
          </div>
        )}

        <PositionList
          positions={positions}
          onEdit={setEditingPosition}
          onDelete={handleDelete}
          isEventOwner={isEventOwner}
          fetchSlots={fetchSlots}
        />
      </div>
    </div>
  );
}