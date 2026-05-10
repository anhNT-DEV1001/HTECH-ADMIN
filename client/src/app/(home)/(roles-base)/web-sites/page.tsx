"use client";

import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import WebModal from "@/features/web/components/WebModal";
import { useWeb } from "@/features/web/hooks";
import type { ICreateWeb, IWeb } from "@/features/web/interfaces";
import {
  ArrowDownWideNarrow,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SortKey = keyof Pick<IWeb, "name" | "alias" | "url">;
type SortDirection = "asc" | "desc";

export default function WebSitesPage() {
  const { confirm } = useConfirm();
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWeb, setSelectedWeb] = useState<IWeb | undefined>(undefined);
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const {
    webData,
    isLoading,
    isFetching,
    createWeb,
    updateWeb,
    deleteWeb,
    isCreating,
    isUpdating,
    isDeleting,
  } = useWeb();

  const websites = useMemo(() => webData?.data || [], [webData?.data]);

  useEffect(() => {
    setSearch(debouncedSearch.trim().toLowerCase());
  }, [debouncedSearch]);

  const filteredWebsites = useMemo(() => {
    const matchedWebsites = websites.filter((web) => {
      if (!search) return true;

      return [web.name, web.alias, web.url].some((value) =>
        value.toLowerCase().includes(search),
      );
    });

    return [...matchedWebsites].sort((first, second) => {
      const firstValue = first[sortKey].toLowerCase();
      const secondValue = second[sortKey].toLowerCase();
      const sortResult = firstValue.localeCompare(secondValue);

      return sortDirection === "asc" ? sortResult : -sortResult;
    });
  }, [search, sortDirection, sortKey, websites]);

  const handleSort = (column: SortKey) => {
    setSortKey(column);
    setSortDirection((currentDirection) =>
      sortKey === column && currentDirection === "asc" ? "desc" : "asc",
    );
  };

  const getSortIcon = (column: SortKey) => {
    if (sortKey !== column) {
      return <ArrowDownWideNarrow size={14} />;
    }

    return sortDirection === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const handleAddNew = () => {
    setSelectedWeb(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (web: IWeb) => {
    setSelectedWeb(web);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedWeb(undefined);
  };

  const handleSave = async (formData: ICreateWeb) => {
    if (selectedWeb) {
      const isConfirm = await confirm({
        title: `Bạn có muốn cập nhật ${formData.name}?`,
        variant: "info",
      });

      if (isConfirm) {
        updateWeb(
          { id: selectedWeb.id, ...formData },
          { onSuccess: () => handleCloseModal() },
        );
      }

      return;
    }

    const isConfirm = await confirm({
      title: "Bạn có muốn lưu website này?",
      variant: "info",
    });

    if (isConfirm) {
      createWeb(formData, { onSuccess: () => handleCloseModal() });
    }
  };

  const handleDelete = async (web: IWeb) => {
    const isConfirm = await confirm({
      title: "Bạn có chắc chắn muốn xóa website?",
      message: `Tên: ${web.name} - Mã: ${web.alias}`,
      variant: "danger",
    });

    if (isConfirm) {
      deleteWeb(web.id);
    }
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Danh sách website
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm website..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              className="pr-9"
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={16}
            />
          </div>
          {isFetching && (
            <Loader2 size={18} className="animate-spin text-blue-500" />
          )}
        </div>

        <Button onClick={handleAddNew}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm website</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-15 text-center">STT</TableHead>
            <TableHead
              className="min-w-50 cursor-pointer"
              onClick={() => handleSort("name")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Tên website</span>
                <span className="shrink-0">{getSortIcon("name")}</span>
              </div>
            </TableHead>
            <TableHead
              className="w-45 cursor-pointer"
              onClick={() => handleSort("alias")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Mã</span>
                <span className="shrink-0">{getSortIcon("alias")}</span>
              </div>
            </TableHead>
            <TableHead
              className="min-w-75 cursor-pointer"
              onClick={() => handleSort("url")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Đường dẫn</span>
                <span className="shrink-0">{getSortIcon("url")}</span>
              </div>
            </TableHead>
            <TableHead className="w-25 text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : filteredWebsites.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={5}
                className="text-center py-8 text-muted-foreground"
              >
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            filteredWebsites.map((web, index) => (
              <TableRow key={web.id}>
                <TableCell className="text-center text-muted-foreground font-mono text-xs">
                  {index + 1}
                </TableCell>
                <TableCell className="text-center">{web.name}</TableCell>
                <TableCell className="text-center">{web.alias}</TableCell>
                <TableCell className="text-center">
                  <a
                    href={web.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex max-w-[360px] items-center justify-center gap-1 text-blue-600 hover:underline"
                  >
                    <span className="truncate">{web.url}</span>
                    <ExternalLink size={14} className="shrink-0" />
                  </a>
                </TableCell>
                <TableCell>
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleEdit(web)}
                      className="text-blue-600 hover:bg-blue-100"
                    >
                      <Pencil size={15} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-xs"
                      onClick={() => handleDelete(web)}
                      disabled={isDeleting}
                      className="text-red-600 hover:bg-red-100"
                    >
                      <Trash2 size={15} />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>

        <TableFooter>
          <TableRow>
            <TableCell colSpan={5}>
              <div className="flex justify-between items-center">
                <div>
                  Hiển thị{" "}
                  <span className="font-medium">{filteredWebsites.length}</span>{" "}
                  / {websites.length} kết quả
                </div>
              </div>
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>

      <WebModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        data={selectedWeb}
        loading={isCreating || isUpdating}
      />
    </section>
  );
}
