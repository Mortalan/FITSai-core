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

  const connect = useCallback(() => {
    // Don't connect if no token or already connected/connecting
    if (!token || wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) {
      return;
    }

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setState('connecting');
    console.log('[WS] Connecting to Momo Voice...');
    
    // Use window.location.hostname if we want to be dynamic, but 10.0.0.231 is hardcoded for now
    const wsUrl = `ws://10.0.0.231:9000/api/v1/voice/ws`;
    const ws = new WebSocket(wsUrl);
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      console.log('[WS] Connected');
      setState('connected');
    };

    ws.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        onBinary(e.data);
      } else {
        try {
          onMessage(JSON.parse(e.data));
        } catch (err) {
          console.error('[WS] Parse error:', err);
        }
      }
    };

    ws.onclose = (e) => {
      console.log('[WS] Closed:', e.code, e.reason);
      setState('disconnected');
      
      // Only reconnect if not closed intentionally
      if (e.code !== 1000 && !reconnectTimerRef.current) {
        reconnectTimerRef.current = window.setTimeout(connect, 5000);
      }
    };

    ws.onerror = (e) => {
      console.error('[WS] Error:', e);
      setState('error');
    };

    wsRef.current = ws;
  }, [token, onMessage, onBinary]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      wsRef.current?.close(1000, 'Unmounting');
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
