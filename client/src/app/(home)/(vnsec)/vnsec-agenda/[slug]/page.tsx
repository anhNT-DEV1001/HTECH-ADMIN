"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  CalendarPlus,
  ChevronDown,
  ChevronRight,
  Clock,
  FileText,
  Loader2,
  Plus,
  Save,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { agendaService } from "@/features/agenda/services";
import type { IAgenda, IAgendaDatePayload, IAgendaTimelinePayload } from "@/features/agenda/interfaces";
import { useWeb } from "@/features/web/hooks";
import { useToast } from "@/common/providers/ToastProvider";
import { DatePicker } from "@/common/components/DatePicker";
import { TimePicker } from "@/common/components/TimePicker";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

type TimelineForm = IAgendaTimelinePayload & {
  key: string;
};

type AgendaDateForm = Omit<IAgendaDatePayload, "timelines"> & {
  key: string;
  timelines: TimelineForm[];
};

const createKey = () => {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
};

const toDateInputValue = (value?: string | null) => {
  if (!value) return "";
  return value.slice(0, 10);
};

const toTimeInputValue = (value?: string | null) => {
  if (!value) return "";
  if (/^\d{2}:\d{2}/.test(value)) return value.slice(0, 5);
  const timePart = value.split("T")[1];
  return timePart ? timePart.slice(0, 5) : "";
};

const createEmptyTimeline = (): TimelineForm => ({
  key: createKey(),
  STime: "",
  ETime: "",
  name_vn: "",
  name_en: "",
  short_name_vn: "",
  short_name_en: "",
  locate_vn: "",
  locate_en: "",
});

const createEmptyAgendaDate = (): AgendaDateForm => ({
  key: createKey(),
  date: "",
  description: "",
  timelines: [createEmptyTimeline()],
});

const mapAgendaToFormDates = (agenda: IAgenda): AgendaDateForm[] => {
  if (agenda.agendaDates.length === 0) return [createEmptyAgendaDate()];

  return agenda.agendaDates.map((agendaDate) => ({
    key: createKey(),
    id: agendaDate.id,
    date: toDateInputValue(agendaDate.date),
    description: agendaDate.description || "",
    timelines: agendaDate.timelines.length
      ? agendaDate.timelines.map((timeline) => ({
        key: createKey(),
        id: timeline.id,
        STime: toTimeInputValue(timeline.STime),
        ETime: toTimeInputValue(timeline.ETime),
        name_vn: timeline.name_vn,
        name_en: timeline.name_en || "",
        short_name_vn: timeline.short_name_vn,
        short_name_en: timeline.short_name_en || "",
        locate_vn: timeline.locate_vn,
        locate_en: timeline.locate_en || "",
      }))
      : [createEmptyTimeline()],
  }));
};

