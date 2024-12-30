import { useState, useEffect } from 'react';
import { useEventStore } from '../store/eventStore';
import type { Event } from '../types/event';

export function useEvents() {
  const { events, loading, error, fetchEvents, createEvent, updateEvent, deleteEvent } = useEventStore();
  const [isCreating, setIsCreating] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showImportDialog, setShowImportDialog] = useState(false);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleCreate = async (data: Omit<Event, 'id' | 'user_id' | 'created_at'>) => {
    try {
      await createEvent(data);
      setIsCreating(false);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create event';
      window.alert(message);
    }
  };

  const handleUpdate = async (data: Partial<Event>) => {
    try {
      if (editingEvent) {
        await updateEvent(editingEvent.id, data);
        setEditingEvent(null);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update event';
      window.alert(message);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const confirmed = window.confirm(
        'Are you sure you want to delete this event? This action cannot be undone and will delete all associated positions and slots.'
      );
      
      if (!confirmed) return;
      
      await deleteEvent(id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete event';
      window.alert(message);
    }
  };

  const handleImportSuccess = () => {
    fetchEvents();
    setShowImportDialog(false);
  };

  return {
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
  };
}