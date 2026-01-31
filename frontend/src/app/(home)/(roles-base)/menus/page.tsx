'use client';
import { useResource } from "@/apis/resource/hooks";
import { useDebouncedValue } from "@/common/hooks";
import { IPaginationRequest } from "@/common/interfaces";
import { ArrowDownWideNarrow, ChevronDown, ChevronUp, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function ListMenu() {
  const router = useRouter();
  const pathName = usePathname();
  const searchParams = useSearchParams();
  const [params, setParams] = useState<IPaginationRequest>({
    page: Number(searchParams.get("page")) || 1,
    limit: Number(searchParams.get("limit")) || 10,
    search: searchParams.get("search") || "",
    searchBy: "description",
    sortBy: "desc",
    orderBy: "created_at",
  });
  const [searchInput, setSearchInput] = useState(params.search || "");
  const debouncedSearch = useDebouncedValue(searchInput , 500);
  const {resourceData , isFetching , isLoading , createResource , deleteResource , updateResource , isCreating , isDeleting, isUpdating} = useResource(params);
  useEffect(() => {
      setParams((prev) => ({
        ...prev,
        search: debouncedSearch,
        page: 1,
      }));
    }, [debouncedSearch]);

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (params.page) newParams.set("page", params.page.toString());
    if (params.limit) newParams.set("limit", params.limit.toString());
    if (params.search) newParams.set("search", params.search);
    if (params.sortBy) newParams.set("sortBy", params.sortBy);
    if (params.orderBy) newParams.set("orderBy", params.orderBy);
    router.push(`${pathName}?${newParams.toString()}`, { scroll: false });
  }, [params, pathName, router]);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchInput(e.target.value);
  };
  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  const getSortIcon = (column: string) => {
    if (params.orderBy !== column) {
      return <ArrowDownWideNarrow size={14} />;
    }
    return params.sortBy === "asc" ? (
      <ChevronUp size={14} className="text-blue-600" />
    ) : (
      <ChevronDown size={14} className="text-blue-600" />
    );
  };


  return (
    <section>
      <div className="flex justify-between items-end mb-2">
        <div>
          <h1 className="text-xl font-bold text-gray-800">
            Danh sách tài nguyên
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
              placeholder="Tìm kiếm tên tài nguyên..."
              className="w-full border border-gray-200 rounded-md pl-9 pr-3 py-1.5 focus:ring-1 focus:ring-blue-500 outline-none transition bg-gray-50/50"
              value={searchInput}
              onChange={handleSearch}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table>
            <thead></thead>
            <tbody></tbody>
            <tfoot></tfoot>
          </table>
        </div>
      </div>
    </section>
  );
}