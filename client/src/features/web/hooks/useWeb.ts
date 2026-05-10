"use client";

import type { ErrorResponse } from "@/common/types";
import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { useToast } from "@/common/providers/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { ICreateWeb, IUpdateWeb } from "../interfaces";
import { webService } from "../services";

const getErrorMessage = (error: Error, fallback: string) => {
  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error.message || fallback;
};

export const useWeb = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const QUERY_KEY = ["web", "getAllWeb"];

  const webQuery = useCommonQuery(QUERY_KEY, () => webService.getAllWeb());

  const createWebMutation = useCommonMutate(
    (body: ICreateWeb) => webService.createWeb(body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(getErrorMessage(error, "Lỗi khi tạo website"), "error");
      },
    },
  );

  const updateWebMutation = useCommonMutate(
    (body: IUpdateWeb) => webService.updateWeb(body),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(getErrorMessage(error, "Lỗi khi cập nhật website"), "error");
      },
    },
  );

  const deleteWebMutation = useCommonMutate(
    (id: number) => webService.deleteWeb(id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(getErrorMessage(error, "Lỗi khi xóa website"), "error");
      },
    },
  );

  return {
    webQuery,
    webData: webQuery.data,
    isLoading: webQuery.isLoading,
    isFetching: webQuery.isFetching,
    createWeb: createWebMutation.mutate,
    updateWeb: updateWebMutation.mutate,
    deleteWeb: deleteWebMutation.mutate,
    isCreating: createWebMutation.isPending,
    isUpdating: updateWebMutation.isPending,
    isDeleting: deleteWebMutation.isPending,
  };
};
