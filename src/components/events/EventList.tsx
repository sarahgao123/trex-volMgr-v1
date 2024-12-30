import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Pencil, Trash2, BarChart } from 'lucide-react';
import type { Event } from '../../types/event';
import { formatLocalDateTime } from '../../utils/dateUtils';
import { useAuthStore } from '../../store/authStore';

interface EventListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
}

export function EventList({ events, onEdit, onDelete }: EventListProps) {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  if (!events.length) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow">
        <div className="max-w-sm mx-auto">
          <Calendar className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">No events yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Get started by creating your first event using the button above.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event) => {
        const isOwner = user?.id === event.user_id;

        return (
          <div 
            key={event.id}
            className="group bg-white shadow-sm hover:shadow-md transition-shadow duration-200 rounded-lg overflow-hidden cursor-pointer"
            onClick={() => navigate(`/events/${event.id}/positions`)}
          >
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                    {event.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {event.description}
                  </p>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span>{formatLocalDateTime(event.event_time)}</span>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="h-4 w-4 mr-1.5 flex-shrink-0" />
                      <span>{event.location}</span>
                    </div>
                  </div>
                </div>

                <div className="ml-4 flex items-center space-x-4">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/events/${event.id}/report`);
                    }}
                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition-colors"
                    title="View Report"
                  >
                    <BarChart className="h-5 w-5" />
                  </button>
                  
                  {isOwner && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(event);
                        }}
                        className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-full transition-colors"
                        title="Edit Event"
                      >
                        <Pencil className="h-5 w-5" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(event.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-50 rounded-full transition-colors"
                        title="Delete Event"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}