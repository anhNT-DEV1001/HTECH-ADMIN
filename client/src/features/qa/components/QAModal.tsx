"use client";

import { DraggableModal } from "@/common/components/ui/Modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CircleX, Loader2, Save } from "lucide-react";
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import type { ICreateQA, IQA, IQACategory } from "../interfaces";

interface QAModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: ICreateQA) => void;
  data?: IQA;
  category?: IQACategory;
  loading: boolean;
}

export default function QAModal({ isOpen, onClose, onSave, data, category, loading }: QAModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ICreateQA>({
    defaultValues: {
      category_id: category?.id || 0,
      question_vn: "",
      question_en: "",
      ans_vn: "",
      ans_en: "",
    },
  });

  useEffect(() => {
    if (!isOpen) return;

    reset({
      category_id: category?.id || data?.category_id || 0,
      question_vn: data?.question_vn || "",
      question_en: data?.question_en || "",
      ans_vn: data?.ans_vn || "",
      ans_en: data?.ans_en || "",
    });
  }, [category, data, isOpen, reset]);

  const onSubmit: SubmitHandler<ICreateQA> = (formData) => {
    onSave({
      category_id: category?.id || formData.category_id,
      question_vn: formData.question_vn.trim(),
      question_en: formData.question_en?.trim() || "",
      ans_vn: formData.ans_vn?.trim() || "",
      ans_en: formData.ans_en?.trim() || "",
    });
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? "Chỉnh sửa QA" : "Thêm QA"}
      width="max-w-2xl w-full"
      footer={
        <>
          <Button type="button" variant="outline" onClick={onClose}>
            <CircleX size={16} />
            Hủy
          </Button>
          <Button type="submit" form="qa-form" disabled={loading || !category}>
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {data ? "Cập nhật" : "Lưu mới"}
          </Button>
        </>
      }
    >
      <form id="qa-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="rounded-lg border bg-slate-50 px-4 py-3 text-sm text-slate-700">
          {category ? (
            <>
              <div className="font-medium">{category.name_vn}</div>
              <div className="text-xs text-slate-500">{category.web?.name || "Chưa có website"}</div>
            </>
          ) : (
            <div>Vui lòng chọn category trước khi thêm QA.</div>
          )}
        </div>

        <div className="space-y-1">
          <Label>
            Câu hỏi VN<span className="text-red-500">*</span>
          </Label>
          <Textarea
            rows={3}
            {...register("question_vn", { required: "Vui lòng nhập câu hỏi VN" })}
            placeholder="Vui lòng nhập câu hỏi VN"
          />
          {errors.question_vn && <p className="text-xs text-red-500">{errors.question_vn.message}</p>}
        </div>

        <div className="space-y-1">
          <Label>Câu hỏi EN</Label>
          <Input {...register("question_en")} placeholder="Vui lòng nhập câu hỏi EN" />
        </div>

        <div className="space-y-1">
          <Label>Trả lời VN</Label>
          <Textarea rows={5} {...register("ans_vn")} placeholder="Vui lòng nhập câu trả lời VN" />
        </div>

        <div className="space-y-1">
          <Label>Trả lời EN</Label>
          <Textarea rows={5} {...register("ans_en")} placeholder="Vui lòng nhập câu trả lời EN" />
        </div>
      </form>
    </DraggableModal>
  );
}
