import React from 'react';

export const PresentationIcon: React.FC<{ className?: string }> = ({ className = 'w-16 h-16' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 64 64"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <rect x="4" y="8" width="56" height="36" rx="2" ry="2"></rect>
    <line x1="20" y1="52" x2="44" y2="52"></line>
    <line x1="32" y1="44" x2="32" y2="52"></line>
    <rect x="12" y="16" width="12" height="8"></rect>
    <rect x="28" y="16" width="12" height="8"></rect>
    <rect x="12" y="28" width="12" height="8"></rect>
    <rect x="28" y="28" width="12" height="8"></rect>
  </svg>
);
