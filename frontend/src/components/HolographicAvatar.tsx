import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

interface HolographicAvatarProps {
  state: 'idle' | 'listening' | 'processing' | 'speaking' | 'error';
  size?: number;
  audioData?: Uint8Array | null;
  level?: number;
}

export const HolographicAvatar: React.FC<HolographicAvatarProps> = ({
  state = 'idle',
  size = 400,
  audioData,
  level = 1
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const materialRef = useRef<THREE.ShaderMaterial | null>(null);
  const frameIdRef = useRef<number | undefined>(undefined);
  const stateRef = useRef(state);
  const audioDataRef = useRef<Uint8Array | null | undefined>(audioData);
  const mouseRef = useRef({ x: 0, y: 0 });

  stateRef.current = state;
  audioDataRef.current = audioData;

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(size, size);
    renderer.setClearColor(0x000000, 0);
    rendererRef.current = renderer;
    containerRef.current.appendChild(renderer.domElement);

    const handleMouseMove = (event: MouseEvent) => {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        mouseRef.current.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouseRef.current.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      }
    };
    window.addEventListener('mousemove', handleMouseMove);

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load('/assets/avfel2.png', (texture) => {
      const geometry = new THREE.PlaneGeometry(4.5, 4.5);
      
      // Calculate visual intensity based on level
      const glowBoost = Math.min(level / 50, 1.0) * 0.5;
      
      const material = new THREE.ShaderMaterial({
        uniforms: {
          tDiffuse: { value: texture },
          brightness: { value: 0.95 },
          contrast: { value: 1.1 },
          audioLevel: { value: 0.0 },
          glowIntensity: { value: 0.0 },
          levelBoost: { value: glowBoost },
          time: { value: 0.0 },
        },
        vertexShader: `
          varying vec2 vUv;
          void main() {
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          uniform sampler2D tDiffuse;
          uniform float brightness;
          uniform float contrast;
          uniform float audioLevel;
          uniform float glowIntensity;
          uniform float levelBoost;
          uniform float time;
          varying vec2 vUv;

          void main() {
            vec4 texel = texture2D(tDiffuse, vUv);
            if (texel.a < 0.01) discard;

            vec3 color = texel.rgb * brightness;
            color = (color - 0.5) * contrast + 0.5;

            // Audio reaction
            float pulse = audioLevel * (0.4 + levelBoost);
            color *= (1.0 + pulse);

            // Scan lines (faster and more prominent at higher levels)
            float scanSpeed = 5.0 + (levelBoost * 10.0);
            float scanline = sin(vUv.y * 200.0 + time * scanSpeed) * (0.04 + levelBoost * 0.05);
            color -= scanline;

            // Edge glow (changes color based on level)
            vec2 center = vec2(0.5, 0.5);
            float dist = distance(vUv, center);
            float edgeGlow = smoothstep(0.3, 0.55, dist) * (glowIntensity + levelBoost);
            
            // Shift from Blue to Purple/Gold at higher levels
            vec3 lowLevelColor = vec3(0.1, 0.5, 1.0); // Blue
            vec3 highLevelColor = vec3(1.0, 0.8, 0.2); // Gold
            vec3 glowColor = mix(lowLevelColor, highLevelColor, levelBoost);
            
            color += glowColor * edgeGlow * (0.5 + audioLevel);

            // Cosmic sparkle effect for high levels
            if (levelBoost > 0.3) {
               float sparkle = pow(sin(vUv.x * 50.0 + time) * cos(vUv.y * 50.0 - time), 10.0);
               color += glowColor * sparkle * levelBoost;
            }

            gl_FragColor = vec4(color, texel.a);
          }
        `,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);
      materialRef.current = material;
    });

    let timeValue = 0;
    const animate = () => {
      frameIdRef.current = requestAnimationFrame(animate);
      timeValue += 0.016;

      if (scene.children[0]) {
        scene.children[0].rotation.y = mouseRef.current.x * 0.15;
        scene.children[0].rotation.x = -mouseRef.current.y * 0.1;
      }

      // Calculate audio level
      let currentAudioLevel = 0;
      if (audioDataRef.current) {
        let sum = 0;
        for (let i = 0; i < audioDataRef.current.length; i++) {
          sum += audioDataRef.current[i];
        }
        currentAudioLevel = (sum / audioDataRef.current.length) / 255;
      }

      let targetGlow = 0;
      switch (stateRef.current) {
        case 'listening': targetGlow = 0.8; break;
        case 'speaking': targetGlow = 1.0; break;
        case 'processing': targetGlow = 0.5; break;
        default: targetGlow = 0.1;
      }

      if (materialRef.current) {
        materialRef.current.uniforms.audioLevel.value = currentAudioLevel;
        materialRef.current.uniforms.glowIntensity.value += (targetGlow - materialRef.current.uniforms.glowIntensity.value) * 0.1;
        materialRef.current.uniforms.time.value = timeValue;
      }
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
      if (rendererRef.current && containerRef.current) {
        if (containerRef.current.contains(rendererRef.current.domElement)) {
          containerRef.current.removeChild(rendererRef.current.domElement);
        }
        rendererRef.current.dispose();
      }
    };
  }, [size, level]);

  return <div ref={containerRef} style={{ width: size, height: size, display: 'flex', justifyContent: 'center', alignItems: 'center' }} />;
};
