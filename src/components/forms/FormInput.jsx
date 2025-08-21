import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import { Input, Label } from '../ui';

/**
 * A reusable form input component with validation support
 */
const FormInput = forwardRef((
  {
    id,
    name,
    label,
    type = 'text',
    placeholder = '',
    error = '',
    className = '',
    labelClassName = '',
    inputClassName = '',
    errorClassName = '',
    required = false,
    disabled = false,
    readOnly = false,
    autoComplete = 'off',
    leftIcon,
    validate, // Extract validate prop to prevent it from being passed to the input element
    ...props
  },
  ref
) => {
  const inputId = id || `input-${name}`;
  
  return (
    <div className={`mb-4 ${className}`}>
      {label && (
        <Label htmlFor={inputId} className={`block mb-1 ${labelClassName}`}>
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <Input
          id={inputId}
          ref={ref}
          name={name}
          type={type}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          autoComplete={autoComplete}
          className={`w-full ${leftIcon ? 'pl-10' : ''} ${error ? 'border-red-500' : ''} ${inputClassName}`}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...props}
        />
      </div>
      
      {error && (
        <p 
          id={`${inputId}-error`} 
          className={`mt-1 text-sm text-red-600 ${errorClassName}`}
        >
          {error}
        </p>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

FormInput.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string.isRequired,
  label: PropTypes.string,
  type: PropTypes.oneOf([
    'text',
    'email',
    'password',
    'number',
    'tel',
    'date',
    'time',
    'datetime-local',
    'url',
    'search',
    'color',
  ]),
  placeholder: PropTypes.string,
  error: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.arrayOf(PropTypes.string),
  ]),
  className: PropTypes.string,
  labelClassName: PropTypes.string,
  inputClassName: PropTypes.string,
  errorClassName: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  readOnly: PropTypes.bool,
  autoComplete: PropTypes.string,
  leftIcon: PropTypes.element,
  validate: PropTypes.func,
};

export default FormInput;
