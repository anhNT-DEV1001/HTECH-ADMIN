'use client';
import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { IPaginationRequest } from "@/common/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { resourceService } from "../services";
import { ICreateResource, IUpdateResourceWithDetail } from "../interfaces";
import { useToast } from "@/common/providers/ToastProvider";

export const useResource = (query? : IPaginationRequest) => {
  const queryClient  = useQueryClient();
  const QUERY_KEY = ["resource" , "getAllResource" , query];
  const {showToast} = useToast();
  const resourceQuery = useCommonQuery(
    QUERY_KEY,
    ()=> resourceService.getAllResource(query || {}),
    {placeholderData : (prev) => prev}
  );

  const createResourceMutation = useCommonMutate((body: ICreateResource) =>resourceService.createResource(body),{
    onSuccess: (data)=> {
      queryClient.invalidateQueries({
        queryKey : [QUERY_KEY[0], QUERY_KEY[1]]
      });
      showToast(data.message, 'success');
    },
    onError: (error: any) => {
      const errorMsg = error.response?.data?.message || "Lỗi hệ thông !";
      showToast(errorMsg, 'error'); 
    }
  })

  const updateResourceMutation = useCommonMutate(
    (body: IUpdateResourceWithDetail) =>
      resourceService.updateResourceWithDetail(body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY[0], QUERY_KEY[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error: any) => {
        const errorMsg = error.response?.data?.message || "Lỗi hệ thông !";
        showToast(errorMsg, "error");
      },
    },
  );
  const deleteResourceMutation = useCommonMutate(resourceService.deleteResource, {
      onSuccess: (data) => {
        queryClient.invalidateQueries({
          queryKey: [QUERY_KEY[0], QUERY_KEY[1]],
        });
        showToast(data.message, "success");
      },
      onError: (error: any) => {
        const message = error.response?.data?.message || 'Lỗi khi xóa quyền';
        showToast(message, "error");
      },
  });

  return {
    resourceQuery,
    createResourceMutation,
    updateResourceMutation,
    deleteResourceMutation,
    resourceData: resourceQuery.data,
    isLoading: resourceQuery.isLoading,
    isFetching: resourceQuery.isFetching,

    createResource : createResourceMutation.mutate,
    isCreating: createResourceMutation.isPending,
    updateResource: updateResourceMutation.mutate,
    isUpdating : updateResourceMutation.isPending,
    deleteResource: deleteResourceMutation.mutate,
    isDeleting: deleteResourceMutation.isPending
  };
}