"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { LucideIconByName } from "@/common/components/ui/lucide-icon";
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
import { Textarea } from "@/components/ui/textarea";
import type { IWeb } from "@/features/web/interfaces";
import { CircleX, Loader2, Save } from "lucide-react";
import { useEffect, useMemo } from "react";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import type { ICreateExhibition, IExhibition, IZone } from "../interfaces";

interface ExhibitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateExhibition) => void;
  data?: IExhibition;
  websites: IWeb[];
  zones: IZone[];
  loading: boolean;
}

export default function ExhibitionModal({
  isOpen,
  onClose,
  onSave,
  data,
  websites,
  zones,
  loading,
}: ExhibitionModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ICreateExhibition>({
    defaultValues: {
      logo: "",
      name_vn: "",
      name_en: "",
      title_vn: "",
      title_en: "",
      sumary_vn: "",
      sumary_en: "",
      content_vn: "",
      content_en: "",
      display_order: 0,
      web_id: websites[0]?.id || 0,
      zone_id: 0,
      exhibitor_ids: [],
    },
  });

  const selectedWebId = useWatch({ control, name: "web_id" });
  const selectedZoneId = useWatch({ control, name: "zone_id" });
  const selectedLogo = useWatch({ control, name: "logo" });

  const zonesByWeb = useMemo(
    () => zones.filter((zone) => zone.web_id === Number(selectedWebId)),
    [selectedWebId, zones],
  );

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      reset({
        logo: data.logo || "",
        name_vn: data.name_vn,
        name_en: data.name_en || "",
        title_vn: data.title_vn,
        title_en: data.title_en || "",
        sumary_vn: data.sumary_vn || "",
        sumary_en: data.sumary_en || "",
        content_vn: data.content_vn || "",
        content_en: data.content_en || "",
        display_order: data.display_order,
        web_id: data.web_id,
        zone_id: data.zones?.[0]?.id || 0,
        exhibitor_ids: data.exhibitors?.map((exhibitor) => exhibitor.id) || [],
      });
      return;
    }

    const defaultWebId = websites[0]?.id || 0;

    reset({
      logo: "",
      name_vn: "",
      name_en: "",
      title_vn: "",
      title_en: "",
      sumary_vn: "",
      sumary_en: "",
      content_vn: "",
      content_en: "",
      display_order: 0,
      web_id: defaultWebId,
      zone_id: 0,
      exhibitor_ids: [],
    });
  }, [data, isOpen, reset, websites, zones]);

  useEffect(() => {
    if (!isOpen) return;
    if (!selectedZoneId) return;
    const selectedZoneBelongsToWeb = zonesByWeb.some((zone) => zone.id === Number(selectedZoneId));
    if (!selectedZoneBelongsToWeb) {
      setValue("zone_id", 0, { shouldValidate: true });
    }
  }, [isOpen, selectedZoneId, setValue, zonesByWeb]);

  const onSubmit: SubmitHandler<ICreateExhibition> = (formData) => {
    onSave({
      logo: formData.logo?.trim() || "",
      name_vn: formData.name_vn.trim(),
      name_en: formData.name_en?.trim() || "",
      title_vn: formData.title_vn.trim(),
      title_en: formData.title_en?.trim() || "",
      sumary_vn: formData.sumary_vn?.trim() || "",
      sumary_en: formData.sumary_en?.trim() || "",
      content_vn: formData.content_vn?.trim() || "",
      content_en: formData.content_en?.trim() || "",
      display_order: Number(formData.display_order) || 0,
      web_id: Number(formData.web_id),
      zone_id: Number(formData.zone_id),
      exhibitor_ids: formData.exhibitor_ids || [],
    });
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa exhibition: ${data.name_vn}` : "Thêm mới exhibition"}
      width="max-w-4xl w-full"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            <CircleX size={16} />
            Hủy
          </Button>
          <Button
            type="submit"
            form="exhibition-form"
            disabled={loading || websites.length === 0 || !selectedZoneId}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form
        id="exhibition-form"
        onSubmit={handleSubmit(onSubmit)}
        className="max-h-[75vh] space-y-4 overflow-y-auto pr-1"
      >
        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              Web-site<span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedWebId ? String(selectedWebId) : undefined}
              onValueChange={(value) => {
                const nextWebId = Number(value);
                setValue("web_id", nextWebId, { shouldValidate: true });
                setValue("zone_id", 0, { shouldValidate: true });
              }}
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
          </div>

          <div className="space-y-1">
            <Label>
              Zone liên quan<span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedZoneId ? String(selectedZoneId) : undefined}
              onValueChange={(value) => setValue("zone_id", Number(value), { shouldValidate: true })}
              disabled={!selectedWebId || zonesByWeb.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={selectedWebId ? "Chọn zone" : "Chọn web-site trước"} />
              </SelectTrigger>
              <SelectContent>
                {zonesByWeb.map((zone) => (
                  <SelectItem key={zone.id} value={String(zone.id)}>
                    {zone.name_vn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {zonesByWeb.length === 0 && <p className="text-xs text-red-500">Web-site này chưa có zone</p>}
            {zonesByWeb.length > 0 && !selectedZoneId && (
              <p className="text-xs text-red-500">Vui lòng chọn zone</p>
            )}
          </div>

          <div className="space-y-1">
            <Label>
              Tên exhibition VN<span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("name_vn", { required: "Vui lòng nhập tên exhibition VN" })}
              placeholder="Vui lòng nhập tên exhibition VN"
            />
            {errors.name_vn && <p className="text-xs text-red-500">{errors.name_vn.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Tên exhibition EN</Label>
            <Input {...register("name_en")} placeholder="Vui lòng nhập tên exhibition EN" />
          </div>

          <div className="space-y-1">
            <Label>
              Tiêu đề VN<span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("title_vn", { required: "Vui lòng nhập tiêu đề VN" })}
              placeholder="Vui lòng nhập tiêu đề VN"
            />
            {errors.title_vn && <p className="text-xs text-red-500">{errors.title_vn.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Tiêu đề EN</Label>
            <Input {...register("title_en")} placeholder="Vui lòng nhập tiêu đề EN" />
          </div>

          <div className="space-y-1">
            <Label>Tên icon Lucide</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/30 text-primary">
                <LucideIconByName name={selectedLogo} size={18} />
              </div>
              <Input {...register("logo")} placeholder="User, Shield, Camera..." />
            </div>
            <p className="text-xs text-muted-foreground">
              Giá trị này sẽ được dùng như tên icon từ `lucide-react`.
            </p>
          </div>

          <div className="space-y-1">
            <Label>Thứ tự hiển thị</Label>
            <Input type="number" {...register("display_order", { valueAsNumber: true })} placeholder="0" />
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>Mô tả ngắn VN</Label>
            <Textarea rows={3} {...register("sumary_vn")} placeholder="Vui lòng nhập mô tả ngắn VN" />
          </div>
          <div className="space-y-1">
            <Label>Mô tả ngắn EN</Label>
            <Textarea rows={3} {...register("sumary_en")} placeholder="Vui lòng nhập mô tả ngắn EN" />
          </div>
          <div className="space-y-1">
            <Label>Nội dung VN</Label>
            <Textarea rows={5} {...register("content_vn")} placeholder="Vui lòng nhập nội dung VN" />
          </div>
          <div className="space-y-1">
            <Label>Nội dung EN</Label>
            <Textarea rows={5} {...register("content_en")} placeholder="Vui lòng nhập nội dung EN" />
          </div>
        </section>
      </form>
    </DraggableModal>
  );
}
