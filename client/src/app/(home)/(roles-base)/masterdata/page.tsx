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
              placeholder="Tìm kiếm tên tài nguyên..."
              value={searchInput}
              // onChange={handleSearch}
              className="pr-9"
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={16}
            />
          </div>

          <div className="w-full max-w-md">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Chọn loại cấu hình"/>
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="all">Chọn loại cấu hình</SelectItem>
                <SelectItem value="true">Email</SelectItem>
                <SelectItem value="false">Phân quyền</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button onClick={handleAddNew}>
          <Plus size={16} className="mr-1" />
          <span className="whitespace-nowrap">Thêm mới</span>
        </Button>
      </div>
    </section>
  );
}