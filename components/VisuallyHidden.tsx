import React from 'react';

interface VisuallyHiddenProps {
  children: React.ReactNode;
  className?: string;
}

/**
 * A component that visually hides its children while keeping them accessible to screen readers.
 */
export const VisuallyHidden: React.FC<VisuallyHiddenProps> = ({ children, className = '' }) => {
  return (
    <span className={`visually-hidden ${className}`}>
      {children}
    </span>
  );
};
