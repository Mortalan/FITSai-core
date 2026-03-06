import React from 'react';
import { useAuthStore } from '../store/authStore';
import { AvatarParticles } from './AvatarParticles';
import { ChampionFrame } from './ChampionFrame';

export const Avatar: React.FC<{ state?: 'idle' | 'thinking' | 'speaking', size?: number, userOverride?: any }> = ({ state = 'idle', size = 40, userOverride }) => {
  const authUser = useAuthStore((state) => state.user);
  const user = userOverride || authUser;
  
  const customEmoji = user?.special_effects?.emoji;
  const customColor = user?.special_effects?.color || '#3b82f6';
  const bgEffect = user?.avatar_customization?.background || 'none';
  const charClass = user?.character_class || 'Kobold';
  const level = user?.character_level || 1;
  const particleIntensity = user?.avatar_customization?.particleIntensity || 100;

  // Fixed layering: Background effects should be SHADOWS or low z-index containers
  const bgStyles: Record<string, string> = {
    'glow': 'shadow-[0_0_30px_rgba(59,130,246,0.4)]',
    'border': 'border-4 border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.3)]',
    'cosmic': 'shadow-[0_0_40px_rgba(168,85,247,0.5)] animate-pulse',
    'none': ''
  };

  const content = (
    <div 
      className={`relative rounded-full transition-all duration-500 flex items-center justify-center ${bgStyles[bgEffect]} ${
        state === 'thinking' ? 'scale-110' : state === 'speaking' ? 'scale-105' : 'scale-100'
      }`}
      style={{ 
        width: size, 
        height: size, 
        borderColor: customColor, 
        backgroundColor: `${customColor}10`,
        borderWidth: bgEffect === 'border' ? '0' : '2px' // Let the class handle the border if specific
      }}
    >
      {/* 1. Background Aura (Lowest Layer) */}
      {bgEffect === 'cosmic' && (
        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-purple-500/20 to-blue-500/20 animate-spin-slow" />
      )}

      {/* 2. Particles (Middle Layer - behind image) */}
      {particleIntensity > 0 && (
        <div className="absolute inset-0 overflow-visible">
          <AvatarParticles charClass={charClass} level={level} size={size} intensity={particleIntensity} />
        </div>
      )}

      {/* 3. Main Visual (Top Layer) */}
      <div className="relative z-10 w-full h-full rounded-full overflow-hidden flex items-center justify-center">
        {customEmoji ? (
          <span style={{ fontSize: size * 0.6 }} className="z-10 select-none">{customEmoji}</span>
        ) : (
          <img 
            src={`/avatars/${charClass.toLowerCase()}.png`} 
            onError={(e) => { e.currentTarget.src = '/assets/avfel2.png'; }} 
            className={`w-full h-full object-contain pointer-events-none ${state === 'speaking' ? 'animate-bounce' : ''}`} 
            alt="Avatar"
          />
        )}
      </div>

      {/* 4. Thinking Overlay (Topmost) */}
      {state === 'thinking' && (
        <div className="absolute inset-0 bg-blue-500/10 animate-ping z-20 rounded-full" />
      )}
    </div>
  );

  if (level >= 45) return <ChampionFrame size={size}>{content}</ChampionFrame>;
  return content;
};
