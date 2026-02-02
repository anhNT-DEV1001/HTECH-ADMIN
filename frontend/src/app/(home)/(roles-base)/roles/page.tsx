"use client";

import React, { useState, useEffect } from "react";
import { useRole } from "@/features/role/hooks";
import { IPaginationRequest } from "@/common/interfaces";
import {
  Pencil,
  Trash2,
  Search,
  ChevronLeft,
  ChevronRight,
  Plus,
  Loader2,
  X,
  ArrowDownWideNarrow,
  ChevronUp,
  ChevronDown,
  Shield,
} from "lucide-react";
import { IRole } from "@/features/role/interfaces";
import dayjs from "dayjs";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useDebouncedValue } from "@/common/hooks";
import RoleLoading from "./loading";
import RoleModal from "@/features/role/components/RoleModal";
export default function RoleManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<IPaginationRequest>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "name",
    sortBy: "desc",
    orderBy: "created_at",
  });

  const {
    rolesData,
    isLoading,
    isFetching,
    deleteRole,
    createRole,
    updateRole,
    isCreating,
    isUpdating,
  } = useRole(params);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState<any>(null);
  const { confirm } = useConfirm();
  const meta = rolesData?.data?.meta;
  const roles = rolesData?.data?.records || [];
  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebouncedValue(searchInput, 500);
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
    if (params.sortBy) newParams.set("sortBy", params.sortBy);
    if (params.orderBy) newParams.set("orderBy", params.orderBy);
    // Đẩy lên URL mà không làm load lại trang (shallow routing)
    router.push(`${pathname}?${newParams.toString()}`, { scroll: false });
  }, [params, pathname, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleAddNew = () => {
    setSelectedRole(null);
    setIsModalOpen(true);
  };

  const handleEdit = (role: any) => {
    setSelectedRole(role);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: any) => {
    if (selectedRole) {
      const isConfirm = await confirm({
        title: "Xác nhận cập nhật quyền",
        variant: "info",
      });
      if (isConfirm) {
        updateRole(
          { id: selectedRole.id, body: formData },
          {
            onSuccess: () => setIsModalOpen(false),
          },
        );
      }
    } else {
      createRole(formData, {
        onSuccess: () => setIsModalOpen(false),
      });
    }
  };

  const handleDelete = async (role: IRole) => {
    const isConfirm = await confirm({
      title: `Xác nhận xóa quyền ${role.name}`,
      variant: "danger",
    });
    if (isConfirm) deleteRole(role.id);
  };

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý quyền</h1>
        </div>
      </div>

      {/* FILTER SECTION */}
      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        {/* Nhóm bên trái: Gồm Search và Loader */}
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Tìm kiếm tên quyền..."
              className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition bg-gray-50/50"
              value={searchInput}
              onChange={handleSearch}
            />
          </div>

          {isFetching && <RoleLoading />}
        </div>

        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition shrink-0"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm quyền</span>
        </button>
      </div>

      {/* TABLE & PAGINATION CONTAINER */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-gray-700 w-16 text-center border border-gray-200">
                  STT
                </th>

                {/* Cột Tên Quyền */}
                <th
                  className="px-4 py-2.5 font-semibold text-gray-700 text-center border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("name")}
                >
                  <div className="flex items-center justify-center gap-2 select-none">
                    <span>Tên quyền</span>
                    {getSortIcon("name")}
                  </div>
                </th>

                {/* Cột Mô tả  */}
                <th className="px-4 py-2.5 font-semibold text-gray-700 text-center border border-gray-200">
                  Mô tả
                </th>

                {/* Cột Ngày tạo */}
                <th
                  className="px-4 py-2.5 font-semibold text-gray-700 text-center border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("created_at")}
                >
                  <div className="flex items-center justify-center gap-2 select-none">
                    <span>Ngày tạo</span>
                    {getSortIcon("created_at")}
                  </div>
                </th>

                {/* Cột Cập nhật lần cuối */}
                <th
                  className="px-4 py-2.5 font-semibold text-gray-700 text-center border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort("updated_at")}
                >
                  <div className="flex items-center justify-center gap-2 select-none">
                    <span>Cập nhật lần cuối</span>
                    {getSortIcon("updated_at")}
                  </div>
                </th>

                <th className="px-4 py-2.5 font-semibold text-gray-700 text-center border border-gray-200">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-gray-400 border border-gray-200"
                  >
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto mb-2 opacity-20"
                    />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : roles.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="p-12 text-center text-gray-400 font-light italic border border-gray-200"
                  >
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                roles.map((role: IRole, index) => {
                  const currentPage = params.page || 1;
                  const currentLimit = params.limit || 10;
                  const stt = (currentPage - 1) * currentLimit + index + 1;
                  return (
                    <tr
                      key={role.id}
                      className="hover:bg-blue-50/30 transition-colors"
                    >
                      {/* Thêm 'border border-gray-200' cho mỗi td */}
                      <td className="px-4 py-2 text-gray-400 font-mono text-xs text-center border border-gray-200">
                        {stt}
                      </td>
                      <td className="px-4 py-2 font-medium text-gray-800 text-center border border-gray-200">
                        {role.name}
                      </td>
                      <td className="px-4 py-2 text-gray-800 truncate max-w-2xs border border-gray-200">
                        {role.description}
                      </td>
                      <td className="px-4 py-2 text-gray-800 text-center text-xs border border-gray-200">
                        <span className="font-medium">
                          {dayjs(role.created_at).format("DD/MM/YYYY")}
                        </span>
                        <div className="text-gray-400 mt-0.5">
                          {dayjs(role.created_at).format("HH:mm:ss")}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-gray-800 text-center text-xs border border-gray-200">
                        <span className="font-medium">
                          {dayjs(role.updated_at || role.created_at).format(
                            "DD/MM/YYYY",
                          )}
                        </span>
                        <div className="text-gray-400 mt-0.5">
                          {dayjs(role.updated_at || role.created_at).format(
                            "HH:mm:ss",
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 border border-gray-200">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => {}}
                            className="p-1.5 hover:bg-blue-100 text-green-500 rounded-md transition"
                            title="Phân quyền"
                          >
                            <Shield size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition"
                            title="Chỉnh sửa"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(role)}
                            className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
            {meta && (
              <tfoot className="bg-gray-50/50">
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-2.5 border-t border-gray-200"
                  >
                    <div className="flex justify-between items-center">
                      {/* PHẦN HIỂN THỊ SỐ KẾT QUẢ */}
                      <div className="text-xs text-gray-500">
                        Hiển thị{" "}
                        <span className="font-medium text-gray-700">
                          {roles.length}
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
        <RoleModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
          data={selectedRole}
          loading={isCreating || isUpdating}
        />
      </div>
    </div>
  );
}