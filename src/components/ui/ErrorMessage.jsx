import React from 'react';
import { cn } from '../../lib/utils';

/**
 * ErrorMessage component for form validation errors
 * @param {Object} props - Component props
 * @param {string} [props.className] - Additional CSS classes
 * @param {React.ReactNode} props.children - Error message content
 * @returns {JSX.Element} ErrorMessage component
 */
const ErrorMessage = React.forwardRef(({ className, children, ...props }, ref) => {
  if (!children) return null;
  
  return (
    <p
      ref={ref}
      className={cn(
        'mt-1 text-sm text-red-600 dark:text-red-400',
        className
      )}
      role="alert"
      {...props}
    >
      {children}
    </p>
  );
});

ErrorMessage.displayName = 'ErrorMessage';

export { ErrorMessage };
