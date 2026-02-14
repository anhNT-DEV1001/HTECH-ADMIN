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
        <button className="btn btn-primary btn-md" 
          onClick={handleAddNew}
         >
            <Plus size={16} />
            <span className="whitespace-nowrap">Thêm tài nguyên</span>
        </button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="w-[60px]">STT</th>
                <th className="w-[140px] table-header-cell" onClick={() => handleSort("alias")}>
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Mã</span>
                    <span className="shrink-0">{getSortIcon("alias")}</span>
                  </div>
                </th>
                <th
                  className="min-w-[200px] table-header-cell"
                  onClick={() => handleSort("description")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Tên tài nguyên</span>
                    <span className="shrink-0">{getSortIcon("description")}</span>
                  </div>
                </th>
                <th className="w-[120px]">Trạng thái</th>
                <th
                  className="w-[220px] table-header-cell"
                  onClick={() => handleSort("href")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Đường dẫn</span>
                    <span className="shrink-0">{getSortIcon("href")}</span>
                  </div>
                </th>
                <th
                  className="w-[160px] table-header-cell"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Ngày tạo</span>
                    <span className="shrink-0">{getSortIcon("created_at")}</span>
                  </div>
                </th>
                <th
                  className="w-[160px] table-header-cell"
                  onClick={() => handleSort("updated_at")}
                >
                  <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                    <span>Cập nhật cuối</span>
                    <span className="shrink-0">{getSortIcon("updated_at")}</span>
                  </div>
                </th>
                <th className="w-[100px]">Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="table-empty">
                    <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : resources.length === 0 ? (
                <tr>
                  <td colSpan={8} className="table-empty">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                resources.map((resource, index) => {
                  const stt = (Number(params.page) - 1) * Number(params.limit) + index + 1;
                  const isExpanded = expandedRowId === resource.id;
                  return (
                    <React.Fragment key={resource.id}>
                      <tr className="table-row">
                        <td className="table-col-xs">{stt}</td>
                        <td className="table-col-text">{resource.alias}</td>
                        <td className="table-col-text text-left">{resource.description}</td>
                        <td>
                          {resource.is_active ? (
                            <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                              Bật
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                              Tắt
                            </span>
                          )}
                        </td>
                        <td className="table-col-truncate">
                          {resource.href || "Không có dữ liệu"}
                        </td>
                        <td className="text-xs">
                          <span>{dayjs(resource.created_at).format("DD/MM/YYYY")}</span>
                          <div className="text-gray-400 mt-0.5">
                            {dayjs(resource.created_at).format("HH:mm:ss")}
                          </div>
                        </td>
                        <td className="text-xs">
                          <span>{dayjs(resource.updated_at).format("DD/MM/YYYY")}</span>
                          <div className="text-gray-400 mt-0.5">
                            {dayjs(resource.updated_at).format("HH:mm:ss")}
                          </div>
                        </td>
                        <td>
                          <div className="flex justify-center gap-1">
                            <button
                              onClick={() => toggleRow(resource.id)}
                              className="p-1 hover:bg-gray-200 rounded transition-transform"
                              style={{
                                transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              }}
                            >
                              <ChevronDown size={16} className="text-gray-500" />
                            </button>
                            <button
                              onClick={() => handleEdit(resource)}
                              className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(resource)}
                              className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="table-row-sub">
                          <td colSpan={8} className="p-0">
                            <div className="animate-in slide-in-from-top-2 duration-200">
                              <div className="table-nested">
                                <table className="table">
                                  <thead>
                                    <tr>
                                      <th className="w-[60px]">STT</th>
                                      <th>Mã</th>
                                      <th className="w-[200px]">Đường dẫn</th>
                                      <th className="w-[100px]">Trạng thái</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {resource.resourceDetails?.length > 0 ? (
                                      resource.resourceDetails.map((detail, dIdx) => (
                                        <tr
                                          key={dIdx}
                                          className="hover:bg-blue-100 cursor-pointer transition-colors"
                                          onClick={() => router.push(`menus/${detail?.id}`)}
                                        >
                                          <td className="table-col-xs">{dIdx + 1}</td>
                                          <td className="table-col-text">{detail.alias}</td>
                                          <td className="table-col-truncate font-mono">
                                            {detail.herf || "—"}
                                          </td>
                                          <td>
                                            {detail.is_active ? (
                                              <span className="inline-flex items-center rounded-md bg-green-50 px-2 py-1 text-xs font-medium text-green-700 ring-1 ring-inset ring-green-600/20">
                                                Bật
                                              </span>
                                            ) : (
                                              <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/10">
                                                Tắt
                                              </span>
                                            )}
                                          </td>
                                        </tr>
                                      ))
                                    ) : (
                                      <tr>
                                        <td colSpan={4} className="table-empty">
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
              <tfoot>
                <tr>
                  <td colSpan={8}>
                    <div className="table-pagination grid grid-cols-3 items-center">
                      <div className="text-sm text-gray-500">
                        Hiển thị{" "}
                        <span className="font-medium text-gray-900">
                          {resources.length}
                        </span>{" "}
                        / {meta.total} kết quả
                      </div>

                      <div className="flex justify-center">
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
                      </div>

                      <div className="flex justify-end gap-1">
                        <button
                          disabled={params.page === 1}
                          onClick={() => handlePageChange(params.page! - 1)}
                          className="table-pagination-button"
                        >
                          <ChevronLeft size={16} />
                        </button>

                        <div className="flex gap-1 px-2">
                          {[...Array(meta.totalPages)].map((_, i) => (
                            <button
                              key={i}
                              onClick={() => handlePageChange(i + 1)}
                              className={`table-pagination-page ${
                                params.page === i + 1
                                  ? "table-pagination-page-active"
                                  : "table-pagination-page-inactive"
                              }`}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </div>

                        <button
                          disabled={params.page === meta.totalPages}
                          onClick={() => handlePageChange(params.page! + 1)}
                          className="table-pagination-button"
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
