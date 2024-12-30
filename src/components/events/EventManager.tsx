import React from 'react';
import { EventHeader } from './EventHeader';
import { EventList } from './EventList';
import { EventFormSection } from './EventFormSection';
import { ImportEventDialog } from './ImportEventDialog';
import { useEvents } from '../../hooks/useEvents';

export default function EventManager() {
  const {
    events,
    loading,
    error,
    isCreating,
    editingEvent,
    showImportDialog,
    handleCreate,
    handleUpdate,
    handleDelete,
    setIsCreating,
    setEditingEvent,
    setShowImportDialog,
    handleImportSuccess
  } = useEvents();

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  if (error) {
    return <div className="text-red-600 text-center">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <EventHeader 
        onCreateClick={() => setIsCreating(true)}
        onImportClick={() => setShowImportDialog(true)}
      />

      <div className="space-y-6">
        <EventFormSection
          isCreating={isCreating}
          editingEvent={editingEvent}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
          onCancel={() => {
            setIsCreating(false);
            setEditingEvent(null);
          }}
        />

        <EventList
          events={events}
          onEdit={setEditingEvent}
          onDelete={handleDelete}
        />
      </div>

      {showImportDialog && (
        <ImportEventDialog
          onClose={() => setShowImportDialog(false)}
          onSuccess={handleImportSuccess}
        />
      )}
    </div>
  );
}