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
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên"
                className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition bg-gray-50/50"
                value={searchInput}
                onChange={handleSearch}
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

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-separate border-spacing-0">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-4 py-2.5 font-semibold text-gray-700 w-16 text-center border border-gray-200">STT</th>
                <th 
                    className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("username")}
                >
                    <div className="flex items-center gap-2 select-none">
                        <span>Tài khoản</span>
                        {getSortIcon("username")}
                    </div>
                </th>
                <th 
                    className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors"
                    onClick={() => handleSort("fullName")}
                >
                    <div className="flex items-center gap-2 select-none">
                        <span>Họ tên</span>
                        {getSortIcon("fullName")}
                    </div>
                </th>
                <th className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200">Email</th>
                <th className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200">SĐT</th>
                <th className="px-4 py-2.5 font-semibold text-gray-700 border border-gray-200">Ngày sinh</th>
                <th className="px-4 py-2.5 font-semibold text-gray-700 text-center border border-gray-200">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                  <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400">
                          <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                          Đang tải dữ liệu...
                      </td>
                  </tr>
              ) : users.length === 0 ? (
                  <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400 font-light italic">
                          Không tìm thấy dữ liệu phù hợp
                      </td>
                  </tr>
              ) : (
                  users.map((user, index) => {
                      const currentPage = params.page || 1;
                      const currentLimit = params.limit || 10;
                      const stt = (currentPage - 1) * currentLimit + index + 1;
                      return (
                          <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                              <td className="px-4 py-2 text-gray-500 font-mono text-xs text-center border border-gray-200">{stt}</td>
                              <td className="px-4 py-2 font-medium text-gray-800 border border-gray-200">{user.username}</td>
                              <td className="px-4 py-2 text-gray-800 border border-gray-200">{user.fullName}</td>
                              <td className="px-4 py-2 text-gray-600 border border-gray-200">{user.email}</td>
                              <td className="px-4 py-2 text-gray-600 border border-gray-200">{user.phone}</td>
                              <td className="px-4 py-2 text-gray-600 border border-gray-200">
                                  {user.dob ? dayjs(user.dob).format("DD/MM/YYYY") : "-"}
                              </td>
                              <td className="px-4 py-2 border border-gray-200 text-center">
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
                      )
                  })
              )}
            </tbody>
            {meta && (
                <tfoot className="bg-gray-50/50">
                    <tr>
                        <td colSpan={7} className="px-4 py-2.5 border-t border-gray-200">
                            <div className="flex justify-between items-center">
                                <div className="text-xs text-gray-500">
                                    Hiển thị <span className="font-medium text-gray-700">{users.length}</span>/{meta.total} kết quả
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        className="border border-gray-200 rounded-md px-2 py-1.5 outline-none bg-white text-gray-600 text-xs shadow-sm cursor-pointer"
                                        value={params.limit}
                                        onChange={(e) => setParams(prev => ({ ...prev, limit: Number(e.target.value), page: 1 }))}
                                    >
                                        <option value={10}>10 / trang</option>
                                        <option value={20}>20 / trang</option>
                                        <option value={50}>50 / trang</option>
                                    </select>
                                    <div className="flex items-center gap-1">
                                        <button
                                            disabled={params.page === 1}
                                            onClick={() => handlePageChange(params.page! - 1)}
                                            className="p-1 border rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition shadow-sm bg-white"
                                        >
                                            <ChevronLeft size={16} />
                                        </button>
                                        <span className="text-xs font-medium px-2">Trang {params.page} / {meta.totalPages}</span>
                                        <button
                                            disabled={params.page === meta.totalPages}
                                            onClick={() => handlePageChange(params.page! + 1)}
                                            className="p-1 border rounded hover:bg-white disabled:opacity-30 disabled:hover:bg-transparent transition shadow-sm bg-white"
                                        >
                                            <ChevronRight size={16} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
      </div>

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