"use client";
import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Loader2, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { IPaginationRequest } from "@/common/interfaces";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNews } from "@/features/news/hooks";
import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import dayjs from "dayjs";

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
        <h1 className="text-xl font-bold text-gray-800">Quản lý tin tức</h1>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Input
                type="text"
                placeholder="Tìm kiếm theo tên"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pr-9"
              />
              <Search
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
                size={16}
              />
            </div>
          </div>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm tin tức</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">STT</TableHead>
            <TableHead>Tiêu đề</TableHead>
            <TableHead>Tóm tắt</TableHead>
            <TableHead className="text-center">Ngày tạo</TableHead>
            <TableHead className="text-center">Ngày cập nhật</TableHead>
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
            ) : news.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Không tìm thấy dữ liệu phù hợp
                </TableCell>
              </TableRow>
            ) : (
              news.map((newItem ,index) => {
                const currentPage = params.page || 1;
                const currentLimit = params.limit || 10;
                const stt = (currentPage - 1) * currentLimit + Number(index) + 1;
                return (
                  <TableRow key={newItem.id}>
                      <TableCell className="text-center text-muted-foreground font-mono text-xs">{stt}</TableCell>
                      <TableCell>{newItem.title_vn}</TableCell>
                      <TableCell className="truncate max-w-[250px]">{newItem.summary_vn}</TableCell>
                      <TableCell className="text-xs">
                        <span>{dayjs(newItem.created_at).format("DD/MM/YYYY")}</span>
                        <div className="text-muted-foreground mt-0.5">
                          {dayjs(newItem.created_at).format("HH:mm:ss")}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs">
                        <span>{dayjs(newItem.updated_at).format("DD/MM/YYYY")}</span>
                        <div className="text-muted-foreground mt-0.5">
                          {dayjs(newItem.updated_at).format("HH:mm:ss")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => router.push(`/htech-news/${newItem.id}`)}
                            className="text-blue-600 hover:bg-blue-100"
                            title="Cập nhật"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
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
                            className="text-red-600 hover:bg-red-100"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                  </TableRow>
                )
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
                      {news.length}
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

    </section>
  );
}
