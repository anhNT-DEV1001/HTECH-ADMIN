"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, Briefcase, Newspaper, Users, ArrowRight } from "lucide-react";
import { FeaturedProject, FeaturedNews, OpenJob } from "../interfaces";

interface StatCardProps {
  title: string;
  count: number;
  icon: "briefcase" | "newspaper" | "users";
  items: FeaturedProject[] | FeaturedNews[] | OpenJob[];
  itemType: "project" | "news" | "job";
}

const iconMap = {
  briefcase: Briefcase,
  newspaper: Newspaper,
  users: Users,
};

export default function StatCard({
  title,
  count,
  icon,
  items,
  itemType,
}: StatCardProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const IconComponent = iconMap[icon];

  const getItemTitle = (item: any) => {
    if (itemType === "project" || itemType === "news") {
      return item.title_vn;
    }
    return item.title_vn;
  };

  const getItemSubtitle = (item: any) => {
    if (itemType === "project") {
      return item.client_name || "-";
    }
    if (itemType === "news") {
      return item.category?.name_vn || "-";
    }
    return item.field_of_work?.name_vn || "-";
  };

  const getItemUrl = (item: any): string => {
    const slug = item.id;
    if (itemType === "project") {
      return `/htech-projects/${slug}`;
    }
    if (itemType === "news") {
      return `/htech-news/${slug}`;
    }
    if (itemType === "job") {
      return `/htech-careers/${slug}`;
    }
    return "/";
  };

  const getListPageUrl = (): string => {
    if (itemType === "project") {
      return `/htech-projects`;
    }
    if (itemType === "news") {
      return `/htech-news`;
    }
    if (itemType === "job") {
      return `/htech-careers`;
    }
    return "/";
  };

  const handleItemClick = (item: any) => {
    const url = getItemUrl(item);
    router.push(url);
  };

  const handleTitleClick = () => {
    const url = getListPageUrl();
    router.push(url);
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader>
          <CollapsibleTrigger asChild>
            <div className="flex items-center justify-between cursor-pointer">
              <div className="flex items-center gap-4 flex-1">
                <div className="p-3 bg-blue-100 rounded-lg">
                  <IconComponent className="w-6 h-6 text-blue-600" />
                </div>
                <div onClick={handleTitleClick} className="flex-1 hover:opacity-70 transition-opacity">
                  <CardTitle className="text-lg hover:text-blue-600 transition-colors cursor-pointer">
                    {title}
                  </CardTitle>
                  <p className="text-3xl font-bold text-blue-600 mt-1">
                    {count}
                  </p>
                </div>
              </div>
              <ChevronDown
                className={`w-5 h-5 transition-transform duration-300 ${
                  isOpen ? "rotate-180" : ""
                }`}
              />
            </div>
          </CollapsibleTrigger>
        </CardHeader>

        <div className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <CollapsibleContent>
            <CardContent>
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {items.length > 0 ? (
                items.map((item: any) => (
                  <div
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className="p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 cursor-pointer hover:border-blue-400 hover:shadow-md group"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                          {getItemTitle(item)}
                        </h4>
                        <p className="text-sm text-slate-600 mt-1">
                          {getItemSubtitle(item)}
                        </p>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors ml-2 flex-shrink-0 mt-1" />
                    </div>
                    {itemType === "project" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                          {(item as FeaturedProject).industry_vn || "N/A"}
                        </span>
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                          {(item as FeaturedProject).status}
                        </span>
                      </div>
                    )}
                    {itemType === "news" && (
                      <p className="text-xs text-slate-500 mt-2">
                        {(item as FeaturedNews).created_at &&
                          new Date(
                            (item as FeaturedNews).created_at
                          ).toLocaleDateString("vi-VN")}
                      </p>
                    )}
                    {itemType === "job" && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                          {(item as OpenJob).job_type_vn || "N/A"}
                        </span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-center text-slate-500 py-6">
                  Không có dữ liệu
                </p>
              )}
            </div>
          </CardContent>
          </CollapsibleContent>
        </div>
      </Collapsible>
    </Card>
  );
}
