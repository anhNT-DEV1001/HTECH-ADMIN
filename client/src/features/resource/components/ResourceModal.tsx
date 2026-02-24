"use client";

import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { IResource, IUpdateResourceWithDetail } from "../interfaces";
import { useEffect, useState } from "react";
import { CircleX, Loader2, Plus, Save, Trash2 } from "lucide-react";
import {DraggableModal} from "@/common/components/ui/Modal";

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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function ResourceModal({
  isOpen,
  onClose,
  onSave,
  data,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: IUpdateResourceWithDetail) => void;
  data?: IResource;
  loading: boolean;
}) {
  const { register, handleSubmit, reset, control, setValue, watch } =
    useForm<IUpdateResourceWithDetail>({
      defaultValues: {
        is_active: true,
        resourceDetails: [],
      },
    });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "resourceDetails",
  });

  const [isAppending, setIsAppending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (data) {
        reset({
          ...data,
          resourceDetails:
            data.resourceDetails?.map((item: any) => ({
              id: item.id,
              alias: item.alias || "",
              is_active: item.is_active ?? true,
              herf: item.herf || "",
            })) || [],
        });
      } else {
        reset({
          alias: "",
          description: "",
          href: "",
          is_active: true,
          resourceDetails: [],
        });
      }
    } else {
      reset({
        alias: "",
        description: "",
        href: "",
        is_active: true,
        resourceDetails: [],
      });
    }
  }, [data, reset, isOpen]);

  const onSubmit: SubmitHandler<IUpdateResourceWithDetail> = (formData) => {
    const cleanData = {
      ...formData,
      resourceDetails: formData.resourceDetails?.map((detail: any) => {
        const { herf, created_at, updated_at, ...validDetail } = detail;
        return {
          ...validDetail,
          herf : String(detail.herf),
          is_active: String(detail.is_active) === "true",
        };
      }),
    };
    onSave(cleanData);
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa: ${data.alias}` : "Thêm mới tài nguyên"}
      width="max-w-2xl w-full"
      footer={
        <>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            <CircleX size={16}/>
            Hủy
          </Button>
          <Button
            type="submit"
            form="resource-form"
            disabled={loading}
          >
            {loading && <Loader2 size={16} className="animate-spin"/>}
            {!loading && <Save size={16}/>}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form
        id="resource-form"
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 max-h-[75vh] overflow-y-auto custom-scrollbar"
      >
        {/* Thông tin chung */}
        <section className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <Label>
              Mã<span className="text-red-500">*</span>
            </Label>
            <Input
              {...register("alias", { required: true })}
              placeholder="Vui lòng nhập mã"
            />
          </div>

          <div className="space-y-1">
            <Label>Trạng thái</Label>
            <select
              {...register("is_active")}
              className="flex h-9 w-full items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none"
            >
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Tên tài nguyên</Label>
            <Input
              {...register("description")}
              placeholder="Vui lòng nhập tên tài nguyên"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <Label>Đường dẫn</Label>
            <Input
              {...register("href")}
              placeholder="Vui lòng nhập đường dẫn"
            />
          </div>
        </section>

        {/* Danh sách chi tiết tài nguyên */}
        {data && (
          <section className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <div></div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={isAppending}
                onClick={() => {
                  setIsAppending(true);
                  append({ alias: "", herf: "", is_active: true });
                  setTimeout(() => setIsAppending(false), 300);
                }}
              >
                <Plus size={14} /> Thêm
              </Button>
            </div>

            <div
              className="border rounded-md relative overflow-y-auto"
              style={{ maxHeight: "300px" }}
            >
              <Table>
                <TableHeader className="bg-gray-50 sticky top-0 z-10">
                  <TableRow>
                    <TableHead className="text-center w-12">
                      STT
                    </TableHead>
                    <TableHead className="text-center">
                      Mã
                    </TableHead>
                    <TableHead className="text-center">
                      Đường dẫn
                    </TableHead>
                    <TableHead className="text-center w-32">
                      Trạng thái
                    </TableHead>
                    <TableHead className="text-center w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fields.map((field, index) => (
                    <TableRow key={field.id}>
                      <TableCell className="text-center text-muted-foreground">
                        {index + 1}
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(
                            `resourceDetails.${index}.alias` as const,
                            { required: true }
                          )}
                          className="h-8 text-xs"
                          placeholder="Vui lòng nhập mã"
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          {...register(
                            `resourceDetails.${index}.herf` as const
                          )}
                          className="h-8 text-xs"
                          placeholder="Vui lòng nhập đường dẫn"
                        />
                      </TableCell>
                      <TableCell>
                        <select
                          {...register(
                            `resourceDetails.${index}.is_active` as const
                          )}
                          className="flex h-8 w-full items-center rounded-md border border-input bg-transparent px-2 py-1 text-xs shadow-xs outline-none"
                        >
                          <option value="true">Bật</option>
                          <option value="false">Tắt</option>
                        </select>
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:bg-red-50"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </section>
        )}
      </form>
    </DraggableModal>
  );
}
