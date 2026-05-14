"use client";

import { useConfirm } from "@/common/providers/ConfirmProvider";
import { LucideIconByName } from "@/common/components/ui/lucide-icon";
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
import { useDebouncedValue } from "@/common/hooks";
import { ExhibitionModal, ZoneModal } from "@/features/exhibition/components";
import { useExhibition } from "@/features/exhibition/hooks";
import type {
  ICreateExhibition,
  ICreateZone,
  IExhibition,
  IZone,
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
type ExhibitionSortKey = "display_order" | "name_vn" | "web_id" | "zones" | "updated_at";
type ZoneSortKey = "name_vn" | "web_id" | "updated_at";

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

const getComparableValue = (
  item: IExhibition,
  key: ExhibitionSortKey,
): string | number => {
  if (key === "updated_at") return item.updated_at || "";
  if (key === "zones") return item.zones?.map((zone) => zone.name_vn).join(", ") || "";
  return item[key] ?? "";
};

const getZoneComparableValue = (item: IZone, key: ZoneSortKey): string | number => {
  if (key === "updated_at") return item.updated_at || "";
  return item[key] ?? "";
};

export default function VnsecExhibitionsPage() {
  const { confirm } = useConfirm();
  const { webData } = useWeb();
  const {
    exhibitionData,
    zoneData,
    isLoadingExhibitions,
    isLoadingZones,
    isFetchingExhibitions,
    isFetchingZones,
    createExhibition,
    updateExhibition,
    deleteExhibition,
    createZone,
    updateZone,
    deleteZone,
    isCreatingExhibition,
    isUpdatingExhibition,
    isDeletingExhibition,
    isCreatingZone,
    isUpdatingZone,
    isDeletingZone,
  } = useExhibition();

  const [searchInput, setSearchInput] = useState("");
  const [zoneFilter, setZoneFilter] = useState("all");
  const [exhibitionPage, setExhibitionPage] = useState(1);
  const [exhibitionLimit, setExhibitionLimit] = useState(10);
  const [exhibitionSortKey, setExhibitionSortKey] = useState<ExhibitionSortKey>("display_order");
  const [exhibitionSortDirection, setExhibitionSortDirection] = useState<SortDirection>("asc");

  const [zonePage, setZonePage] = useState(1);
  const [zoneLimit, setZoneLimit] = useState(10);
  const [zoneSortKey, setZoneSortKey] = useState<ZoneSortKey>("name_vn");
  const [zoneSortDirection, setZoneSortDirection] = useState<SortDirection>("asc");

  const [isExhibitionModalOpen, setIsExhibitionModalOpen] = useState(false);
  const [isZoneModalOpen, setIsZoneModalOpen] = useState(false);
  const [selectedExhibition, setSelectedExhibition] = useState<IExhibition | undefined>();
  const [selectedZone, setSelectedZone] = useState<IZone | undefined>();

  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const websites = webData?.data || [];
  const zones = zoneData?.data || [];
  const exhibitions = exhibitionData?.data || [];

  const filteredExhibitions = useMemo(() => {
    const query = normalizeText(debouncedSearch);

    return exhibitions
      .filter((exhibition) => {
        const matchesZone =
          zoneFilter === "all" ||
          Boolean(exhibition.zones?.some((zone) => zone.id === Number(zoneFilter)));
        const matchesSearch =
          !query ||
          normalizeText(exhibition.name_vn).includes(query) ||
          normalizeText(exhibition.name_en).includes(query) ||
          normalizeText(exhibition.title_vn).includes(query) ||
          normalizeText(exhibition.title_en).includes(query);

        return matchesZone && matchesSearch;
      })
      .sort((left, right) => {
        const leftValue = getComparableValue(left, exhibitionSortKey);
        const rightValue = getComparableValue(right, exhibitionSortKey);
        const result = String(leftValue).localeCompare(String(rightValue), "vi", {
          numeric: true,
          sensitivity: "base",
        });
        return exhibitionSortDirection === "asc" ? result : -result;
      });
  }, [debouncedSearch, exhibitionSortDirection, exhibitionSortKey, exhibitions, zoneFilter]);

  const sortedZones = useMemo(
    () =>
      [...zones].sort((left, right) => {
        const leftValue = getZoneComparableValue(left, zoneSortKey);
        const rightValue = getZoneComparableValue(right, zoneSortKey);
        const result = String(leftValue).localeCompare(String(rightValue), "vi", {
          numeric: true,
          sensitivity: "base",
        });
        return zoneSortDirection === "asc" ? result : -result;
      }),
    [zoneSortDirection, zoneSortKey, zones],
  );

  const exhibitionTotalPages = Math.max(1, Math.ceil(filteredExhibitions.length / exhibitionLimit));
  const zoneTotalPages = Math.max(1, Math.ceil(sortedZones.length / zoneLimit));

  const pagedExhibitions = filteredExhibitions.slice(
    (exhibitionPage - 1) * exhibitionLimit,
    exhibitionPage * exhibitionLimit,
  );
  const pagedZones = sortedZones.slice((zonePage - 1) * zoneLimit, zonePage * zoneLimit);

  const activeFilterCount = zoneFilter !== "all" ? 1 : 0;
  const isSavingExhibition = isCreatingExhibition || isUpdatingExhibition;
  const isSavingZone = isCreatingZone || isUpdatingZone;

  const handleExhibitionSort = (key: ExhibitionSortKey) => {
    setExhibitionSortKey(key);
    setExhibitionSortDirection((current) =>
      exhibitionSortKey === key && current === "asc" ? "desc" : "asc",
    );
    setExhibitionPage(1);
  };

  const handleZoneSort = (key: ZoneSortKey) => {
    setZoneSortKey(key);
    setZoneSortDirection((current) => (zoneSortKey === key && current === "asc" ? "desc" : "asc"));
    setZonePage(1);
  };

  const getExhibitionSortIcon = (key: ExhibitionSortKey) => {
    if (exhibitionSortKey !== key) return <ArrowDownWideNarrow size={14} />;
    return exhibitionSortDirection === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const getZoneSortIcon = (key: ZoneSortKey) => {
    if (zoneSortKey !== key) return <ArrowDownWideNarrow size={14} />;
    return zoneSortDirection === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };

  const handleAddExhibition = () => {
    setSelectedExhibition(undefined);
    setIsExhibitionModalOpen(true);
  };

  const handleEditExhibition = (exhibition: IExhibition) => {
    setSelectedExhibition(exhibition);
    setIsExhibitionModalOpen(true);
  };

  const handleCloseExhibitionModal = () => {
    setSelectedExhibition(undefined);
    setIsExhibitionModalOpen(false);
  };

  const handleSaveExhibition = async (formData: ICreateExhibition) => {
    const accepted = await confirm({
      title: selectedExhibition ? "Cập nhật exhibition" : "Tạo exhibition",
      message: selectedExhibition
        ? `Bạn có muốn cập nhật "${selectedExhibition.name_vn}"?`
        : `Bạn có muốn tạo "${formData.name_vn}"?`,
      variant: "info",
    });

    if (!accepted) return;

    if (selectedExhibition) {
      updateExhibition(
        { id: selectedExhibition.id, ...formData },
        { onSuccess: handleCloseExhibitionModal },
      );
      return;
    }

    createExhibition(formData, { onSuccess: handleCloseExhibitionModal });
  };

  const handleDeleteExhibition = async (exhibition: IExhibition) => {
    const accepted = await confirm({
      title: "Xóa exhibition",
      message: `Bạn có chắc chắn muốn xóa "${exhibition.name_vn}"?`,
      variant: "danger",
    });

    if (accepted) deleteExhibition(exhibition.id);
  };

  const handleAddZone = () => {
    setSelectedZone(undefined);
    setIsZoneModalOpen(true);
  };

  const handleEditZone = (zone: IZone) => {
    setSelectedZone(zone);
    setIsZoneModalOpen(true);
  };

  const handleCloseZoneModal = () => {
    setSelectedZone(undefined);
    setIsZoneModalOpen(false);
  };

  const handleSaveZone = async (formData: ICreateZone) => {
    const accepted = await confirm({
      title: selectedZone ? "Cập nhật zone" : "Tạo zone",
      message: selectedZone
        ? `Bạn có muốn cập nhật "${selectedZone.name_vn}"?`
        : `Bạn có muốn tạo "${formData.name_vn}"?`,
      variant: "info",
    });

    if (!accepted) return;

    if (selectedZone) {
      updateZone({ id: selectedZone.id, ...formData }, { onSuccess: handleCloseZoneModal });
      return;
    }

    createZone(formData, { onSuccess: handleCloseZoneModal });
  };

  const handleDeleteZone = async (zone: IZone) => {
    const accepted = await confirm({
      title: "Xóa zone",
      message: `Bạn có chắc chắn muốn xóa "${zone.name_vn}"?`,
      variant: "danger",
    });

    if (accepted) deleteZone(zone.id);
  };

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Quản lý Exhibition</h1>
          <p className="text-sm text-muted-foreground">Danh sách exhibition và zone theo hệ thống VNSEC</p>
        </div>
        {(isFetchingExhibitions || isFetchingZones) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 size={14} className="animate-spin" />
            Đang cập nhật
          </div>
        )}
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Danh sách exhibition</h2>
            <p className="text-xs text-muted-foreground">Có thể lọc exhibition theo zone</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:w-[320px]">
              <Input
                value={searchInput}
                onChange={(event) => {
                  setSearchInput(event.target.value);
                  setExhibitionPage(1);
                }}
                placeholder="Tìm kiếm exhibition"
                className="pr-9"
              />
              <Search
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={16}
              />
            </div>

            <Select
              value={zoneFilter}
              onValueChange={(value) => {
                setZoneFilter(value);
                setExhibitionPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-[240px]">
                <SelectValue placeholder="Lọc theo zone" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả zone</SelectItem>
                {zones.map((zone) => (
                  <SelectItem key={zone.id} value={String(zone.id)}>
                    {zone.name_vn}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeFilterCount > 0 && (
              <Button variant="outline" onClick={() => setZoneFilter("all")} className="gap-1">
                <X size={14} />
                Xóa lọc
              </Button>
            )}

            <Button onClick={handleAddExhibition}>
              <Plus size={16} />
              <span className="whitespace-nowrap">Thêm exhibition</span>
            </Button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">STT</TableHead>
                <TableHead className="min-w-[220px] cursor-pointer" onClick={() => handleExhibitionSort("name_vn")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Tên exhibition</span>
                    {getExhibitionSortIcon("name_vn")}
                  </div>
                </TableHead>
                <TableHead className="min-w-[220px] cursor-pointer" onClick={() => handleExhibitionSort("zones")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Zone</span>
                    {getExhibitionSortIcon("zones")}
                  </div>
                </TableHead>
                <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleExhibitionSort("web_id")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Web-site</span>
                    {getExhibitionSortIcon("web_id")}
                  </div>
                </TableHead>
                <TableHead className="w-28 cursor-pointer" onClick={() => handleExhibitionSort("display_order")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Thứ tự</span>
                    {getExhibitionSortIcon("display_order")}
                  </div>
                </TableHead>
                <TableHead className="w-32 text-center">Exhibitor</TableHead>
                <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleExhibitionSort("updated_at")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Cập nhật cuối</span>
                    {getExhibitionSortIcon("updated_at")}
                  </div>
                </TableHead>
                <TableHead className="w-28 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingExhibitions ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-30" />
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : pagedExhibitions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="py-8 text-center text-muted-foreground">
                    Không tìm thấy exhibition phù hợp
                  </TableCell>
                </TableRow>
              ) : (
                pagedExhibitions.map((exhibition, index) => {
                  const stt = (exhibitionPage - 1) * exhibitionLimit + index + 1;

                  return (
                    <TableRow key={exhibition.id}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">{stt}</TableCell>
                      <TableCell>
                        <div className="flex items-start gap-3">
                          <div className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-md border bg-slate-50">
                            {exhibition.img ? (
                              <img
                                src={getImageUrl(exhibition.img)}
                                alt={exhibition.name_vn}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center text-blue-700">
                                <LucideIconByName name={exhibition.logo} size={22} />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{exhibition.name_vn}</div>
                            <div className="text-xs text-muted-foreground">{exhibition.title_vn}</div>
                            {exhibition.name_en && (
                              <div className="text-xs text-muted-foreground">{exhibition.name_en}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap justify-center gap-1">
                          {exhibition.zones?.length ? (
                            exhibition.zones.map((zone) => (
                              <Badge key={zone.id} variant="secondary" className="bg-blue-50 text-blue-700">
                                {zone.name_vn}
                              </Badge>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-center">{exhibition.web?.name || "—"}</TableCell>
                      <TableCell className="text-center">{exhibition.display_order}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {exhibition.exhibitors?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {exhibition.updated_at ? dayjs(exhibition.updated_at).format("DD/MM/YYYY HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEditExhibition(exhibition)}
                            className="text-blue-600 hover:bg-blue-100"
                            title="Cập nhật"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteExhibition(exhibition)}
                            disabled={isDeletingExhibition}
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
            <TableFooter>
              <TableRow>
                <TableCell colSpan={8}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm">
                      Hiển thị <span className="font-medium">{pagedExhibitions.length}</span> /{" "}
                      {filteredExhibitions.length} kết quả
                    </div>

                    <Select
                      value={String(exhibitionLimit)}
                      onValueChange={(value) => {
                        setExhibitionLimit(Number(value));
                        setExhibitionPage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_LIMIT_OPTIONS.map((limit) => (
                          <SelectItem key={limit} value={String(limit)}>
                            {limit} / trang
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={exhibitionPage <= 1}
                        onClick={() => setExhibitionPage((page) => page - 1)}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <div className="flex gap-1 px-2">
                        {Array.from({ length: exhibitionTotalPages }, (_, index) => (
                          <Button
                            key={index}
                            variant={exhibitionPage === index + 1 ? "default" : "outline"}
                            size="icon-xs"
                            onClick={() => setExhibitionPage(index + 1)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={exhibitionPage >= exhibitionTotalPages}
                        onClick={() => setExhibitionPage((page) => page + 1)}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Danh sách zone</h2>
            <p className="text-xs text-muted-foreground">Quản lý nhóm zone dùng cho exhibition</p>
          </div>
          <Button onClick={handleAddZone}>
            <Plus size={16} />
            <span className="whitespace-nowrap">Thêm zone</span>
          </Button>
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-16 text-center">STT</TableHead>
                <TableHead className="min-w-[220px] cursor-pointer" onClick={() => handleZoneSort("name_vn")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Tên zone</span>
                    {getZoneSortIcon("name_vn")}
                  </div>
                </TableHead>
                <TableHead className="min-w-[160px] cursor-pointer" onClick={() => handleZoneSort("web_id")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Web-site</span>
                    {getZoneSortIcon("web_id")}
                  </div>
                </TableHead>
                <TableHead className="w-32 text-center">Exhibition</TableHead>
                <TableHead className="min-w-[150px] cursor-pointer" onClick={() => handleZoneSort("updated_at")}>
                  <div className="flex items-center justify-center gap-2">
                    <span>Cập nhật cuối</span>
                    {getZoneSortIcon("updated_at")}
                  </div>
                </TableHead>
                <TableHead className="w-28 text-center">Thao tác</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingZones ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    <Loader2 size={24} className="mx-auto mb-2 animate-spin opacity-30" />
                    Đang tải dữ liệu...
                  </TableCell>
                </TableRow>
              ) : pagedZones.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                    Chưa có zone
                  </TableCell>
                </TableRow>
              ) : (
                pagedZones.map((zone, index) => {
                  const stt = (zonePage - 1) * zoneLimit + index + 1;

                  return (
                    <TableRow key={zone.id}>
                      <TableCell className="text-center font-mono text-xs text-muted-foreground">{stt}</TableCell>
                      <TableCell>
                        <div className="font-medium">{zone.name_vn}</div>
                        {zone.name_en && <div className="text-xs text-muted-foreground">{zone.name_en}</div>}
                      </TableCell>
                      <TableCell className="text-center">{zone.web?.name || "—"}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700">
                          {zone.exhibitions?.length || 0}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-xs">
                        {zone.updated_at ? dayjs(zone.updated_at).format("DD/MM/YYYY HH:mm") : "—"}
                      </TableCell>
                      <TableCell>
                        <div className="flex justify-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleEditZone(zone)}
                            className="text-blue-600 hover:bg-blue-100"
                            title="Cập nhật"
                          >
                            <Pencil size={15} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => handleDeleteZone(zone)}
                            disabled={isDeletingZone}
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
            <TableFooter>
              <TableRow>
                <TableCell colSpan={6}>
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-sm">
                      Hiển thị <span className="font-medium">{pagedZones.length}</span> / {sortedZones.length} kết quả
                    </div>

                    <Select
                      value={String(zoneLimit)}
                      onValueChange={(value) => {
                        setZoneLimit(Number(value));
                        setZonePage(1);
                      }}
                    >
                      <SelectTrigger className="h-8 w-[120px] text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAGE_LIMIT_OPTIONS.map((limit) => (
                          <SelectItem key={limit} value={String(limit)}>
                            {limit} / trang
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={zonePage <= 1}
                        onClick={() => setZonePage((page) => page - 1)}
                      >
                        <ChevronLeft size={16} />
                      </Button>
                      <div className="flex gap-1 px-2">
                        {Array.from({ length: zoneTotalPages }, (_, index) => (
                          <Button
                            key={index}
                            variant={zonePage === index + 1 ? "default" : "outline"}
                            size="icon-xs"
                            onClick={() => setZonePage(index + 1)}
                          >
                            {index + 1}
                          </Button>
                        ))}
                      </div>
                      <Button
                        variant="outline"
                        size="icon-xs"
                        disabled={zonePage >= zoneTotalPages}
                        onClick={() => setZonePage((page) => page + 1)}
                      >
                        <ChevronRight size={16} />
                      </Button>
                    </div>
                  </div>
                </TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </div>
      </div>

      <ExhibitionModal
        isOpen={isExhibitionModalOpen}
        onClose={handleCloseExhibitionModal}
        onSave={handleSaveExhibition}
        data={selectedExhibition}
        websites={websites}
        zones={zones}
        loading={isSavingExhibition}
      />

      <ZoneModal
        isOpen={isZoneModalOpen}
        onClose={handleCloseZoneModal}
        onSave={handleSaveZone}
        data={selectedZone}
        websites={websites}
        loading={isSavingZone}
      />
    </section>
  );
}
