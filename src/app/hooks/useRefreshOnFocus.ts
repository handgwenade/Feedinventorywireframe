import { useEffect, useRef } from 'react';

export default function useRefreshOnFocus(callback: () => void, isLoading: boolean) {
  const callbackRef = useRef(callback);
  const lastRefreshRef = useRef(0);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    function runRefresh() {
      if (isLoading) return;
      const now = Date.now();
      if (now - lastRefreshRef.current < 1000) return;
      lastRefreshRef.current = now;
      callbackRef.current();
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        runRefresh();
      }
    }

    function handleWindowFocus() {
      runRefresh();
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, [isLoading]);
}
