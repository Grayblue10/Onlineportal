import React from 'react';
import PropTypes from 'prop-types';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable card component with header and footer sections
 */
const Card = ({
  children,
  title,
  subtitle,
  header,
  footer,
  className = '',
  headerClassName = '',
  bodyClassName = '',
  footerClassName = '',
  hoverEffect = false,
  ...props
}) => {
  // Base card classes
  const cardClasses = 'bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200';
  
  // Hover effect
  const hoverClasses = hoverEffect ? 'transition-shadow duration-200 hover:shadow-md' : '';
  
  // Header classes
  const headerBaseClasses = 'px-4 py-5 sm:px-6';
  
  // Body classes
  const bodyBaseClasses = 'px-4 py-5 sm:p-6';
  
  // Footer classes
  const footerBaseClasses = 'px-4 py-4 sm:px-6';

  return (
    <div 
      className={twMerge(cardClasses, hoverClasses, className)} 
      {...props}
    >
      {(title || subtitle || header) && (
        <div className={twMerge(headerBaseClasses, headerClassName)}>
          {header || (
            <>
              {title && (
                <h3 className="text-lg font-medium leading-6 text-gray-900">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {subtitle}
                </p>
              )}
            </>
          )}
        </div>
      )}
      
      <div className={twMerge(bodyBaseClasses, bodyClassName)}>
        {children}
      </div>
      
      {footer && (
        <div className={twMerge(footerBaseClasses, footerClassName, 'bg-gray-50')}>
          {footer}
        </div>
      )}
    </div>
  );
};

Card.propTypes = {
  /** Card content */
  children: PropTypes.node,
  /** Card title */
  title: PropTypes.string,
  /** Card subtitle */
  subtitle: PropTypes.string,
  /** Custom header content (overrides title and subtitle) */
  header: PropTypes.node,
  /** Footer content */
  footer: PropTypes.node,
  /** Additional CSS classes for the card */
  className: PropTypes.string,
  /** Additional CSS classes for the header */
  headerClassName: PropTypes.string,
  /** Additional CSS classes for the body */
  bodyClassName: PropTypes.string,
  /** Additional CSS classes for the footer */
  footerClassName: PropTypes.string,
  /** Whether to show hover effect */
  hoverEffect: PropTypes.bool,
};

export default Card;
