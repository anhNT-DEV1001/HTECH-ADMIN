"use client";

import { useDebouncedValue } from "@/common/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { Badge } from "@/components/ui/badge";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BoothModal, ExhibitorModal, ExhibitorRankModal } from "@/features/exhibition/components";
import { useExhibition } from "@/features/exhibition/hooks";
import type {
  IBooth,
  ICreateBooth,
  ICreateExhibitor,
  ICreateExhibitorRank,
  IExhibitor,
  IExhibitorRank,
} from "@/features/exhibition/interfaces";
import { useWeb } from "@/features/web/hooks";
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
  X,
} from "lucide-react";
import { useMemo, useState } from "react";

type SortDirection = "asc" | "desc";
type RankSortKey = "display_order" | "name_vn" | "web_id" | "updated_at";
type BoothSortKey = "name" | "web_id" | "updated_at";
type ExhibitorSortKey = "name" | "rank" | "booth" | "web_id" | "updated_at";

const PAGE_LIMIT_OPTIONS = [10, 20, 50];

const normalizeText = (value?: string | null) => value?.toLowerCase().trim() || "";
const getImageUrl = (path?: string | null) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("blob:")) {
    return path;
  }
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api/v1").replace(
    "/api/v1",
    "",
  );
  return `${baseUrl}${path}`;
};

const sortByValue = <T,>(
  items: T[],
  getValue: (item: T) => string | number,
  direction: SortDirection,
) =>
  [...items].sort((left, right) => {
    const result = String(getValue(left)).localeCompare(String(getValue(right)), "vi", {
      numeric: true,
      sensitivity: "base",
    });
    return direction === "asc" ? result : -result;
  });

const getRankComparableValue = (item: IExhibitorRank, key: RankSortKey): string | number => {
  if (key === "updated_at") return item.updated_at || "";
  return item[key] ?? "";
};

const getBoothComparableValue = (item: IBooth, key: BoothSortKey): string | number => {
  if (key === "updated_at") return item.updated_at || "";
  return item[key] ?? "";
};

const getExhibitorComparableValue = (item: IExhibitor, key: ExhibitorSortKey): string | number => {
  if (key === "updated_at") return item.updated_at || "";
  if (key === "rank") return item.rank?.name_vn || "";
  if (key === "booth") return item.booth?.name || "";
  return item[key] ?? "";
};

