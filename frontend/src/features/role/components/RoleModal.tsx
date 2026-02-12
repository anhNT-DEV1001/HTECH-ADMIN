"use client";

import { CircleX, Loader2, Save } from "lucide-react";
import React, { useState, useEffect } from "react";
import Modal from "@/common/components/ui/Modal";

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
    <Modal
      open={isOpen}
      onClose={onClose}
      title={data ? `Cập nhật quyền ${data.name}` : "Thêm quyền mới"}
      width="max-w-md"
      footer={
        <>
          <button
            onClick={onClose}
            className="btn btn-default btn-md"
            disabled={loading}
          >
            <CircleX size={16}/>
            Hủy
          </button>
          <button
            form="role-form"
            type="submit"
            disabled={loading || !formData.name.trim()}
            className="btn btn-primary btn-md flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading && <Loader2 size={16} className="animate-spin" />}
            {!loading && <Save size={16}/>}
            {data ? "Cập nhật" : "Lưu lại"}
          </button>
        </>
      }
    >
      <form
        id="role-form"
        onSubmit={handleSubmit}
        className="space-y-4 text-sm"
      >
        <div className="space-y-1">
          <label className="font-medium text-gray-700">
            Tên quyền <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full border rounded-md px-3 py-2 outline-none focus:ring-2 transition-all ${
              !formData.name.trim()
                ? "focus:ring-red-200 border-gray-300"
                : "focus:ring-blue-100 border-gray-300"
            }`}
            value={formData.name}
            onChange={(e) =>
              setFormData({ ...formData, name: e.target.value })
            }
            placeholder="Ví dụ: Quản trị viên"
          />
        </div>

        <div className="space-y-1">
          <label className="font-medium text-gray-700">Mô tả</label>
          <textarea
            className="w-full border rounded-md px-3 py-2 outline-none focus:ring-2 focus:ring-blue-100 h-24 transition-all"
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Mô tả ngắn gọn về quyền này..."
          />
        </div>
      </form>
    </Modal>
  );
}
