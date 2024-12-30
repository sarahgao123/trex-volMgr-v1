import React from 'react';
import { Link } from 'react-router-dom';
import { Plus, BookOpen, Download } from 'lucide-react';

interface EventHeaderProps {
  onCreateClick: () => void;
  onImportClick: () => void;
}

export function EventHeader({ onCreateClick, onImportClick }: EventHeaderProps) {
  return (
    <div className="flex justify-between items-center mb-6">
      <h2 className="text-2xl font-bold text-gray-900">Volunteer Events</h2>
      <div className="flex items-center gap-4">
        <Link
          to="/docs"
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <BookOpen className="h-5 w-5 mr-2" />
          Documentation
        </Link>
        <button
          onClick={onImportClick}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          <Download className="h-5 w-5 mr-2" />
          Import from SignUpGenius
        </button>
        <button
          onClick={onCreateClick}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
        >
          <Plus className="h-5 w-5 mr-2" />
          Create Event
        </button>
      </div>
    </div>
  );
}