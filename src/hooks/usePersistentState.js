import { useCallback, useEffect, useRef, useState } from "react";

const PREFIX = "salah-shutdown:";

function isPlainObject(v) {
  return v !== null && typeof v === "object" && !Array.isArray(v);
}

/**
 * State that is mirrored into localStorage.
 * Reads happen after mount so server and client render identically (no hydration mismatch).
 */
export function usePersistentState(key, initialValue) {
  const storageKey = `${PREFIX}${key}`;
  const [value, setValue] = useState(initialValue);
  const [hydrated, setHydrated] = useState(false);
  const initialRef = useRef(initialValue);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw != null) {
        const parsed = JSON.parse(raw);
        setValue(
          isPlainObject(initialRef.current) && isPlainObject(parsed)
            ? { ...initialRef.current, ...parsed }
            : parsed,
        );
      }
    } catch {
      /* ignore unreadable storage */
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(value));
    } catch {
      /* ignore quota errors */
    }
  }, [storageKey, value, hydrated]);

  const reset = useCallback(() => setValue(initialRef.current), []);

  return [value, setValue, hydrated, reset];
}
