'use client';
import { useQueryClient } from "@tanstack/react-query"
import { actionService } from "../services";
import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { useToast } from "@/common/providers/ToastProvider";
import { BaseResponse } from "@/common/types";
import { IActionDetailForm } from "../interfaces/action.interface";

export const useAction = (resourceDetailId: number) => {
  const queryClient = useQueryClient();
  const {showToast} = useToast();
  const QUERY_KEY = ["action", "getAllAction", resourceDetailId];
  const actionQuery = useCommonQuery(
    QUERY_KEY, 
    ()=> actionService.getActionInDetail(resourceDetailId),
    {
      placeholderData : (prev) => prev
    }
  )

  const createActionMutation = useCommonMutate(
    (body : IActionDetailForm) => actionService.createActionInDetail(body), 
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey : [QUERY_KEY[0], QUERY_KEY[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error : any) => {
        const message = error.response?.data?.message || 'Lỗi khi tạo quyền';
        showToast(message, "error");
      }
    }
  )

  const updateActionMutation = useCommonMutate(
    (body : any) => actionService.updatedActionInDetail(body), 
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey : [QUERY_KEY[0], QUERY_KEY[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error : any) => {
        const message = error.response?.data?.message || 'Lỗi khi cập nhật quyền';
        showToast(message, "error");
      }
    }
  )

  const deleteActionMutation = useCommonMutate(
    (id : number) => actionService.deleteAction(id), 
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey : [QUERY_KEY[0], QUERY_KEY[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error : any) => {
        const message = error.response?.data?.message || 'Lỗi khi xóa quyền';
        showToast(message, "error");
      }
    }
  )

  return {
    actionQuery,
    actionData: actionQuery.data,
    isLoading: actionQuery.isLoading,
    isFetching: actionQuery.isFetching,

    createActionMutation,
    isCreating : createActionMutation.isPending,
    updateActionMutation,
    isUpdating : updateActionMutation.isPending,
    deleteActionMutation,
    isDeleting : deleteActionMutation.isPending,
  }
}