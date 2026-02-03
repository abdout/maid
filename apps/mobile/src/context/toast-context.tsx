import React, { createContext, useContext, useState, useCallback, useRef, ReactNode } from 'react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastConfig {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration: number;
}

interface ToastContextValue {
  toasts: ToastConfig[];
  showToast: (config: Omit<ToastConfig, 'id'>) => void;
  hideToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const MAX_TOASTS = 3;
const DEFAULT_DURATION = 4000;

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastConfig[]>([]);
  const toastIdRef = useRef(0);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const hideToast = useCallback((id: string) => {
    // Clear any existing timeout
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback((config: Omit<ToastConfig, 'id'>) => {
    const id = `toast-${++toastIdRef.current}`;
    const duration = config.duration ?? DEFAULT_DURATION;

    const newToast: ToastConfig = {
      ...config,
      id,
      duration,
    };

    setToasts((prev) => {
      // Remove oldest toasts if we exceed max
      const updated = [...prev, newToast];
      if (updated.length > MAX_TOASTS) {
        const toRemove = updated.slice(0, updated.length - MAX_TOASTS);
        toRemove.forEach((t) => {
          const timeout = timeoutsRef.current.get(t.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(t.id);
          }
        });
        return updated.slice(-MAX_TOASTS);
      }
      return updated;
    });

    // Auto-dismiss if duration > 0
    if (duration > 0) {
      const timeout = setTimeout(() => {
        hideToast(id);
      }, duration);
      timeoutsRef.current.set(id, timeout);
    }
  }, [hideToast]);

  const success = useCallback((message: string, title?: string) => {
    showToast({ type: 'success', message, title, duration: DEFAULT_DURATION });
  }, [showToast]);

  const error = useCallback((message: string, title?: string) => {
    showToast({ type: 'error', message, title, duration: DEFAULT_DURATION });
  }, [showToast]);

  const warning = useCallback((message: string, title?: string) => {
    showToast({ type: 'warning', message, title, duration: DEFAULT_DURATION });
  }, [showToast]);

  const info = useCallback((message: string, title?: string) => {
    showToast({ type: 'info', message, title, duration: DEFAULT_DURATION });
  }, [showToast]);

  const value: ToastContextValue = {
    toasts,
    showToast,
    hideToast,
    success,
    error,
    warning,
    info,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}
