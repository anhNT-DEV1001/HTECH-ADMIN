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

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm tên quyền..."
              value={searchInput}
              onChange={handleSearch}
              className="pr-9"
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={16}
            />
          </div>

          {isFetching && <RoleLoading />}
        </div>

        <Button onClick={handleAddNew}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm quyền</span>
        </Button>
      </div>

      {/* TABLE & PAGINATION CONTAINER */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">STT</TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Tên quyền</span>
                {getSortIcon("name")}
              </div>
            </TableHead>

            <TableHead>Mô tả</TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Ngày tạo</span>
                {getSortIcon("created_at")}
              </div>
            </TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("updated_at")}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Cập nhật lần cuối</span>
                {getSortIcon("updated_at")}
              </div>
            </TableHead>

            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                <Loader2
                  size={24}
                  className="animate-spin mx-auto mb-2 opacity-20"
                />
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role: IRole, index) => {
              const currentPage = params.page || 1;
              const currentLimit = params.limit || 10;
              const stt = (currentPage - 1) * currentLimit + index + 1;

              return (
                <TableRow key={role.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs text-center">{stt}</TableCell>
                  <TableCell className="font-medium">{role.name}</TableCell>
                  <TableCell className="truncate max-w-[200px]">
                    {role.description}
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className="font-medium">
                      {dayjs(role.created_at).format("DD/MM/YYYY")}
                    </span>
                    <div className="text-muted-foreground">
                      {dayjs(role.created_at).format("HH:mm:ss")}
                    </div>
                  </TableCell>

                  <TableCell className="text-xs">
                    <span className="font-medium">
                      {dayjs(role.updated_at || role.created_at).format(
                        "DD/MM/YYYY"
                      )}
                    </span>
                    <div className="text-muted-foreground">
                      {dayjs(role.updated_at || role.created_at).format(
                        "HH:mm:ss"
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => router.push(`/roles/${role.id}`)}
                        className="text-green-500 hover:bg-blue-100"
                        title="Phân quyền"
                      >
                        <Shield size={15} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleEdit(role)}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={15} />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(role)}
                        className="text-red-600 hover:bg-red-100"
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>

        {meta && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={6}>
                <div className="flex justify-between items-center">
                  {/* Tổng số hiển thị */}
                  <div>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {roles.length}
                    </span>{" "}
                    / {meta.total} kết quả
                  </div>

                  {/* Chọn limit */}
                  <Select
                    value={String(params.limit)}
                    onValueChange={(val) =>
                      setParams((prev) => ({
                        ...prev,
                        limit: Number(val),
                        page: 1,
                      }))
                    }
                  >
                    <SelectTrigger className="w-[120px] h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 / trang</SelectItem>
                      <SelectItem value="10">10 / trang</SelectItem>
                      <SelectItem value="20">20 / trang</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Phân trang */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={params.page === 1}
                      onClick={() => handlePageChange(params.page! - 1)}
                    >
                      <ChevronLeft size={16} />
                    </Button>

                    <div className="flex gap-1 px-2">
                      {[...Array(meta.totalPages)].map((_, i) => (
                        <Button
                          key={i}
                          variant={params.page === i + 1 ? "default" : "outline"}
                          size="icon-xs"
                          onClick={() => handlePageChange(i + 1)}
                        >
                          {i + 1}
                        </Button>
                      ))}
                    </div>

                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={params.page === meta.totalPages}
                      onClick={() => handlePageChange(params.page! + 1)}
                    >
                      <ChevronRight size={16} />
                    </Button>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </TableFooter>
        )}
      </Table>

      {/* Modal */}
      <RoleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        data={selectedRole}
        loading={isCreating || isUpdating}
      />
    </div>
  );
}