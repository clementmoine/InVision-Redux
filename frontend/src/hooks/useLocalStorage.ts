import { useState, useEffect, useCallback } from 'react';

interface CustomStorageEventDetail {
  key: string;
  value: string;
}

class CustomStorageEvent extends CustomEvent<CustomStorageEventDetail> {
  constructor(key: string, value: string) {
    super('localStorageChange', { detail: { key, value } });
  }
}

export type LocalStorageAPI = {
  getItem: (name?: string) => string | null;
  setItem: (name: string, value: string) => void;
  onChange: (callback: (key: string, value: string) => void) => void;
};

const useLocalStorage = (key: string): LocalStorageAPI => {
  const [_, setValue] = useState(() => localStorage.getItem(key));

  const setItem = useCallback(
    (_: string, newValue: string) => {
      localStorage.setItem(key, newValue);
      setValue(newValue);

      window.dispatchEvent(new CustomStorageEvent(key, newValue));
    },
    [key],
  );

  const getItem = useCallback(
    (_?: string) => {
      return localStorage.getItem(key);
    },
    [key],
  );

  const onChange = useCallback(
    (callback: (key: string, value: string) => void) => {
      const handleStorageChange = (event: Event) => {
        if (event instanceof CustomStorageEvent) {
          const { key: eventKey, value } = event.detail;
          if (eventKey === key) {
            callback(eventKey, value);
          }
        }
      };

      window.addEventListener(
        'localStorageChange',
        handleStorageChange as EventListener,
      );

      // Cleanup
      return () => {
        window.removeEventListener(
          'localStorageChange',
          handleStorageChange as EventListener,
        );
      };
    },
    [key],
  );

  useEffect(() => {
    return () => {
      window.removeEventListener('localStorageChange', () => {});
    };
  }, []);

  return { getItem, setItem, onChange };
};

export default useLocalStorage;
