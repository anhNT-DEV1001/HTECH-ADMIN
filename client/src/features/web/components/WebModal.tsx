"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CircleX, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import type { ICreateWeb, IWeb } from "../interfaces";

interface WebModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateWeb) => void;
  data?: IWeb;
  loading: boolean;
}

export default function WebModal({
  isOpen,
  onClose,
  onSave,
  data,
  loading,
}: WebModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateWeb>({
    defaultValues: {
      name: "",
      alias: "",
      url: "",
    },
  });

  useEffect(() => {
    if (isOpen && data) {
      reset({
        name: data.name,
        alias: data.alias,
        url: data.url,
      });
      return;
    }

    if (isOpen) {
      reset({
        name: "",
        alias: "",
        url: "",
      });
    }
  }, [data, isOpen, reset]);

  const onSubmit: SubmitHandler<ICreateWeb> = (formData) => {
    onSave({
      name: formData.name.trim(),
      alias: formData.alias.trim(),
      url: formData.url.trim(),
    });
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa: ${data.name}` : "Thêm mới website"}
      width="max-w-xl w-full"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            <CircleX size={16} />
            Hủy
          </Button>
          <Button type="submit" form="web-form" disabled={loading}>
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Save size={16} />
            )}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form
        id="web-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4"
      >
        <div className="space-y-1">
          <Label>
            Tên website<span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("name", { required: "Vui lòng nhập tên website" })}
            placeholder="Vui lòng nhập tên website"
          />
          {errors.name && (
            <p className="text-xs text-red-500">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>
            Mã website<span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("alias", { required: "Vui lòng nhập mã website" })}
            placeholder="Vui lòng nhập mã website"
          />
          {errors.alias && (
            <p className="text-xs text-red-500">{errors.alias.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label>
            Đường dẫn<span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("url", { required: "Vui lòng nhập đường dẫn" })}
            placeholder="https://example.com"
          />
          {errors.url && (
            <p className="text-xs text-red-500">{errors.url.message}</p>
          )}
        </div>
      </form>
    </DraggableModal>
  );
}
