"use client";

import { CircleX, Loader2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import {DraggableModal} from "@/common/components/ui/Modal";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function RoleModal({
  isOpen,
  onClose,
  onSave,
  data,
  loading,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSave: (formData: any) => void;
  data?: any;
  loading: boolean;
}) {
  const [formData, setFormData] = useState({ name: "", description: "" });

  useEffect(() => {
    if (isOpen) {
      if (data)
        setFormData({
          name: data.name,
          description: data.description || "",
        });
      else setFormData({ name: "", description: "" });
    }
  }, [data, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    onSave(formData);
  };

  return (
    <DraggableModal
      open={isOpen}
      onClose={onClose}
      title={data ? `Cập nhật quyền ${data.name}` : "Thêm quyền mới"}
      width="max-w-2xl w-full"
      footer={
        <>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
          >
            <CircleX size={16}/>
            Hủy
          </Button>
          <Button
            form="role-form"
            type="submit"
            disabled={loading || !formData.name.trim()}
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {!loading && <Save size={16}/>}
            {data ? "Cập nhật" : "Lưu lại"}
          </Button>
        </>
      }
    >
      <form
        id="role-form"
        onSubmit={handleSubmit}
        className="space-y-4 text-sm"
      >
        <div className="space-y-1">
          <Label>
            Tên quyền <span className="text-red-500">*</span>
          </Label>
          <Input
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ví dụ: Quản trị viên"
            aria-invalid={!formData.name.trim() ? true : undefined}
          />
        </div>

        <div className="space-y-1">
          <Label>Mô tả</Label>
          <Textarea
            className="h-24"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Mô tả ngắn gọn về quyền này..."
          />
        </div>
      </form>
    </DraggableModal>
  );
}
