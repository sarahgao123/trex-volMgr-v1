import React from 'react';
import { Link } from 'react-router-dom';

interface Tab {
  label: string;
  href: string;
  active: boolean;
}

interface TabNavigationProps {
  tabs: Tab[];
}

export function TabNavigation({ tabs }: TabNavigationProps) {
  return (
    <div className="border-b border-gray-200 mb-6">
      <nav className="-mb-px flex space-x-8">
        {tabs.map(tab => (
          <Link
            key={tab.href}
            to={tab.href}
            className={`
              whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
              ${tab.active
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }
            `}
          >
            {tab.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}