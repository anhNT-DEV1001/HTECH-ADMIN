'use client';
import { useUser } from "@/features/user/hooks/useUser";
import { Plus, Search, Pencil, Trash2, ArrowDownWideNarrow, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, Loader2, Shield } from "lucide-react";
import React, { useState, useEffect } from "react";
import { IPaginationRequest } from "@/common/interfaces";
import { useDebouncedValue } from "@/common/hooks";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import UserModal from "@/features/user/components/UserModal";
import { IUserResponse, IUserForm } from "@/features/user/interfaces/user.interface";
import dayjs from "dayjs";
import { useConfirm } from "@/common/providers/ConfirmProvider";

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

export default function UserManagement() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();

  const [params, setParams] = useState<IPaginationRequest>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "fullName",
    sortBy: "desc",
    orderBy: "created_at",
  });

  const {
      usersData,
      isLoading,
      isFetching,
      createUserMutation,
      updateUserMutation,
      deleteUserMutation,
      isCreating,
      isUpdating
  } = useUser(params);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<IUserResponse | null>(null);
  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const meta = usersData?.data?.meta;
  const users = usersData?.data?.records || [];

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

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const handleAddNew = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEdit = (user: IUserResponse) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handlePermission = (user: IUserResponse) => {
    router.push(`/users/${user.id}`);
  };

  const handleDelete = async (user: IUserResponse) => {
      const isConfirm = await confirm({
          title: `Xác nhận xóa người dùng ${user.username}`,
          variant: "danger",
      });
      if(isConfirm) {
          deleteUserMutation.mutate(user.id);
      }
  };

  const handleSave = (data: IUserForm) => {
      const { username, password, email, fullName, phone, dob } = data;
      
      const payload: IUserForm = {
          username,
          password: password || "",
          email,
          fullName,
          phone,
          dob
      };

      if (selectedUser) {
          updateUserMutation.mutate({ id: selectedUser.id, body: payload }, {
              onSuccess: () => setIsModalOpen(false)
          });
      } else {
          createUserMutation.mutate(payload, {
              onSuccess: () => setIsModalOpen(false)
          });
      }
  }

  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên"
                value={searchInput}
                onChange={handleSearch}
                className="pr-9"
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={16}
              />
            </div>
            {isFetching && <Loader2 className="animate-spin text-blue-600" size={20}/>}
          </div>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm tài khoản</span>
        </Button>
      </div>

      {/* TABLE & PAGINATION CONTAINER */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">STT</TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("username")}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Tài khoản</span>
                {getSortIcon("username")}
              </div>
            </TableHead>

            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("fullName")}
            >
              <div className="flex items-center justify-center gap-2">
                <span>Họ tên</span>
                {getSortIcon("fullName")}
              </div>
            </TableHead>

            <TableHead>Email</TableHead>
            <TableHead>SĐT</TableHead>
            <TableHead>Ngày sinh</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                <Loader2
                  size={24}
                  className="animate-spin mx-auto mb-2 opacity-20"
                />
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : users.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            users.map((user, index) => {
              const currentPage = params.page || 1;
              const currentLimit = params.limit || 10;
              const stt = (currentPage - 1) * currentLimit + index + 1;

              return (
                <TableRow key={user.id}>
                  <TableCell className="text-muted-foreground font-mono text-xs text-center">{stt}</TableCell>
                  <TableCell className="font-medium">{user.username}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell className="text-muted-foreground">{user.email}</TableCell>
                  <TableCell className="text-muted-foreground">{user.phone}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {user.dob
                      ? dayjs(user.dob).format("DD/MM/YYYY")
                      : "-"}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handlePermission(user)}
                        className="text-green-500 hover:bg-blue-100"
                        title="Phân quyền"
                      >
                        <Shield size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Cập nhật"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(user)}
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
              <TableCell colSpan={7}>
                <div className="flex justify-between items-center">
                  {/* Tổng số hiển thị */}
                  <div>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {users.length}
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

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={selectedUser}
        loading={isCreating || isUpdating}
      />

    </section>
  );
}