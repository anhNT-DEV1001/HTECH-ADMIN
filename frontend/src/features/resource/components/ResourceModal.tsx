"use client";

import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import { IResource, IUpdateResourceWithDetail } from "../interfaces";
import { useEffect, useState } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";
import Modal from "@/common/components/ui/Modal";

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
  const { register, handleSubmit, reset, control } =
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
              href: item.href || item.herf || "",
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
          is_active: String(detail.is_active) === "true",
        };
      }),
    };
    onSave(cleanData);
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      title={data ? `Chỉnh sửa: ${data.alias}` : "Thêm mới tài nguyên"}
      width="max-w-4xl"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="btn btn-default btn-sm"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="resource-form"
            disabled={loading}
            className="btn btn-primary btn-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {data ? "Cập nhật" : "Lưu mới"}
          </button>
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
            <label className="text-sm font-semibold">
              Mã<span className="text-red-500">*</span>
            </label>
            <input
              {...register("alias", { required: true })}
              className="w-full border p-2 rounded-md"
              placeholder="Vui lòng nhập mã"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold">Trạng thái</label>
            <select
              {...register("is_active")}
              className="w-full border p-2 rounded-md"
            >
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-sm font-semibold">Tên tài nguyên</label>
            <input
              {...register("description")}
              className="w-full border p-2 rounded-md"
              placeholder="Vui lòng nhập tên tài nguyên"
            />
          </div>

          <div className="col-span-2 space-y-1">
            <label className="text-sm font-semibold">Đường dẫn</label>
            <input
              {...register("href")}
              className="w-full border p-2 rounded-md"
              placeholder="Vui lòng nhập đường dẫn"
            />
          </div>
        </section>

        {/* Danh sách chi tiết tài nguyên */}
        {data && (
          <section className="space-y-4 pt-2">
            <div className="flex justify-between items-center">
              <div></div>
              <button
                type="button"
                disabled={isAppending}
                onClick={() => {
                  setIsAppending(true);
                  append({ alias: "", href: "", is_active: true });
                  setTimeout(() => setIsAppending(false), 300);
                }}
                className="flex items-center gap-1 bg-blue-50 text-blue-600 px-3 py-1.5 rounded-md text-xs hover:bg-blue-100 disabled:opacity-50"
              >
                <Plus size={14} /> Thêm
              </button>
            </div>

            <div
              className="border rounded-md relative overflow-y-auto"
              style={{ maxHeight: "300px" }}
            >
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="p-2 text-center w-12 sticky top-0 bg-gray-50 z-10">
                      STT
                    </th>
                    <th className="p-2 text-center sticky top-0 bg-gray-50 z-10">
                      Mã
                    </th>
                    <th className="p-2 text-center sticky top-0 bg-gray-50 z-10">
                      Đường dẫn
                    </th>
                    <th className="p-2 text-center w-32 sticky top-0 bg-gray-50 z-10">
                      Trạng thái
                    </th>
                    <th className="p-2 text-center w-12 sticky top-0 bg-gray-50 z-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {fields.map((field, index) => (
                    <tr key={field.id} className="border-b last:border-0">
                      <td className="p-2 text-center text-gray-400">
                        {index + 1}
                      </td>
                      <td className="p-2">
                        <input
                          {...register(
                            `resourceDetails.${index}.alias` as const,
                            { required: true }
                          )}
                          className="w-full border p-1.5 rounded text-xs"
                          placeholder="Vui lòng nhập mã"
                        />
                      </td>
                      <td className="p-2">
                        <input
                          {...register(
                            `resourceDetails.${index}.href` as const
                          )}
                          defaultValue={field.href || ""}
                          className="w-full border p-1.5 rounded text-xs"
                          placeholder="Vui lòng nhập đường dẫn"
                        />
                      </td>
                      <td className="p-2">
                        <select
                          {...register(
                            `resourceDetails.${index}.is_active` as const
                          )}
                          className="w-full border p-1.5 rounded text-xs"
                        >
                          <option value="true">Bật</option>
                          <option value="false">Tắt</option>
                        </select>
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => remove(index)}
                          className="text-red-500 hover:bg-red-50 p-1.5 rounded"
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </form>
    </Modal>
  );
}
