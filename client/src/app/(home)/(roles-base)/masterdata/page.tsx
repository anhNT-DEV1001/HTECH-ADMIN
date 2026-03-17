"use client";
import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
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

import { useMasterData } from "@/features/masterdata/hooks";
import { IMasterDataFilterParams, IMasterData } from "@/features/masterdata/interfaces";
import { MasterDataForm } from "./_components/MasterDataForm";

export default function MasterDataPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { confirm } = useConfirm();

  const [params, setParams] = useState<IMasterDataFilterParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    sortBy: (searchParams.get("sortBy") as "asc" | "desc") || "desc",
    orderBy: searchParams.get("orderBy") || "created_at",
  });

  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const { masterData: responseData, isLoading, deleteMasterData } = useMasterData(params);
  
  const meta = responseData?.meta;
  const records = responseData?.records || [];

  // Dialog state
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<IMasterData | null>(null);

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

  const handleDelete = async (id: number) => {
    if (
      await confirm({
        title: "Xóa cấu hình",
        message: "Bạn có chắc chắn muốn xóa cấu hình này? Hành động này không thể hoàn tác.",
        variant: "danger",
      })
    ) {
      deleteMasterData.mutate(id);
    }
  };

  const handleAddNew = () => {
    setSelectedItem(null);
    setIsDialogOpen(true);
  };

  const handleEdit = (item: IMasterData) => {
    setSelectedItem(item);
    setIsDialogOpen(true);
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <h1 className="text-xl font-bold text-gray-800">Cấu hình chung</h1>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm ..."
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
          <Plus size={16} className="mr-1" />
          <span className="whitespace-nowrap">Thêm mới</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">STT</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("dataKey")}
            >
              <div className="flex items-center gap-2 whitespace-nowrap select-none">
                <span>Khóa (Key)</span>
                <span className="shrink-0">{getSortIcon("dataKey")}</span>
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center gap-2 whitespace-nowrap select-none">
                <span>Tên hiển thị</span>
                <span className="shrink-0">{getSortIcon("name")}</span>
              </div>
            </TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("dataValue")}
            >
              <div className="flex items-center gap-2 whitespace-nowrap select-none">
                <span>Giá trị</span>
                <span className="shrink-0">{getSortIcon("dataValue")}</span>
              </div>
            </TableHead>
            <TableHead>Mô tả</TableHead>
            <TableHead
              className="cursor-pointer"
              onClick={() => handleSort("updated_at")}
            >
              <div className="flex items-center gap-2 whitespace-nowrap select-none">
                <span>Ngày cập nhật</span>
                <span className="shrink-0">{getSortIcon("updated_at")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center w-24">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                <Loader2
                  size={24}
                  className="animate-spin mx-auto mb-2 opacity-20"
                />
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : records.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            records.map((item, index) => {
              const currentPage = params.page || 1;
              const currentLimit = params.limit || 10;
              const stt = (currentPage - 1) * currentLimit + index + 1;
              return (
                <TableRow key={item.id}>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">
                    {stt}
                  </TableCell>
                  <TableCell className="font-medium text-blue-600">
                    {item.dataKey}
                  </TableCell>
                  <TableCell>{item.name}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={item.dataValue}>
                    {item.dataValue}
                  </TableCell>
                  <TableCell className="max-w-[250px] truncate text-muted-foreground" title={item.description || ""}>
                    {item.description || "—"}
                  </TableCell>
                  <TableCell className="text-xs">
                    <span>{dayjs(item.updated_at).format("DD/MM/YYYY")}</span>
                    <div className="text-muted-foreground mt-0.5">
                      {dayjs(item.updated_at).format("HH:mm:ss")}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleEdit(item)}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Cập nhật"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteMasterData.isPending}
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
                  <div>
                    Hiển thị <span className="font-medium">{records.length}</span> /{" "}
                    {meta.total} kết quả
                  </div>

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
                      <SelectItem value="10">10 / trang</SelectItem>
                      <SelectItem value="20">20 / trang</SelectItem>
                      <SelectItem value="50">50 / trang</SelectItem>
                    </SelectContent>
                  </Select>

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
                      disabled={params.page === meta.totalPages || meta.totalPages === 0}
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

      <MasterDataForm
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        masterData={selectedItem}
      />
    </section>
  );
}