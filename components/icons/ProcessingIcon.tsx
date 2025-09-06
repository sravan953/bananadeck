import React from 'react';

export const ProcessingIcon: React.FC<{ className?: string }> = ({ className = 'w-24 h-24' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    viewBox="0 0 100 100"
  >
    <defs>
      <radialGradient id="processing-gradient" cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
        <stop offset="0%" style={{ stopColor: '#38bdf8', stopOpacity: 1 }} />
        <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 1 }} />
      </radialGradient>
    </defs>
    {/* Central Circle */}
    <circle cx="50" cy="50" r="16" fill="url(#processing-gradient)" />
    <circle cx="50" cy="50" r="20" fill="none" stroke="#38bdf8" strokeWidth="1" />
    <circle cx="50" cy="50" r="22" fill="none" stroke="#38bdf8" strokeOpacity="0.5" strokeWidth="0.5" />
    
    {/* Circuit lines and dots */}
    <g stroke="#f97316" strokeWidth="0.75">
      {[...Array(12)].map((_, i) => {
        const angle = (i * 30) * Math.PI / 180;
        const x1 = 50 + 22 * Math.cos(angle);
        const y1 = 50 + 22 * Math.sin(angle);
        const x2 = 50 + 28 * Math.cos(angle);
        const y2 = 50 + 28 * Math.sin(angle);
        return <line key={`line-${i}`} x1={x1} y1={y1} x2={x2} y2={y2} />;
      })}
    </g>
    
    {/* Data squares */}
    <g fill="#f97316">
        <rect x="48" y="20" width="4" height="4" rx="1" />
        <rect x="65" y="28" width="4" height="4" rx="1" />
        <rect x="75" y="48" width="4" height="4" rx="1" />
        <rect x="65" y="68" width="4" height="4" rx="1" />
        <rect x="48" y="76" width="4" height="4" rx="1" />
        <rect x="31" y="68" width="4" height="4" rx="1" />
        <rect x="21" y="48" width="4" height="4" rx="1" />
        <rect x="31" y="28" width="4" height="4" rx="1" />
    </g>

    {/* Connecting lines */}
     <g stroke="#f97316" strokeOpacity="0.5" strokeWidth="0.5">
        <path d="M 33 30 L 47 47" />
        <path d="M 67 30 L 53 47" />
        <path d="M 77 50 L 53 50" />
        <path d="M 67 70 L 53 53" />
        <path d="M 33 70 L 47 53" />
        <path d="M 23 50 L 47 50" />
     </g>
  </svg>
);
