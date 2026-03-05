import { useEffect, useRef, useState, useCallback } from 'react';

interface PlaybackState {
  isPlaying: boolean;
  isSupported: boolean;
  error: Error | null;
  audioData: Uint8Array | null;
}

function useAudioPlayer(onPlaybackComplete?: () => void) {
  const [state, setState] = useState<PlaybackState>({
    isPlaying: false,
    isSupported: false,
    error: null,
    audioData: null,
  });

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const animationFrameRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    const isSupported = typeof window !== 'undefined' && !!(window.AudioContext || (window as any).webkitAudioContext);
    setState((prev) => ({ ...prev, isSupported }));

    if (isSupported && !audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      analyserRef.current = audioContextRef.current.createAnalyser();
      analyserRef.current.fftSize = 128;
      analyserRef.current.connect(audioContextRef.current.destination);
    }

    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  const updateVisualization = useCallback(() => {
    if (!analyserRef.current || !isPlayingRef.current) {
      setState((prev) => ({ ...prev, audioData: null }));
      return;
    }
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);
    setState((prev) => ({ ...prev, audioData: dataArray }));
    animationFrameRef.current = requestAnimationFrame(updateVisualization);
  }, []);

  const playNextChunk = useCallback(() => {
    if (!audioContextRef.current || audioQueueRef.current.length === 0) {
      isPlayingRef.current = false;
      setState((prev) => ({ ...prev, isPlaying: false, audioData: null }));
      onPlaybackComplete?.();
      return;
    }

    const buffer = audioQueueRef.current.shift();
    if (!buffer) return;

    audioContextRef.current.decodeAudioData(buffer, (decoded) => {
      if (!audioContextRef.current || !analyserRef.current) return;
      const source = audioContextRef.current.createBufferSource();
      source.buffer = decoded;
      source.connect(analyserRef.current);
      source.onended = playNextChunk;
      
      isPlayingRef.current = true;
      setState((prev) => ({ ...prev, isPlaying: true }));
      updateVisualization();
      source.start(0);
    });
  }, [updateVisualization, onPlaybackComplete]);

  const enqueueAudioChunk = useCallback((buffer: ArrayBuffer) => {
    audioQueueRef.current.push(buffer);
    if (!isPlayingRef.current) playNextChunk();
  }, [playNextChunk]);

  return { ...state, enqueueAudioChunk };
}

export default useAudioPlayer;
