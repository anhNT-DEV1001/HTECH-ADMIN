"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { AlertTriangle, CircleCheck, CircleX, X } from "lucide-react";
import Modal from "@/common/components/ui/Modal"; // import modal common

interface ConfirmOptions {
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "info";
}

interface ConfirmContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const ConfirmContext = createContext<ConfirmContextType | undefined>(undefined);

export const ConfirmProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [config, setConfig] = useState<
    (ConfirmOptions & { resolve: (val: boolean) => void }) | null
  >(null);

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setConfig({
        title: "Xác nhận",
        message: "Bạn có chắc chắn muốn thực hiện hành động này?",
        confirmLabel: "Xác nhận",
        cancelLabel: "Hủy",
        variant: "danger",
        ...options,
        resolve,
      });
    });
  }, []);

  const handleClose = (value: boolean) => {
    config?.resolve(value);
    setConfig(null);
  };

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      {config && (
        <Modal
          open={!!config}
          title={config.title}
          onClose={() => handleClose(false)}
          footer={
            <>
              <button
                onClick={() => handleClose(false)}
                className="btn btn-outline btn-sm"
              >
                <CircleX size={16} className="text-gray-600" />
                {config.cancelLabel}
              </button>
              <button
                onClick={() => handleClose(true)}
                className={`btn btn-sm ${
                  config.variant === "danger"
                    ? "btn-danger"
                    : "btn-primary"
                }`}
              >
                <CircleCheck size={16} />
                {config.confirmLabel}
              </button>
            </>
          }
        >
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-full ${
                config.variant === "danger"
                  ? "bg-red-100 text-red-600"
                  : "bg-blue-100 text-blue-600"
              }`}
            >
              <AlertTriangle size={24} />
            </div>
            <p className="text-gray-700 leading-relaxed">{config.message}</p>
          </div>
        </Modal>
      )}
    </ConfirmContext.Provider>
  );
};

export const useConfirm = () => {
  const context = useContext(ConfirmContext);
  if (!context)
    throw new Error("useConfirm must be used within ConfirmProvider");
  return context;
};
