import { X, Loader2 } from "lucide-react";
import React, { useState } from "react";

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

  React.useEffect(() => {
    if (data)
      setFormData({ name: data.name, description: data.description || "" });
    else setFormData({ name: "", description: "" });
  }, [data, isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-2 ">
          <h2 className="font-bold text-gray-800">
            {data ? `Cập nhật quyền ${data.name}` : "Thêm quyền mới"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-full"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 space-y-4 text-sm">
          <div className="space-y-1">
            <label className="font-medium text-gray-700">
              Tên quyền <span className="text-red-500">*</span>
            </label>
            <input
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500"
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
              className="w-full border rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-blue-500 h-24"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Mô tả ngắn gọn về quyền này..."
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 p-4 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-1.5 hover:bg-gray-200 rounded-md transition text-gray-600"
          >
            Hủy
          </button>
          <button
            onClick={() => onSave(formData)}
            disabled={loading || !formData.name}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md transition disabled:opacity-50"
          >
            {loading && <Loader2 size={14} className="animate-spin" />}
            {data ? "Cập nhật" : "Lưu lại"}
          </button>
        </div>
      </div>
    </div>
  );
}