import { Loader2 } from "lucide-react";

export default function UserLoading() {
  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
      <div className="bg-transparent p-6 rounded-xl  flex flex-col items-center gap-3">
        <Loader2
          size={40}
          className="animate-spin text-blue-500 shrink-0"
        />
        <p className="text-sm font-medium text-white">Đang tải dữ liệu...</p>
      </div>
    </div>
  )
}