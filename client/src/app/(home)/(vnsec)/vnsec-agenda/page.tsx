"use client";

import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  ArrowDownWideNarrow,
  CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ExternalLink,
  FileText,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { useAgenda } from "@/features/agenda/hooks";
import type { IAgendaFilterParams } from "@/features/agenda/interfaces";
import { useWeb } from "@/features/web/hooks";
import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { useToast } from "@/common/providers/ToastProvider";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const getPublicFileUrl = (fileUrl: string) => {
  if (!fileUrl) return "";
  if (/^https?:\/\//.test(fileUrl)) return fileUrl;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1").replace("/api/v1", "");
  return `${baseUrl}${fileUrl}`;
};

export default function VnsecAgendaPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const [params, setParams] = useState<IAgendaFilterParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "name_vn",
    sortBy: "asc",
    orderBy: "SDate",
    web_id: searchParams.get("web_id") ? Number(searchParams.get("web_id")) : undefined,
    startDate: searchParams.get("startDate") || undefined,
    endDate: searchParams.get("endDate") || undefined,
  });
  const [searchInput, setSearchInput] = useState(params.search || "");
  const [filterOpen, setFilterOpen] = useState(false);
  const [webId, setWebId] = useState(params.web_id ? String(params.web_id) : "all");
  const [startDate, setStartDate] = useState<Date | undefined>(
    params.startDate ? new Date(params.startDate) : undefined,
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    params.endDate ? new Date(params.endDate) : undefined,
  );
  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 500);

  const { agendaData, isLoading, isFetching, deleteAgendaMutation, isDeleting } = useAgenda(params);
  const { webData } = useWeb();
  const agendas = agendaData?.data?.records || [];
  const meta = agendaData?.data?.meta;
  const websites = webData?.data || [];

  useEffect(() => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    const nextParams = new URLSearchParams();
    if (params.page) nextParams.set("page", String(params.page));
    if (params.limit) nextParams.set("limit", String(params.limit));
    if (params.search) nextParams.set("search", params.search);
    if (params.sortBy) nextParams.set("sortBy", params.sortBy);
    if (params.orderBy) nextParams.set("orderBy", params.orderBy);
    if (params.web_id) nextParams.set("web_id", String(params.web_id));
    if (params.startDate) nextParams.set("startDate", params.startDate);
    if (params.endDate) nextParams.set("endDate", params.endDate);
    router.push(`${pathname}?${nextParams.toString()}`, { scroll: false });
  }, [params, pathname, router]);

  const activeFilterCount = [
    webId !== "all" ? webId : null,
    startDate,
    endDate,
  ].filter(Boolean).length;

  const handleApplyFilter = () => {
    if (startDate && endDate && dayjs(startDate).isAfter(dayjs(endDate))) {
      showToast("Ngày bắt đầu không được lớn hơn ngày kết thúc", "error");
      return;
    }

    setParams((prev) => ({
      ...prev,
      page: 1,
      web_id: webId !== "all" ? Number(webId) : undefined,
      startDate: startDate ? dayjs(startDate).format("YYYY-MM-DD") : undefined,
      endDate: endDate ? dayjs(endDate).format("YYYY-MM-DD") : undefined,
    }));
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setWebId("all");
    setStartDate(undefined);
    setEndDate(undefined);
    setParams((prev) => ({
      ...prev,
      page: 1,
      web_id: undefined,
      startDate: undefined,
      endDate: undefined,
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
    if (params.orderBy !== column) return <ArrowDownWideNarrow size={14} />;
    return params.sortBy === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const handleDelete = async (id: number) => {
    const accepted = await confirm({
      title: "Xóa agenda",
      message: "Bạn có chắc chắn muốn xóa agenda này?",
      variant: "danger",
    });

    if (accepted) deleteAgendaMutation.mutate(id);
  };

  const handlePreviewFile = (fileUrl: string) => {
    window.open(getPublicFileUrl(fileUrl), "_blank", "noopener,noreferrer");
  };

  return (
    <section>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý Agenda</h1>
          <p className="text-sm text-muted-foreground">Danh sách chương trình theo từng web-site VNSEC</p>
        </div>
        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Đang cập nhật
          </div>
        )}
      </div>

      <div className="mb-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 items-center gap-3 lg:max-w-xl">
          <div className="relative flex-1">
            <Input
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              placeholder="Tìm kiếm theo tên agenda"
              className="pr-9"
            />
            <Search className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
          </div>

          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" className="relative gap-2">
                <Filter size={16} />
                <span>Bộ lọc</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                    {activeFilterCount}
                  </span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="start">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Bộ lọc agenda</h4>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Web-site</Label>
                  <Select value={webId} onValueChange={setWebId}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả web-site" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả web-site</SelectItem>
                      {websites.map((web) => (
                        <SelectItem key={web.id} value={String(web.id)}>
                          {web.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ngày bắt đầu</Label>
                  <Popover open={startDatePopoverOpen} onOpenChange={setStartDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
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

                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Ngày kết thúc</Label>
                  <Popover open={endDatePopoverOpen} onOpenChange={setEndDatePopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left font-normal">
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

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" className="flex-1 gap-1" onClick={handleClearFilter}>
                    <X size={14} />
                    Xóa lọc
                  </Button>
                  <Button className="flex-1" onClick={handleApplyFilter}>
                    Áp dụng
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        <Button onClick={() => router.push("/vnsec-agenda/create")}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Tạo agenda</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16 text-center">STT</TableHead>
            <TableHead className="cursor-pointer" onClick={() => handleSort("name_vn")}>
              <div className="flex items-center justify-center gap-2">
                <span>Tên agenda</span>
                {getSortIcon("name_vn")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-center" onClick={() => handleSort("web_id")}>
              <div className="flex items-center justify-center gap-2">
                <span>Web-site</span>
                {getSortIcon("web_id")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-center" onClick={() => handleSort("SDate")}>
              <div className="flex items-center justify-center gap-2">
                <span>Ngày bắt đầu</span>
                {getSortIcon("SDate")}
              </div>
            </TableHead>
            <TableHead className="cursor-pointer text-center" onClick={() => handleSort("EDate")}>
              <div className="flex items-center justify-center gap-2">
                <span>Ngày kết thúc</span>
                {getSortIcon("EDate")}
              </div>
            </TableHead>
            <TableHead className="text-center">Timeline</TableHead>
            <TableHead className="text-center">File</TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-30" />
                Đang tải dữ liệu...
              </TableCell>
            </TableRow>
          ) : agendas.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                Không tìm thấy agenda phù hợp
              </TableCell>
            </TableRow>
          ) : (
            agendas.map((agenda, index) => {
              const currentPage = params.page || 1;
              const currentLimit = params.limit || 10;
              const stt = (currentPage - 1) * currentLimit + index + 1;
              const timelineCount = agenda.agendaDates.reduce(
                (total, agendaDate) => total + agendaDate.timelines.length,
                0,
              );

              return (
                <TableRow key={agenda.id}>
                  <TableCell className="text-center font-mono text-xs text-muted-foreground">{stt}</TableCell>
                  <TableCell>
                    <div className="font-medium">{agenda.name_vn}</div>
                    {agenda.name_en && <div className="text-xs text-muted-foreground">{agenda.name_en}</div>}
                  </TableCell>
                  <TableCell className="text-center">{agenda.web?.name || "—"}</TableCell>
                  <TableCell className="text-center">{dayjs(agenda.SDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="text-center">{dayjs(agenda.EDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell className="text-center">
                    <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                      {agenda.agendaDates.length} ngày / {timelineCount} mục
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    {agenda.file_url ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1.5 text-blue-600"
                        onClick={() => handlePreviewFile(agenda.file_url)}
                      >
                        <FileText size={14} />
                        PDF
                        <ExternalLink size={14} />
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => router.push(`/vnsec-agenda/${agenda.id}`)}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Cập nhật"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDelete(agenda.id)}
                        disabled={isDeleting}
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
              <TableCell colSpan={8}>
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm">
                    Hiển thị <span className="font-medium">{agendas.length}</span> / {meta.total} kết quả
                  </div>

                  <Select
                    value={String(params.limit)}
                    onValueChange={(value) => setParams((prev) => ({ ...prev, limit: Number(value), page: 1 }))}
                  >
                    <SelectTrigger className="h-8 w-[120px] text-xs">
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
                      disabled={(params.page || 1) <= 1}
                      onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) - 1 }))}
                    >
                      <ChevronLeft size={16} />
                    </Button>
                    <div className="flex gap-1 px-2">
                      {Array.from({ length: meta.totalPages || 1 }, (_, index) => (
                        <Button
                          key={index}
                          variant={params.page === index + 1 ? "default" : "outline"}
                          size="icon-xs"
                          onClick={() => setParams((prev) => ({ ...prev, page: index + 1 }))}
                        >
                          {index + 1}
                        </Button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon-xs"
                      disabled={(params.page || 1) >= meta.totalPages}
                      onClick={() => setParams((prev) => ({ ...prev, page: (prev.page || 1) + 1 }))}
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
