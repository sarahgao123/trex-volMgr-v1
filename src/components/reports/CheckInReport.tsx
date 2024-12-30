import React from 'react';
import { Calendar, Clock, Users, CheckCircle } from 'lucide-react';
import { formatLocalDateTime } from '../../utils/dateUtils';
import type { Event } from '../../types/event';
import type { PositionWithVolunteers } from '../../types/position';
import type { SlotWithVolunteers } from '../../types/slot';

interface CheckInReportProps {
  event: Event;
  positions: PositionWithVolunteers[];
  slots: SlotWithVolunteers[];
}

export function CheckInReport({ event, positions, slots }: CheckInReportProps) {
  // Calculate totals using the new volunteer_list property
  const totalVolunteers = slots.reduce((sum, slot) => 
    sum + (slot.volunteer_list?.length || 0), 0);
  
  const checkedInVolunteers = slots.reduce((sum, slot) => 
    sum + (slot.checked_in_count || 0), 0);
  
  const checkInRate = totalVolunteers ? 
    Math.round((checkedInVolunteers / totalVolunteers) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Event Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Check-in Report</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-2">
              <Users className="h-5 w-5 mr-2" />
              <span>Total Volunteers</span>
            </div>
            <div className="text-2xl font-bold">{totalVolunteers}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-2">
              <CheckCircle className="h-5 w-5 mr-2" />
              <span>Checked In</span>
            </div>
            <div className="text-2xl font-bold">{checkedInVolunteers}</div>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center text-gray-500 mb-2">
              <Calendar className="h-5 w-5 mr-2" />
              <span>Check-in Rate</span>
            </div>
            <div className="text-2xl font-bold">{checkInRate}%</div>
          </div>
        </div>

        <div className="text-sm text-gray-600">
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 mr-2" />
            <span>Event Date: {formatLocalDateTime(event.event_time)}</span>
          </div>
          <div className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            <span>Location: {event.location}</span>
          </div>
        </div>
      </div>

      {/* Position Details */}
      {positions.map(position => {
        const positionSlots = slots.filter(s => s.position_id === position.id);
        const positionVolunteers = positionSlots.reduce((sum, slot) => 
          sum + (slot.volunteer_list?.length || 0), 0);
        const positionCheckedIn = positionSlots.reduce((sum, slot) => 
          sum + (slot.checked_in_count || 0), 0);

        return (
          <div key={position.id} className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">{position.name}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Volunteers</div>
                <div className="font-semibold">{positionVolunteers}</div>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-500 mb-1">Checked In</div>
                <div className="font-semibold">{positionCheckedIn}</div>
              </div>
            </div>

            <div className="space-y-4">
              {positionSlots.map(slot => (
                <div key={slot.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="text-sm font-medium text-gray-900">
                      {slot.start_time && slot.end_time ? (
                        <span>
                          {formatLocalDateTime(slot.start_time)} - {formatLocalDateTime(slot.end_time)}
                        </span>
                      ) : (
                        <span>Flexible Time</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                      {slot.checked_in_count} / {slot.volunteer_list?.length || 0} checked in
                    </div>
                  </div>

                  <div className="space-y-2">
                    {slot.volunteer_list?.map(volunteer => (
                      <div 
                        key={volunteer.user.id}
                        className="flex items-center justify-between text-sm"
                      >
                        <span className="text-gray-600">
                          {volunteer.name || volunteer.user.email}
                        </span>
                        <div className="flex items-center">
                          {volunteer.checked_in ? (
                            <>
                              <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                              <span className="text-green-600">
                                Checked in at {formatLocalDateTime(volunteer.check_in_time!)}
                              </span>
                            </>
                          ) : (
                            <span className="text-gray-400">Not checked in</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}