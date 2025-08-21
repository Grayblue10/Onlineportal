import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const variants = {
  default: 'bg-blue-50 text-blue-700',
  success: 'bg-green-50 text-green-700',
  error: 'bg-red-50 text-red-700',
  warning: 'bg-yellow-50 text-yellow-700',
};

const iconMap = {
  default: <Info className="h-5 w-5" />,
  success: <CheckCircle className="h-5 w-5" />,
  error: <AlertCircle className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
};

/**
 * A reusable alert component for displaying messages with different severity levels
 */
const Alert = ({
  children,
  variant = 'default',
  className = '',
  onDismiss,
  dismissible = false,
  ...props
}) => {
  const baseClasses = 'p-4 rounded-md flex items-start';
  const variantClasses = variants[variant] || variants.default;
  const icon = iconMap[variant] || iconMap.default;

  return (
    <div
      className={twMerge(baseClasses, variantClasses, className)}
      role="alert"
      {...props}
    >
      <div className="flex-shrink-0 mr-3">
        {icon}
      </div>
      <div className="flex-1">
        {children}
      </div>
      {dismissible && (
        <button
          type="button"
          className="ml-4 -mr-1.5 -mt-0.5 p-1 rounded-md hover:bg-opacity-20 hover:bg-current focus:outline-none focus:ring-2 focus:ring-current"
          onClick={onDismiss}
          aria-label="Dismiss"
        >
          <X className="h-5 w-5" />
        </button>
      )}
    </div>
  );
};

Alert.propTypes = {
  /** Alert content */
  children: PropTypes.node.isRequired,
  /** Alert variant */
  variant: PropTypes.oneOf(['default', 'success', 'error', 'warning']),
  /** Additional CSS classes */
  className: PropTypes.string,
  /** Callback when dismiss button is clicked */
  onDismiss: PropTypes.func,
  /** Show dismiss button */
  dismissible: PropTypes.bool,
};

export default Alert;
