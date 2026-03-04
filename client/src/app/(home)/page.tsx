"use client";
import { useHtechStat } from "@/features/statistics/hooks";
import StatCard from "@/features/statistics/components/StatCard";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const { htechStatData, isLoading } = useHtechStat();

  const featuredProjects = htechStatData?.data?.featuredProjects || [];
  const featuredNews = htechStatData?.data?.featuredNews || [];
  const openJobs = htechStatData?.data?.openJobs || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="animate-spin w-8 h-8" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl ">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-slate-900 mb-2">Trang chủ</h1>
        <p className="text-slate-600">Tổng quan và truy cập nhanh</p>
      </div>

      {/* Stats Grid */}
      {/* Thêm class items-start ở đây */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 items-start">
        <StatCard
          title="Dự Án Nổi Bật"
          count={featuredProjects.length}
          icon="briefcase"
          items={featuredProjects}
          itemType="project"
        />
        <StatCard
          title="Tin Tức Nổi Bật"
          count={featuredNews.length}
          icon="newspaper"
          items={featuredNews}
          itemType="news"
        />
        <StatCard
          title="Công Việc Đang Mở"
          count={openJobs.length}
          icon="users"
          items={openJobs}
          itemType="job"
        />
      </div>
    </div>
  );
}
