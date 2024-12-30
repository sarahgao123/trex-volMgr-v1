import React from 'react';
import { Info } from 'lucide-react';

interface InfoBoxProps {
  children: React.ReactNode;
}

export function InfoBox({ children }: InfoBoxProps) {
  return (
    <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
      <div className="flex">
        <Info className="h-5 w-5 text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          {children}
        </div>
      </div>
    </div>
  );
}