import React from 'react';

export default function useToast(duration = 2200) {
  const [toast, setToast] = React.useState(null);
  const timerRef = React.useRef(null);

  const showToast = React.useCallback((type, message) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast({ type, message });
    timerRef.current = setTimeout(() => {
      setToast(null);
    }, duration);
  }, [duration]);

  const hideToast = React.useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
    setToast(null);
  }, []);

  React.useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  return { toast, showToast, hideToast };
}
