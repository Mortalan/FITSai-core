import { useEffect, useRef, useState, useCallback } from 'react';

interface AudioRecorderState {
  isRecording: boolean;
  isSupported: boolean;
  error: Error | null;
}

type AudioChunkCallback = (chunk: Blob) => void;

function useAudioRecorder(onChunk: AudioChunkCallback) {
  const [state, setState] = useState<AudioRecorderState>({
    isRecording: false,
    isSupported: false,
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const isSupported = typeof navigator !== 'undefined' && !!(navigator.mediaDevices?.getUserMedia);
    setState((prev) => ({ ...prev, isSupported }));
  }, []);

  const startRecording = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, error: null }));
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) onChunk(event.data);
      };

      mediaRecorder.start(100);
      setState((prev) => ({ ...prev, isRecording: true }));
    } catch (err: any) {
      setState((prev) => ({ ...prev, error: err, isRecording: false }));
    }
  }, [onChunk]);

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      setState((prev) => ({ ...prev, isRecording: false }));
    }
  }, [state.isRecording]);

  return { ...state, startRecording, stopRecording };
}

export default useAudioRecorder;
