"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

import { MENU_ITEMS } from "@/common/menus";
import { useRouter } from 'next/navigation';

export function AppHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const getBreadcrumbs = () => {
    for (const item of MENU_ITEMS) {
      if (item.href === pathname) {
        return [{ label: item.label, href: item.href }];
      }
      if (item.children) {
        for (const child of item.children) {
          if (child.href === pathname) {
            return [
              { label: item.label, href: item.href },
              { label: child.label, href: child.href },
            ];
          }
        }
      }
    }
    return [{ label: "Trang chủ", href: "/" }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background rounded-tr-lg">
      {/* Nút trigger đóng/mở sidebar */}
      <SidebarTrigger className="-ml-1" />

      {/* Đường kẻ dọc ngăn cách */}
      <div className="mr-2 h-4 w-px bg-border" />

      {/* Breadcrumb động */}
      <Breadcrumb>
        <BreadcrumbList>
          {breadcrumbs.map((bc, index) => {
            const isLast = index === breadcrumbs.length - 1;

            return (
              <React.Fragment key={bc.label}>
                <BreadcrumbItem className="hidden sm:block">
                  {!isLast ? (
                    bc.href ? (
                      <BreadcrumbLink asChild>
                        <Link href={bc.href}>{bc.label}</Link>
                      </BreadcrumbLink>
                    ) : (
                      <span className="text-muted-foreground transition-colors hover:text-foreground">
                        {bc.label}
                      </span>
                    )
                  ) : (
                    <BreadcrumbPage>{bc.label}</BreadcrumbPage>
                  )}
                </BreadcrumbItem>
                {!isLast && <BreadcrumbSeparator className="hidden sm:block" />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>

      <div className="ml-auto flex items-center cursor-pointer">
        <Link href="/" className="transition-opacity hover:opacity-80">
          <Image 
            src="/logo.png" 
            alt="App Logo" 
            width={120} 
            height={40} 
            className="object-contain"
            style={{ width: "auto", height: "auto" }}
            priority 
          />
        </Link>
      </div>
    </header>
  );
}