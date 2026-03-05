import React from 'react';

interface AvatarProps {
  state?: 'idle' | 'thinking' | 'speaking';
  size?: number;
}

export const Avatar: React.FC<AvatarProps> = ({ state = 'idle', size = 40 }) => {
  return (
    <div 
      className={`relative rounded-full overflow-hidden border-2 border-[var(--border)] bg-white dark:bg-black/20 transition-all duration-500 ${
        state === 'thinking' ? 'animate-pulse scale-110 shadow-lg shadow-blue-500/20' : 
        state === 'speaking' ? 'scale-105 border-[var(--accent)] shadow-md' : 'scale-100'
      }`}
      style={{ width: size, height: size }}
    >
      <img 
        src="/assets/avfel2.png" 
        alt="Momo Avatar"
        className={`w-full h-full object-cover transition-transform duration-700 ${
          state === 'speaking' ? 'animate-bounce' : ''
        }`}
      />
      
      {state === 'thinking' && (
        <div className="absolute inset-0 bg-blue-500/10 animate-ping" />
      )}
    </div>
  );
};
