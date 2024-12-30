import React, { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { useCheckIn } from '../hooks/useCheckIn';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { ErrorMessage } from '../components/common/ErrorMessage';
import { formatLocalDateTime } from '../utils/dateUtils';

export default function CheckInPage() {
  const { positionId } = useParams<{ positionId: string }>();
  const [searchParams] = useSearchParams();
  const slotId = searchParams.get('slot');
  
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { slot, loading, error: slotError } = useCheckIn(positionId, slotId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    try {
      if (!slot) {
        throw new Error('No active slot found');
      }

      await slot.handleCheckIn(email, name);
      setSuccess(true);
      setEmail('');
      setName('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to check in');
    }
  };

  if (loading) return <LoadingSpinner />;
  if (slotError) return <ErrorMessage message={slotError} />;
  if (!slot) return <ErrorMessage message="No active slot found for check-in" />;

  // Get list of registered volunteers who haven't checked in yet
  const registeredVolunteers = slot.volunteers
    .filter(v => !v.checked_in)
    .sort((a, b) => a.user.email.localeCompare(b.user.email));

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Volunteer Check-in
        </h2>
        <div className="mt-2 text-center text-sm text-gray-600">
          <p>Position: {slot.name}</p>
          <p className="mt-1">
            Time: {formatLocalDateTime(slot.start_time)} - {formatLocalDateTime(slot.end_time)}
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {success ? (
            <div className="text-center">
              <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
              <h3 className="mt-2 text-lg font-medium text-gray-900">Check-in Successful!</h3>
              <p className="mt-1 text-sm text-gray-500">You're all set for your volunteer position.</p>
              <button
                onClick={() => setSuccess(false)}
                className="mt-4 w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Check in Another Volunteer
              </button>
            </div>
          ) : (
            <form className="space-y-6" onSubmit={handleSubmit}>
              {error && (
                <div className="rounded-md bg-red-50 p-4">
                  <div className="text-sm text-red-700">{error}</div>
                </div>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Select Volunteer
                </label>
                <div className="mt-1">
                  <select
                    id="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      // Find and set the name if available
                      const volunteer = registeredVolunteers.find(v => v.user.email === e.target.value);
                      if (volunteer?.name) {
                        setName(volunteer.name);
                      }
                    }}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="">Select a volunteer</option>
                    {registeredVolunteers.map(volunteer => (
                      <option key={volunteer.user.id} value={volunteer.user.email}>
                        {volunteer.user.email} {volunteer.name ? `(${volunteer.name})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Name (optional)
                </label>
                <div className="mt-1">
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Check In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}