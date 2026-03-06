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
  const connectionInProgressRef = useRef(false);
  
  const onMessageRef = useRef(onMessage);
  const onBinaryRef = useRef(onBinary);

  useEffect(() => {
    onMessageRef.current = onMessage;
    onBinaryRef.current = onBinary;
  }, [onMessage, onBinary]);

  const connect = useCallback(() => {
    // Only connect if we have a token and aren't already connected or connecting
    if (!token || connectionInProgressRef.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    connectionInProgressRef.current = true;
    setState('connecting');
    
    const host = window.location.hostname || '10.0.0.231';
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${host}:9000/api/v1/voice/ws?token=${token}`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;
    ws.binaryType = 'arraybuffer';

    ws.onopen = () => {
      console.log('[WS] Voice Engine Ready');
      setState('connected');
      connectionInProgressRef.current = false;
    };

    ws.onmessage = (e) => {
      if (e.data instanceof ArrayBuffer) {
        onBinaryRef.current(e.data);
      } else {
        try {
          onMessageRef.current(JSON.parse(e.data));
        } catch (err) {
          // Quiet parse error for keep-alives
        }
      }
    };

    ws.onclose = (e) => {
      // code 1000 is a clean close (unmounting)
      if (e.code !== 1000) {
        console.log('[WS] Connection Closed:', e.code);
        setState('disconnected');
        // Exponential backoff or simple delay
        if (!reconnectTimerRef.current) {
          reconnectTimerRef.current = window.setTimeout(() => {
            connectionInProgressRef.current = false;
            connect();
          }, 5000);
        }
      }
      connectionInProgressRef.current = false;
    };

    ws.onerror = () => {
      // Don't log error if we're just unmounting
      if (wsRef.current?.readyState !== WebSocket.CLOSED) {
        setState('error');
      }
      connectionInProgressRef.current = false;
    };
  }, [token]);

  useEffect(() => {
    // Small delay to let React finishes its double-mount dance in Dev mode
    const timer = setTimeout(connect, 100);
    return () => {
      clearTimeout(timer);
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        const socket = wsRef.current;
        wsRef.current = null;
        socket.onclose = null; // Prevent onclose firing during cleanup
        socket.onerror = null;
        socket.close(1000);
      }
      connectionInProgressRef.current = false;
    };
  }, [connect]);

  const send = useCallback((data: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  return { state, send, isConnected: state === 'connected' };
}

export default useWebSocket;
