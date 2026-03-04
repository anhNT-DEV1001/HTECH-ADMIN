"use client";
import { useEffect, useState } from "react";
import {
  ArrowDownWideNarrow,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Filter,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
  Briefcase,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useJobs, useFieldsOfWork } from "@/features/jobs/hooks";
import { IJobFilterParams } from "@/features/jobs/interfaces";
import { ExperienceOptions, JobTypeOptions } from "@/features/jobs/constants";
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
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";

export default function HtechCareers() {
  const searchParams = useSearchParams();
  const [params, setParams] = useState<IJobFilterParams>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    sortBy: "desc",
    orderBy: "created_at",
  });

  const router = useRouter();
  const pathname = usePathname();
  const { confirm } = useConfirm();
  const { showToast } = useToast();

  // Filter state
  const [filterOpen, setFilterOpen] = useState(false);
  const [jobType, setJobType] = useState<string>("");
  const [experience, setExperience] = useState<string>("");
  const [fieldOfWorkId, setFieldOfWorkId] = useState<string>("");

  const { fieldsOfWork } = useFieldsOfWork();

  const { jobsData, isLoading, deleteJobMutation, isDeleting } =
    useJobs(params);

  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebouncedValue(searchInput, 500);
  const meta = jobsData?.data?.meta;
  const jobs = jobsData?.data?.records || [];

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
    router.push("htech-careers/create");
  };

  // Count active filters
  const activeFilterCount = [
    jobType && jobType !== "all" ? jobType : null,
    experience && experience !== "all" ? experience : null,
    fieldOfWorkId && fieldOfWorkId !== "all" ? fieldOfWorkId : null,
  ].filter(Boolean).length;

  const handleApplyFilter = () => {
    setParams((prev) => ({
      ...prev,
      page: 1,
      job_type: jobType && jobType !== "all" ? jobType : undefined,
      experience: experience && experience !== "all" ? experience : undefined,
      field_of_work_id:
        fieldOfWorkId && fieldOfWorkId !== "all" ? fieldOfWorkId : undefined,
    }));
    setFilterOpen(false);
  };

  const handleClearFilter = () => {
    setJobType("");
    setExperience("");
    setFieldOfWorkId("");
    setParams((prev) => ({
      ...prev,
      page: 1,
      job_type: undefined,
      experience: undefined,
      field_of_work_id: undefined,
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
        <h1 className="text-xl font-bold text-gray-800">Quản lý Tuyển dụng</h1>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative flex-1">
            <Input
              type="text"
              placeholder="Tìm kiếm theo tiêu đề"
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

                {/* Job Type */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Loại công việc
                  </Label>
                  <Select value={jobType} onValueChange={setJobType}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả loại hình" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả loại hình</SelectItem>
                      {JobTypeOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Kinh nghiệm
                  </Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả kinh nghiệm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả kinh nghiệm</SelectItem>
                      {ExperienceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Field of Work */}
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">
                    Lĩnh vực chuyên môn
                  </Label>
                  <Select
                    value={fieldOfWorkId}
                    onValueChange={setFieldOfWorkId}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Tất cả lĩnh vực" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả lĩnh vực</SelectItem>
                      {fieldsOfWork.map((field) => (
                        <SelectItem key={field.id} value={String(field.id)}>
                          {field.name_vn}
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
                  <Button className="flex-1" onClick={handleApplyFilter}>
                    Áp dụng
                  </Button>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        <Button onClick={handleAddNew}>
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm công việc</span>
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-center w-16">STT</TableHead>
            <TableHead
              className="cursor-pointer text-center"
              onClick={() => handleSort("title_vn")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Vị trí</span>
                <span className="shrink-0">{getSortIcon("title_vn")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Thông tin</span>
              </div>
            </TableHead>
            <TableHead className="text-center">
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Lĩnh vực</span>
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer"
              onClick={() => handleSort("sort_order")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Trạng thái</span>
                <span className="shrink-0">{getSortIcon("sort_order")}</span>
              </div>
            </TableHead>
            <TableHead
              className="text-center cursor-pointer"
              onClick={() => handleSort("created_at")}
            >
              <div className="flex items-center justify-center gap-2 whitespace-nowrap select-none">
                <span>Ngày tạo</span>
                <span className="shrink-0">{getSortIcon("created_at")}</span>
              </div>
            </TableHead>
            <TableHead className="text-center">Thao tác</TableHead>
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
          ) : jobs.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={7}
                className="text-center py-8 text-muted-foreground"
              >
                Không tìm thấy dữ liệu phù hợp
              </TableCell>
            </TableRow>
          ) : (
            jobs.map((job, index) => {
              const currentPage = params.page || 1;
              const currentLimit = params.limit || 10;
              const stt = (currentPage - 1) * currentLimit + Number(index) + 1;
              return (
                <TableRow key={job.id}>
                  <TableCell className="text-center text-muted-foreground font-mono text-xs">
                    {stt}
                  </TableCell>
                  <TableCell className="text-left align-top py-4">
                    <div className="font-medium text-blue-600 mb-1">
                      {job.title_vn || job.title_en}
                    </div>
                    {job.recruitment_url && (
                      <a
                        href={job.recruitment_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-muted-foreground hover:text-blue-500 underline"
                      >
                        Link ứng tuyển (hoặc JD)
                      </a>
                    )}
                  </TableCell>
                  <TableCell className="text-center text-xs align-top py-4">
                    <div className="mb-1 text-gray-800 font-medium">
                      {job.job_type_vn || job.job_type_en || "—"}
                    </div>
                    <div className="text-muted-foreground">
                      EXP: {job.experience_vn || job.experience_en || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {job.field_of_work?.name_vn || "—"}
                  </TableCell>
                  <TableCell className="text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${job.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                    >
                      {job.is_active ? "Đang mở" : "Đã đóng"}
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs">
                    <span>{dayjs(job.created_at).format("DD/MM/YYYY")}</span>
                    <div className="text-muted-foreground mt-0.5">
                      {dayjs(job.created_at).format("HH:mm:ss")}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => router.push(`/htech-careers/${job.id}`)}
                        className="text-blue-600 hover:bg-blue-100"
                        title="Cập nhật"
                      >
                        <Pencil size={15} />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={async () => {
                          if (
                            await confirm({
                              title: "Xóa công việc",
                              message:
                                "Bạn có chắc chắn muốn xóa tin tuyển dụng này?",
                              variant: "danger",
                            })
                          ) {
                            deleteJobMutation.mutate(job.id);
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
              );
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
                    Hiển thị <span className="font-medium">{jobs.length}</span>{" "}
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
                      <SelectItem value="10">10 / trang</SelectItem>
                      <SelectItem value="20">20 / trang</SelectItem>
                      <SelectItem value="50">50 / trang</SelectItem>
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
                          variant={
                            params.page === i + 1 ? "default" : "outline"
                          }
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
