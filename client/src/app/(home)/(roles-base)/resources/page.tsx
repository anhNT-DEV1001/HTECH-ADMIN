"use client";

import { useResource } from "@/features/resource/hooks";
import {
  ICreateResource,
  IResource,
  IResourceRequest,
  IUpdateResourceWithDetail,
} from "@/features/resource/interfaces";
import { useDebouncedValue } from "@/common/hooks";
import dayjs from "dayjs";
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
import React, { useEffect, useState } from "react";
import MenuLoading from "./loading";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import ResourceModal from "@/features/resource/components/ResourceModal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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

export default function ListMenu() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const { confirm } = useConfirm();
  const [params, setParams] = useState<IResourceRequest>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "description",
    sortBy: "desc",
    orderBy: "created_at",
    is_active: "all",
  });
  const [searchInput, setSearchInput] = useState(params.search || "");
  const [selectIsActive, setSelectIsActive] = useState(
    params.is_active || "all",
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedResource, setSelectedResource] = useState<
    IResource | undefined
  >(undefined);
  const [expandedRowId, setExpandedRowId] = useState<number | null>(null);
  const toggleRow = (id: number) => {
    setExpandedRowId(expandedRowId === id ? null : id);
  };
  const debouncedSearch = useDebouncedValue(searchInput, 500);
  const {
    resourceData,
    isFetching,
    isLoading,
    createResource,
    deleteResource,
    updateResource,
    isCreating,
    isDeleting,
    isUpdating,
  } = useResource(params);
  const resources = resourceData?.data?.records || [];
  const meta = resourceData?.data?.meta;
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
    if (params.searchBy)
      newParams.set(
        "searchBy",
        params.searchBy ? params.searchBy : "description",
      );
    if (params.sortBy) newParams.set("sortBy", params.sortBy);
    if (params.orderBy) newParams.set("orderBy", params.orderBy);
    if (params.is_active) newParams.set("isActive", params.is_active);
    router.push(`${pathName}?${newParams.toString()}`, { scroll: false });
  }, [params, pathName, router]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
  };

  const handleSelectIsActive = (selectedVal: "all" | "true" | "false") => {
    setSelectIsActive(selectedVal);
    setParams((prev) => ({
      ...prev,
      is_active: selectedVal === "all" ? "all" : selectedVal,
      page: 1,
    }));
  };
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

  const handleDelete = async (resource: IResource) => {
    const isConfirm = await confirm({
      title: `Bạn có chắc chắn muốn xóa tài nguyên hệ thống`,
      message: `Tên: ${resource.description} Mã: ${resource.alias}`,
      variant: "danger",
    });
    if (isConfirm) deleteResource(resource.id);
  };

  const handleAddNew = () => {
    setSelectedResource(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (resource: IResource) => {
    setSelectedResource(resource);
    setIsModalOpen(true);
  };

  const handleSave = async (formData: ICreateResource) => {
    if (selectedResource) {
      const isConfirm = await confirm({
        title: `Bạn có muốn cập nhập ${formData.alias}`,
        variant: "info",
      });
      if (isConfirm)
        await updateResource(
          { id: selectedResource.id, ...formData },
          {
            onSuccess: () => handleCloseModal(),
          },
        );
    } else {
      const isConfirm = await confirm({
        title: `Bạn có muốn lưu tài nguyên này`,
        variant: "info",
      });
      if (isConfirm)
        await createResource(formData, {
          onSuccess: () => handleCloseModal(),
        });
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedResource(undefined);
  };

  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Danh sách tài nguyên
          </h1>
        </div>
      </div>
      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm tên tài nguyên..."
              value={searchInput}
              onChange={handleSearch}
              className="pr-9"
            />
            <Search
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
              size={16}
            />
          </div>
          <Select
            value={selectIsActive}
            onValueChange={(val) =>
              handleSelectIsActive(val as "all" | "true" | "false")
            }
          >
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Tất cả trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="true">Bật</SelectItem>
              <SelectItem value="false">Tắt</SelectItem>
            </SelectContent>
          </Select>
          {isFetching && <MenuLoading />}
        </div>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm tài nguyên</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-15 text-center">STT</TableHead>
            <TableHead className="w-35 cursor-pointer" onClick={() => handleSort("alias")}>
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Mã</span>
                <span className="shrink-0">{getSortIcon("alias")}</span>
              </div>
            </TableHead>
            <TableHead
              className="min-w-50 cursor-pointer"
              onClick={() => handleSort("description")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Tên tài nguyên</span>
                <span className="shrink-0">{getSortIcon("description")}</span>
              </div>
            </TableHead>
            <TableHead className="w-30 text-center">Trạng thái</TableHead>
            <TableHead
              className="w-55 cursor-pointer"
              onClick={() => handleSort("href")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Đường dẫn</span>
                <span className="shrink-0">{getSortIcon("href")}</span>
              </div>
            </TableHead>
            <TableHead
              className="w-40 cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Ngày tạo</span>
                <span className="shrink-0">{getSortIcon("created_at")}</span>
              </div>
            </TableHead>
            <TableHead
              className="w-40 cursor-pointer"
              onClick={() => handleSort("updated_at")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Cập nhật cuối</span>
                <span className="shrink-0">{getSortIcon("updated_at")}</span>
              </div>
            </TableHead>
            <TableHead className="w-25 text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                <Loader2 size={24} className="animate-spin mx-auto mb-2 opacity-20" />
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : resources.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            resources.map((resource, index) => {
              const stt = (Number(params.page) - 1) * Number(params.limit) + index + 1;
              const isExpanded = expandedRowId === resource.id;
              return (
                <React.Fragment key={resource.id}>
                  <TableRow>
                    <TableCell className="text-center text-muted-foreground font-mono text-xs">{stt}</TableCell>
                    <TableCell className="text-center">{resource.alias}</TableCell>
                    <TableCell className="text-center">{resource.description}</TableCell>
                    <TableCell className="text-center">
                      {resource.is_active ? (
                        <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-600/20">
                          Bật
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-600/10">
                          Tắt
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="truncate max-w-[220px]">
                      {resource.href || "Không có dữ liệu"}
                    </TableCell>
                    <TableCell className="text-xs">
                      <span>{dayjs(resource.created_at).format("DD/MM/YYYY")}</span>
                      <div className="text-muted-foreground mt-0.5">
                        {dayjs(resource.created_at).format("HH:mm:ss")}
                      </div>
                    </TableCell>
                    <TableCell className="text-xs">
                      <span>{dayjs(resource.updated_at).format("DD/MM/YYYY")}</span>
                      <div className="text-muted-foreground mt-0.5">
                        {dayjs(resource.updated_at).format("HH:mm:ss")}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => toggleRow(resource.id)}
                          className="transition-transform"
                          style={{
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                          }}
                        >
                          <ChevronDown size={16} className="text-muted-foreground" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleEdit(resource)}
                          className="text-blue-600 hover:bg-blue-100"
                        >
                          <Pencil size={15} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          onClick={() => handleDelete(resource)}
                          className="text-red-600 hover:bg-red-100"
                        >
                          <Trash2 size={15} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>

                  {isExpanded && (
                    <TableRow className="bg-muted/30">
                      <TableCell colSpan={8} className="p-0">
                        <div className="animate-in slide-in-from-top-2 duration-200">
                          <div className="p-3">
                            <Table>
                              <TableHeader>
                                <TableRow>
                                  <TableHead className="w-15 text-center">STT</TableHead>
                                  <TableHead className="text-center">Mã</TableHead>
                                  <TableHead className="text-center">Đường dẫn</TableHead>
                                  <TableHead className="w-25 text-center">Trạng thái</TableHead>
                                </TableRow>
                              </TableHeader>
                              <TableBody>
                                {resource.resourceDetails?.length > 0 ? (
                                  resource.resourceDetails.map((detail, dIdx) => (
                                    <TableRow
                                      key={dIdx}
                                      className="hover:bg-blue-100 cursor-pointer transition-colors"
                                      onClick={() => router.push(`resources/${detail?.id}`)}
                                    >
                                      <TableCell className="text-center text-muted-foreground font-mono text-xs">{dIdx + 1}</TableCell>
                                      <TableCell className="text-center">{detail.alias}</TableCell>
                                      <TableCell className="text-center truncate font-mono">
                                        {detail.herf || "—"}
                                      </TableCell>
                                      <TableCell className="text-center">
                                        {detail.is_active ? (
                                          <Badge variant="secondary" className="bg-green-50 text-green-700 border-green-600/20">
                                            Bật
                                          </Badge>
                                        ) : (
                                          <Badge variant="secondary" className="bg-red-50 text-red-700 border-red-600/10">
                                            Tắt
                                          </Badge>
                                        )}
                                      </TableCell>
                                    </TableRow>
                                  ))
                                ) : (
                                  <TableRow>
                                    <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                                      Không có tài nguyên con
                                    </TableCell>
                                  </TableRow>
                                )}
                              </TableBody>
                            </Table>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </React.Fragment>
              );
            })
          )}
        </TableBody>

        {meta && (
          <TableFooter>
            <TableRow>
              <TableCell colSpan={8}>
                <div className="flex justify-between items-center">
                  {/* Tổng số hiển thị */}
                  <div>
                    Hiển thị{" "}
                    <span className="font-medium">
                      {resources.length}
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

      <ResourceModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSave}
        data={selectedResource}
        loading={isCreating || isUpdating}
      />

    </section>
  );
}
