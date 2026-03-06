import React, { useEffect, useState, useMemo } from 'react';

const PARTICLE_CONFIGS: Record<string, { colors: string[]; symbols?: string[] }> = {
  'none': { colors: [] },
  'green-dots': { colors: ['#22c55e', '#16a34a', '#86efac'] },
  'dark-smoke': { colors: ['#374151', '#4b5563', '#6b7280'] },
  'golden-sparks': { colors: ['#fbbf24', '#f59e0b', '#fcd34d'] },
  'silver-sparkles': { colors: ['#e0e0e0', '#d1d5db', '#f3f4f6'], symbols: ['✨', '⭐', '💫'] },
  'purple-runes': { colors: ['#9333ea', '#a855f7', '#c084fc'], symbols: ['✨', '🔮', '✦'] },
  'fire': { colors: ['#ef4444', '#f97316', '#fb923c', '#fbbf24'], symbols: ['🔥'] },
  'rainbow': { colors: ['#ef4444', '#f59e0b', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899'], symbols: ['🌈', '✨'] },
  'smoke-embers': { colors: ['#1f2937', '#ef4444', '#f97316'], symbols: ['💨', '🔥'] },
  'golden-rays': { colors: ['#fbbf24', '#f59e0b', '#fcd34d'], symbols: ['✨', '⭐'] },
  'stars': { colors: ['#60a5fa', '#3b82f6', '#93c5fd'], symbols: ['⭐', '✨', '💫'] },
  'cosmic': { colors: ['#a855f7', '#8b5cf6', '#c084fc', '#e879f9', '#fbbf24'], symbols: ['✨', '⭐', '💫', '🌟'] },
};

const CLASS_PARTICLE_TYPES: Record<string, string> = {
  'Kobold': 'none', 'Goblin': 'green-dots', 'Troll': 'dark-smoke', 'Dwarf': 'golden-sparks',
  'Elf': 'silver-sparkles', 'Wizard': 'purple-runes', 'Phoenix': 'fire', 'Unicorn': 'rainbow',
  'Dragon': 'smoke-embers', 'Demigod': 'golden-rays', 'God': 'stars', 'BDFL': 'cosmic',
};

export const AvatarParticles: React.FC<{ charClass: string, level: number, size: number, intensity?: number }> = ({ charClass, level, size, intensity = 100 }) => {
  const [particles, setParticles] = useState<any[]>([]);
  const particleType = CLASS_PARTICLE_TYPES[charClass] || 'none';
  const config = PARTICLE_CONFIGS[particleType] || PARTICLE_CONFIGS['none'];

  useEffect(() => {
    if (config.colors.length === 0 || intensity === 0) {
      setParticles([]);
      return;
    }
    
    // Scale count based on level and intensity setting
    const count = Math.min(Math.floor((level * (intensity / 100)) + 4), 24);
    
    setParticles(Array.from({ length: count }, (_, i) => ({
      id: i, 
      angle: (Math.PI * 2 / count) * i, 
      speed: 0.01 + (Math.random() * 0.02),
      radius: size * 0.6 + (Math.random() * size * 0.2),
      color: config.colors[i % config.colors.length],
      symbol: config.symbols ? config.symbols[i % config.symbols.length] : null,
      oscillation: Math.random() * Math.PI
    })));

    const interval = setInterval(() => {
      setParticles(prev => prev.map(p => ({ 
        ...p, 
        angle: p.angle + p.speed,
        oscillation: p.oscillation + 0.1
      })));
    }, 30);
    return () => clearInterval(interval);
  }, [charClass, level, config, intensity, size]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-0">
      {particles.map(p => (
        <div 
          key={p.id} 
          className="absolute transition-transform duration-300" 
          style={{
            left: '50%', 
            top: '50%',
            transform: `translate(${Math.cos(p.angle) * p.radius}px, ${Math.sin(p.angle) * p.radius + Math.sin(p.oscillation) * 5}px) translate(-50%, -50%)`,
            width: p.symbol ? 'auto' : '4px', 
            height: p.symbol ? 'auto' : '4px',
            backgroundColor: p.symbol ? 'transparent' : p.color,
            boxShadow: p.symbol ? 'none' : `0 0 10px ${p.color}`,
            fontSize: p.symbol ? '${size * 0.25}px' : '0',
            opacity: 0.4 + (Math.sin(p.oscillation) * 0.3)
          }}
        >
          {p.symbol}
        </div>
      ))}
    </div>
  );
};
