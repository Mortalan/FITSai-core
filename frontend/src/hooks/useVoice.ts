import { useState, useCallback, useRef, useEffect } from 'react';
import useAudioRecorder from './useAudioRecorder';
import useAudioPlayer from './useAudioPlayer';
import useWebSocket from './useWebSocket';

export type VoiceState = 'idle' | 'listening' | 'processing' | 'speaking';

function useVoice(token: string | null, onMessage: (text: string) => void) {
  const [voiceState, setVoiceState] = useState<VoiceState>('idle');
  const audioChunksRef = useRef<Blob[]>([]);
  const onMessageRef = useRef(onMessage);

  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  const onPlaybackComplete = useCallback(() => {
    setVoiceState('idle');
  }, []);

  const player = useAudioPlayer(onPlaybackComplete);
  // Store player in a ref to stabilize callbacks
  const playerRef = useRef(player);
  useEffect(() => {
    playerRef.current = player;
  });

  const handleWebSocketMessage = useCallback((msg: any) => {
    if (msg.type === 'token') {
      onMessageRef.current(msg.content);
    } else if (msg.type === 'status') {
      if (msg.message.includes('thinking')) setVoiceState('processing');
      if (msg.message.includes('speaking')) setVoiceState('speaking');
    }
  }, []);

  const handleBinaryData = useCallback((data: ArrayBuffer) => {
    playerRef.current.enqueueAudioChunk(data);
  }, []);

  const ws = useWebSocket(token, handleWebSocketMessage, handleBinaryData);

  const onRecorderChunk = useCallback((chunk: Blob) => {
    audioChunksRef.current.push(chunk);
  }, []);

  const recorder = useAudioRecorder(onRecorderChunk);

  const startVoice = useCallback(async () => {
    audioChunksRef.current = [];
    setVoiceState('listening');
    await recorder.startRecording();
  }, [recorder]);

  const stopVoice = useCallback(async () => {
    recorder.stopRecording();
    setVoiceState('processing');

    // Small delay to ensure last chunk is caught
    await new Promise(r => setTimeout(r, 300));

    if (audioChunksRef.current.length > 0) {
      const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64 = (reader.result as string).split(',')[1];
        ws.send({ type: 'audio_chunk', data: base64 });
      };
      reader.readAsDataURL(blob);
    }
  }, [recorder, ws]);

  return {
    voiceState,
    startVoice,
    stopVoice,
    isSupported: recorder.isSupported && player.isSupported,
    audioData: player.audioData
  };
}

export default useVoice;
