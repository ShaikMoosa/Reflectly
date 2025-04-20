'use client';

import React from 'react';
import SimpleWhiteboard from './SimpleWhiteboard';

interface CustomWhiteboardProps {
  userId?: string;
}

const CustomWhiteboard: React.FC<CustomWhiteboardProps> = ({ userId }) => {
  return <SimpleWhiteboard userId={userId} />;
};

export default CustomWhiteboard; 