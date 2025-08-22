import React from 'react';
import Card from './Card';

export default function MobileCardList({ children, className = '' }) {
  return (
    <Card className={`md:hidden ${className}`}>
      {children}
    </Card>
  );
}
