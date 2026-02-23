"use client";
import React, {
  createContext,
  useContext,
  useState,
  useCallback,
} from "react";
import { AlertTriangle, CircleCheck, CircleX, Info, X } from "lucide-react";
import {DraggableModal} from "@/common/components/ui/Modal"; // import modal common
import { Button } from "@/components/ui/button"; // use shadcn button for actions

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
        <DraggableModal
          open={!!config}
          title={config.title}
          onClose={() => handleClose(false)}
          footer={
            <>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleClose(false)}
              >
                <CircleX size={16} className="text-gray-600" />
                {config.cancelLabel}
              </Button>
              <Button
                size="sm"
                variant={config.variant === "danger" ? "destructive" : "default"}
                onClick={() => handleClose(true)}
              >
                <CircleCheck size={16} />
                {config.confirmLabel}
              </Button>
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
              {config.variant === "danger" ?
                (<AlertTriangle size={24} />) :
                (<Info size={24} />)
              }
            </div>
            <p className="text-gray-700 leading-relaxed">{config.message}</p>
          </div>
        </DraggableModal>
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
