import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import { twMerge } from 'tailwind-merge';

/**
 * A reusable modal component
 */
const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  className = '',
  overlayClassName = '',
  contentClassName = '',
  hideCloseButton = false,
}) => {
  // Close modal when pressing Escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scrolling
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl',
    xl: 'max-w-6xl',
    full: 'max-w-full m-4',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className={twMerge(
          'fixed inset-0 bg-black bg-opacity-50 transition-opacity',
          overlayClassName
        )}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal container */}
      <div className="flex items-center justify-center min-h-screen p-4 text-center">
        <div 
          className={twMerge(
            'inline-block w-full bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all',
            sizeClasses[size],
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-lg font-medium text-gray-900">
              {title}
            </h3>
            
            {!hideCloseButton && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                onClick={onClose}
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Content */}
          <div className={twMerge('p-6', contentClassName)}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

Modal.propTypes = {
  /** Whether the modal is open */
  isOpen: PropTypes.bool.isRequired,
  /** Function to call when modal is closed */
  onClose: PropTypes.func.isRequired,
  /** Modal title */
  title: PropTypes.string.isRequired,
  /** Modal content */
  children: PropTypes.node.isRequired,
  /** Size of the modal */
  size: PropTypes.oneOf(['sm', 'md', 'lg', 'xl', 'full']),
  /** Additional CSS classes for the modal */
  className: PropTypes.string,
  /** Additional CSS classes for the overlay */
  overlayClassName: PropTypes.string,
  /** Additional CSS classes for the content area */
  contentClassName: PropTypes.string,
  /** Whether to hide the close button */
  hideCloseButton: PropTypes.bool,
};

export default Modal;
