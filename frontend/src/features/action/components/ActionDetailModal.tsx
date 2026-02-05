import { X, Save, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";

interface ActionDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: { action: string }) => void;
  loading: boolean;
  title?: string;
}

interface ActionForm {
  action: string;
}

export default function ActionDetailModal({
  isOpen,
  onClose,
  onSave,
  loading,
  title = "Thêm thao tác",
}: ActionDetailModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ActionForm>();

  useEffect(() => {
    if (isOpen) {
      reset();
    }
  }, [isOpen, reset]);

  if (!isOpen) return null;

  const onSubmit = (data: ActionForm) => {
    onSave(data);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
      <div 
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 transform transition-all scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-center justify-between px-6 py-4 border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-full hover:bg-gray-100"
          >
            <X size={20} />
          </button>
        </header>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <label 
                  htmlFor="action-name" 
                  className="text-sm font-medium text-gray-700"
                >
                  Tên thao tác <span className="text-red-500">*</span>
                </label>
                <input
                  id="action-name"
                  type="text"
                  placeholder="Nhập tên thao tác"
                  className={`
                    w-full px-4 py-2 border rounded-lg outline-none transition-all
                    ${errors.action 
                      ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
                      : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    }
                  `}
                  autoFocus
                  {...register("action", {
                    required: "Tên thao tác không được để trống",
                    minLength: {
                        value: 2,
                        message: "Tên thao tác phải có ít nhất 2 ký tự"
                    }
                  })}
                />
                {errors.action && (
                  <span className="text-sm text-red-500">
                    {errors.action.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <footer className="flex items-center justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-lg border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
              disabled={loading}
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all focus:ring-4 focus:ring-blue-500/20 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Lưu lại</span>
                </>
              )}
            </button>
          </footer>
        </form>
      </div>
    </div>
  );
}
