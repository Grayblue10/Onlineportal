import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { ChevronDown, Check } from 'lucide-react';

/**
 * A reusable select/dropdown component
 */
const Select = ({
  options = [],
  value,
  onChange,
  placeholder = 'Select an option',
  className = '',
  disabled = false,
  label = '',
  error = '',
  required = false,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const selectedOption = options.find(option => option.value === value) || null;

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const handleSelect = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };

  return (
    <div className={`w-full ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <button
          type="button"
          className={twMerge(
            'relative w-full bg-white border border-gray-300 rounded-md shadow-sm pl-3 pr-10 py-2 text-left cursor-default focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm',
            disabled ? 'bg-gray-100 cursor-not-allowed opacity-70' : 'hover:bg-gray-50',
            error ? 'border-red-300 text-red-900 placeholder-red-300' : ''
          )}
          onClick={toggleDropdown}
          disabled={disabled}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-labelledby="listbox-label"
          {...props}
        >
          <span className={`block truncate ${!selectedOption ? 'text-gray-500' : ''}`}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
          <span className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
            <ChevronDown className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </button>

        {isOpen && (
          <div className="absolute z-10 mt-1 w-full rounded-md bg-white shadow-lg">
            <ul
              tabIndex={-1}
              role="listbox"
              className="max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            >
              {options.map((option) => (
                <li
                  key={option.value}
                  className={twMerge(
                    'text-gray-900 cursor-default select-none relative py-2 pl-3 pr-9 hover:bg-blue-50',
                    option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                  )}
                  onClick={() => !option.disabled && handleSelect(option)}
                  role="option"
                  aria-selected={value === option.value}
                >
                  <div className="flex items-center">
                    {option.icon && (
                      <span className="mr-3">
                        {React.cloneElement(option.icon, {
                          className: 'h-5 w-5 text-gray-400',
                          'aria-hidden': 'true'
                        })}
                      </span>
                    )}
                    <span className="block truncate">
                      {option.label}
                    </span>
                    {value === option.value && (
                      <span className="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600">
                        <Check className="h-5 w-5" aria-hidden="true" />
                      </span>
                    )}
                  </div>
                </li>
              ))}
              
              {options.length === 0 && (
                <li className="text-gray-500 text-center py-2 px-3">
                  No options available
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-1 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

Select.propTypes = {
  /** Array of options to display in the dropdown */
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      disabled: PropTypes.bool,
    })
  ),
  /** Currently selected value */
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  /** Function called when selection changes */
  onChange: PropTypes.func.isRequired,
  /** Placeholder text when no option is selected */
  placeholder: PropTypes.string,
  /** Additional CSS classes for the container */
  className: PropTypes.string,
  /** Whether the select is disabled */
  disabled: PropTypes.bool,
  /** Label text */
  label: PropTypes.string,
  /** Error message to display */
  error: PropTypes.string,
  /** Whether the field is required */
  required: PropTypes.bool,
};

export default Select;
