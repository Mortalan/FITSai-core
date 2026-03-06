# FELICIA Holographic Avatar - Quick Reference

**Implementation Date:** 2026-01-09
**Status:** ✅ Production Ready
**Build:** index-BHFxek4y.js

---

## What Was Implemented

V.I.K.I.-style 3D holographic avatar using Three.js with:
- Custom holographic shaders (Fresnel glow, scan lines, chromatic aberration)
- 31 personality color mappings
- Interactive mouse tracking (5-15 degree rotation)
- 600-800 glowing particles with additive blending
- State-based animations (idle, listening, speaking, processing, error)
- Anti-strobing smooth transitions
- Transparent background (no black squares)

---

## Key Files

### Production Files (on server 10.0.0.231)
```
/home/felicia/felicia-mvp/frontend/src/components/avatar/HolographicAvatar.tsx
/home/felicia/felicia-mvp/frontend/src/components/avatar/FeliciaAvatar.tsx
/home/felicia/felicia-mvp/frontend/public/avfel1.png (6.5MB)
/home/felicia/felicia-mvp/frontend/dist/index-BHFxek4y.js (built)
```

### Backup/Reference Files (local)
```
/tmp/HolographicAvatar_FINAL_COMPLETE.tsx (latest working version)
/tmp/HolographicAvatar_complete.tsx (original full version)
/tmp/HolographicAvatar_final.tsx
/tmp/HolographicAvatar_fixed.tsx
/tmp/HolographicAvatar_working.tsx
/tmp/FeliciaAvatar_wrapper.tsx
```

---

## Technical Specs

**Framework:** Three.js (WebGL)
**Shader:** Custom ShaderMaterial with GLSL
**Particles:** 600 (default) with THREE.AdditiveBlending
**Texture:** Circuit face PNG (6.5MB) loaded from public folder
**Mouse Tracking:** ±12° horizontal, ±8.4° vertical with 0.05 damping
**Anti-Strobing:** Ref-based state with 0.02 lerp factor
**Performance:** 60fps target, auto-detects mobile

---

## State Behaviors

| State | Glow Intensity | Particle Behavior |
|-------|---------------|-------------------|
| idle | 1.0 | Slow orbital drift |
| listening | 1.8 | Flow inward |
| speaking | 2.2 | Burst outward |
| processing | 1.6 | Fast swirl (4x speed) |
| error | 1.2 | Chaotic jitter + red color |

---

## Personality Colors

**Format:** PERSONALITY_COLORS: Record<string, THREE.Color>

All 31 modes mapped + 'professional' alias for backend compatibility:
- professional / professional_maven: 0x0088FF (Blue)
- sarcastic_sidekick: 0x00FF88 (Cyan-Green)
- pirate: 0xFF8800 (Orange)
- zen_minimalist: 0x8800FF (Purple)
- grumpy: 0xFF0000 (Red)
- ... (see full doc for all 31)

---

## How to Build & Deploy

```bash
# On server 10.0.0.231
ssh root@10.0.0.231
cd /home/felicia/felicia-mvp/frontend
npm run build

# Build output: dist/index-{hash}.js
# Nginx auto-serves from dist/
# Hard refresh browser (Ctrl+Shift+R) to see changes
```

---

## Troubleshooting

### Avatar not showing
- Check browser console for texture load errors
- Verify `/avfel1.png` exists in public folder
- Check WebGL support: visit https://get.webgl.org/

### Colors not visible
- Backend sends 'professional' not 'professional_maven'
- Added alias in PERSONALITY_COLORS to handle both

### Strobing on state changes
- Used refs instead of props to prevent React re-renders
- All transitions use 0.02 lerp factor (very slow)

### Mouse tracking inverted
- Use standard NDC: `((x - left) / width) * 2 - 1`
- Negative Y axis: `-((y - top) / height) * 2 + 1`

### Background not transparent
- Set `premultipliedAlpha: false` in WebGLRenderer
- Set `depthWrite: false` on all materials
- `setClearColor(0x000000, 0)` for full transparency

---

## Integration Points

**Wrapper Usage:**
```typescript
<FeliciaAvatar
  voiceState={voiceState}  // 'idle' | 'listening' | 'speaking' | 'processing' | 'error'
  personalityMode={user?.personality_mode || 'professional'}
  audioData={audioData}  // Currently unused (future voice reactivity)
  onClick={() => startVoiceSession()}
  size="fullscreen"  // 'small' | 'medium' | 'large' | 'fullscreen'
/>
```

**Where Used:**
- `/home/felicia/felicia-mvp/frontend/src/pages/Chat.tsx` (main chat interface)
- Voice state updated via `useVoice` hook
- Personality from user profile

---

## Known Issues

1. **Audio reactivity not implemented** - `audioData` prop exists but not used
2. **No touch tracking** - Only mouse, no mobile gestures
3. **Particle count static** - Not dynamically adjusted by performance

---

## Future Enhancements

1. Voice reactivity: Scale based on audio amplitude
2. Touch gesture support for mobile
3. Additional particle patterns per personality
4. More shader effects (interference, glitch)
5. LOD system for performance

---

## Quick Reference Commands

```bash
# View current implementation
ssh root@10.0.0.231 "cat /home/felicia/felicia-mvp/frontend/src/components/avatar/HolographicAvatar.tsx | head -100"

# Check build status
ssh root@10.0.0.231 "ls -lh /home/felicia/felicia-mvp/frontend/dist/index-*.js"

# Rebuild
ssh root@10.0.0.231 "cd /home/felicia/felicia-mvp/frontend && npm run build"

# Check texture
ssh root@10.0.0.231 "ls -lh /home/felicia/felicia-mvp/frontend/public/avfel1.png"
```

---

## Success Criteria (All Met ✅)

- ✅ All 31 personality colors display correctly
- ✅ Mouse tracking works in all directions (NOT inverted)
- ✅ No strobing during state transitions
- ✅ Particles flow correctly in all states
- ✅ Texture loads successfully
- ✅ Transparent background (no black/checkerboard)
- ✅ Smooth 60fps on target hardware
- ✅ Error state shows red tint
- ✅ Glow intensity changes smoothly between states
- ✅ 50% personality color tinting visible
- ✅ Fresnel edge glow working
- ✅ Scan lines animating

---

**Last Updated:** 2026-01-09
**Build Hash:** BHFxek4y
**Bundle Size:** +300KB (Three.js), ~100KB gzipped
