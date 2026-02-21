"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Images, Loader2, Pencil, Plus, Search, Shield, Trash2, Trash2Icon } from "lucide-react";
import { IPaginationRequest } from "@/common/interfaces";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNews } from "@/features/news/hooks";
import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import dayjs from "dayjs";

export default function HtechNew() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [params, setParams] = useState<IPaginationRequest>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "fullName",
    sortBy: "desc",
    orderBy: "created_at",
  });
  const router = useRouter();
  const pathname = usePathname();
  const { confirm } = useConfirm();

  const {
    newsData,
    isLoading,
    isFetching,
    createNewsMutation,
    updateNewsMutation,
    deleteNewsMutation,
    isCreating,
    isDeleting,
    isUpdating
  } = useNews(params);
  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebouncedValue(searchInput, 500);
  const meta = newsData?.data?.meta;
  const news = newsData?.data?.records || []; 

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
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

  const handleAddNew = () => {
    router.push('htech-news/create');
  }
  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Quản lý tin tức
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
                // onChange={handleSearch}
                onChange={()=> {}}
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>
        <button
          onClick={handleAddNew}
          className="btn btn-primary btn-md"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm tin tức</span>
        </button>
      </div>

      <div className="table-container">
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th className="table-header-cell">STT</th>
                <th className="table-header-cell">Tiêu đề</th>
                <th className="table-header-cell">Tóm tắt</th>
                <th className="table-header-cell">Ngày tạo</th>
                <th className="table-header-cell">Ngày cập nhật</th>
                <th className="table-header-cell">Thao tác</th>
              </tr>
            </thead>
            <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      <Loader2
                        size={24}
                        className="animate-spin mx-auto mb-2 opacity-20"
                      />
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : news.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="table-empty">
                      Không tìm thấy dữ liệu phù hợp
                    </td>
                  </tr>
                ) : (
                  news.map((newItem ,index) => {
                    const currentPage = params.page || 1;
                    const currentLimit = params.limit || 10;
                    const stt = (currentPage - 1) * currentLimit + Number(index) + 1;
                    return (
                      <tr key={newItem.id} className="table-row">
                          <td>{stt}</td>
                          <td>{newItem.title_vn}</td>
                          <td>{newItem.summary_vn}</td>
                          <td>
                            <span>{dayjs(newItem.created_at).format("DD/MM/YYYY")}</span>
                            <div className="text-gray-400 mt-0.5">
                              {dayjs(newItem.created_at).format("HH:mm:ss")}
                            </div>
                          </td>
                          <td>
                            <span>{dayjs(newItem.updated_at).format("DD/MM/YYYY")}</span>
                            <div className="text-gray-400 mt-0.5">
                              {dayjs(newItem.updated_at).format("HH:mm:ss")}
                            </div>
                          </td>
                          <td>
                            <div className="flex justify-center gap-1">
                              <button
                                onClick={() => router.push(`/htech-news/${newItem.id}`)}
                                className="p-1.5 hover:bg-blue-100 text-blue-600 rounded-md transition"
                                title="Cập nhật"
                              >
                                <Pencil size={15} />
                              </button>
                              <button
                                onClick={async () => {
                                  if (await confirm({
                                    title: 'Xóa tin tức',
                                    message: 'Bạn có chắc chắn muốn xóa tin tức này?',
                                    variant: 'danger'
                                  })) {
                                    deleteNewsMutation.mutate(newItem.id);
                                  }
                                }}
                                disabled={isDeleting}
                                className="p-1.5 hover:bg-red-100 text-red-600 rounded-md transition disabled:opacity-50"
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
              <tfoot>
                <tr>
                  <td colSpan={8}>
                    <div className="table-pagination flex justify-between items-center">
                      {/* Tổng số hiển thị */}
                      <div>
                        Hiển thị{" "}
                        <span className="font-medium text-gray-700">
                          {news.length}
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

    </section>
  );
}
