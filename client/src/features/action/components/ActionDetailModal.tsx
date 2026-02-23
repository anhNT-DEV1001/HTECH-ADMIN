"use client";

import { Save, Loader2, CircleX } from "lucide-react";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import {DraggableModal} from "@/common/components/ui/Modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <DraggableModal
      open={isOpen}
      title={title}
      onClose={onClose}
      width="max-w-md"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <CircleX size={16}/>
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="action-form"
            disabled={loading}
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
          </Button>
        </>
      }
    >
      <form id="action-form" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="action-name">
              Tên thao tác <span className="text-red-500">*</span>
            </Label>
            <Input
              id="action-name"
              type="text"
              placeholder="Nhập tên thao tác"
              autoFocus
              aria-invalid={errors.action ? true : undefined}
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
    </DraggableModal>
  );
}
