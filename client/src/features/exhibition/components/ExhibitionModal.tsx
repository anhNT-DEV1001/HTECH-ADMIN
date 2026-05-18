"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { LucideIconByName } from "@/common/components/ui/lucide-icon";
import { Button } from "@/components/ui/button";
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
import TextEditor from "@/common/components/ui/TextEditor";
import type { IWeb } from "@/features/web/interfaces";
import getCroppedImg from "@/lib/cropImage";
import Cropper, { Area } from "react-easy-crop";
import { CircleX, Image as ImageIcon, Loader2, RotateCcw, Save, Trash2 } from "lucide-react";
import type { ChangeEvent, PointerEvent as ReactPointerEvent } from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Controller, SubmitHandler, useForm, useWatch } from "react-hook-form";
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

type ResizeHandle =
  | "n"
  | "s"
  | "e"
  | "w"
  | "ne"
  | "nw"
  | "se"
  | "sw";

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
      img: "",
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
  const [cropWidthPercent, setCropWidthPercent] = useState(80);
  const [cropHeightPercent, setCropHeightPercent] = useState(80);
  const [cropContainerSize, setCropContainerSize] = useState({ width: 0, height: 0 });
  const cropContainerRef = useRef<HTMLDivElement | null>(null);
  const resizeStateRef = useRef<{
    handle: ResizeHandle;
    startX: number;
    startY: number;
    startWidthPercent: number;
    startHeightPercent: number;
  } | null>(null);

  const selectedWebId = useWatch({ control, name: "web_id" });
  const selectedZoneId = useWatch({ control, name: "zone_id" });
  const selectedLogo = useWatch({ control, name: "logo" });
  const editorSessionKey = `${data?.id ?? "new"}-${isOpen ? "open" : "closed"}`;

  const zonesByWeb = useMemo(
    () => zones.filter((zone) => zone.web_id === Number(selectedWebId)),
    [selectedWebId, zones],
  );

  useEffect(() => {
    if (!isOpen) return;

    if (data) {
      reset({
        logo: data.logo || "",
        img: data.img || "",
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
        remove_img: false,
      });
      setImageFile(null);
      setImagePreview(getImageUrl(data.img));
      return;
    }

    const defaultWebId = websites[0]?.id || 0;
    reset({
      logo: "",
      img: "",
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
      remove_img: false,
    });
    setImageFile(null);
    setImagePreview("");
  }, [data, isOpen, reset, websites]);

  useEffect(() => {
    if (!isOpen) return;
    if (!selectedZoneId) return;
    const selectedZoneBelongsToWeb = zonesByWeb.some((zone) => zone.id === Number(selectedZoneId));
    if (!selectedZoneBelongsToWeb) {
      setValue("zone_id", 0, { shouldValidate: true });
    }
  }, [isOpen, selectedZoneId, setValue, zonesByWeb]);

  useEffect(() => {
    return () => {
      if (imagePreview.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  useEffect(() => {
    if (!isCropModalOpen || !cropContainerRef.current) return;

    const element = cropContainerRef.current;
    const updateSize = () => {
      setCropContainerSize({
        width: element.clientWidth,
        height: element.clientHeight,
      });
    };

    updateSize();

    const observer = new ResizeObserver(updateSize);
    observer.observe(element);

    return () => observer.disconnect();
  }, [isCropModalOpen]);

  const cropSize = useMemo(() => {
    if (!cropContainerSize.width || !cropContainerSize.height) return undefined;

    return {
      width: Math.max(120, Math.round((cropContainerSize.width * cropWidthPercent) / 100)),
      height: Math.max(120, Math.round((cropContainerSize.height * cropHeightPercent) / 100)),
    };
  }, [cropContainerSize.height, cropContainerSize.width, cropHeightPercent, cropWidthPercent]);

  const cropFrameStyle = useMemo(() => {
    if (!cropSize) return undefined;

    const left = (cropContainerSize.width - cropSize.width) / 2;
    const top = (cropContainerSize.height - cropSize.height) / 2;

    return {
      width: cropSize.width,
      height: cropSize.height,
      left,
      top,
    };
  }, [cropContainerSize.height, cropContainerSize.width, cropSize]);

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
      setCropWidthPercent(80);
      setCropHeightPercent(80);
      setCroppedAreaPixels(null);
      setIsCropModalOpen(true);
    };
    reader.readAsDataURL(file);
  };

  const handleApplyCrop = async () => {
    if (!imageToCrop || !croppedAreaPixels) return;

    const croppedFileName = `${(data?.name_vn || "exhibition").replace(/\s+/g, "-").toLowerCase()}.jpg`;
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

  const clampPercent = (value: number) => Math.min(100, Math.max(20, Math.round(value)));

  const handleResizePointerDown = (handle: ResizeHandle) => (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!cropContainerSize.width || !cropContainerSize.height) return;

    event.preventDefault();
    event.stopPropagation();

    resizeStateRef.current = {
      handle,
      startX: event.clientX,
      startY: event.clientY,
      startWidthPercent: cropWidthPercent,
      startHeightPercent: cropHeightPercent,
    };

    const onPointerMove = (moveEvent: PointerEvent) => {
      const current = resizeStateRef.current;
      if (!current) return;

      const deltaX = moveEvent.clientX - current.startX;
      const deltaY = moveEvent.clientY - current.startY;

      let nextWidth = current.startWidthPercent;
      let nextHeight = current.startHeightPercent;

      if (current.handle.includes("e")) {
        nextWidth = current.startWidthPercent + (deltaX / cropContainerSize.width) * 200;
      }
      if (current.handle.includes("w")) {
        nextWidth = current.startWidthPercent - (deltaX / cropContainerSize.width) * 200;
      }
      if (current.handle.includes("s")) {
        nextHeight = current.startHeightPercent + (deltaY / cropContainerSize.height) * 200;
      }
      if (current.handle.includes("n")) {
        nextHeight = current.startHeightPercent - (deltaY / cropContainerSize.height) * 200;
      }

      setCropWidthPercent(clampPercent(nextWidth));
      setCropHeightPercent(clampPercent(nextHeight));
    };

    const onPointerUp = () => {
      resizeStateRef.current = null;
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
  };

  const onSubmit: SubmitHandler<ICreateExhibition> = (formData) => {
    onSave({
      logo: formData.logo?.trim() || "",
      img: data?.img || "",
      imgFile: imageFile,
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
      remove_img: !imageFile && !imagePreview,
    });
  };

  return (
    <>
      <DraggableModal
        open={isOpen}
        onClose={onClose}
        title={data ? `Chỉnh sửa exhibition: ${data.name_vn}` : "Thêm mới exhibition"}
        width="max-w-6xl w-full"
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
                      <div className="flex flex-col">
                        <span>{zone.name_vn}</span>
                        {zone.field_vn && (
                          <span className="text-xs text-muted-foreground">{zone.field_vn}</span>
                        )}
                      </div>
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

            <div className="space-y-2 md:col-span-2">
              <Label>Ảnh exhibition</Label>
              <div className="flex flex-col gap-3 rounded-lg border border-dashed p-4 md:flex-row md:items-center">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-muted/30">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Exhibition preview" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-xs text-muted-foreground">
                      <ImageIcon size={24} />
                      <span>Chưa có ảnh</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 space-y-2">
                  <Input type="file" accept="image/*" onChange={handleSelectImage} />
                  <p className="text-xs text-muted-foreground">
                    Ảnh sẽ được crop trước khi gửi bằng `multipart/form-data`.
                  </p>
                  {imagePreview && (
                    <Button type="button" variant="outline" onClick={handleRemoveImage}>
                      <Trash2 size={16} />
                      Xóa ảnh
                    </Button>
                  )}
                </div>
              </div>
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
              <Controller
                name="content_vn"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    key={`content-vn-${editorSessionKey}`}
                    content={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
            <div className="space-y-1">
              <Label>Nội dung EN</Label>
              <Controller
                name="content_en"
                control={control}
                render={({ field }) => (
                  <TextEditor
                    key={`content-en-${editorSessionKey}`}
                    content={field.value || ""}
                    onChange={field.onChange}
                  />
                )}
              />
            </div>
          </section>
        </form>
      </DraggableModal>

      <Dialog
        open={isCropModalOpen}
        onOpenChange={(open) => {
          setIsCropModalOpen(open);
          if (!open) {
            setImageToCrop(null);
          }
        }}
      >
        <DialogContent className="grid h-[92vh] w-[96vw] max-w-[96vw] grid-rows-[auto,minmax(0,1fr),auto] gap-0 overflow-hidden p-0 sm:max-w-[96vw]">
          <DialogHeader className="gap-0 border-b px-6 py-4">
            <DialogTitle>Cắt ảnh exhibition</DialogTitle>
          </DialogHeader>
          <div className="flex min-h-0 flex-col px-6 py-4">
            <div
              ref={cropContainerRef}
              className="relative min-h-0 flex-1 overflow-hidden rounded-lg bg-black/90"
            >
              {imageToCrop && (
                <Cropper
                  image={imageToCrop}
                  crop={cropPoint}
                  zoom={zoom}
                  cropSize={cropSize}
                  onCropChange={setCropPoint}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              )}
              {cropFrameStyle && (
                <div
                  className="pointer-events-none absolute border-2 border-white/90 shadow-[0_0_0_9999px_rgba(0,0,0,0.28)]"
                  style={cropFrameStyle}
                >
                  <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                    {Array.from({ length: 9 }).map((_, index) => (
                      <div key={index} className="border border-white/35" />
                    ))}
                  </div>

                  <div
                    className="pointer-events-auto absolute -left-2 top-1/2 h-12 w-4 -translate-y-1/2 cursor-ew-resize"
                    onPointerDown={handleResizePointerDown("w")}
                  />
                  <div
                    className="pointer-events-auto absolute -right-2 top-1/2 h-12 w-4 -translate-y-1/2 cursor-ew-resize"
                    onPointerDown={handleResizePointerDown("e")}
                  />
                  <div
                    className="pointer-events-auto absolute left-1/2 top-0 h-4 w-12 -translate-x-1/2 -translate-y-1/2 cursor-ns-resize"
                    onPointerDown={handleResizePointerDown("n")}
                  />
                  <div
                    className="pointer-events-auto absolute bottom-0 left-1/2 h-4 w-12 -translate-x-1/2 translate-y-1/2 cursor-ns-resize"
                    onPointerDown={handleResizePointerDown("s")}
                  />

                  <div
                    className="pointer-events-auto absolute -left-2 -top-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-blue-500"
                    onPointerDown={handleResizePointerDown("nw")}
                  />
                  <div
                    className="pointer-events-auto absolute -right-2 -top-2 h-5 w-5 cursor-nesw-resize rounded-full border-2 border-white bg-blue-500"
                    onPointerDown={handleResizePointerDown("ne")}
                  />
                  <div
                    className="pointer-events-auto absolute -bottom-2 -left-2 h-5 w-5 cursor-nesw-resize rounded-full border-2 border-white bg-blue-500"
                    onPointerDown={handleResizePointerDown("sw")}
                  />
                  <div
                    className="pointer-events-auto absolute -bottom-2 -right-2 h-5 w-5 cursor-nwse-resize rounded-full border-2 border-white bg-blue-500"
                    onPointerDown={handleResizePointerDown("se")}
                  />
                </div>
              )}
            </div>
            <div className="pt-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span>Zoom</span>
                  <span>{zoom.toFixed(1)}x</span>
                </div>
                <Slider
                  min={1}
                  max={3}
                  step={0.1}
                  value={[zoom]}
                  onValueChange={(value) => setZoom(value[0] || 1)}
                />
              </div>
              <p className="pt-2 text-xs text-muted-foreground">
                Kéo trực tiếp các góc hoặc cạnh của khung crop để thay đổi kích thước vùng cắt.
              </p>
            </div>
          </div>
          <DialogFooter className="border-t px-6 py-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCropPoint({ x: 0, y: 0 });
                setZoom(1);
                setCropWidthPercent(80);
                setCropHeightPercent(80);
              }}
            >
              <RotateCcw size={16} />
              Đặt lại
            </Button>
            <Button type="button" onClick={handleApplyCrop} disabled={!croppedAreaPixels}>
              <Save size={16} />
              Áp dụng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
