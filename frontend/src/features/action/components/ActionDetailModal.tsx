"use client";

import { Save, Loader2 } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import Modal from "@/common/components/ui/Modal"; 

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
    if (isOpen) reset();
  }, [isOpen, reset]);

  const onSubmit = (data: ActionForm) => onSave(data);

  return (
    <Modal
      open={isOpen}
      title={title}
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn btn-default btn-sm"
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="action-form"
            disabled={loading}
            className="btn btn-primary btn-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
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
        </>
      }
    >
      <form id="action-form" onSubmit={handleSubmit(onSubmit)}>
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
                ${
                  errors.action
                    ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
                    : "border-gray-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                }
              `}
              autoFocus
              {...register("action", {
                required: "Tên thao tác không được để trống",
                minLength: {
                  value: 2,
                  message: "Tên thao tác phải có ít nhất 2 ký tự",
                },
              })}
            />
            {errors.action && (
              <span className="text-sm text-red-500">
                {errors.action.message}
              </span>
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}
