import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable input component with different variants and states
 */
const Input = forwardRef(({
  label,
  id,
  type = 'text',
  error,
  helperText,
  startIcon,
  endIcon,
  fullWidth = false,
  className = '',
  labelClassName = '',
  inputClassName = '',
  errorClassName = '',
  helperTextClassName = '',
  textarea = false,
  rows = 3,
  ...props
}, ref) => {
  // Base input classes
  const inputBaseClasses = 'block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6';
  
  // Error state
  const errorClasses = error ? 'ring-red-500 text-red-900 placeholder-red-300 focus:ring-red-500' : '';
  
  // Disabled state
  const disabledClasses = props.disabled ? 'bg-gray-100 cursor-not-allowed' : 'bg-white';
  
  // Full width
  const widthClass = fullWidth ? 'w-full' : '';

  // Input with icon wrapper
  const withIconClasses = startIcon || endIcon ? 'relative' : '';
  const startIconClasses = startIcon ? 'pl-10' : '';
  const endIconClasses = endIcon ? 'pr-10' : '';

  return (
    <div className={twMerge('mb-4', widthClass, className)}>
      {label && (
        <label 
          htmlFor={id} 
          className={twMerge('block text-sm font-medium leading-6 text-gray-900 mb-1', labelClassName)}
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className={withIconClasses}>
        {startIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        
        {textarea ? (
          <textarea
            ref={ref}
            id={id}
            rows={rows}
            className={twMerge(
              inputBaseClasses,
              errorClasses,
              disabledClasses,
              'resize-vertical',
              inputClassName
            )}
            {...props}
          />
        ) : (
          <input
            ref={ref}
            type={type}
            id={id}
            className={twMerge(
              inputBaseClasses,
              errorClasses,
              disabledClasses,
              startIcon && 'pl-10',
              endIcon && 'pr-10',
              inputClassName
            )}
            {...props}
          />
        )}
        
        {endIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            {endIcon}
          </div>
        )}
      </div>
      
      {error && (
        <p className={twMerge('mt-1 text-sm text-red-600', errorClassName)}>
          {error}
        </p>
      )}
      
      {helperText && !error && (
        <p className={twMerge('mt-1 text-sm text-gray-500', helperTextClassName)}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

Input.propTypes = {
  /** Input label */
  label: PropTypes.string,
  /** Input ID */
  id: PropTypes.string.isRequired,
  /** Input type */
  type: PropTypes.string,
  /** Error message to display */
  error: PropTypes.string,
  /** Helper text to display below the input */
  helperText: PropTypes.string,
  /** Icon to display at the start of the input */
  startIcon: PropTypes.node,
  /** Icon to display at the end of the input */
  endIcon: PropTypes.node,
  /** Whether the input should take full width of its container */
  fullWidth: PropTypes.bool,
  /** Additional CSS classes for the wrapper */
  className: PropTypes.string,
  /** Additional CSS classes for the label */
  labelClassName: PropTypes.string,
  /** Additional CSS classes for the input */
  inputClassName: PropTypes.string,
  /** Additional CSS classes for the error message */
  errorClassName: PropTypes.string,
  /** Additional CSS classes for the helper text */
  helperTextClassName: PropTypes.string,
  /** Whether to render as textarea */
  textarea: PropTypes.bool,
  /** Number of rows for textarea */
  rows: PropTypes.number,
};

export default Input;