export default function VnsecAgendaFormPage() {
  const router = useRouter();
  const params = useParams();
  const slug = String(params?.slug || "create");
  const isCreateMode = slug === "create";
  const agendaId = isCreateMode ? null : Number(slug);
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const { webData, isLoading: isLoadingWebsites } = useWeb();
  const websites = webData?.data || [];

  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [nameVn, setNameVn] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [webId, setWebId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agendaDates, setAgendaDates] = useState<AgendaDateForm[]>([createEmptyAgendaDate()]);
  const [collapsedDateKeys, setCollapsedDateKeys] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (isCreateMode || !agendaId || !Number.isFinite(agendaId)) {
      setIsLoading(false);
      return;
    }

    const fetchAgenda = async () => {
      try {
        const response = await agendaService.getAgendaById(agendaId);
        if (response.status !== "success" || !response.data) {
          showToast("Không tìm thấy agenda", "error");
          router.push("/vnsec-agenda");
          return;
        }

        const agenda = response.data;
        setNameVn(agenda.name_vn);
        setNameEn(agenda.name_en || "");
        setFileUrl(agenda.file_url || "");
        setWebId(String(agenda.web_id));
        setStartDate(toDateInputValue(agenda.SDate));
        setEndDate(toDateInputValue(agenda.EDate));
        setAgendaDates(mapAgendaToFormDates(agenda));
      } catch {
        showToast("Không tìm thấy agenda", "error");
        router.push("/vnsec-agenda");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgenda();
  }, [agendaId, isCreateMode, router, showToast]);

  const timelineTotal = useMemo(
    () => agendaDates.reduce((total, agendaDate) => total + agendaDate.timelines.length, 0),
    [agendaDates],
  );

  const handleWebChange = (value: string) => {
    setWebId(value);
  };

  const updateAgendaDate = (dateKey: string, field: "date" | "description", value: string) => {
    setAgendaDates((previous) =>
      previous.map((agendaDate) =>
        agendaDate.key === dateKey ? { ...agendaDate, [field]: value } : agendaDate,
      ),
    );
  };

  const updateTimeline = (
    dateKey: string,
    timelineKey: string,
    field: keyof IAgendaTimelinePayload,
    value: string,
  ) => {
    setAgendaDates((previous) =>
      previous.map((agendaDate) =>
        agendaDate.key === dateKey
          ? {
            ...agendaDate,
            timelines: agendaDate.timelines.map((timeline) =>
              timeline.key === timelineKey ? { ...timeline, [field]: value } : timeline,
            ),
          }
          : agendaDate,
      ),
    );
  };

  const addAgendaDate = () => {
    const newAgendaDate = createEmptyAgendaDate();
    setAgendaDates((previous) => [...previous, newAgendaDate]);
  };

  const removeAgendaDate = (dateKey: string) => {
    setAgendaDates((previous) => {
      if (previous.length === 1) return previous;
      return previous.filter((agendaDate) => agendaDate.key !== dateKey);
    });
  };

  const addTimeline = (dateKey: string) => {
    setAgendaDates((previous) =>
      previous.map((agendaDate) =>
        agendaDate.key === dateKey
          ? { ...agendaDate, timelines: [...agendaDate.timelines, createEmptyTimeline()] }
          : agendaDate,
      ),
    );
  };

  const removeTimeline = (dateKey: string, timelineKey: string) => {
    setAgendaDates((previous) =>
      previous.map((agendaDate) =>
        agendaDate.key === dateKey
          ? {
            ...agendaDate,
            timelines:
              agendaDate.timelines.length === 1
                ? agendaDate.timelines
                : agendaDate.timelines.filter((timeline) => timeline.key !== timelineKey),
          }
          : agendaDate,
      ),
    );
  };

  const toggleAgendaDate = (dateKey: string) => {
    setCollapsedDateKeys((previous) => {
      const next = new Set(previous);
      if (next.has(dateKey)) {
        next.delete(dateKey);
      } else {
        next.add(dateKey);
      }
      return next;
    });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Vui lòng chọn file PDF", "error");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const validateForm = () => {
    if (!nameVn.trim()) return "Vui lòng nhập tên agenda tiếng Việt";
    if (!webId) return "Vui lòng chọn web-site";
    if (!startDate) return "Vui lòng chọn ngày bắt đầu";
    if (!endDate) return "Vui lòng chọn ngày kết thúc";
    if (startDate > endDate) return "Ngày bắt đầu không được lớn hơn ngày kết thúc";

    for (const agendaDate of agendaDates) {
      if (!agendaDate.date) return "Vui lòng nhập đầy đủ ngày trong lịch agenda";
      for (const timeline of agendaDate.timelines) {
        if (!timeline.STime || !timeline.ETime) return "Vui lòng nhập đầy đủ thời gian timeline";
        if (timeline.STime >= timeline.ETime) return "Thời gian bắt đầu timeline phải nhỏ hơn thời gian kết thúc";
        if (!timeline.name_vn.trim()) return "Vui lòng nhập tên timeline tiếng Việt";
        if (!timeline.short_name_vn.trim()) return "Vui lòng nhập tên ngắn timeline tiếng Việt";
        if (!timeline.locate_vn.trim()) return "Vui lòng nhập địa điểm timeline tiếng Việt";
      }
    }

    return null;
  };

  const buildFormData = () => {
    const formData = new FormData();
    formData.append("name_vn", nameVn.trim());
    formData.append("name_en", nameEn.trim());
    formData.append("web_id", webId);
    formData.append("SDate", startDate);
    formData.append("EDate", endDate);
    formData.append(
      "agendaDates",
      JSON.stringify(
        agendaDates.map((agendaDate) => ({
          id: agendaDate.id,
          date: agendaDate.date,
          description: agendaDate.description?.trim(),
          timelines: agendaDate.timelines.map((timeline) => ({
            id: timeline.id,
            STime: timeline.STime,
            ETime: timeline.ETime,
            name_vn: timeline.name_vn.trim(),
            name_en: timeline.name_en?.trim(),
            short_name_vn: timeline.short_name_vn.trim(),
            short_name_en: timeline.short_name_en?.trim(),
            locate_vn: timeline.locate_vn.trim(),
            locate_en: timeline.locate_en?.trim(),
          })),
        })),
      ),
    );

    if (selectedFile) {
      formData.append("file", selectedFile, selectedFile.name);
    } else if (fileUrl) {
      formData.append("file_url", fileUrl);
    }

    return formData;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const errorMessage = validateForm();
    if (errorMessage) {
      showToast(errorMessage, "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const formData = buildFormData();
      if (isCreateMode) {
        await agendaService.createAgenda(formData);
        showToast("Tạo agenda thành công", "success");
      } else if (agendaId) {
        await agendaService.updateAgenda(agendaId, formData);
        showToast("Cập nhật agenda thành công", "success");
      }

      await queryClient.invalidateQueries({ queryKey: ["agenda", "getAgendas"] });
      router.push("/vnsec-agenda");
    } catch {
      showToast(isCreateMode ? "Tạo agenda thất bại" : "Cập nhật agenda thất bại", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center">
        <Loader2 size={36} className="mb-3 animate-spin text-blue-600" />
        <p className="text-sm text-muted-foreground">Đang tải dữ liệu agenda...</p>
      </div>
    );
  }

  return (
    <section>
      <Button
        variant="ghost"
        className="mb-3 flex items-center gap-2 text-muted-foreground hover:text-blue-600"
        onClick={() => router.push("/vnsec-agenda")}
      >
        <ArrowLeft size={18} />
        <span className="text-lg font-bold text-gray-800">
          {isCreateMode ? "Tạo Agenda" : "Chỉnh sửa Agenda"}
        </span>
      </Button>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 rounded-md border border-slate-200 p-4 lg:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name-vn">Tên agenda (Tiếng Việt)</Label>
            <Input id="name-vn" value={nameVn} onChange={(event) => setNameVn(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="name-en">Tên agenda (Tiếng Anh)</Label>
            <Input id="name-en" value={nameEn} onChange={(event) => setNameEn(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Web-site</Label>
            <Select value={webId} onValueChange={handleWebChange} disabled={isLoadingWebsites}>
              <SelectTrigger>
                <SelectValue placeholder="Chọn web-site" />
              </SelectTrigger>
              <SelectContent>
                {websites.map((web) => (
                  <SelectItem key={web.id} value={String(web.id)}>
                    {web.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>File PDF</Label>
            <div className="flex flex-col gap-2 rounded-md border border-dashed border-slate-300 bg-slate-50 p-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-2 text-sm">
                  <FileText size={18} className="shrink-0 text-orange-500" />
                  <span className="truncate font-medium text-gray-800">
                    {selectedFile?.name || (fileUrl ? fileUrl.split("/").pop() : "Chưa chọn file PDF")}
                  </span>
                </div>
                {(selectedFile || fileUrl) && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-xs"
                    className="shrink-0 text-red-600 hover:bg-red-100"
                    onClick={() => {
                      setSelectedFile(null);
                      setFileUrl("");
                    }}
                  >
                    <X size={14} />
                  </Button>
                )}
              </div>
              <label className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-md border bg-white px-3 text-sm font-medium shadow-xs transition hover:bg-accent hover:text-accent-foreground">
                <Upload size={16} />
                Chọn PDF
                <input type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
              </label>
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="start-date">Ngày bắt đầu</Label>
            <DatePicker value={startDate} onChange={setStartDate} placeholder="Chọn ngày bắt đầu" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="end-date">Ngày kết thúc</Label>
            <DatePicker value={endDate} onChange={setEndDate} placeholder="Chọn ngày kết thúc" />
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-800">Date và timeline</h2>
            <p className="text-sm text-muted-foreground">{agendaDates.length} ngày / {timelineTotal} timeline</p>
          </div>
          <Button type="button" variant="outline" onClick={addAgendaDate}>
            <CalendarPlus size={16} />
            Thêm ngày
          </Button>
        </div>

        <div className="space-y-4">
          {agendaDates.map((agendaDate, dateIndex) => (
            <Collapsible
              key={agendaDate.key}
              open={!collapsedDateKeys.has(agendaDate.key)}
              onOpenChange={() => toggleAgendaDate(agendaDate.key)}
              className="overflow-hidden rounded-md border border-orange-200 bg-white shadow-sm"
            >
              <div className="flex flex-col gap-3 border-b border-orange-200 bg-orange-50/80 p-4 lg:flex-row lg:items-end">
                <div className="grid flex-1 gap-3 lg:grid-cols-[220px_1fr]">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <CollapsibleTrigger asChild>
                        <Button type="button" variant="ghost" size="icon-xs" className="bg-white text-orange-600 hover:bg-orange-100">
                          {collapsedDateKeys.has(agendaDate.key) ? <ChevronRight size={14} /> : <ChevronDown size={14} />}
                        </Button>
                      </CollapsibleTrigger>
                      <Label className="font-semibold text-orange-700">Ngày {dateIndex + 1}</Label>
                      <span className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-orange-700">
                        {agendaDate.timelines.length} timeline
                      </span>
                    </div>
                    <DatePicker
                      value={agendaDate.date}
                      onChange={(value) => updateAgendaDate(agendaDate.key, "date", value)}
                      placeholder="Chọn ngày"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Mô tả</Label>
                    <Input
                      value={agendaDate.description || ""}
                      onChange={(event) => updateAgendaDate(agendaDate.key, "description", event.target.value)}
                      placeholder="VD: Main conference day"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => addTimeline(agendaDate.key)}>
                    <Plus size={16} />
                    Timeline
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon-sm"
                    className="text-red-600 hover:bg-red-100"
                    onClick={() => removeAgendaDate(agendaDate.key)}
                    disabled={agendaDates.length === 1}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>

              <CollapsibleContent className="space-y-4 p-4">
                {agendaDate.timelines.map((timeline, timelineIndex) => (
                  <div key={timeline.key} className="rounded-md border border-slate-100 p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <Clock size={16} className="text-orange-500" />
                        Timeline {timelineIndex + 1}
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-xs"
                        className="text-red-600 hover:bg-red-100"
                        onClick={() => removeTimeline(agendaDate.key, timeline.key)}
                        disabled={agendaDate.timelines.length === 1}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>

                    <div className="grid gap-3 lg:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label>Bắt đầu</Label>
                        <TimePicker
                          value={timeline.STime}
                          onChange={(value) => updateTimeline(agendaDate.key, timeline.key, "STime", value)}
                          placeholder="HH:mm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Kết thúc</Label>
                        <TimePicker
                          value={timeline.ETime}
                          onChange={(value) => updateTimeline(agendaDate.key, timeline.key, "ETime", value)}
                          placeholder="HH:mm"
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <Label>Tên timeline (Tiếng Việt)</Label>
                        <Input
                          value={timeline.name_vn}
                          onChange={(event) => updateTimeline(agendaDate.key, timeline.key, "name_vn", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <Label>Tên timeline (Tiếng Anh)</Label>
                        <Input
                          value={timeline.name_en || ""}
                          onChange={(event) => updateTimeline(agendaDate.key, timeline.key, "name_en", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Tên ngắn VN</Label>
                        <Input
                          value={timeline.short_name_vn}
                          onChange={(event) => updateTimeline(agendaDate.key, timeline.key, "short_name_vn", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label>Tên ngắn EN</Label>
                        <Input
                          value={timeline.short_name_en || ""}
                          onChange={(event) => updateTimeline(agendaDate.key, timeline.key, "short_name_en", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <Label>Địa điểm VN</Label>
                        <Input
                          value={timeline.locate_vn}
                          onChange={(event) => updateTimeline(agendaDate.key, timeline.key, "locate_vn", event.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5 lg:col-span-2">
                        <Label>Địa điểm EN</Label>
                        <Input
                          value={timeline.locate_en || ""}
                          onChange={(event) => updateTimeline(agendaDate.key, timeline.key, "locate_en", event.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          ))}
        </div>

        <div className="sticky bottom-0 flex justify-end gap-2 border-t border-slate-200 bg-white py-4">
          <Button type="button" variant="outline" onClick={() => router.push("/vnsec-agenda")} disabled={isSubmitting}>
            Hủy
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {isCreateMode ? "Tạo agenda" : "Lưu thay đổi"}
          </Button>
        </div>
      </form>
    </section>
  );
}
