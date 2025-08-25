import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable button component with different variants and sizes
 */
const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  startIcon,
  endIcon,
  className = '',
  ...props
}) => {
  // Base button classes
  const baseClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200';

  // Variant classes with improved visibility and design system colors
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
    secondary: 'bg-gray-100 text-gray-800 hover:bg-gray-200 focus:ring-gray-400 border border-gray-300 shadow-sm hover:shadow-md transition-all duration-200',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200',
    outline: 'bg-white border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500 shadow-sm hover:shadow-md transition-all duration-200',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-400 hover:shadow-sm transition-all duration-200',
    link: 'bg-transparent text-blue-600 hover:text-blue-800 hover:underline p-0 transition-colors duration-200',
  };

  // Size classes with improved padding and typography
  const sizes = {
    sm: 'px-3 py-2 text-sm font-medium',
    md: 'px-5 py-2.5 text-base font-medium',
    lg: 'px-8 py-3.5 text-lg font-semibold',
  };

  // Disabled state
  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed'
    : 'cursor-pointer';

  // Full width
  const widthClass = fullWidth ? 'w-full' : '';

  // Merge all classes
  const buttonClasses = twMerge(
    baseClasses,
    variants[variant],
    sizes[size],
    disabledClasses,
    widthClass,
    className
  );

  return (
    <button
      className={buttonClasses}
      disabled={disabled || loading}
      aria-busy={loading ? 'true' : 'false'}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {startIcon && <span className="mr-2">{startIcon}</span>}
      {children}
      {endIcon && <span className="ml-2">{endIcon}</span>}
    </button>
  );
};

Button.propTypes = {
  /** Button content */
  children: PropTypes.node.isRequired,
  /** Button variant */
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'warning', 'outline', 'ghost', 'link']),
  /** Button size */
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  /** Whether the button should take full width of its container */
  fullWidth: PropTypes.bool,
  /** Whether the button is disabled */
  disabled: PropTypes.bool,
  /** Whether to show a loading spinner */
  loading: PropTypes.bool,
  /** Icon to display at the start of the button */
  startIcon: PropTypes.node,
  /** Icon to display at the end of the button */
  endIcon: PropTypes.node,
  /** Additional CSS classes */
  className: PropTypes.string,
};

export default Button;
