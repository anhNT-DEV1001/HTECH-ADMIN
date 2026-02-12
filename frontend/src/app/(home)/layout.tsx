"use client";
import { useAuth } from "@/features/auth/hooks";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { useToast } from "@/common/providers/ToastProvider";
import { useAuthStore } from "@/common/stores";
import {
  Bell,
  ChevronDown,
  ChevronRight,
  Image,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings,
  Users,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import React, { useState } from "react";

export default function HomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [openSubMenus, setOpenSubMenus] = useState<string[]>([]);
  const { confirm } = useConfirm();
  // Hàm toggle menu con
  const toggleSubMenu = (label: string) => {
    setOpenSubMenus((prev) =>
      prev.includes(label) ? prev.filter((i) => i !== label) : [...prev, label],
    );
  };
  const navigate = useRouter();
  const pathname = usePathname();
  const { logout } = useAuth();
  const { user } = useAuthStore();
  const { showToast } = useToast();
  const userName = user?.user?.fullName || user?.user?.username || "Người dùng";
  const userInitial = user?.user?.fullName?.charAt(0).toUpperCase() || "A";

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
        onError: (error: any) => {
          showToast("Đăng xuất thất bại. Vui lòng thử lại.", "error");
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <aside
        className={`${isSidebarOpen ? "w-64" : "w-20"
          } bg-slate-100  transition-all duration-300 flex flex-col fixed h-full z-50`}
      >
        <div className="p-4 flex items-center justify-between h-16">
          <span
            className={`font-bold text-xl text-gray-600 ${!isSidebarOpen && "hidden"
              }`}
          >
            <img src="logo.svg" alt="Htech-logo" className="w-auto h-15"
            />
          </span>
          <button
            onClick={() => setSidebarOpen(!isSidebarOpen)}
            className="p-1 hover:bg-slate-100 rounded"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="bg-blue-900 flex-1 overflow-y-auto p-3 space-y-1 font-sm">
          {MENU_ITEMS.map((item) => (
            <div key={item.label}>
              {item.children ? (
                // Menu có con
                <div>
                  <button
                    onClick={() => toggleSubMenu(item.label)}
                    className={`w-full flex items-center justify-between cursor-pointer p-3 rounded-lg transition-colors ${item.children?.some(child => pathname === child.href)
                      ? " text-orange-300"
                      : "text-white hover:text-orange-300"
                      }`}
                  >
                    <div className="flex items-center gap-3">
                      {item.icon}
                      <span className={`${!isSidebarOpen && "hidden"}`}>
                        {item.label}
                      </span>
                    </div>
                    {isSidebarOpen &&
                      (openSubMenus.includes(item.label) ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      ))}
                  </button>

                  {/* Submenu Item */}
                  {isSidebarOpen && openSubMenus.includes(item.label) && (
                    <div className="ml-9 mt-1 space-y-1">
                      {item.children.map((child) => (
                        <Link
                          key={child.label}
                          href={child.href}
                          className={`block p-2 text-sm rounded-md transition-colors ${pathname === child.href
                            ? "text-orange-300 font-medium "
                            : "text-white hover:text-orange-300"
                            }`}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                // Menu đơn
                <Link
                  href={item.href || "#"}
                  className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${pathname === item.href
                    ? "text-orange-300 font-medium "
                    : "text-white hover:text-orange-300"
                    }`}
                >
                  {item.icon}
                  <span className={`${!isSidebarOpen && "hidden"}`}>
                    {item.label}
                  </span>
                </Link>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarOpen ? "ml-64" : "ml-20"
          }`}
      >
        {/* HEADER */}
        <header className="h-16 bg-blue-900 sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="text-sm text-white font-medium">
            Chào mừng trở lại, {userName}!
          </div>

          <div className="flex items-center gap-4">
            {/* <button className="relative p-2 text-gray-400 hover:text-blue-600">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button> */}
            {/* <div className="h-8 bg-slate-200 mx-2"></div> */}
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {userInitial}
              </div>
              <span className="text-sm font-semibold text-white group-hover:text-orange-300">
                {userName}
              </span>
            </div>
            <button
              className="flex items-center gap-2 text-sm font-medium text-white hover:text-red-500 transition-colors"
              onClick={handleLogout}
            >
              <LogOut size={16} />
              <span>Đăng xuất</span>
            </button>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 pt-6 pl-6 pr-6 ">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 min-h-[calc(100vh-12rem)] pt-6 pl-6 pr-6">
            {children}
          </div>
        </main>

        {/* FOOTER */}
        <footer className="p-4 bg-white border-t border-slate-200 text-center text-sm text-gray-500">
          © 2026 HTECH System. Bảo lưu mọi quyền.
        </footer>
      </div>
    </div>
  );
}

const MENU_ITEMS = [
  { label: "Trang chủ", icon: <LayoutDashboard size={20} />, href: "/" },
  {
    label: "Quản lý hệ thống",
    icon: <Settings size={20} />,
    // href: "/menus",
    children: [
      { label: "Nhóm quyền", href: "/roles" },
      { label: "Người dùng", href: "/users" },
      {
        label: "Danh sách tài nguyên",
        icon: <Settings size={16} />,
        href: "/menus",
      },
    ],
  },
];
