"use client";
import { useState } from "react";
import { Trash2Icon } from "lucide-react";
import Modal from "@/common/components/ui/Modal";

export default function HtechNew() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <h1>Htech Quản lý tin tức</h1>
      <button className="btn btn-outline btn-sm" onClick={() => setOpen(true)}>
        Mở Modal
      </button>

      <Modal
        open={open}
        title="Xác nhận hành động"
        onClose={() => setOpen(false)}
        footer={
          <>
            <button
              className="btn btn-default btn-sm"
              onClick={() => setOpen(false)}
            >
              Hủy
            </button>
            <button className="btn btn-danger btn-sm flex items-center gap-1">
              <Trash2Icon size={16} />
              Xóa
            </button> 
          </>
        }
      >
        <p>Bạn có chắc chắn muốn thực hiện hành động này không?</p>
      </Modal>
    </div>
  );
}
