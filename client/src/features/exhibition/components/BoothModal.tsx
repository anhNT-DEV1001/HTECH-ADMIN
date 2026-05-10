"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IWeb } from "@/features/web/interfaces";
import { CircleX, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import type { IBooth, ICreateBooth } from "../interfaces";

interface BoothModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateBooth) => void;
  data?: IBooth;
  websites: IWeb[];
  loading: boolean;
}

export default function BoothModal({
  isOpen,
  onClose,
  onSave,
  data,
  websites,
  loading,
}: BoothModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ICreateBooth>({
    defaultValues: {
      name: "",
      web_id: websites[0]?.id || 0,
    },
  });

  const selectedWebId = watch("web_id");

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      reset({
        name: data.name || "",
        web_id: data.web_id,
      });
      return;
    }

    reset({
      name: "",
      web_id: websites[0]?.id || 0,
    });
  }, [data, isOpen, reset, websites]);

  const onSubmit: SubmitHandler<ICreateBooth> = (formData) => {
    onSave({
      name: formData.name?.trim() || "",
      web_id: Number(formData.web_id),
    });
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa booth: ${data.name || `#${data.id}`}` : "Thêm mới booth"}
      width="max-w-xl w-full"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            <CircleX size={16} />
            Hủy
          </Button>
          <Button type="submit" form="booth-form" disabled={loading || websites.length === 0}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form id="booth-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1">
          <Label>
            Web-site<span className="text-red-500">*</span>
          </Label>
          <Select
            value={selectedWebId ? String(selectedWebId) : undefined}
            onValueChange={(value) => setValue("web_id", Number(value), { shouldValidate: true })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Chọn web-site" />
            </SelectTrigger>
            <SelectContent>
              {websites.map((web) => (
                <SelectItem key={web.id} value={String(web.id)}>
                  {web.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {websites.length === 0 && <p className="text-xs text-red-500">Chưa có dữ liệu web-site</p>}
        </div>

        <div className="space-y-1">
          <Label>
            Tên booth<span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("name", { required: "Vui lòng nhập tên booth" })}
            placeholder="VD: A01, B12, Main Hall"
          />
          {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
        </div>
      </form>
    </DraggableModal>
  );
}
