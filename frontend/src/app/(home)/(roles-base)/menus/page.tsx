"use client";

import { useResource } from "@/features/resource/hooks";
import {
  ICreateResource,
  IResource,
  IResourceRequest,
  IUpdateResourceWithDetail,
} from "@/features/resource/interfaces";
import { useDebouncedValue } from "@/common/hooks";
import dayjs from "dayjs";
import {
  ArrowDownWideNarrow,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  CircleOff,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import React, { useEffect, useState } from "react";
import MenuLoading from "./loading";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { SubmitHandler, useFieldArray, useForm } from "react-hook-form";
import ResourceModal from "@/features/resource/components/ResourceModal";

export default function ListMenu() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();
  const [params, setParams] = useState<IResourceRequest>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "description",
    sortBy: "desc",
    orderBy: "created_at",
    is_active: "all",
  });
  const [searchInput, setSearchInput] = useState(params.search || "");
  const [selectIsActive, setSelectIsActive] = useState(
    params.is_active || "all",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<
    IResource | undefined
  >(undefined);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const toggleRow = (id: number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };
  const debouncedSearch = useDebouncedValue(searchInput, 500);
  const {
    resourceData,
    isFetching,
    isLoading,
    createResource,
    deleteResource,
    updateResource,
    isCreating,
    isDeleting,
    isUpdating,
  } = useResource(params);
  const resources = resourceData?.data?.records || [];
  const meta = resourceData?.data?.meta;
  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      search: debouncedSearch,
      page: 1,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (params.page) newParams.set("page", params.page.toString());
    if (params.limit) newParams.set("limit", params.limit.toString());
    if (params.search) newParams.set("search", params.search);
    if (params.searchBy)
      newParams.set(
        "searchBy",
        params.searchBy ? params.searchBy : "description",
      );
    if (params.sortBy) newParams.set("sortBy", params.sortBy);
    if (params.orderBy) newParams.set("orderBy", params.orderBy);
    if (params.is_active) newParams.set("isActive", params.is_active);
    router.push(`${pathName}?${newParams.toString()}`, { scroll: false });
  }, [params, pathName, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSelectIsActive = (selectedVal: "all" | "true" | "false") => {
    setSelectIsActive(selectedVal);
    setParams((prev) => ({
      ...prev,
      is_active: selectedVal === "all" ? "all" : selectedVal,
      page: 1,
    }));
  };
  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };
  const handleSort = (column: string) => {
    setParams((prev) => ({
      ...prev,
      orderBy: column,
      sortBy: prev.orderBy === column && prev.sortBy === "asc" ? "desc" : "asc",
      page: 1,
    }));
  };
  const getSortIcon = (column: string) => {
    if (params.orderBy !== column) {
      return <ArrowDownWideNarrow size={14} />;
    }
    return params.sortBy === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const handleDelete = async (resource: IResource) => {
    const isConfirm = await confirm({
      title: `Bạn có chắc chắn muốn xóa tài nguyên hệ thống`,
      message: `Tên: ${resource.description} Mã: ${resource.alias}`,
      variant: "danger",
    });
    if (isConfirm) deleteResource(resource.id);
  };

  const handleAddNew = () => {
    setSelectedResource(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (resource: IResource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: ICreateResource) => {
    if (selectedResource) {
      const isConfirm = await confirm({
        title: `Bạn có muốn cập nhập ${formData.alias}`,
        variant: "info",
      });
      if (isConfirm)
        await updateResource(
          { id: selectedResource.id, ...formData },
          {
            onSuccess: () => handleCloseModal(),
          },
        );
    } else {
      const isConfirm = await confirm({
        title: `Bạn có muốn lưu tài nguyên này`,
        variant: "info",
      });
      if (isConfirm)
        await createResource(formData, {
          onSuccess: () => handleCloseModal(),
        });
    }
    // handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(undefined);
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Danh sách tài nguyên
          </h1>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên tài nguyên..."
              className=" border border-gray-200 rounded-md pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition bg-gray-50/50"
              value={searchInput}
              onChange={handleSearch}
            />
          </div>
          <div className="relative flex-1">
            <select
              className="border border-gray-200 rounded-md px-2 py-2.5 outline-none text-gray-600 text-xs cursor-pointer transition bg-gray-50/50 w-full"
              value={selectIsActive}
              onChange={(e) =>
                handleSelectIsActive(e.target.value as "all" | "true" | "false")
              }
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="true">Bật</option>
              <option value="false">Tắt</option>
            </select>
          </div>
          {isFetching && <MenuLoading />}
        </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition shrink-0"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm tài nguyên</span>
        </button>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0 table-fixed">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-2.5 font-semibold w-[60px] text-gray-700 text-center border border-gray-200">
                  STT
                </th>
                <th
                  className="px-4 py-2.5 font-semibold w-[140px] text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("alias")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Mã</span>
                    <span className="shrink-0">{getSortIcon("alias")}</span>
                  </div>
                </th>

                <th
                  className="px-4 py-2.5 font-semibold min-w-[200px] text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("descreption")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Tên tài nguyên</span>
                    <span className="shrink-0">
                      {getSortIcon("descreption")}
                    </span>
                  </div>
                </th>

                <th className="px-4 py-2.5 font-semibold w-[120px] text-gray-700 text-center border border-gray-200">
                  Trạng thái
                </th>

                {/* Biểu tượng: 100px */}
                {/* <th className="px-4 py-2.5 font-semibold w-[168px] text-gray-700 text-center border border-gray-200">
                  Biểu tượng
                </th> */}

                {/* Đường dẫn: 200px */}
                <th
                  className="px-4 py-2.5 font-semibold w-[220px] text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("href")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Đường dẫn</span>
                    <span className="shrink-0">{getSortIcon("href")}</span>
                  </div>
                </th>

                <th
                  className="px-4 py-2.5 font-semibold w-[160px] text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Ngày tạo</span>
                    <span className="shrink-0">
                      {getSortIcon("created_at")}
                    </span>
                  </div>
                </th>

                <th
                  className="px-4 py-2.5 font-semibold w-[160px] text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("updated_at")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Cập nhật cuối</span>
                    <span className="shrink-0 ">
                      {getSortIcon("updated_at")}
                    </span>
                  </div>
                </th>

                <th className="px-4 py-2.5 font-semibold w-[100px] text-gray-700 text-center border border-gray-200">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-gray-400 border border-gray-200"
                  >
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto mb-2 opacity-20"
                    />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="p-12 text-center text-gray-400 font-light italic border border-gray-200"
                  >
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                resources.map((resource: IResource, index) => {
                  const currentPage = params.page || 1;
                  const currentLimit = params.limit || 10;
                  const stt = (currentPage - 1) * currentLimit + index + 1;
                  const isExpanded = expandedRowId === resource.id;
                  return (
                    <React.Fragment key={resource.id}>
                      <tr
                        key={resource.id}
                        className="hover:bg-blue-50/30 transition-colors"
                      >
                        <td className="px-4 py-2 text-gray-400 font-mono text-xs text-center border border-gray-200">
                          {stt}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-800 text-center border border-gray-200">
                          {resource.alias}
                        </td>
                        <td className="px-4 py-2 font-medium text-gray-800 text-left border border-gray-200">
                          {resource.description}
                        </td>
                        <td className="px-4 py-2 border border-gray-200 text-center">
                          {resource.is_active ? (
                            <span className="flex items-center gap-2 justify-center text-green-500">
                              <CheckCircle2 size={10} /> Bật
                            </span>
                          ) : (
                            <span className="flex items-center gap-2 justify-center text-red-500">
                              <CircleOff size={10} /> Tắt
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          {resource.href ? resource.href : "Không có dữ liệu"}
                        </td>
                        <td className="border border-gray-200 text-center text-xs">
                          <span>
                            {dayjs(resource.created_at).format("DD/MM/YYYY")}
                          </span>
                          <div className="text-gray-400 mt-0.5">
                            {dayjs(resource.created_at).format("HH:mm:ss")}
                          </div>
                        </td>
                        <td className="border border-gray-200 text-center text-xs">
                          <span>
                            {dayjs(resource.updated_at).format("DD/MM/YYYY")}
                          </span>
                          <div className="text-gray-400 mt-0.5">
                            {dayjs(resource.updated_at).format("HH:mm:ss")}
                          </div>
                        </td>
                        <td className="px-4 py-2 border border-gray-200">
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => toggleRow(resource.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-transform"
                              style={{
                                transform: isExpanded
                                  ? "rotate(180deg)"
                                  : "rotate(0deg)",
                              }}
                            >
                              <ChevronDown
                                size={16}
                                className="text-gray-500"
                              />
                            </button>
                            <button
                              onClick={() => handleEdit(resource)}
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition"
                              title="Chỉnh sửa"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(resource)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr className="bg-gray-50/50">
                          <td colSpan={8} className="p-0">
                            <div className="animate-in slide-in-from-top-2 duration-200">
                              <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                                <table className="w-full text-left border-separate border-spacing-0 table-fixed">
                                    <thead className="bg-gray-50/80">
                                      <tr>
                                        <th className="px-4 py-2.5 font-semibold w-[60px] text-gray-700 text-center border border-gray-200">
                                          STT
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold  text-gray-700 border border-gray-200">
                                          Mã
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200 w-[200px]">
                                          Đường dẫn
                                        </th>
                                        <th className="px-4 py-2.5 font-semibold w-[100px] text-gray-700 text-center border border-gray-200">
                                          Trạng thái
                                        </th>
                                      </tr>
                                    </thead>
                                  <tbody>
                                    {resource.resourceDetails?.length > 0 ? (
                                      resource.resourceDetails.map(
                                        (detail, dIdx) => (
                                          <tr
                                            key={dIdx}
                                            className="hover:bg-blue-100 cursor-pointer transition-colors"
                                            onClick={() => {
                                              const targetUrl = `menus/${detail?.id}`;
                                              if (targetUrl) router.push(targetUrl);
                                            }}
                                          >
                                            <td className="px-4 py-2 text-gray-400 font-mono text-xs text-center border border-gray-200">
                                              {dIdx + 1}
                                            </td>
                                            <td className="px-4 py-2 font-medium text-gray-800 border border-gray-200">
                                              {detail.alias}
                                            </td>
                                            <td className="px-4 py-2 font-mono  border border-gray-200 truncate">
                                              {detail.href ||
                                                (detail as any).herf ||
                                                "—"}
                                            </td>
                                            <td className="px-4 py-2 border border-gray-200 text-center">
                                              {detail.is_active ? (
                                                <span className="flex items-center gap-2 justify-center text-green-500">
                                                  <CheckCircle2 size={10} /> Bật
                                                </span>
                                              ) : (
                                                <span className="flex items-center gap-2 justify-center text-red-500">
                                                  <CircleOff size={10} /> Tắt
                                                </span>
                                              )}
                                            </td>
                                          </tr>
                                        ),
                                      )
                                    ) : (
                                      <tr>
                                        <td
                                          colSpan={4}
                                          className="p-8 text-center text-gray-400 font-light italic border border-gray-200"
                                        >
                                          Không có tài nguyên con
                                        </td>
                                      </tr>
                                    )}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </tbody>
            {meta && (
              <tfoot className="bg-gray-50/50">
                <tr>
                  <td
                    colSpan={8}
                    className="px-4 py-2.5 border-t border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      {/* PHẦN HIỂN THỊ SỐ KẾT QUẢ */}
                      <div className="text-xs text-gray-500">
                        Hiển thị{" "}
                        <span className="font-medium text-gray-700">
                          {resources.length}
                        </span>
                        /{meta.total} kết quả
                      </div>

                      {/* PHẦN CHỌN LIMIT */}
                      <select
                        className="border border-gray-200 rounded-md px-2 py-1.5 outline-none bg-white text-gray-600 text-xs shadow-sm cursor-pointer"
                        value={params.limit}
                        onChange={(e) =>
                          setParams((prev) => ({
                            ...prev,
                            limit: Number(e.target.value),
                            page: 1,
                          }))
                        }
                      >
                        <option value={1}>1 / trang</option>
                        <option value={10}>10 / trang</option>
                        <option value={20}>20 / trang</option>
                      </select>

                      {/* PHẦN ĐIỀU HƯỚNG TRANG */}
                      <div className="flex items-center gap-1">
                        <button
                          disabled={params.page === 1}
                          onClick={() => handlePageChange(params.page! - 1)}
                          className="p-1 border rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition shadow-sm bg-white"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <div className="flex gap-1 px-2">
                          {[...Array(meta.totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => handlePageChange(i + 1)}
                              className={`min-w-5 h-7 text-xs rounded transition font-medium ${
                                params.page === i + 1
                                  ? "bg-blue-600 text-white shadow-sm"
                                  : "hover:bg-white border border-transparent hover:border-gray-200"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={params.page === meta.totalPages}
                          onClick={() => handlePageChange(params.page! + 1)}
                          className="p-1 border rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition shadow-sm bg-white"
                        >
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  </td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
      <ResourceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        data={selectedResource}
        loading={isCreating || isUpdating}
      />
    </section>
  );
}
