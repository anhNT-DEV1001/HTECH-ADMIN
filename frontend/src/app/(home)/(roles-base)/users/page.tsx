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
              
              <input
                type="text"
                placeholder="Tìm kiếm theo tên"
                className="input"
                value={searchInput}
                onChange={handleSearch}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
            {isFetching && <Loader2 className="animate-spin text-blue-600" size={20}/>}
          </div>
        <button
          onClick={handleAddNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition shrink-0"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm tài khoản</span>
        </button>
      </div>

      {/* TABLE & PAGINATION CONTAINER */}
      <div className="table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="w-16">STT</th>

                <th
                  className="table-header-cell"
                  onClick={() => handleSort("username")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Tài khoản</span>
                    {getSortIcon("username")}
                  </div>
                </th>

                <th
                  className="table-header-cell"
                  onClick={() => handleSort("fullName")}
                >
                  <div className="flex items-center justify-center gap-2">
                    <span>Họ tên</span>
                    {getSortIcon("fullName")}
                  </div>
                </th>

                <th>Email</th>
                <th>SĐT</th>
                <th>Ngày sinh</th>
                <th>Thao tác</th>
              </tr>
            </thead>

            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="table-empty">
                    <Loader2
                      size={24}
                      className="animate-spin mx-auto mb-2 opacity-20"
                    />
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="table-empty">
                    Không tìm thấy dữ liệu phù hợp
                  </td>
                </tr>
              ) : (
                users.map((user, index) => {
                  const currentPage = params.page || 1;
                  const currentLimit = params.limit || 10;
                  const stt = (currentPage - 1) * currentLimit + index + 1;

                  return (
                    <tr key={user.id} className="table-row">
                      <td className="text-gray-500 font-mono text-xs">{stt}</td>
                      <td className="font-medium text-gray-800">{user.username}</td>
                      <td className="text-gray-800">{user.fullName}</td>
                      <td className="text-gray-600">{user.email}</td>
                      <td className="text-gray-600">{user.phone}</td>
                      <td className="text-gray-600">
                        {user.dob
                          ? dayjs(user.dob).format("DD/MM/YYYY")
                          : "-"}
                      </td>
                      <td>
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handlePermission(user)}
                            className="p-1.5 hover:bg-blue-100 text-green-500 rounded-md transition"
                            title="Phân quyền"
                          >
                            <Shield size={15} />
                          </button>
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition"
                            title="Cập nhật"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(user)}
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
              <tfoot>
                <tr>
                  <td colSpan={7}>
                    <div className="table-pagination flex justify-between items-center">
                      {/* Tổng số hiển thị */}
                      <div>
                        Hiển thị{" "}
                        <span className="font-medium text-gray-700">
                          {users.length}
                        </span>{" "}
                        / {meta.total} kết quả
                      </div>

                      {/* Chọn limit */}
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

                      {/* Phân trang */}
                      <div className="flex items-center gap-1">
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