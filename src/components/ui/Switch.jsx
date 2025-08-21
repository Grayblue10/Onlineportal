import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable switch/toggle component
 */
const Switch = ({
  checked,
  onChange,
  disabled = false,
  label = '',
  className = '',
  labelClassName = '',
  ...props
}) => {
  return (
    <div className={twMerge('flex items-center', className)}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={twMerge(
          'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
          checked ? 'bg-indigo-600' : 'bg-gray-200',
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-opacity-80'
        )}
        {...props}
      >
        <span
          aria-hidden="true"
          className={twMerge(
            'pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
            checked ? 'translate-x-5' : 'translate-x-0'
          )}
        />
      </button>
      {label && (
        <span 
          className={twMerge(
            'ml-3 text-sm font-medium text-gray-700',
            disabled && 'opacity-50',
            labelClassName
          )}
        >
          {label}
        </span>
      )}
    </div>
  );
};

Switch.propTypes = {
  /** Whether the switch is on or off */
  checked: PropTypes.bool.isRequired,
  /** Function to call when the switch is toggled */
  onChange: PropTypes.func.isRequired,
  /** Whether the switch is disabled */
  disabled: PropTypes.bool,
  /** Optional label text */
  label: PropTypes.string,
  /** Additional CSS classes for the container */
  className: PropTypes.string,
  /** Additional CSS classes for the label */
  labelClassName: PropTypes.string,
};

export default Switch;
