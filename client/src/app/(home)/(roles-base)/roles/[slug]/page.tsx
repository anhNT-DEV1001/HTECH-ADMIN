'use client';
import React, { useEffect, useState } from "react";
import { usePermission } from "@/features/permission/hooks/usePermission";
import { useRoleDetail } from "@/features/role/hooks/useRole";
import { Loader2, Save, ArrowLeft, Check } from "lucide-react";
import { useRouter } from "next/navigation";
import { IPermission } from "@/features/permission/interfaces";
import { useConfirm } from "@/common/providers/ConfirmProvider";
import { IRole } from "@/features/role/interfaces";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function RoleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const roleId = Number(slug);
  
  const { roleData, isLoading: isLoadingRole } = useRoleDetail(roleId);
  const role = roleData?.data;
  const {confirm} = useConfirm();
  const {
    permissionData,
    isLoading,
    savePermissionMutation,
    isSaving
  } = usePermission(roleId, undefined);

  const permissions = permissionData?.data || [];

  const [selectedActionIds, setSelectedActionIds] = useState<number[]>([]);

  useEffect(() => {
    if (permissions.length > 0) {
      const activeIds: number[] = [];
      permissions.forEach((p: IPermission) => {
        if (p.actions) {
          p.actions.forEach((a) => {
            if (a.is_active && a.id) {
              activeIds.push(a.id);
            }
          });
        }
      });
      setSelectedActionIds(activeIds);
    }
  }, [permissions]);

  const handleToggleAction = (actionId: number) => {
    setSelectedActionIds((prev) => {
      if (prev.includes(actionId)) {
        return prev.filter((id) => id !== actionId);
      } else {
        return [...prev, actionId];
      }
    });
  };

  const handleSave = async (roleData : IRole) => {
    const isConfirm = await confirm({
      title : `Xác nhận cập nhật nhóm quyền ${roleData.name}!`,
      message: `Thao tác sẽ áp dụng cho tất cả người dùng có vai trò ${roleData.name}`,
      variant : 'info'
    })
    if(isConfirm){
      savePermissionMutation.mutate(selectedActionIds);
    }
  };

  const handleBack = () => {
    router.back();
  };

  return (
    <div>
      {/* HEADER SECTION */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-3">
            <Button 
                variant="ghost"
                size="icon"
                onClick={handleBack}
                className="text-muted-foreground"
            >
                <ArrowLeft size={20} />
            </Button>
            <div>
                <h1 className="text-xl font-bold text-gray-800">
                    Phân quyền vai trò: {role?.name || '...'}
                </h1>
                <p className="text-sm text-muted-foreground">
                    {role?.description || 'Quản lý quyền hạn truy cập tài nguyên cho vai trò này'}
                </p>
            </div>
        </div>

        <Button
          onClick={() => handleSave(role as IRole)}
          disabled={isSaving}
        >
          {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
          <span>Lưu thay đổi</span>
        </Button>
      </div>

      {/* CONTENT SECTION */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-2">
        {isLoading ? (
            <div className="flex justify-center items-center p-12 text-muted-foreground">
                <Loader2 size={32} className="animate-spin mb-2" />
                <span className="ml-2">Đang tải dữ liệu quyền...</span>
            </div>
        ) : permissions.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground font-light italic">
                Không có dữ liệu phân quyền nào.
            </div>
        ) : (
            <Table>
              <TableHeader className="bg-gray-50/80">
                <TableRow>
                  <TableHead className="text-center">
                    Tài nguyên
                  </TableHead>
                  <TableHead className="text-center">
                    Thao tác
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="divide-y divide-gray-100">
                {permissions.map((permission, index) => (
                  <TableRow key={permission.id || index} className="hover:bg-gray-50/50 transition-colors">
                    <TableCell className="border-r border-gray-200 align-top">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg">
                          <Check size={16} /> 
                        </div>
                        <div>
                          <div className="font-medium text-gray-800">{permission.alias}</div>
                          <div className="text-xs text-muted-foreground font-mono mt-1">{permission.herf}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-3">
                        {permission.actions?.map((action) => {
                          const isChecked = selectedActionIds.includes(action.id!);
                          return (
                            <label 
                              key={action.id} 
                              className={`
                                flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer select-none transition-all
                                ${isChecked 
                                  ? 'bg-blue-50 border-blue-200 text-blue-700 ring-1 ring-blue-200' 
                                  : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                                }
                              `}
                            >
                              <Checkbox
                                checked={isChecked}
                                onCheckedChange={() => handleToggleAction(action.id!)}
                              />
                              <span className="text-sm font-medium">{action.action}</span>
                            </label>
                          );
                        })}
                        {(!permission.actions || permission.actions.length === 0) && (
                          <span className="text-xs text-muted-foreground italic">Không có thao tác nào</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
        )}
      </div>
    </div>
  );
}