"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useCommonQuery, useCommonMutate } from "@/common/hooks";
import { roleService } from "../services";
import { IPaginationRequest } from "@/common/interfaces";
import { ICreateRoleRequest } from "../interfaces";
import { useToast } from "@/common/providers/ToastProvider";
import { useConfirm } from "@/common/providers/ConfirmProvider";

export const useRole = (query?: IPaginationRequest) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["role", "getAllRoles", query];
  const {showToast} = useToast();
  const {confirm} = useConfirm();

  const rolesQuery = useCommonQuery(
    QUERY_KEY,
    () => roleService.getAllRoles(query || {}),
    { placeholderData: (prev) => prev },
  );

  const createMutation = useCommonMutate((body : ICreateRoleRequest) => roleService.createRole(body), {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role", "getAllRoles"] });
      showToast("Tạo quyền thành công!", "success");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Lỗi khi tạo quyền';
      showToast(message, "error");
    },
  });

  const updateMutation = useCommonMutate(
    ({ id, body }: { id: number; body: ICreateRoleRequest }) =>
      roleService.updateRole(id, body),
    {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["role", "getAllRoles"] });
        showToast("Cập nhật quyền thành công!", "success");
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Lỗi khi cập nhật quyền';
        showToast(message, "error");
      },
    },
  );

  const deleteMutation = useCommonMutate(roleService.deleteRole, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["role", "getAllRoles"] });
      showToast("Xóa quyền thành công!", "success");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || 'Lỗi khi xóa quyền';
      showToast(message, "error");
    },
  });

  return {
    rolesData: rolesQuery.data,
    isLoading: rolesQuery.isLoading,
    isFetching: rolesQuery.isFetching,

    createRole: createMutation.mutate,
    isCreating: createMutation.isPending,

    updateRole: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteRole: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,

    rolesQuery,
    createMutation,
    updateMutation,
    deleteMutation,
  };
};
