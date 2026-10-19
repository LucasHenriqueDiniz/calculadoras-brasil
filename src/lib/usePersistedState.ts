import { useEffect, useLayoutEffect, useState } from "react";

/** The stored value under `key`, or `defaultValue` when there is none or it cannot be read. */
export function readPersistedValue<T>(key: string, defaultValue: T): T {
  if (typeof window === "undefined") return defaultValue;

  try {
    const stored = window.localStorage.getItem(key);
    return stored ? (JSON.parse(stored) as T) : defaultValue;
  } catch {
    return defaultValue;
  }
}

/**
 * State mirrored to localStorage under `key`.
 *
 * The first render always uses `defaultValue`, because that is what the server rendered and the
 * hydration render has to match it. The stored value replaces it in a layout effect, before the
 * browser paints. `isRestored` turns true in that same update: an effect that reads this state
 * should wait for it, or it runs once with the defaults first.
 */
export function usePersistedState<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(defaultValue);
  const [isRestored, setIsRestored] = useState(false);

  useLayoutEffect(() => {
    setValue(readPersistedValue(key, defaultValue));
    setIsRestored(true);
    // Only the key decides what to read; a new defaultValue object every render must not re-read.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  useEffect(() => {
    // Writing before the restore would replace the stored value with the default.
    if (!isRestored) return;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* localStorage may be unavailable in private mode or restricted contexts */
    }
  }, [key, value, isRestored]);

  return [value, setValue, isRestored] as const;
}
