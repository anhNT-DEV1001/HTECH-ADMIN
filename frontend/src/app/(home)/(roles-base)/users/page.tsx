'use client';
import { Plus, Search } from "lucide-react";

export default function UserManagement() {
  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Quản lý người dùng
          </h1>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-t-sm mb-2">
        <div className="flex items-center gap-3 flex-1 max-w-md">
            <div className="relative flex-1">
              <Search
                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên"
                className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition bg-gray-50/50"
                // value={searchInput}
                // onChange={handleSearch}
              />
            </div>
  
            {/* {isFetching && (
              <RoleLoading/>
            )} */}
          </div>
        <button
          // onClick={handleAddNew}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md transition shrink-0"
        >
          <Plus size={16} />
          <span className="whitespace-nowrap">Thêm mới</span>
        </button>
      </div>
    </section>
  );
}