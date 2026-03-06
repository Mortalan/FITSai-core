import React from 'react';
import { useAuthStore } from '../store/authStore';
import { AvatarParticles } from './AvatarParticles';
import { ChampionFrame } from './ChampionFrame';

export const Avatar: React.FC<{ state?: 'idle' | 'thinking' | 'speaking', size?: number, userOverride?: any }> = ({ state = 'idle', size = 40, userOverride }) => {
  const authUser = useAuthStore((state) => state.user);
  const user = userOverride || authUser;
  
  const customEmoji = user?.special_effects?.emoji;
  const customColor = user?.special_effects?.color || 'var(--accent)';
  const bgEffect = user?.avatar_customization?.background || 'none';
  const charClass = user?.character_class || 'Kobold';
  const level = user?.character_level || 1;

  const bgStyles: Record<string, string> = {
    'glow': 'shadow-[0_0_20px_rgba(59,130,246,0.5)]',
    'border': 'border-double border-4 border-blue-500',
    'cosmic': 'shadow-[0_0_30px_rgba(168,85,247,0.6)] animate-pulse',
    'none': ''
  };

  const content = (
    <div 
      className={`relative rounded-full overflow-hidden border-2 transition-all duration-500 flex items-center justify-center ${bgStyles[bgEffect]} ${
        state === 'thinking' ? 'scale-110' : state === 'speaking' ? 'scale-105' : 'scale-100'
      }`}
      style={{ width: size, height: size, borderColor: customColor, backgroundColor: `${customColor}10` }}
    >
      <AvatarParticles charClass={charClass} level={level} size={size} />
      {customEmoji ? <span style={{ fontSize: size * 0.6 }} className="z-10">{customEmoji}</span> : <img src={`/avatars/${charClass.toLowerCase()}.png`} onError={(e) => { e.currentTarget.src = '/assets/avfel2.png'; }} className={`w-full h-full object-cover z-10 ${state === 'speaking' ? 'animate-bounce' : ''}`} />}
      {state === 'thinking' && <div className="absolute inset-0 bg-blue-500/10 animate-ping z-0" />}
    </div>
  );

  if (level >= 45) return <ChampionFrame size={size}>{content}</ChampionFrame>;
  return content;
};
