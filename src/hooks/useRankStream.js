import { useCallback, useEffect, useRef, useState } from 'react';
import rankService from '../api/rankService';

const DEFAULT_COUNT = 20;
export const STREAM_RECONNECT_DELAY = 5000;

const getNow = () => new Date();

export default function useRankStream({ count = DEFAULT_COUNT } = {}) {
  const [rankings, setRankings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [streamStatus, setStreamStatus] = useState('idle');
  const [lastUpdatedAt, setLastUpdatedAt] = useState(null);

  const eventSourceRef = useRef(null);
  const reconnectTimerRef = useRef(null);

  const fetchSnapshot = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) {
        setIsLoading(true);
      } else {
        setIsRefreshing(true);
      }
      setError(null);

      try {
        const data = await rankService.getRankings({ count });
        setRankings(Array.isArray(data) ? data : []);
        setLastUpdatedAt(getNow());
      } catch (err) {
        setError(err);
      } finally {
        if (!silent) {
          setIsLoading(false);
        } else {
          setIsRefreshing(false);
        }
      }
    },
    [count]
  );

  useEffect(() => {
    fetchSnapshot();
  }, [fetchSnapshot]);

  useEffect(() => {
    if (typeof EventSource === 'undefined') {
      setStreamStatus('unsupported');
      return undefined;
    }

    let isUnmounted = false;

    const clearReconnectTimer = () => {
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
    };

    const closeStream = () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
        eventSourceRef.current = null;
      }
    };

    const scheduleReconnect = () => {
      if (isUnmounted) return;
      clearReconnectTimer();
      reconnectTimerRef.current = setTimeout(() => {
        startStream();
      }, STREAM_RECONNECT_DELAY);
    };

    const handleRankUpdate = (event) => {
      if (isUnmounted) return;
      try {
        JSON.parse(event.data);
      } catch (_) {
        // ignore malformed payloads
      }
      fetchSnapshot({ silent: true });
    };

    const handleInit = () => {
      if (isUnmounted) return;
      setStreamStatus('open');
    };

    function startStream() {
      if (isUnmounted) return;
      clearReconnectTimer();
      closeStream();

      setStreamStatus('connecting');
      const streamUrl = rankService.getStreamUrl();
      const eventSource = new EventSource(streamUrl);
      eventSourceRef.current = eventSource;

      eventSource.onopen = () => {
        if (isUnmounted) return;
        setStreamStatus('open');
      };

      eventSource.addEventListener('INIT', handleInit);
      eventSource.addEventListener('rank-update', handleRankUpdate);

      eventSource.onmessage = (event) => {
        // 일부 서버는 기본 message 타입만 사용하므로 동일하게 처리
        handleRankUpdate(event);
      };

      eventSource.onerror = () => {
        if (isUnmounted) return;
        setStreamStatus('error');
        eventSource.close();
        scheduleReconnect();
      };
    }

    startStream();

    return () => {
      isUnmounted = true;
      clearReconnectTimer();
      closeStream();
    };
  }, [fetchSnapshot]);

  const manualRefresh = useCallback(() => fetchSnapshot(), [fetchSnapshot]);

  return {
    rankings,
    isLoading,
    isRefreshing,
    error,
    lastUpdatedAt,
    streamStatus,
    refresh: manualRefresh,
  };
}
