import React from 'react';
import { PIECE_SYMBOLS } from '@/lib/chess-utils';

interface ChessPieceProps {
  type: string;
  color: 'w' | 'b';
  className?: string;
}

function KingSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 45 45"
      width="0.85em"
      height="0.85em"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Crescent moon (even-odd fill replaces cross) */}
      <g fillRule="evenodd">
        <circle cx="22.5" cy="8" r="6.5" />
        <circle cx="19" cy="6.5" r="5.5" />
      </g>
      {/* Head orb */}
      <circle cx="22.5" cy="17" r="4" />
      {/* Neck */}
      <rect x="19" y="20" width="7" height="3" rx="1" />
      {/* Body */}
      <polygon points="12,41 14,22 31,22 33,41" />
      {/* Step */}
      <rect x="9" y="38" width="27" height="3" rx="1.5" />
      {/* Base */}
      <rect x="6" y="41" width="33" height="3.5" rx="1.75" />
    </svg>
  );
}

function BishopSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 45 45"
      width="0.85em"
      height="0.85em"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      {/* Crescent moon (even-odd fill replaces cross notch) */}
      <g fillRule="evenodd">
        <circle cx="22.5" cy="6" r="5.5" />
        <circle cx="19.5" cy="5" r="4.5" />
      </g>
      {/* Ball */}
      <circle cx="22.5" cy="14.5" r="3.5" />
      {/* Hat/mitre */}
      <polygon points="16.5,28 22.5,12 28.5,28" />
      {/* Collar */}
      <rect x="11" y="27" width="23" height="4" rx="2" />
      {/* Body */}
      <polygon points="11,41 13.5,30 31.5,30 34,41" />
      {/* Step */}
      <rect x="9" y="38" width="27" height="3" rx="1.5" />
      {/* Base */}
      <rect x="6" y="41" width="33" height="3.5" rx="1.75" />
    </svg>
  );
}

export function ChessPiece({ type, color, className }: ChessPieceProps) {
  if (type === 'k') {
    return <KingSvg className={className} />;
  }
  if (type === 'b') {
    return <BishopSvg className={className} />;
  }
  return <span className={className}>{PIECE_SYMBOLS[type][color]}</span>;
}
