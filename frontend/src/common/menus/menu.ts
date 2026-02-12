import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  label: string;
  icon?: LucideIcon;
  href?: string;
  children?: MenuItem[];
}

import { LayoutDashboard, Settings, ShieldCheck, Users, ListTree } from 'lucide-react';

export const MENU_ITEMS: MenuItem[] = [
  { label: "Trang chủ", icon: LayoutDashboard, href: "/" },
  {
    label: "Quản lý hệ thống",
    icon: Settings,
    children: [
      { label: "Nhóm quyền", icon: ShieldCheck, href: "/roles" },
      { label: "Người dùng", icon: Users, href: "/users" },
      {
        label: "Danh sách tài nguyên",
        icon: ListTree,
        href: "/menus",
      },
    ],
  },
];