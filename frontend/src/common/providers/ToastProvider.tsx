"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useState,
  useEffect,
} from "react";
import { AlertCircle, CheckCircle2, X } from "lucide-react";

// --- Types ---
type ToastType = "success" | "error";

interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

interface ToastContextType {
  showToast: (message: string, type: ToastType, duration?: number) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

// --- Provider Component ---
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    (message: string, type: ToastType, duration = 3000) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, message, type, duration }]);
    },
    [],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Container chứa các Toast - Fix: bg-transparent để không che nội dung */}
      <div className="fixed top-4 right-4 z-9999 flex flex-col gap-3 pointer-events-none">
        {toasts.map((toast) => (
          <ToastItem
            key={toast.id}
            {...toast}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

const ToastItem = ({
  message,
  type,
  duration = 3000,
  onClose,
}: Toast & { onClose: () => void }) => {
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    const step = 10;
    const totalSteps = duration / step;
    const decrement = 100 / totalSteps;

    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, step);

    const autoClose = setTimeout(onClose, duration);

    return () => {
      clearInterval(timer);
      clearTimeout(autoClose);
    };
  }, [duration, onClose]);

  const config = {
    success: {
      Icon: CheckCircle2,
      color: "text-green-500",
      bg: "bg-green-50 dark:bg-green-900/30",
      border: "border-green-500",
      progressBg: "bg-green-500",
    },
    error: {
      Icon: AlertCircle,
      color: "text-red-500",
      bg: "bg-red-50 dark:bg-red-900/30",
      border: "border-red-500",
      progressBg: "bg-red-500",
    },
  };

  const { Icon, color, bg, border, progressBg } = config[type];

  return (
    <div
      className={`
        pointer-events-auto relative overflow-hidden
        flex items-center w-80 p-4 bg-white dark:bg-gray-800
        rounded-lg shadow-lg border-l-4 ${border} ${bg}
        animate-in slide-in-from-right duration-300
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`shrink-0 ${color}`}>
        <Icon size={20} strokeWidth={2.5} />
      </div>

      {/* Message */}
      <div className="ml-3 text-sm font-medium text-gray-800 dark:text-gray-200">
        {message}
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
      >
        <X size={18} />
      </button>

      {/* Progress Bar - Chạy ở dưới đáy toast */}
      <div className="absolute bottom-0 left-0 h-1 w-full bg-gray-200 dark:bg-gray-700">
        <div
          className={`h-full ${progressBg} transition-all linear`}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};
