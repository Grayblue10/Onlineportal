import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * A loading spinner component with different sizes and colors
 */
const Spinner = ({
  size = 'md',
  color = 'primary',
  className = '',
  ...props
}) => {
  const sizeClasses = {
    xs: 'h-3 w-3 border-2',
    sm: 'h-4 w-4 border-2',
    md: 'h-6 w-6 border-2',
    lg: 'h-8 w-8 border-2',
    xl: 'h-10 w-10 border-2',
  };

  const colorClasses = {
    primary: 'border-t-primary-500 border-r-primary-300 border-b-primary-300 border-l-primary-300',
    white: 'border-t-white border-r-gray-200 border-b-gray-200 border-l-gray-200',
    gray: 'border-t-gray-500 border-r-gray-300 border-b-gray-300 border-l-gray-300',
    red: 'border-t-red-500 border-r-red-300 border-b-red-300 border-l-red-300',
    green: 'border-t-green-500 border-r-green-300 border-b-green-300 border-l-green-300',
    blue: 'border-t-blue-500 border-r-blue-300 border-b-blue-300 border-l-blue-300',
    yellow: 'border-t-yellow-500 border-r-yellow-300 border-b-yellow-300 border-l-yellow-300',
    indigo: 'border-t-indigo-500 border-r-indigo-300 border-b-indigo-300 border-l-indigo-300',
    purple: 'border-t-purple-500 border-r-purple-300 border-b-purple-300 border-l-purple-300',
    pink: 'border-t-pink-500 border-r-pink-300 border-b-pink-300 border-l-pink-300',
  };

  return (
    <div 
      className={twMerge(
        'animate-spin rounded-full',
        sizeClasses[size] || sizeClasses.md,
        colorClasses[color] || colorClasses.primary,
        className
      )}
      role="status"
      {...props}
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

Spinner.propTypes = {
  /** Size of the spinner */
  size: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  /** Color variant of the spinner */
  color: PropTypes.oneOf([
    'primary', 'white', 'gray', 'red', 'green', 
    'blue', 'yellow', 'indigo', 'purple', 'pink'
  ]),
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Spinner;
