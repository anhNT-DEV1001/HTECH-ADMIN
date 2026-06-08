"use client";

import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { useToast } from "@/common/providers/ToastProvider";
import type { ErrorResponse } from "@/common/types";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type {
  ICreateQA,
  ICreateQACategory,
  IUpdateQA,
  IUpdateQACategory,
} from "../interfaces";
import { qaService } from "../services";

const QA_CATEGORY_QUERY_KEY = ["qa", "categories"];
const QA_QUERY_KEY = ["qa", "list"];

const getErrorMessage = (error: Error, fallback: string) => {
  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error.message || fallback;
};

export const useQA = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const categoryQuery = useCommonQuery(QA_CATEGORY_QUERY_KEY, () => qaService.getQACategories());
  const qaQuery = useCommonQuery(QA_QUERY_KEY, () => qaService.getQAs());

  const invalidateQAData = () => {
    queryClient.invalidateQueries({ queryKey: QA_CATEGORY_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: QA_QUERY_KEY });
  };

  const createCategoryMutation = useCommonMutate(
    (body: ICreateQACategory) => qaService.createQACategory(body),
    {
      onSuccess: (data) => {
        invalidateQAData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo QA category"), "error"),
    },
  );

  const updateCategoryMutation = useCommonMutate(
    (body: IUpdateQACategory) => qaService.updateQACategory(body),
    {
      onSuccess: (data) => {
        invalidateQAData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật QA category"), "error"),
    },
  );

  const deleteCategoryMutation = useCommonMutate((id: number) => qaService.deleteQACategory(id), {
    onSuccess: (data) => {
      invalidateQAData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa QA category"), "error"),
  });

  const createQAMutation = useCommonMutate((body: ICreateQA) => qaService.createQA(body), {
    onSuccess: (data) => {
      invalidateQAData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo QA"), "error"),
  });

  const updateQAMutation = useCommonMutate((body: IUpdateQA) => qaService.updateQA(body), {
    onSuccess: (data) => {
      invalidateQAData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật QA"), "error"),
  });

  const deleteQAMutation = useCommonMutate((id: number) => qaService.deleteQA(id), {
    onSuccess: (data) => {
      invalidateQAData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa QA"), "error"),
  });

  return {
    categoryData: categoryQuery.data,
    qaData: qaQuery.data,
    isLoadingCategories: categoryQuery.isLoading,
    isLoadingQA: qaQuery.isLoading,
    isFetchingCategories: categoryQuery.isFetching,
    isFetchingQA: qaQuery.isFetching,
    createCategory: createCategoryMutation.mutate,
    updateCategory: updateCategoryMutation.mutate,
    deleteCategory: deleteCategoryMutation.mutate,
    createQA: createQAMutation.mutate,
    updateQA: updateQAMutation.mutate,
    deleteQA: deleteQAMutation.mutate,
    isCreatingCategory: createCategoryMutation.isPending,
    isUpdatingCategory: updateCategoryMutation.isPending,
    isDeletingCategory: deleteCategoryMutation.isPending,
    isCreatingQA: createQAMutation.isPending,
    isUpdatingQA: updateQAMutation.isPending,
    isDeletingQA: deleteQAMutation.isPending,
  };
};
