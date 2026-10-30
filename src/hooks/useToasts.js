import { useCallback, useRef, useState } from "react";

const DEFAULT_DURATION = 3600;

export function useToasts() {
  const [toasts, setToasts] = useState([]);
  const timers = useRef({});

  const removeToast = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
    clearTimeout(timers.current[id]);
    delete timers.current[id];
  }, []);

  const dismissToast = useCallback(
    (id) => {
      setToasts((list) => list.map((t) => (t.id === id ? { ...t, leaving: true } : t)));
      timers.current[`${id}-exit`] = setTimeout(() => removeToast(id), 240);
    },
    [removeToast],
  );

  const addToast = useCallback(
    (message, options = {}) => {
      const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
      const toast = {
        id,
        message,
        description: options.description ?? "",
        tone: options.tone ?? "success",
        duration: options.duration ?? DEFAULT_DURATION,
        leaving: false,
      };
      setToasts((list) => [...list.slice(-3), toast]);
      timers.current[id] = setTimeout(() => dismissToast(id), toast.duration);
      return id;
    },
    [dismissToast],
  );

  return { toasts, addToast, dismissToast };
}