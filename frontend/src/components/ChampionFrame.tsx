import React from 'react';

export const ChampionFrame: React.FC<{ size: number, children: React.ReactNode }> = ({ size, children }) => {
  return (
    <div className="relative inline-block">
      <div className="absolute -inset-1.5 rounded-full pointer-events-none z-10 animate-spin-slow"
        style={{
          background: 'conic-gradient(from 0deg, #fbbf24, #f59e0b, #fbbf24, #d97706, #fbbf24)',
          mask: 'radial-gradient(transparent 65%, black 66%)',
          WebkitMask: 'radial-gradient(transparent 65%, black 66%)'
        }}
      />
      <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-20 drop-shadow-md text-lg">👑</div>
      <div className="relative z-0">{children}</div>
    </div>
  );
};
