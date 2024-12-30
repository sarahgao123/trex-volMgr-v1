import React from 'react';
import { Info } from 'lucide-react';

interface HelpTextProps {
  children: React.ReactNode;
  className?: string;
}

export function HelpText({ children, className = '' }: HelpTextProps) {
  return (
    <div className={`flex items-start gap-2 text-sm text-gray-600 mt-1 ${className}`}>
      <Info className="h-4 w-4 flex-shrink-0 mt-0.5" />
      <span>{children}</span>
    </div>
  );
}