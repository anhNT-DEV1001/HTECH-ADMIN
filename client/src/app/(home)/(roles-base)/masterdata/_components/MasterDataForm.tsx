"use client";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

import {
  IMasterData,
  ICreateMasterDataDto,
  IUpdateMasterDataDto,
} from "@/features/masterdata/interfaces";
import { useMasterData } from "@/features/masterdata/hooks";

const _formSchema = z.object({
  dataKey: z.string().min(1, { message: "Khóa không được để trống" }),
  dataValue: z.string().min(1, { message: "Giá trị không được để trống" }),
  name: z.string().min(1, { message: "Tên không được để trống" }),
  description: z.string().optional(),
});

type FormValues = z.infer<typeof _formSchema>;

interface MasterDataFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  masterData?: IMasterData | null;
}

export function MasterDataForm({
  open,
  onOpenChange,
  masterData,
}: MasterDataFormProps) {
  const { createMasterData, updateMasterData } = useMasterData();
  const isEditing = !!masterData;
  const isSubmitting = createMasterData.isPending || updateMasterData.isPending;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(_formSchema),
    defaultValues: {
      dataKey: "",
      dataValue: "",
      name: "",
      description: "",
    },
  });

  useEffect(() => {
    if (open) {
      if (masterData) {
        reset({
          dataKey: masterData.dataKey || "",
          dataValue: masterData.dataValue || "",
          name: masterData.name || "",
          description: masterData.description || "",
        });
      } else {
        reset({
          dataKey: "",
          dataValue: "",
          name: "",
          description: "",
        });
      }
    }
  }, [open, masterData, reset]);

  const onSubmit = async (data: FormValues) => {
    try {
      if (isEditing && masterData) {
        await updateMasterData.mutateAsync({
          id: masterData.id,
          data: data as IUpdateMasterDataDto,
        });
      } else {
        await createMasterData.mutateAsync(data as ICreateMasterDataDto);
      }
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the generic mutation hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Cập nhật cấu hình" : "Thêm cấu hình mới"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="dataKey">
              Khóa (Key) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dataKey"
              placeholder="Nhập khóa (VD: contact_email)"
              {...register("dataKey")}
            />
            {errors.dataKey && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dataKey.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="dataValue">
              Giá trị <span className="text-red-500">*</span>
            </Label>
            <Input
              id="dataValue"
              placeholder="Nhập giá trị"
              {...register("dataValue")}
            />
            {errors.dataValue && (
              <p className="text-red-500 text-xs mt-1">
                {errors.dataValue.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="name">
              Tên hiển thị <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="Nhập tên hiển thị"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Textarea
              id="description"
              placeholder="Nhập mô tả (không bắt buộc)"
              className="resize-none"
              rows={3}
              {...register("description")}
            />
            {errors.description && (
              <p className="text-red-500 text-xs mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Hủy
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {isEditing ? "Cập nhật" : "Thêm mới"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
