"use client";
import { useHtechStat } from "@/features/statistics/hooks";
import StatCard from "@/features/statistics/components/StatCard";
import { Loader2, ShieldCheck, Users, ListTree, Settings, Newspaper, ProjectorIcon, UserCheck } from "lucide-react";
import Link from "next/link";

const QUICK_ACCESS_ITEMS = [
  { label: "Nhóm quyền", icon: ShieldCheck, href: "/roles", color: "bg-violet-50 text-violet-600 border-violet-100" },
  { label: "Người dùng", icon: Users, href: "/users", color: "bg-blue-50 text-blue-600 border-blue-100" },
  { label: "Tài nguyên", icon: ListTree, href: "/resources", color: "bg-emerald-50 text-emerald-600 border-emerald-100" },
  { label: "Cấu hình chung", icon: Settings, href: "/masterdata", color: "bg-amber-50 text-amber-600 border-amber-100" },
  { label: "Tin tức", icon: Newspaper, href: "/htech-news", color: "bg-sky-50 text-sky-600 border-sky-100" },
  { label: "Dự án", icon: ProjectorIcon, href: "/htech-projects", color: "bg-indigo-50 text-indigo-600 border-indigo-100" },
  { label: "Tuyển dụng", icon: UserCheck, href: "/htech-careers", color: "bg-rose-50 text-rose-600 border-rose-100" },
];

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
    <div className="max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900 mb-1">Trang chủ</h1>
        <p className="text-slate-500 text-sm">Tổng quan và truy cập nhanh</p>
      </div>

      {/* Section: HTECH */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 rounded-full bg-blue-500 inline-block" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">HTECH</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
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

      {/* Section: Quản lý hệ thống */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <span className="w-1 h-4 rounded-full bg-slate-400 inline-block" />
          <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Quản lý hệ thống</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {QUICK_ACCESS_ITEMS.map(({ label, icon: Icon, href, color }) => (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all duration-150 hover:shadow-md hover:-translate-y-0.5 cursor-pointer ${color}`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs font-medium text-center leading-tight">{label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}