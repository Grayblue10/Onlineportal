import React from 'react';
import Card from './Card';

export default function ResponsiveTable({ children, className = '', containerClassName = '' }) {
  return (
    <Card className={`hidden md:block ${className}`}>
      <div className={`overflow-x-auto ${containerClassName}`}>
        {children}
      </div>
    </Card>
  );
}
