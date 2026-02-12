"use client";
import { useAuth } from "@/features/auth/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { useToast } from "@/common/providers/ToastProvider";
import { useAuthStore } from "@/common/stores";
import {
  ChevronDown,
  ChevronRight,
  LogOut,
  Menu,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import { MENU_ITEMS } from "@/common/menus";

const SidebarNavItem = ({
  item,
  isSidebarOpen,
  pathname,
}: {
  item: any;
  isSidebarOpen: boolean;
  pathname: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = item.children && item.children.length > 0;

  // Kiểm tra nếu pathname khớp hoặc nằm trong nhánh con
  const isChildActive = item.children?.some((child: any) =>
    pathname.startsWith(child.href)
  );

  // Kiểm tra chính menu hiện tại
  const isActive =
    pathname === item.href ||
    (item.href !== "/" && pathname.startsWith(item.href)) ||
    isChildActive;

  useEffect(() => {
    if (isChildActive && isSidebarOpen) setIsOpen(true);
  }, [isChildActive, isSidebarOpen]);

  const content = (
    <div className="flex items-center gap-3">
      {item.icon && <item.icon size={20} />}
      <span className={`${!isSidebarOpen && "hidden"} whitespace-nowrap`}>
        {item.label}
      </span>
    </div>
  );

  return (
    <div className="w-full">
      {hasChildren ? (
        <>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
              isActive
                ? "text-orange-300 font-semibold"
                : "text-white hover:text-orange-300"
            }`}
          >
            {content}
            {isSidebarOpen &&
              (isOpen ? (
                <ChevronDown size={16} />
              ) : (
                <ChevronRight size={16} />
              ))}
          </button>

          {isOpen && isSidebarOpen && (
            <div className="ml-6 mt-1 space-y-1">
              {item.children.map((child: any) => (
                <SidebarNavItem
                  key={child.label}
                  item={child}
                  isSidebarOpen={isSidebarOpen}
                  pathname={pathname}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <Link
          href={item.href || "#"}
          className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
            isActive
              ? "text-orange-300 font-semibold"
              : "text-white hover:text-orange-300"
          }`}
        >
          {content}
        </Link>
      )}
    </div>
  );
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const { confirm } = useConfirm();
  const navigate = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const { showToast } = useToast();

  const userName = user?.user?.fullName || user?.user?.username || "Người dùng";
  const userInitial = userName.charAt(0).toUpperCase();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isConfirm = await confirm({
      title: "Bạn có chắc chắn muốn đăng xuất ?",
      variant: "info",
    });
    if (isConfirm) {
      logout.mutate(void 0, {
        onSuccess: (response) => {
          showToast(`${response.message}`, "success");
          navigate.push("/login");
        },
        onError: () => {
          showToast("Đăng xuất thất bại.", "error");
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"} bg-blue-900 transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-4 flex items-center justify-between align-middle h-16 bg-slate-100">
          <span className={`${!isSidebarOpen && "hidden"}`}>
            <img src="/logo.svg" alt="Htech-logo" className="w-auto h-10" />
          </span>
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-200 rounded text-gray-600">
            <Menu size={20} />
          </button>
        </div>  

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {MENU_ITEMS.map((item) => (
            <SidebarNavItem 
              key={item.label} 
              item={item} 
              isSidebarOpen={isSidebarOpen} 
              pathname={pathname} 
            />
          ))}
        </nav>
      </aside>

      <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"}`}>
        <header className="h-16 bg-white sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="text-sm  font-medium">Chào mừng trở lại, {userName}!</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {userInitial}
              </div>
              <span className="text-sm font-semibold  group-hover:text-orange-300">{userName}</span>
            </div>
            <button className="flex items-center gap-2 text-sm font-medium  hover:text-red-500 transition-colors" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        <main className="flex-1 p-6 bg-slate-200">
          <div className="bg-slate-100 rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-10rem)] p-6">
            {children}
          </div>
        </main>

        <footer className="p-4 bg-white border-t border-slate-200 text-center text-sm text-gray-500">
          © 2026 HTECH System. Bảo lưu mọi quyền.
        </footer>
      </div>
    </div>
  );
}