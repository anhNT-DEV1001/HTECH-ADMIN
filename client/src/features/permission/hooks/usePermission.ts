'use client';
import { useToast } from "@/common/providers/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import { permissionService } from "../services";
import { useCommonMutate, useCommonQuery } from "@/common/hooks";

export const usePermission = (roleId? : number, userId? : number) => {
  const queryClient = useQueryClient();
  const {showToast} = useToast();
  const QUERY_KEY_ROLE_PERMISSION = ["rolePermission", "getAllPermissionByRole", roleId];
  const QUERY_KEY_USER_PERMISSION = ["userPermission", "getAllPermissionByUser", userId];
  const permissionQuery = useCommonQuery(
    QUERY_KEY_ROLE_PERMISSION, 
    ()=> permissionService.getAllPermissionByRole(Number(roleId)),
    {
      enabled: !!roleId && !isNaN(Number(roleId)),
    }
  )

  const savePermissionMutation = useCommonMutate(
    (body : number[]) => permissionService.savePermissionByRole(Number(roleId), body), 
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey : [QUERY_KEY_ROLE_PERMISSION[0], QUERY_KEY_ROLE_PERMISSION[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error : any) => {
        const message = error.response?.data?.message || 'Lỗi khi cập nhật quyền';
        showToast(message, "error");
      }
    }
  )

  const userPermissionQuery = useCommonQuery(
    QUERY_KEY_USER_PERMISSION, 
    ()=> permissionService.getAllPermissionByUser(Number(userId)),
    {
      enabled: !!userId && !isNaN(Number(userId)),
    }
  )

  const saveUserPermissionMutation = useCommonMutate(
    (body : number[]) => permissionService.savePermissionByUser(Number(userId), body), 
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey : [QUERY_KEY_USER_PERMISSION[0], QUERY_KEY_USER_PERMISSION[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error : any) => {
        const message = error.response?.data?.message || 'Lỗi khi cập nhật quyền';
        showToast(message, "error");
      }
    }
  )

  return {
    permissionQuery,
    permissionData: permissionQuery.data,
    isLoading: permissionQuery.isLoading,
    isFetching: permissionQuery.isFetching,

    savePermissionMutation,
    isSaving : savePermissionMutation.isPending,

    userPermissionQuery,
    userPermissionData: userPermissionQuery.data,
    isLoadingUserPermission: userPermissionQuery.isLoading,
    isFetchingUserPermission: userPermissionQuery.isFetching,

    saveUserPermissionMutation,
    isSavingUserPermission : saveUserPermissionMutation.isPending,
  }
}