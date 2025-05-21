import { useState, useEffect } from 'react';

interface Toast {
  id: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
}

interface ToastState {
  toasts: Toast[];
}

interface ToastContext {
  toast: (message: string, type: Toast['type'], duration?: number) => void;
}

// 初始状态
const initialState: ToastState = {
  toasts: [],
};

// 简单的Toast钩子
export function useToast(): ToastContext {
  const [state, setState] = useState<ToastState>(initialState);

  useEffect(() => {
    // 自动关闭toast的逻辑
    const timers: number[] = [];

    state.toasts.forEach((toast) => {
      if (toast.duration) {
        const timer = setTimeout(() => {
          setState((prev) => ({
            ...prev,
            toasts: prev.toasts.filter((t) => t.id !== toast.id),
          }));
        }, toast.duration);

        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(clearTimeout);
    };
  }, [state.toasts]);

  // 创建新的toast
  const toast = (message: string, type: Toast['type'] = 'info', duration = 3000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setState((prev) => ({
      ...prev,
      toasts: [...prev.toasts, { id, message, type, duration }],
    }));
  };

  return { toast };
} 