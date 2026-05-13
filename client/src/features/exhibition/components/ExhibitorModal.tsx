"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { LucideIconByName } from "@/common/components/ui/lucide-icon";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
import type {
  IBooth,
  ICreateExhibitor,
  IExhibition,
  IExhibitor,
  IExhibitorRank,
} from "../interfaces";

interface ExhibitorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateExhibitor) => void;
  data?: IExhibitor;
  websites: IWeb[];
  ranks: IExhibitorRank[];
  booths: IBooth[];
  exhibitions: IExhibition[];
  loading: boolean;
}

export default function ExhibitorModal({
  isOpen,
  onClose,
  onSave,
  data,
  websites,
  ranks,
  booths,
  exhibitions,
  loading,
}: ExhibitorModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ICreateExhibitor>({
    defaultValues: {
      name: "",
      logo_url: "",
      sumary_vn: "",
      sumary_en: "",
      content_vn: "",
      content_en: "",
      rankId: 0,
      boothId: 0,
      web_id: websites[0]?.id || 0,
      exhibition_ids: [],
    },
  });

  const selectedWebId = useWatch({ control, name: "web_id" });
  const selectedRankId = useWatch({ control, name: "rankId" });
  const selectedBoothId = useWatch({ control, name: "boothId" });
  const selectedLogoUrl = useWatch({ control, name: "logo_url" });
  const selectedExhibitionIds = useWatch({ control, name: "exhibition_ids" }) || [];

  const ranksByWeb = useMemo(
    () => ranks.filter((rank) => rank.web_id === Number(selectedWebId)),
    [ranks, selectedWebId],
  );
  const boothsByWeb = useMemo(
    () => booths.filter((booth) => booth.web_id === Number(selectedWebId)),
    [booths, selectedWebId],
  );
  const exhibitionsByWeb = useMemo(
    () => exhibitions.filter((exhibition) => exhibition.web_id === Number(selectedWebId)),
    [exhibitions, selectedWebId],
  );

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      reset({
        name: data.name,
        logo_url: data.logo_url || "",
        sumary_vn: data.sumary_vn,
        sumary_en: data.sumary_en || "",
        content_vn: data.content_vn,
        content_en: data.content_en || "",
        rankId: data.rankId,
        boothId: data.boothId,
        web_id: data.web_id,
        exhibition_ids: data.exhibitions?.map((exhibition) => exhibition.id) || [],
      });
      return;
    }

    reset({
      name: "",
      logo_url: "",
      sumary_vn: "",
      sumary_en: "",
      content_vn: "",
      content_en: "",
      rankId: 0,
      boothId: 0,
      web_id: websites[0]?.id || 0,
      exhibition_ids: [],
    });
  }, [data, isOpen, reset, websites]);

  useEffect(() => {
    if (!isOpen) return;

    if (selectedRankId && !ranksByWeb.some((rank) => rank.id === Number(selectedRankId))) {
      setValue("rankId", 0, { shouldValidate: true });
    }

    if (selectedBoothId && !boothsByWeb.some((booth) => booth.id === Number(selectedBoothId))) {
      setValue("boothId", 0, { shouldValidate: true });
    }

    const validExhibitionIds = selectedExhibitionIds.filter((id) =>
      exhibitionsByWeb.some((exhibition) => exhibition.id === Number(id)),
    );
    if (validExhibitionIds.length !== selectedExhibitionIds.length) {
      setValue("exhibition_ids", validExhibitionIds, { shouldValidate: true });
    }
  }, [
    boothsByWeb,
    exhibitionsByWeb,
    isOpen,
    ranksByWeb,
    selectedBoothId,
    selectedExhibitionIds,
    selectedRankId,
    setValue,
  ]);

  const toggleExhibition = (id: number, checked: boolean) => {
    const nextIds = checked
      ? [...selectedExhibitionIds, id]
      : selectedExhibitionIds.filter((selectedId) => selectedId !== id);
    setValue("exhibition_ids", nextIds, { shouldValidate: true });
  };

  const onSubmit: SubmitHandler<ICreateExhibitor> = (formData) => {
    onSave({
      name: formData.name.trim(),
      logo_url: formData.logo_url?.trim() || "",
      sumary_vn: formData.sumary_vn.trim(),
      sumary_en: formData.sumary_en?.trim() || "",
      content_vn: formData.content_vn.trim(),
      content_en: formData.content_en?.trim() || "",
      rankId: Number(formData.rankId),
      boothId: Number(formData.boothId),
      web_id: Number(formData.web_id),
      exhibition_ids: formData.exhibition_ids || [],
    });
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa exhibitor: ${data.name}` : "Thêm mới exhibitor"}
      width="max-w-4xl w-full"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            <CircleX size={16} />
            Hủy
          </Button>
          <Button
            type="submit"
            form="exhibitor-form"
            disabled={loading || websites.length === 0 || !selectedRankId || !selectedBoothId}
          >
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form
        id="exhibitor-form"
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
                setValue("web_id", Number(value), { shouldValidate: true });
                setValue("rankId", 0, { shouldValidate: true });
                setValue("boothId", 0, { shouldValidate: true });
                setValue("exhibition_ids", [], { shouldValidate: true });
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
              Tên exhibitor<span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("name", { required: "Vui lòng nhập tên exhibitor" })}
              placeholder="Tên nhà triển lãm"
            />
            {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
          </div>

          <div className="space-y-1">
            <Label>Tên icon Lucide</Label>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border bg-muted/30 text-primary">
                <LucideIconByName name={selectedLogoUrl} size={18} />
              </div>
              <Input
                {...register("logo_url")}
                placeholder="Shield, Building2, Camera..."
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Giá trị này sẽ được dùng như tên icon từ `lucide-react`.
            </p>
          </div>

          <div className="space-y-1">
            <Label>
              Rank<span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedRankId ? String(selectedRankId) : undefined}
              onValueChange={(value) => setValue("rankId", Number(value), { shouldValidate: true })}
              disabled={!selectedWebId || ranksByWeb.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn rank" />
              </SelectTrigger>
              <SelectContent>
                {ranksByWeb.map((rank) => (
                  <SelectItem key={rank.id} value={String(rank.id)}>
                    {rank.name_vn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {ranksByWeb.length === 0 && <p className="text-xs text-red-500">Web-site này chưa có rank</p>}
          </div>

          <div className="space-y-1">
            <Label>
              Booth<span className="text-red-500">*</span>
            </Label>
            <Select
              value={selectedBoothId ? String(selectedBoothId) : undefined}
              onValueChange={(value) => setValue("boothId", Number(value), { shouldValidate: true })}
              disabled={!selectedWebId || boothsByWeb.length === 0}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Chọn booth" />
              </SelectTrigger>
              <SelectContent>
                {boothsByWeb.map((booth) => (
                  <SelectItem key={booth.id} value={String(booth.id)}>
                    {booth.name || `Booth #${booth.id}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {boothsByWeb.length === 0 && <p className="text-xs text-red-500">Web-site này chưa có booth</p>}
          </div>
        </section>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <Label>
              Mô tả ngắn VN<span className="text-red-500">*</span>
            </Label>
            <Textarea
              rows={3}
              {...register("sumary_vn", { required: "Vui lòng nhập mô tả ngắn VN" })}
              placeholder="Mô tả ngắn tiếng Việt"
            />
            {errors.sumary_vn && <p className="text-xs text-red-500">{errors.sumary_vn.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Mô tả ngắn EN</Label>
            <Textarea rows={3} {...register("sumary_en")} placeholder="Short English summary" />
          </div>
          <div className="space-y-1">
            <Label>
              Nội dung VN<span className="text-red-500">*</span>
            </Label>
            <Textarea
              rows={5}
              {...register("content_vn", { required: "Vui lòng nhập nội dung VN" })}
              placeholder="Nội dung tiếng Việt"
            />
            {errors.content_vn && <p className="text-xs text-red-500">{errors.content_vn.message}</p>}
          </div>
          <div className="space-y-1">
            <Label>Nội dung EN</Label>
            <Textarea rows={5} {...register("content_en")} placeholder="English content" />
          </div>
        </section>

        <section className="space-y-2">
          <Label>Exhibition liên kết</Label>
          <div className="grid max-h-44 grid-cols-1 gap-2 overflow-y-auto rounded-md border p-3 md:grid-cols-2">
            {exhibitionsByWeb.length === 0 ? (
              <p className="text-sm text-muted-foreground">Web-site này chưa có exhibition</p>
            ) : (
              exhibitionsByWeb.map((exhibition) => {
                const checked = selectedExhibitionIds.includes(exhibition.id);
                return (
                  <label key={exhibition.id} className="flex cursor-pointer items-start gap-2 text-sm">
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(value) => toggleExhibition(exhibition.id, value === true)}
                    />
                    <span>
                      <span className="font-medium">{exhibition.name_vn}</span>
                      <span className="block text-xs text-muted-foreground">{exhibition.title_vn}</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </section>
      </form>
    </DraggableModal>
  );
}
