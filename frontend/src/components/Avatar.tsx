import React from 'react';
import { useAuthStore } from '../store/authStore';
import { AvatarParticles } from './AvatarParticles';
import { ChampionFrame } from './ChampionFrame';

interface AvatarProps {
  state?: 'idle' | 'thinking' | 'speaking';
  size?: number;
  userOverride?: any;
}

export const Avatar: React.FC<AvatarProps> = ({ state = 'idle', size = 40, userOverride }) => {
  const authUser = useAuthStore((state) => state.user);
  const user = userOverride || authUser;
  
  const customEmoji = user?.special_effects?.emoji;
  const customColor = user?.special_effects?.color || 'var(--accent)';
  const charClass = user?.character_class || 'Kobold';
  const level = user?.character_level || 1;

  const content = (
    <div 
      className={`relative rounded-full overflow-hidden border-2 transition-all duration-500 flex items-center justify-center ${
        state === 'thinking' ? 'scale-110 shadow-lg shadow-blue-500/20' : 
        state === 'speaking' ? 'scale-105 shadow-md' : 'scale-100'
      }`}
      style={{ 
        width: size, 
        height: size, 
        borderColor: customColor,
        backgroundColor: `${customColor}10` 
      }}
    >
      <AvatarParticles charClass={charClass} level={level} size={size} />
      
      {customEmoji ? (
        <span style={{ fontSize: size * 0.6 }} className="z-10">{customEmoji}</span>
      ) : (
        <img 
          src="/assets/avfel2.png" 
          alt="Momo Avatar"
          className={`w-full h-full object-cover transition-transform duration-700 z-10 ${
            state === 'speaking' ? 'animate-bounce' : ''
          }`}
        />
      )}
      
      {state === 'thinking' && (
        <div className="absolute inset-0 bg-blue-500/10 animate-ping z-0" />
      )}
    </div>
  );

  if (level >= 45) {
    return <ChampionFrame size={size}>{content}</ChampionFrame>;
  }

  return content;
};
