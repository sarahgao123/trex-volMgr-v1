import React from 'react';
import { useParams } from 'react-router-dom';
import { useEventStore } from '../store/eventStore';
import { usePositionStore } from '../store/positionStore';
import { useSlotStore } from '../store/slotStore';
import { CheckInReport } from '../components/reports/CheckInReport';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { Breadcrumb } from '../components/common/Breadcrumb';

export default function EventReportPage() {
  const { eventId } = useParams<{ eventId: string }>();
  
  const { events, loading: eventsLoading, error: eventsError, fetchEvents } = useEventStore();
  const { positions, loading: positionsLoading, error: positionsError, fetchPositions } = usePositionStore();
  const { slots, loading: slotsLoading, error: slotsError, fetchSlots } = useSlotStore();

  React.useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  React.useEffect(() => {
    if (eventId) {
      fetchPositions(eventId);
    }
  }, [eventId, fetchPositions]);

  React.useEffect(() => {
    positions.forEach(position => {
      fetchSlots(position.id);
    });
  }, [positions, fetchSlots]);

  const loading = eventsLoading || positionsLoading || slotsLoading;
  const error = eventsError || positionsError || slotsError;
  const event = events.find(e => e.id === eventId);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!event) return <ErrorMessage message="Event not found" />;

  return (
    <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: 'Events', href: '/' },
          { label: event.name, href: `/events/${event.id}/positions` },
          { label: 'Check-in Report' }
        ]}
      />

      <CheckInReport 
        event={event}
        positions={positions}
        slots={slots}
      />
    </div>
  );
}