"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { MENU_ITEMS, MenuItem } from "@/common/menus";
import { Search, ArrowUp, ArrowDown, CornerDownLeft, X } from "lucide-react";

// Flatten menu items thành danh sách phẳng để search
interface FlatMenuItem {
  label: string;
  href: string;
  icon?: MenuItem["icon"];
  parent?: string;
}

function flattenMenuItems(items: MenuItem[]): FlatMenuItem[] {
  const result: FlatMenuItem[] = [];
  for (const item of items) {
    if (item.href) {
      result.push({ label: item.label, href: item.href, icon: item.icon });
    }
    if (item.children) {
      for (const child of item.children) {
        if (child.href) {
          result.push({
            label: child.label,
            href: child.href,
            icon: child.icon,
            parent: item.label,
          });
        }
      }
    }
  }
  return result;
}

const ALL_MENU_ITEMS = flattenMenuItems(MENU_ITEMS);

function SearchModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  const filtered = query.trim()
    ? ALL_MENU_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.parent?.toLowerCase().includes(query.toLowerCase())
      )
    : ALL_MENU_ITEMS;

  // Reset khi mở modal
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Reset active index khi filter thay đổi
  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  // Scroll active item vào view
  useEffect(() => {
    const el = listRef.current?.children[activeIndex] as HTMLElement;
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  const handleNavigate = useCallback(
    (href: string) => {
      router.push(href);
      onClose();
    },
    [router, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[activeIndex]) handleNavigate(filtered[activeIndex].href);
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh]"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-2xl mx-4 bg-background rounded-xl shadow-2xl border overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b">
          <Search className="w-4 h-4 text-muted-foreground shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tìm kiếm menu..."
            className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded border border-border text-[10px] font-mono text-muted-foreground bg-muted">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <ul
          ref={listRef}
          className="max-h-96 overflow-y-auto py-3"
        >
          {filtered.length === 0 ? (
            <li className="px-5 py-12 text-center text-base text-muted-foreground">
              Không tìm thấy kết quả cho &ldquo;{query}&rdquo;
            </li>
          ) : (
            filtered.map((item, index) => {
              const Icon = item.icon;
              const isActive = index === activeIndex;
              return (
                <li key={item.href}>
                  <button
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => handleNavigate(item.href)}
                    className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors ${
                      isActive
                        ? "bg-accent text-accent-foreground"
                        : "hover:bg-accent/50"
                    }`}
                  >
                    {Icon && (
                      <span
                        className={`shrink-0 ${isActive ? "text-foreground" : "text-muted-foreground"}`}
                      >
                        <Icon className="w-4 h-4" />
                      </span>
                    )}
                    <div className="flex-1 min-w-0">
                      <span className="text-base font-medium truncate block">
                        {item.label}
                      </span>
                      {item.parent && (
                        <span className="text-sm text-muted-foreground truncate block">
                          {item.parent}
                        </span>
                      )}
                    </div>
                    {isActive && (
                      <CornerDownLeft className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                    )}
                  </button>
                </li>
              );
            })
          )}
        </ul>

        {/* Footer helper */}
        <div className="flex items-center gap-4 px-5 py-3.5 border-t bg-muted/30 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <ArrowUp className="w-3 h-3" />
            <ArrowDown className="w-3 h-3" />
            Di chuyển
          </span>
          <span className="flex items-center gap-1">
            <CornerDownLeft className="w-3 h-3" />
            Mở trang
          </span>
          <span className="flex items-center gap-1">
            <kbd className="px-1 py-0.5 rounded border border-border font-mono bg-background text-[10px]">
              ESC
            </kbd>
            Đóng
          </span>
        </div>
      </div>
    </div>
  );
}

export function AppHeader() {
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // Ctrl+K shortcut
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 bg-background rounded-tr-lg">
        <SidebarTrigger className="-ml-1" />
        <div className="mr-2 h-4 w-px bg-border" />

        {/* Breadcrumb */}
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
                  {!isLast && (
                    <BreadcrumbSeparator className="hidden sm:block" />
                  )}
                </React.Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>

        {/* Search trigger — căn giữa */}
        <div className="flex-1 flex justify-center px-4">
          <button
            onClick={() => setSearchOpen(true)}
            className="flex items-center gap-2 w-full max-w-sm h-10 px-4 rounded-md border border-input bg-muted/50 text-base text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <Search className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Tìm kiếm menu...</span>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border text-[10px] font-mono bg-background">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Logo */}
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

      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}