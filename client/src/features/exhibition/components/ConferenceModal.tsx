"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import type { IWeb } from "@/features/web/interfaces";
import getCroppedImg from "@/lib/cropImage";
import { CircleX, Image as ImageIcon, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { SubmitHandler, useForm, useWatch } from "react-hook-form";
import type {
  IConference,
  ICreateConference,
  IExhibition,
} from "../interfaces";

interface ConferenceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateConference) => void;
  data?: IConference;
  websites: IWeb[];
  exhibitions: IExhibition[];
  loading: boolean;
}

const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1").replace(
    "/api/v1",
    "",
  );
  return `${baseUrl}${path}`;
};

export default function ConferenceModal({
  isOpen,
  onClose,
  onSave,
  data,
  websites,
  exhibitions,
  loading,
}: ConferenceModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    control,
    formState: { errors },
  } = useForm<ICreateConference>({
    defaultValues: {
      name: "",
      sumary_vn: "",
      sumary_en: "",
      content_vn: "",
      content_en: "",
      display_order: 0,
      web_id: websites[0]?.id || 0,
      exhibition_ids: [],
      remove_img: false,
    },
  });

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isCropModalOpen, setIsCropModalOpen] = useState(false);
  const [cropPoint, setCropPoint] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  const selectedWebId = useWatch({ control, name: "web_id" });
  const selectedExhibitionIds = useWatch({ control, name: "exhibition_ids" }) || [];

  const exhibitionsByWeb = useMemo(
    () => exhibitions.filter((exhibition) => exhibition.web_id === Number(selectedWebId)),
    [exhibitions, selectedWebId],
  );

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      reset({
        name: data.name,
        img: data.img || "",
        sumary_vn: data.sumary_vn,
        sumary_en: data.sumary_en || "",
        content_vn: data.content_vn,
        content_en: data.content_en || "",
        display_order: data.display_order,
        web_id: data.web_id,
        exhibition_ids: data.exhibitions?.map((exhibition) => exhibition.id) || [],
        remove_img: false,
      });
      setImageFile(null);
      setImagePreview(getImageUrl(data.img));
      return;
    }

    reset({
      name: "",
      img: "",
      sumary_vn: "",
      sumary_en: "",
      content_vn: "",
      content_en: "",
      display_order: 0,
      web_id: websites[0]?.id || 0,
      exhibition_ids: [],
      remove_img: false,
    });
    setImageFile(null);
    setImagePreview("");
  }, [data, isOpen, reset, websites]);

  useEffect(() => {
    if (!isOpen) return;

    const validExhibitionIds = selectedExhibitionIds.filter((id) =>
      exhibitionsByWeb.some((exhibition) => exhibition.id === Number(id)),
    );
    if (validExhibitionIds.length !== selectedExhibitionIds.length) {
      setValue("exhibition_ids", validExhibitionIds, { shouldValidate: true });
    }
  }, [exhibitionsByWeb, isOpen, selectedExhibitionIds, setValue]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const toggleExhibition = (id: number, checked: boolean) => {
    const nextIds = checked
      ? [...selectedExhibitionIds, id]
      : selectedExhibitionIds.filter((selectedId) => selectedId !== id);
    setValue("exhibition_ids", nextIds, { shouldValidate: true });
  };

  const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
    setCroppedAreaPixels(areaPixels);
  }, []);

  const handleSelectImage = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    event.target.value = "";

    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageToCrop(reader.result as string);
      setCropPoint({ x: 0, y: 0 });
      setZoom(1);
      setCroppedAreaPixels(null);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    const croppedFileName = `${(data?.name || "conference").replace(/\s+/g, "-").toLowerCase()}.jpg`;
    const { file, url } = await getCroppedImg(imageToCrop, croppedAreaPixels, croppedFileName);

    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(url);
    setValue("remove_img", false);
    setIsCropModalOpen(false);
    setImageToCrop(null);
  };

  const handleRemoveImage = () => {
    if (imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImageFile(null);
    setImagePreview("");
    setImageToCrop(null);
    setValue("remove_img", true);
  };

  const onSubmit: SubmitHandler<ICreateConference> = (formData) => {
    onSave({
      name: formData.name.trim(),
      img: data?.img || "",
      imgFile: imageFile,
      sumary_vn: formData.sumary_vn.trim(),
      sumary_en: formData.sumary_en?.trim() || "",
      content_vn: formData.content_vn.trim(),
      content_en: formData.content_en?.trim() || "",
      display_order: Number(formData.display_order || 0),
      web_id: Number(formData.web_id),
      exhibition_ids: formData.exhibition_ids || [],
      remove_img: !imageFile && !imagePreview,
    });
  };

  return (
    <>
      <DraggableModal
        open={isOpen}
        onClose={onClose}
        title={data ? `Chỉnh sửa conference: ${data.name}` : "Thêm mới conference"}
        width="max-w-4xl w-full"
        footer={
          <>
            <Button type="button" variant="outline" onClick={onClose}>
              <CircleX size={16} />
              Hủy
            </Button>
            <Button
              type="submit"
              form="conference-form"
              disabled={loading || websites.length === 0}
            >
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {data ? "Cập nhật" : "Lưu mới"}
            </Button>
          </>
        }
      >
        <form
          id="conference-form"
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
                Tên conference<span className="text-red-500">*</span>
              </Label>
              <Input
                {...register("name", { required: "Vui lòng nhập tên conference" })}
                placeholder="Tên hội thảo"
              />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1">
              <Label>Thứ tự hiển thị</Label>
              <Input
                type="number"
                min={0}
                {...register("display_order", { valueAsNumber: true })}
                placeholder="0"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label>Ảnh conference</Label>
              <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 md:flex-row md:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Conference preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-muted-foreground">
                      <ImageIcon size={24} />
                      <span className="text-xs">Chưa có ảnh</span>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground">
                      <ImageIcon size={16} />
                      Chọn ảnh
                      <input type="file" accept="image/*" onChange={handleSelectImage} className="hidden" />
                    </label>
                    {(imagePreview || data?.img) && (
                      <Button type="button" variant="outline" onClick={handleRemoveImage}>
                        <Trash2 size={16} />
                        Xóa ảnh
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Ảnh sẽ được crop trước khi gửi lên server. Khuyến nghị dùng ảnh vuông, rõ nét.
                  </p>
                </div>
              </div>
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
          </section>

          <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
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

      <Dialog open={isCropModalOpen} onOpenChange={setIsCropModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crop ảnh conference</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="relative h-[320px] overflow-hidden rounded-lg bg-black">
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={cropPoint}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCropPoint}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Zoom</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCropPoint({ x: 0, y: 0 });
                    setZoom(1);
                  }}
                >
                  <RotateCcw size={14} />
                  Reset
                </Button>
              </div>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0] || 1)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setIsCropModalOpen(false)}>
              Hủy
            </Button>
            <Button type="button" onClick={handleApplyCrop}>
              Áp dụng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
