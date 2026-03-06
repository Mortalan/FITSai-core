import { useEffect, useRef, useState, useCallback } from 'react';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

function useWebSocket(
  token: string | null,
  onMessage: (msg: any) => void,
  onBinary: (data: ArrayBuffer) => void
) {
  const [state, setState] = useState<ConnectionState>('disconnected');
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<number | null>(null);
  
  // Use refs for callbacks to prevent reconnection when they change
  const onMessageRef = useRef(onMessage);
  const onBinaryRef = useRef(onBinary);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onBinaryRef.current = onBinary;
  }, [onMessage, onBinary]);

  const connect = useCallback(() => {
    if (!token || wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setState('connecting');
    console.log('[WS] Connecting to Momo Voice...');
    
    const host = window.location.hostname || '10.0.0.231';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${host}:9000/api/v1/voice/ws`;
    
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      console.log('[WS] Connected');
      setState('connected');
    };

    ws.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        onBinaryRef.current(e.data);
      } else {
        try {
          onMessageRef.current(JSON.parse(e.data));
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      }
    };

    ws.onclose = (e) => {
      console.log('[WS] Closed:', e.code, e.reason);
      setState('disconnected');
      if (e.code !== 1000 && !reconnectTimerRef.current) {
        reconnectTimerRef.current = window.setTimeout(connect, 5000);
      }
    };

    ws.onerror = (e) => {
      console.error('[WS] Error:', e);
      setState('error');
    };

    wsRef.current = ws;
  }, [token]); // Removed onMessage/onBinary from dependencies

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        console.log('[WS] Cleaning up connection');
        wsRef.current.close(1000, 'Unmounting');
        wsRef.current = null;
      }
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    } else {
      console.warn('[WS] Cannot send, socket not open');
    }
  }, []);

  return { state, send, isConnected: state === 'connected' };
}

export default useWebSocket;
