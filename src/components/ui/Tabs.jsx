import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable tabs component for navigation between different sections
 */
const Tabs = ({ tabs, activeTab, onChange, className = '' }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => onChange(tab.id)}
            className={twMerge(
              'group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm',
              activeTab === tab.id
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300',
              'focus:outline-none',
              className
            )}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.icon && (
              <span className="mr-2">
                {React.cloneElement(tab.icon, {
                  className: 'h-4 w-4',
                  'aria-hidden': 'true'
                })}
              </span>
            )}
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={twMerge(
                  'ml-2 py-0.5 px-2 rounded-full text-xs font-medium',
                  activeTab === tab.id
                    ? 'bg-indigo-100 text-indigo-600'
                    : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
};

Tabs.propTypes = {
  /** Array of tab objects with id and label */
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      count: PropTypes.number,
    })
  ).isRequired,
  /** Currently active tab ID */
  activeTab: PropTypes.string.isRequired,
  /** Function to call when tab changes */
  onChange: PropTypes.func.isRequired,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Tabs;
