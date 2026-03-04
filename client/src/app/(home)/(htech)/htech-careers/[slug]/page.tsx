"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { jobService } from "@/features/jobs/services";
import { useFieldsOfWork } from "@/features/jobs/hooks";
import { ExperienceOptions, JobTypeOptions } from "@/features/jobs/constants";
import TiptapEditor from "@/common/components/ui/TextEditor";
import { useToast } from "@/common/providers/ToastProvider";
import { ArrowLeft, CircleX, Loader2, Save, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CreateJobPage() {
  const router = useRouter();
  const params = useParams();
  const slug = params?.slug as string;
  const isCreateMode = slug === "create";
  const jobId = isCreateMode ? null : Number(slug);
  const queryClient = useQueryClient();

  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [editorReady, setEditorReady] = useState(false);

  // State quản lý form Tiếng Việt
  const [title_vn, setTitleVn] = useState("");
  const [description_vn, setDescriptionVn] = useState("");
  const [job_type_vn, setJobTypeVn] = useState("");
  const [experience_vn, setExperienceVn] = useState("");

  // State quản lý form Tiếng Anh
  const [title_en, setTitleEn] = useState("");
  const [description_en, setDescriptionEn] = useState("");
  const [job_type_en, setJobTypeEn] = useState("");
  const [experience_en, setExperienceEn] = useState("");

  // Common fields
  const [fieldOfWorkId, setFieldOfWorkId] = useState<string>("");
  const [recruitmentUrl, setRecruitmentUrl] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [sortOrder, setSortOrder] = useState(0);

  const [isFieldModalOpen, setIsFieldModalOpen] = useState(false);
  const [newFieldVn, setNewFieldVn] = useState("");
  const [newFieldEn, setNewFieldEn] = useState("");

  const { showToast } = useToast();
  const { fieldsOfWork, createFieldMutation, isCreatingField } =
    useFieldsOfWork();

  // Fetch dữ liệu nếu là edit mode
  useEffect(() => {
    if (!isCreateMode && jobId) {
      const fetchJobData = async () => {
        try {
          const response = await jobService.getJobById(jobId);
          if (response.status === "success" && response.data) {
            const job = response.data;
            setTitleVn(job.title_vn || "");
            setDescriptionVn(job.description_vn || "");
            setJobTypeVn(job.job_type_vn || "");
            setExperienceVn(job.experience_vn || "");

            setTitleEn(job.title_en || "");
            setDescriptionEn(job.description_en || "");
            setJobTypeEn(job.job_type_en || "");
            setExperienceEn(job.experience_en || "");

            if (job.field_of_work_id) {
              setFieldOfWorkId(String(job.field_of_work_id));
            }
            setRecruitmentUrl(job.recruitment_url || "");
            setIsActive(job.is_active);
            setSortOrder(job.sort_order || 0);
          }
        } catch (error) {
          console.error("Error fetching job:", error);
          showToast("Không tìm thấy công việc", "error");
          router.push("/htech-careers");
        } finally {
          setDataLoading(false);
        }
      };
      fetchJobData();
    } else {
      setDataLoading(false);
    }
  }, [isCreateMode, jobId]);

  const handleEditorReady = useCallback(() => {
    setEditorReady(true);
  }, []);

  const handleCreateField = async () => {
    if (!newFieldVn.trim()) {
      showToast("Vui lòng nhập tên lĩnh vực (Tiếng Việt)", "error");
      return;
    }
    createFieldMutation.mutate(
      { name_vn: newFieldVn, name_en: newFieldEn },
      {
        onSuccess: (data) => {
          setNewFieldVn("");
          setNewFieldEn("");
          setIsFieldModalOpen(false);
          if (data?.data?.id) {
            setFieldOfWorkId(String(data.data.id));
          }
        },
      },
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title_vn) {
      showToast("Vui lòng nhập tiêu đề công việc!", "error");
      return;
    }
    if (!fieldOfWorkId) {
      showToast("Vui lòng chọn lĩnh vực!", "error");
      return;
    }

    try {
      setLoading(true);

      const jobData = {
        title_vn,
        title_en,
        job_type_vn,
        job_type_en,
        experience_vn,
        experience_en,
        field_of_work_id: Number(fieldOfWorkId),
        description_vn,
        description_en,
        recruitment_url: recruitmentUrl,
        is_active: isActive,
        sort_order: sortOrder,
      };

      if (isCreateMode) {
        await jobService.createJob(jobData);
        showToast("Tạo công việc thành công!", "success");
      } else {
        await jobService.updateJob(jobId!, jobData);
        showToast("Cập nhật công việc thành công!", "success");
      }

      await queryClient.invalidateQueries({ queryKey: ["jobs", "getJobs"] });
      router.push("/htech-careers");
    } catch (error) {
      console.error(error);
      showToast(
        isCreateMode
          ? "Có lỗi xảy ra khi tạo công việc."
          : "Có lỗi xảy ra khi cập nhật công việc.",
        "error",
      );
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 size={40} className="animate-spin text-blue-600 mb-3" />
        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
      </div>
    );
  }

  return (
    <div className="container">
      <Button
        variant="ghost"
        className="flex items-center gap-2 text-muted-foreground hover:text-blue-600 mb-2"
        onClick={() => router.back()}
      >
        <ArrowLeft size={18} />
        <h1 className="text-lg font-bold text-gray-800">
          {isCreateMode ? "Tạo Tin Tuyển Dụng Mới" : "Chỉnh Sửa Tin Tuyển Dụng"}
        </h1>
      </Button>

      {!editorReady && (
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 size={32} className="animate-spin text-blue-600 mb-3" />
          <p className="text-sm text-muted-foreground">
            Đang khởi tạo trình soạn thảo...
          </p>
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-6"
        style={{ display: editorReady ? "block" : "none" }}
      >
        <Tabs defaultValue="vi" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList className="grid w-[200px] grid-cols-2">
              <TabsTrigger value="vi">VIE</TabsTrigger>
              <TabsTrigger value="en">ENG</TabsTrigger>
            </TabsList>
          </div>

          {/* Common Fields */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Lĩnh vực */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label>
                  Lĩnh vực <span className="text-red-500">*</span>
                </Label>
                <Dialog
                  open={isFieldModalOpen}
                  onOpenChange={setIsFieldModalOpen}
                >
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="h-auto p-0 text-blue-600 hover:text-blue-700 hover:bg-transparent text-xs flex items-center gap-1"
                    >
                      <Plus size={14} /> Thêm lĩnh vực
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Thêm lĩnh vực mới</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label>
                          Tên lĩnh vực (Tiếng Việt){" "}
                          <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          value={newFieldVn}
                          onChange={(e) => setNewFieldVn(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Tên lĩnh vực (Tiếng Anh)</Label>
                        <Input
                          value={newFieldEn}
                          onChange={(e) => setNewFieldEn(e.target.value)}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setIsFieldModalOpen(false)}
                      >
                        Hủy
                      </Button>
                      <Button
                        type="button"
                        onClick={handleCreateField}
                        disabled={isCreatingField}
                      >
                        {isCreatingField ? (
                          <Loader2 size={16} className="animate-spin mr-2" />
                        ) : null}
                        Thêm mới
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              <Select value={fieldOfWorkId} onValueChange={setFieldOfWorkId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn lĩnh vực" />
                </SelectTrigger>
                <SelectContent>
                  {fieldsOfWork.map((field) => (
                    <SelectItem key={field.id} value={String(field.id)}>
                      {field.name_vn}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Link ứng tuyển */}
            <div className="space-y-1">
              <Label>Link ứng tuyển</Label>
              <Input
                type="url"
                value={recruitmentUrl}
                onChange={(e) => setRecruitmentUrl(e.target.value)}
                placeholder="https://example.com/apply"

              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-4">
            {/* Sort order */}
            <div className="space-y-1">
              <Label>Thứ tự hiển thị</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                min={0}
              />
            </div>

            {/* Trạng thái */}
            <div className="space-y-1">
              <Label>Trạng thái</Label>
              <Select
                value={isActive ? "true" : "false"}
                onValueChange={(val) => setIsActive(val === "true")}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Đang mở</SelectItem>
                  <SelectItem value="false">Đã đóng</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Vietnamese Tab */}
          <TabsContent value="vi" className="space-y-6 mt-0">
            <div className="space-y-1">
              <Label>
                Tiêu đề công việc <span className="text-red-500">*</span>
              </Label>
              <Input
                type="text"
                value={title_vn}
                onChange={(e) => setTitleVn(e.target.value)}
                placeholder="VD: Lập trình viên Backend"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Loại công việc</Label>
                <Select value={job_type_vn} onValueChange={setJobTypeVn}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn loại hình" />
                  </SelectTrigger>
                  <SelectContent>
                    {JobTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Kinh nghiệm</Label>
                <Select value={experience_vn} onValueChange={setExperienceVn}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Chọn kinh nghiệm" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExperienceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Mô tả công việc</Label>
              <TiptapEditor
                content={description_vn}
                onChange={(html) => setDescriptionVn(html)}
                onReady={handleEditorReady}
              />
            </div>
          </TabsContent>

          {/* English Tab */}
          <TabsContent value="en" className="space-y-6 mt-0">
            <div className="space-y-1">
              <Label>Job Title (EN)</Label>
              <Input
                type="text"
                value={title_en}
                onChange={(e) => setTitleEn(e.target.value)}
                placeholder="e.g. Backend Developer"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <Label>Job Type (EN)</Label>
                <Select value={job_type_en} onValueChange={setJobTypeEn}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    {JobTypeOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label>Experience (EN)</Label>
                <Select value={experience_en} onValueChange={setExperienceEn}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent>
                    {ExperienceOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Job Description (EN)</Label>
              <TiptapEditor
                content={description_en}
                onChange={(html) => setDescriptionEn(html)}
                onReady={handleEditorReady}
              />
            </div>
          </TabsContent>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <CircleX size={20} />
            Hủy bỏ
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? (
              <Loader2 size={20} className="animate-spin" />
            ) : (
              <Save size={20} />
            )}
            {loading
              ? isCreateMode
                ? "Đang tạo..."
                : "Đang cập nhật..."
              : isCreateMode
                ? "Đăng tin"
                : "Cập nhật"}
          </Button>
        </div>
      </form>
    </div>
  );
}
