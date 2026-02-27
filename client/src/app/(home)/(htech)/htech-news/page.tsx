"use client";
import { useEffect, useState } from "react";
import { ArrowDownWideNarrow, CalendarIcon, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Filter, Loader2, Pencil, Plus, Search, Trash2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useNews, useNewsCategories } from "@/features/news/hooks";
import { INewsFilterParams } from "@/features/news/interfaces";
import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { useToast } from "@/common/providers/ToastProvider";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Label } from "@/components/ui/label";

export default function HtechNew() {
  const [open, setOpen] = useState(false);
  const searchParams = useSearchParams();
  const [params, setParams] = useState<INewsFilterParams>({
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
  const { showToast } = useToast();

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  const [categoryId, setCategoryId] = useState<string>("");
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

  const { categories } = useNewsCategories();

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

  // Count active filters
  const activeFilterCount = [startDate, endDate, categoryId && categoryId !== "all" ? categoryId : null].filter(Boolean).length;

  const handleApplyFilter = () => {
    if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      showToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "error");
      return;
    }
    setParams((prev) => ({
      ...prev,
      page: 1,
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
      category_id: categoryId && categoryId !== "all" ? Number(categoryId) : undefined,
    }));
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setCategoryId("");
    setParams((prev) => ({
      ...prev,
      page: 1,
      startDate: undefined,
      endDate: undefined,
      category_id: undefined,
    }));
    setFilterOpen(false);
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

          {/* Filter Button */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative gap-2">
                <Filter size={16} />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-orange-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="font-medium text-sm">Bộ lọc nâng cao</h4>

                {/* Start Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ngày bắt đầu</Label>
                  <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {startDate ? dayjs(startDate).format("DD/MM/YYYY") : "Chọn ngày bắt đầu"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => {
                          setStartDate(date);
                          setStartDatePopoverOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* End Date */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ngày kết thúc</Label>
                  <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start text-left font-normal"
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {endDate ? dayjs(endDate).format("DD/MM/YYYY") : "Chọn ngày kết thúc"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => {
                          setEndDate(date);
                          setEndDatePopoverOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Thể loại</Label>
                  <Select value={categoryId} onValueChange={setCategoryId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả thể loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả thể loại</SelectItem>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={String(cat.id)}>
                          {cat.name_vn}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Action buttons */}
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1 gap-1"
                    onClick={handleClearFilter}
                  >
                    <X size={14} />
                    Xoá bộ lọc
                  </Button>
                  <Button
                    className="flex-1"
                    onClick={handleApplyFilter}
                  >
                    Áp dụng
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
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
            <TableHead className="cursor-pointer" onClick={() => handleSort("title_vn")}>
              <div className="flex items-center gap-2 whitespace-nowrap select-none">
                <span>Tiêu đề</span>
                <span className="shrink-0">{getSortIcon("title_vn")}</span>
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("summary_vn")}>
              <div className="flex items-center gap-2 whitespace-nowrap select-none">
                <span>Tóm tắt</span>
                <span className="shrink-0">{getSortIcon("summary_vn")}</span>
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("category_id")}>
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Thể loại</span>
                <span className="shrink-0">{getSortIcon("category_id")}</span>
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Ngày tạo</span>
                <span className="shrink-0">{getSortIcon("created_at")}</span>
              </div>
            </TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("updated_at")}>
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Ngày cập nhật</span>
                <span className="shrink-0">{getSortIcon("updated_at")}</span>
              </div>
            </TableHead>
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
          ) : news.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            news.map((newItem, index) => {
              const currentPage = params.page || 1;
              const currentLimit = params.limit || 10;
              const stt = (currentPage - 1) * currentLimit + Number(index) + 1;
              return (
                <TableRow key={newItem.id}>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">{stt}</TableCell>
                  <TableCell>{newItem.title_vn}</TableCell>
                  <TableCell className="truncate max-w-[250px]">{newItem.summary_vn}</TableCell>
                  <TableCell className="text-center">{(newItem as any).category?.name_vn || "—"}</TableCell>
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
              <TableCell colSpan={7}>
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