export default function VnsecExhibitorsPage() {
  const { confirm } = useConfirm();
  const { webData } = useWeb();
  const {
    exhibitionData,
    exhibitorRankData,
    boothData,
    exhibitorData,
    isLoadingExhibitions,
    isLoadingExhibitorRanks,
    isLoadingBooths,
    isLoadingExhibitors,
    isFetchingExhibitorRanks,
    isFetchingBooths,
    isFetchingExhibitors,
    createExhibitorRank,
    updateExhibitorRank,
    deleteExhibitorRank,
    createBooth,
    updateBooth,
    deleteBooth,
    createExhibitor,
    updateExhibitor,
    deleteExhibitor,
    isCreatingExhibitorRank,
    isUpdatingExhibitorRank,
    isDeletingExhibitorRank,
    isCreatingBooth,
    isUpdatingBooth,
    isDeletingBooth,
    isCreatingExhibitor,
    isUpdatingExhibitor,
    isDeletingExhibitor,
  } = useExhibition();

  const [searchInput, setSearchInput] = useState("");
  const [webFilter, setWebFilter] = useState("all");
  const [rankFilter, setRankFilter] = useState("all");
  const [boothFilter, setBoothFilter] = useState("all");

  const [rankPage, setRankPage] = useState(1);
  const [rankLimit, setRankLimit] = useState(10);
  const [rankSortKey, setRankSortKey] = useState<RankSortKey>("display_order");
  const [rankSortDirection, setRankSortDirection] = useState<SortDirection>("asc");

  const [boothPage, setBoothPage] = useState(1);
  const [boothLimit, setBoothLimit] = useState(10);
  const [boothSortKey, setBoothSortKey] = useState<BoothSortKey>("name");
  const [boothSortDirection, setBoothSortDirection] = useState<SortDirection>("asc");

  const [exhibitorPage, setExhibitorPage] = useState(1);
  const [exhibitorLimit, setExhibitorLimit] = useState(10);
  const [exhibitorSortKey, setExhibitorSortKey] = useState<ExhibitorSortKey>("name");
  const [exhibitorSortDirection, setExhibitorSortDirection] = useState<SortDirection>("asc");

  const [isRankModalOpen, setIsRankModalOpen] = useState(false);
  const [isBoothModalOpen, setIsBoothModalOpen] = useState(false);
  const [isExhibitorModalOpen, setIsExhibitorModalOpen] = useState(false);
  const [selectedRank, setSelectedRank] = useState<IExhibitorRank | undefined>();
  const [selectedBooth, setSelectedBooth] = useState<IBooth | undefined>();
  const [selectedExhibitor, setSelectedExhibitor] = useState<IExhibitor | undefined>();

  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const websites = webData?.data || [];
  const ranks = exhibitorRankData?.data || [];
  const booths = boothData?.data || [];
  const exhibitors = exhibitorData?.data || [];
  const exhibitions = exhibitionData?.data || [];
  const query = normalizeText(debouncedSearch);

  const filteredRanks = useMemo(
    () =>
      sortByValue(
        ranks.filter((rank) => {
          const matchesWeb = webFilter === "all" || rank.web_id === Number(webFilter);
          const matchesSearch =
            !query ||
            normalizeText(rank.name_vn).includes(query) ||
            normalizeText(rank.name_en).includes(query);
          return matchesWeb && matchesSearch;
        }),
        (rank) => getRankComparableValue(rank, rankSortKey),
        rankSortDirection,
      ),
    [query, rankSortDirection, rankSortKey, ranks, webFilter],
  );

  const filteredBooths = useMemo(
    () =>
      sortByValue(
        booths.filter((booth) => {
          const matchesWeb = webFilter === "all" || booth.web_id === Number(webFilter);
          const matchesSearch = !query || normalizeText(booth.name).includes(query);
          return matchesWeb && matchesSearch;
        }),
        (booth) => getBoothComparableValue(booth, boothSortKey),
        boothSortDirection,
      ),
    [boothSortDirection, boothSortKey, booths, query, webFilter],
  );

  const filteredExhibitors = useMemo(
    () =>
      sortByValue(
        exhibitors.filter((exhibitor) => {
          const matchesWeb = webFilter === "all" || exhibitor.web_id === Number(webFilter);
          const matchesRank = rankFilter === "all" || exhibitor.rankId === Number(rankFilter);
          const matchesBooth = boothFilter === "all" || exhibitor.boothId === Number(boothFilter);
          const matchesSearch =
            !query ||
            normalizeText(exhibitor.name).includes(query) ||
            normalizeText(exhibitor.sumary_vn).includes(query) ||
            normalizeText(exhibitor.sumary_en).includes(query) ||
            normalizeText(exhibitor.rank?.name_vn).includes(query) ||
            normalizeText(exhibitor.booth?.name).includes(query);

          return matchesWeb && matchesRank && matchesBooth && matchesSearch;
        }),
        (exhibitor) => getExhibitorComparableValue(exhibitor, exhibitorSortKey),
        exhibitorSortDirection,
      ),
    [
      boothFilter,
      exhibitorSortDirection,
      exhibitorSortKey,
      exhibitors,
      query,
      rankFilter,
      webFilter,
    ],
  );

  const pagedRanks = filteredRanks.slice((rankPage - 1) * rankLimit, rankPage * rankLimit);
  const pagedBooths = filteredBooths.slice((boothPage - 1) * boothLimit, boothPage * boothLimit);
  const pagedExhibitors = filteredExhibitors.slice(
    (exhibitorPage - 1) * exhibitorLimit,
    exhibitorPage * exhibitorLimit,
  );

  const rankTotalPages = Math.max(1, Math.ceil(filteredRanks.length / rankLimit));
  const boothTotalPages = Math.max(1, Math.ceil(filteredBooths.length / boothLimit));
  const exhibitorTotalPages = Math.max(1, Math.ceil(filteredExhibitors.length / exhibitorLimit));
  const activeFilterCount =
    (webFilter !== "all" ? 1 : 0) + (rankFilter !== "all" ? 1 : 0) + (boothFilter !== "all" ? 1 : 0);
  const isFetching = isFetchingExhibitorRanks || isFetchingBooths || isFetchingExhibitors;

  const handleRankSort = (key: RankSortKey) => {
    setRankSortKey(key);
    setRankSortDirection((current) => (rankSortKey === key && current === "asc" ? "desc" : "asc"));
    setRankPage(1);
  };

  const handleBoothSort = (key: BoothSortKey) => {
    setBoothSortKey(key);
    setBoothSortDirection((current) => (boothSortKey === key && current === "asc" ? "desc" : "asc"));
    setBoothPage(1);
  };

  const handleExhibitorSort = (key: ExhibitorSortKey) => {
    setExhibitorSortKey(key);
    setExhibitorSortDirection((current) =>
      exhibitorSortKey === key && current === "asc" ? "desc" : "asc",
    );
    setExhibitorPage(1);
  };

  const getRankSortIcon = (key: RankSortKey) => {
    if (rankSortKey !== key) return <ArrowDownWideNarrow size={14} />;
    return rankSortDirection === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const getBoothSortIcon = (key: BoothSortKey) => {
    if (boothSortKey !== key) return <ArrowDownWideNarrow size={14} />;
    return boothSortDirection === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const getExhibitorSortIcon = (key: ExhibitorSortKey) => {
    if (exhibitorSortKey !== key) return <ArrowDownWideNarrow size={14} />;
    return exhibitorSortDirection === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const resetFilters = () => {
    setWebFilter("all");
    setRankFilter("all");
    setBoothFilter("all");
    setRankPage(1);
    setBoothPage(1);
    setExhibitorPage(1);
  };

  const handleSaveRank = async (formData: ICreateExhibitorRank) => {
    const accepted = await confirm({
      title: selectedRank ? "Cập nhật rank" : "Tạo rank",
      message: selectedRank
        ? `Bạn có muốn cập nhật "${selectedRank.name_vn}"?`
        : `Bạn có muốn tạo "${formData.name_vn}"?`,
      variant: "info",
    });
    if (!accepted) return;

    if (selectedRank) {
      updateExhibitorRank(
        { id: selectedRank.id, ...formData },
        {
          onSuccess: () => {
            setSelectedRank(undefined);
            setIsRankModalOpen(false);
          },
        },
      );
      return;
    }
    createExhibitorRank(formData, {
      onSuccess: () => {
        setSelectedRank(undefined);
        setIsRankModalOpen(false);
      },
    });
  };

  const handleSaveBooth = async (formData: ICreateBooth) => {
    const accepted = await confirm({
      title: selectedBooth ? "Cập nhật booth" : "Tạo booth",
      message: selectedBooth
        ? `Bạn có muốn cập nhật "${selectedBooth.name || `#${selectedBooth.id}`}"?`
        : `Bạn có muốn tạo "${formData.name}"?`,
      variant: "info",
    });
    if (!accepted) return;

    if (selectedBooth) {
      updateBooth(
        { id: selectedBooth.id, ...formData },
        {
          onSuccess: () => {
            setSelectedBooth(undefined);
            setIsBoothModalOpen(false);
          },
        },
      );
      return;
    }
    createBooth(formData, {
      onSuccess: () => {
        setSelectedBooth(undefined);
        setIsBoothModalOpen(false);
      },
    });
  };

  const handleSaveExhibitor = async (formData: ICreateExhibitor) => {
    const accepted = await confirm({
      title: selectedExhibitor ? "Cập nhật exhibitor" : "Tạo exhibitor",
      message: selectedExhibitor
        ? `Bạn có muốn cập nhật "${selectedExhibitor.name}"?`
        : `Bạn có muốn tạo "${formData.name}"?`,
      variant: "info",
    });
    if (!accepted) return;

    if (selectedExhibitor) {
      updateExhibitor(
        { id: selectedExhibitor.id, ...formData },
        {
          onSuccess: () => {
            setSelectedExhibitor(undefined);
            setIsExhibitorModalOpen(false);
          },
        },
      );
      return;
    }
    createExhibitor(formData, {
      onSuccess: () => {
        setSelectedExhibitor(undefined);
        setIsExhibitorModalOpen(false);
      },
    });
  };

  const handleDeleteRank = async (rank: IExhibitorRank) => {
    const accepted = await confirm({
      title: "Xóa rank",
      message: `Bạn có chắc chắn muốn xóa "${rank.name_vn}"?`,
      variant: "danger",
    });
    if (accepted) deleteExhibitorRank(rank.id);
  };

  const handleDeleteBooth = async (booth: IBooth) => {
    const accepted = await confirm({
      title: "Xóa booth",
      message: `Bạn có chắc chắn muốn xóa "${booth.name || `#${booth.id}`}"?`,
      variant: "danger",
    });
    if (accepted) deleteBooth(booth.id);
  };

  const handleDeleteExhibitor = async (exhibitor: IExhibitor) => {
    const accepted = await confirm({
      title: "Xóa exhibitor",
      message: `Bạn có chắc chắn muốn xóa "${exhibitor.name}"?`,
      variant: "danger",
    });
    if (accepted) deleteExhibitor(exhibitor.id);
  };

  const renderPagination = (
    visibleCount: number,
    totalCount: number,
    limit: number,
    setLimit: (limit: number) => void,
    page: number,
    setPage: (page: number) => void,
    totalPages: number,
    colSpan: number,
  ) => (
    <TableFooter>
      <TableRow>
        <TableCell colSpan={colSpan}>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-sm">
              Hiển thị <span className="font-medium">{visibleCount}</span> / {totalCount} kết quả
            </div>
            <Select
              value={String(limit)}
              onValueChange={(value) => {
                setLimit(Number(value));
                setPage(1);
              }}
            >
              <SelectTrigger className="h-8 w-[120px] text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_LIMIT_OPTIONS.map((option) => (
                  <SelectItem key={option} value={String(option)}>
                    {option} / trang
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                <ChevronLeft size={16} />
              </Button>
              <div className="flex gap-1 px-2">
                {Array.from({ length: totalPages }, (_, index) => (
                  <Button
                    key={index}
                    variant={page === index + 1 ? "default" : "outline"}
                    size="icon-xs"
                    onClick={() => setPage(index + 1)}
                  >
                    {index + 1}
                  </Button>
                ))}
              </div>
              <Button
                variant="outline"
                size="icon-xs"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </TableCell>
      </TableRow>
    </TableFooter>
  );

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý Exhibitor</h1>
          <p className="text-sm text-muted-foreground">
            Quản lý rank, booth và nhà triển lãm thuộc hệ thống VNSEC
          </p>
        </div>
        {isFetching && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Đang cập nhật
          </div>
        )}
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative w-full lg:max-w-sm">
          <Input
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setRankPage(1);
              setBoothPage(1);
              setExhibitorPage(1);
            }}
            placeholder="Tìm rank, booth, exhibitor"
            className="pr-9"
          />
          <Search
            className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            size={16}
          />
        </div>

        <Select
          value={webFilter}
          onValueChange={(value) => {
            setWebFilter(value);
            setRankFilter("all");
            setBoothFilter("all");
            setRankPage(1);
            setBoothPage(1);
            setExhibitorPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="Lọc theo web-site" />
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

        <Select
          value={rankFilter}
          onValueChange={(value) => {
            setRankFilter(value);
            setExhibitorPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="Lọc theo rank" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả rank</SelectItem>
            {ranks
              .filter((rank) => webFilter === "all" || rank.web_id === Number(webFilter))
              .map((rank) => (
                <SelectItem key={rank.id} value={String(rank.id)}>
                  {rank.name_vn}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        <Select
          value={boothFilter}
          onValueChange={(value) => {
            setBoothFilter(value);
            setExhibitorPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-[220px]">
            <SelectValue placeholder="Lọc theo booth" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tất cả booth</SelectItem>
            {booths
              .filter((booth) => webFilter === "all" || booth.web_id === Number(webFilter))
              .map((booth) => (
                <SelectItem key={booth.id} value={String(booth.id)}>
                  {booth.name || `Booth #${booth.id}`}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>

        {activeFilterCount > 0 && (
          <Button variant="outline" onClick={resetFilters} className="gap-1">
            <X size={14} />
            Xóa lọc
          </Button>
        )}
      </div>

      <div className="space-y-8">
        <section className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Danh sách exhibitor</h2>
              <p className="text-xs text-muted-foreground">Nhà triển lãm, rank, booth và lĩnh vực liên kết</p>
            </div>
            <Button
              onClick={() => {
                setSelectedExhibitor(undefined);
                setIsExhibitorModalOpen(true);
              }}
            >
              <Plus size={16} />
              <span className="whitespace-nowrap">Thêm exhibitor</span>
            </Button>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16 text-center">STT</TableHead>
                  <TableHead className="min-w-[240px] cursor-pointer" onClick={() => handleExhibitorSort("name")}>
                    <div className="flex items-center justify-center gap-2">
                      <span>Nhà triển lãm</span>
                      {getExhibitorSortIcon("name")}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleExhibitorSort("rank")}>
                    <div className="flex items-center justify-center gap-2">
                      <span>Rank</span>
                      {getExhibitorSortIcon("rank")}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[140px] cursor-pointer" onClick={() => handleExhibitorSort("booth")}>
                    <div className="flex items-center justify-center gap-2">
                      <span>Booth</span>
                      {getExhibitorSortIcon("booth")}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleExhibitorSort("web_id")}>
                    <div className="flex items-center justify-center gap-2">
                      <span>Web-site</span>
                      {getExhibitorSortIcon("web_id")}
                    </div>
                  </TableHead>
                  <TableHead className="min-w-[220px] text-center">Exhibition</TableHead>
                  <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleExhibitorSort("updated_at")}>
                    <div className="flex items-center justify-center gap-2">
                      <span>Cập nhật cuối</span>
                      {getExhibitorSortIcon("updated_at")}
                    </div>
                  </TableHead>
                  <TableHead className="w-28 text-center">Thao tác</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingExhibitors || isLoadingExhibitions ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-30" />
                      Đang tải dữ liệu...
                    </TableCell>
                  </TableRow>
                ) : pagedExhibitors.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                      Không tìm thấy exhibitor phù hợp
                    </TableCell>
                  </TableRow>
                ) : (
                  pagedExhibitors.map((exhibitor, index) => (
                    <TableRow key={exhibitor.id}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">
                        {(exhibitorPage - 1) * exhibitorLimit + index + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {exhibitor.img ? (
                            <img
                              src={getImageUrl(exhibitor.img)}
                              alt={exhibitor.name}
                              className="h-9 w-9 shrink-0 rounded-md border object-cover"
                            />
                          ) : (
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border bg-muted text-xs text-muted-foreground">
                              N/A
                            </div>
                          )}
                          <div className="font-medium">{exhibitor.name}</div>
                        </div>
                        <div className="line-clamp-2 text-xs text-muted-foreground">{exhibitor.sumary_vn}</div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-amber-50 text-amber-700">
                          {exhibitor.rank?.name_vn || "—"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{exhibitor.booth?.name || "—"}</TableCell>
                      <TableCell className="text-center">{exhibitor.web?.name || "—"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-center gap-1">
                          {exhibitor.exhibitions?.length ? (
                            exhibitor.exhibitions.map((exhibition) => (
                              <Badge key={exhibition.id} variant="secondary" className="bg-blue-50 text-blue-700">
                                {exhibition.name_vn}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {exhibitor.updated_at ? dayjs(exhibitor.updated_at).format("DD/MM/YYYY HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => {
                              setSelectedExhibitor(exhibitor);
                              setIsExhibitorModalOpen(true);
                            }}
                            className="text-blue-600 hover:bg-blue-100"
                            title="Cập nhật"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteExhibitor(exhibitor)}
                            disabled={isDeletingExhibitor}
                            className="text-red-600 hover:bg-red-100"
                            title="Xóa"
                          >
                            <Trash2 size={15} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
              {renderPagination(
                pagedExhibitors.length,
                filteredExhibitors.length,
                exhibitorLimit,
                setExhibitorLimit,
                exhibitorPage,
                setExhibitorPage,
                exhibitorTotalPages,
                8,
              )}
            </Table>
          </div>
        </section>

        <Tabs defaultValue="ranks" className="space-y-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-800">Danh mục rank và booth</h2>
              <p className="text-xs text-muted-foreground">Quản lý loại xếp hạng và gian hàng</p>
            </div>
            <TabsList>
              <TabsTrigger value="ranks">Rank ({filteredRanks.length})</TabsTrigger>
              <TabsTrigger value="booths">Booth ({filteredBooths.length})</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="ranks" className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Danh sách rank</h3>
                <p className="text-xs text-muted-foreground">Loại xếp hạng dùng để nhóm exhibitor</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedRank(undefined);
                  setIsRankModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span className="whitespace-nowrap">Thêm rank</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">STT</TableHead>
                    <TableHead className="min-w-[220px] cursor-pointer" onClick={() => handleRankSort("name_vn")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Tên rank</span>
                        {getRankSortIcon("name_vn")}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleRankSort("web_id")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Web-site</span>
                        {getRankSortIcon("web_id")}
                      </div>
                    </TableHead>
                    <TableHead className="w-28 cursor-pointer" onClick={() => handleRankSort("display_order")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Thứ tự</span>
                        {getRankSortIcon("display_order")}
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">Exhibitor</TableHead>
                    <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleRankSort("updated_at")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Cập nhật cuối</span>
                        {getRankSortIcon("updated_at")}
                      </div>
                    </TableHead>
                    <TableHead className="w-28 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingExhibitorRanks ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-30" />
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : pagedRanks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                        Chưa có rank
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedRanks.map((rank, index) => (
                      <TableRow key={rank.id}>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {(rankPage - 1) * rankLimit + index + 1}
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{rank.name_vn}</div>
                          {rank.name_en && <div className="text-xs text-muted-foreground">{rank.name_en}</div>}
                        </TableCell>
                        <TableCell className="text-center">{rank.web?.name || "—"}</TableCell>
                        <TableCell className="text-center">{rank.display_order}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {rank.exhibitors?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {rank.updated_at ? dayjs(rank.updated_at).format("DD/MM/YYYY HH:mm") : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedRank(rank);
                                setIsRankModalOpen(true);
                              }}
                              className="text-blue-600 hover:bg-blue-100"
                              title="Cập nhật"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteRank(rank)}
                              disabled={isDeletingExhibitorRank}
                              className="text-red-600 hover:bg-red-100"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {renderPagination(
                  pagedRanks.length,
                  filteredRanks.length,
                  rankLimit,
                  setRankLimit,
                  rankPage,
                  setRankPage,
                  rankTotalPages,
                  7,
                )}
              </Table>
            </div>
          </TabsContent>

          <TabsContent value="booths" className="space-y-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-sm font-semibold text-gray-800">Danh sách booth</h3>
                <p className="text-xs text-muted-foreground">Gian hàng được gán cho từng exhibitor</p>
              </div>
              <Button
                onClick={() => {
                  setSelectedBooth(undefined);
                  setIsBoothModalOpen(true);
                }}
              >
                <Plus size={16} />
                <span className="whitespace-nowrap">Thêm booth</span>
              </Button>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16 text-center">STT</TableHead>
                    <TableHead className="min-w-[220px] cursor-pointer" onClick={() => handleBoothSort("name")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Tên booth</span>
                        {getBoothSortIcon("name")}
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleBoothSort("web_id")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Web-site</span>
                        {getBoothSortIcon("web_id")}
                      </div>
                    </TableHead>
                    <TableHead className="w-32 text-center">Exhibitor</TableHead>
                    <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleBoothSort("updated_at")}>
                      <div className="flex items-center justify-center gap-2">
                        <span>Cập nhật cuối</span>
                        {getBoothSortIcon("updated_at")}
                      </div>
                    </TableHead>
                    <TableHead className="w-28 text-center">Thao tác</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoadingBooths ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-30" />
                        Đang tải dữ liệu...
                      </TableCell>
                    </TableRow>
                  ) : pagedBooths.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                        Chưa có booth
                      </TableCell>
                    </TableRow>
                  ) : (
                    pagedBooths.map((booth, index) => (
                      <TableRow key={booth.id}>
                        <TableCell className="text-center font-mono text-xs text-muted-foreground">
                          {(boothPage - 1) * boothLimit + index + 1}
                        </TableCell>
                        <TableCell className="font-medium">{booth.name || `Booth #${booth.id}`}</TableCell>
                        <TableCell className="text-center">{booth.web?.name || "—"}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                            {booth.exhibitors?.length || 0}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-center text-xs">
                          {booth.updated_at ? dayjs(booth.updated_at).format("DD/MM/YYYY HH:mm") : "—"}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-1">
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => {
                                setSelectedBooth(booth);
                                setIsBoothModalOpen(true);
                              }}
                              className="text-blue-600 hover:bg-blue-100"
                              title="Cập nhật"
                            >
                              <Pencil size={15} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon-xs"
                              onClick={() => handleDeleteBooth(booth)}
                              disabled={isDeletingBooth}
                              className="text-red-600 hover:bg-red-100"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
                {renderPagination(
                  pagedBooths.length,
                  filteredBooths.length,
                  boothLimit,
                  setBoothLimit,
                  boothPage,
                  setBoothPage,
                  boothTotalPages,
                  6,
                )}
              </Table>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ExhibitorRankModal
        isOpen={isRankModalOpen}
        onClose={() => {
          setSelectedRank(undefined);
          setIsRankModalOpen(false);
        }}
        onSave={handleSaveRank}
        data={selectedRank}
        websites={websites}
        loading={isCreatingExhibitorRank || isUpdatingExhibitorRank}
      />

      <BoothModal
        isOpen={isBoothModalOpen}
        onClose={() => {
          setSelectedBooth(undefined);
          setIsBoothModalOpen(false);
        }}
        onSave={handleSaveBooth}
        data={selectedBooth}
        websites={websites}
        loading={isCreatingBooth || isUpdatingBooth}
      />

      <ExhibitorModal
        isOpen={isExhibitorModalOpen}
        onClose={() => {
          setSelectedExhibitor(undefined);
          setIsExhibitorModalOpen(false);
        }}
        onSave={handleSaveExhibitor}
        data={selectedExhibitor}
        websites={websites}
        ranks={ranks}
        booths={booths}
        exhibitions={exhibitions}
        loading={isCreatingExhibitor || isUpdatingExhibitor}
      />
    </section>
  );
}
