"use client";

import Link from "next/link";
import dayjs from "dayjs";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronsUpDown,
  LogOut,
  User as UserIcon,
  ChevronRight,
  EllipsisVertical
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { MENU_ITEMS } from "@/common/menus";
import { useAuth } from "@/features/auth/hooks";
import { useAuthStore } from "@/common/stores";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { useToast } from "@/common/providers/ToastProvider";
import { useIsMobile } from "@/common/hooks/useMobile";

const DEFAULT_AVATAR = "/favicon.ico";
export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();
  const { user: auth } = useAuthStore();
  const displayUser = auth?.user as any;
  const avatarUrl = DEFAULT_AVATAR;
  const { confirm } = useConfirm();
  const { showToast } = useToast();
  const isMobile = useIsMobile();
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    const isConfirm = await confirm({
      title: "Bạn có chắc chắn muốn đăng xuất ?",
      variant: "danger",
    });
    if (isConfirm) {
      logout.mutate(void 0, {
        onSuccess: (response) => {
          showToast(`${response.message}`, "success");
          router.push("/login");
        },
        onError: () => {
          showToast("Đăng xuất thất bại.", "error");
        },
      });
    }
  };
  return (
    <Sidebar collapsible="icon" className="rounded-r-lg overflow-hidden">
      {/* 1. HEADER: Thông tin User + Dropdown Menu */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarImage src={avatarUrl} alt={displayUser?.fullName || ""} />
                    <AvatarFallback className="rounded-lg">
                      {(displayUser?.fullName || "").charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-semibold">{displayUser?.fullName}</span>
                    <span className="truncate text-xs">{displayUser?.email}</span>
                  </div>
                  <EllipsisVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side={isMobile ? "bottom" : "right"}
                align="end"
                sideOffset={4}
              >
                <div className="px-2 py-2 text-sm">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-XS font-semibold text-muted-foreground">Tài khoản</span>
                      <span className="font-medium">{displayUser?.username || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-XS font-semibold text-muted-foreground">Họ tên</span>
                      <span className="font-medium">{displayUser?.fullName || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-XS font-semibold text-muted-foreground">Email</span>
                      <span className="font-medium break-all">{displayUser?.email || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-XS font-semibold text-muted-foreground">Số điện thoại</span>
                      <span className="font-medium">{displayUser?.phone || "—"}</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-XS font-semibold text-muted-foreground">Ngày sinh</span>
                      <span className="font-medium">
                        {displayUser?.dob ? dayjs(displayUser.dob).format("DD/MM/YYYY") : "—"}
                      </span>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Đăng xuất</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* 2. BODY: Render Menu Items */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            {MENU_ITEMS.map((item) => {
              if (item.children && item.children.length > 0) {
                const isActive = item.children.some(
                  (child) => child.href && pathname.startsWith(child.href)
                );

                return (
                  <Collapsible
                    key={item.label}
                    asChild
                    defaultOpen={isActive}
                    className="group/collapsible"
                  >
                    <SidebarMenuItem>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton tooltip={item.label} isActive={isActive} className="data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:font-medium hover:bg-white/10 hover:text-white transition-all duration-200">
                          {item.icon && <item.icon />}
                          <span>{item.label}</span>
                          <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.children.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.label}>
                              <SidebarMenuSubButton asChild isActive={!!subItem.href && pathname.startsWith(subItem.href)} className="data-[active=true]:bg-orange-500/20 data-[active=true]:text-orange-400 data-[active=true]:font-medium rounded-md hover:bg-white/10 hover:text-white transition-all duration-200">
                                <Link href={subItem.href || "#"}>
                                  {subItem.icon && <subItem.icon />}
                                  <span>{subItem.label}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </SidebarMenuItem>
                  </Collapsible>
                );
              }
              return (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton asChild tooltip={item.label} isActive={pathname === item.href} className="data-[active=true]:bg-orange-500 data-[active=true]:text-white data-[active=true]:font-medium hover:bg-white/10 hover:text-white transition-all duration-200">
                    <Link href={item.href || "#"}>
                      {item.icon && <item.icon />}
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}