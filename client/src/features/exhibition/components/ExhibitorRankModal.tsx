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
import type { ICreateExhibitorRank, IExhibitorRank } from "../interfaces";

interface ExhibitorRankModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateExhibitorRank) => void;
  data?: IExhibitorRank;
  websites: IWeb[];
  loading: boolean;
}

export default function ExhibitorRankModal({
  isOpen,
  onClose,
  onSave,
  data,
  websites,
  loading,
}: ExhibitorRankModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ICreateExhibitorRank>({
    defaultValues: {
      name_vn: "",
      name_en: "",
      display_order: 0,
      web_id: websites[0]?.id || 0,
    },
  });

  const selectedWebId = watch("web_id");

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      reset({
        name_vn: data.name_vn,
        name_en: data.name_en || "",
        display_order: data.display_order,
        web_id: data.web_id,
      });
      return;
    }

    reset({
      name_vn: "",
      name_en: "",
      display_order: 0,
      web_id: websites[0]?.id || 0,
    });
  }, [data, isOpen, reset, websites]);

  const onSubmit: SubmitHandler<ICreateExhibitorRank> = (formData) => {
    onSave({
      name_vn: formData.name_vn.trim(),
      name_en: formData.name_en?.trim() || "",
      display_order: Number(formData.display_order) || 0,
      web_id: Number(formData.web_id),
    });
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa rank: ${data.name_vn}` : "Thêm mới rank"}
      width="max-w-xl w-full"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            <CircleX size={16} />
            Hủy
          </Button>
          <Button type="submit" form="exhibitor-rank-form" disabled={loading || websites.length === 0}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form id="exhibitor-rank-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
            Tên rank VN<span className="text-red-500">*</span>
          </Label>
          <Input
            {...register("name_vn", { required: "Vui lòng nhập tên rank VN" })}
            placeholder="VD: Kim cương, Vàng, Bạc"
          />
          {errors.name_vn && <p className="text-xs text-red-500">{errors.name_vn.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Tên rank EN</Label>
          <Input {...register("name_en")} placeholder="VD: Diamond, Gold, Silver" />
        </div>

        <div className="space-y-1">
          <Label>Thứ tự hiển thị</Label>
          <Input type="number" {...register("display_order", { valueAsNumber: true })} placeholder="0" />
        </div>
      </form>
    </DraggableModal>
  );
}
