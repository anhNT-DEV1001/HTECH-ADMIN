"use client";

import type { ErrorResponse } from "@/common/types";
import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { useToast } from "@/common/providers/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type { IAgendaFilterParams } from "../interfaces";
import { agendaService } from "../services";

const getErrorMessage = (error: Error, fallback: string) => {
  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error.message || fallback;
};

export const useAgenda = (query?: IAgendaFilterParams) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();
  const QUERY_KEY = ["agenda", "getAgendas", query];

  const agendaQuery = useCommonQuery(
    QUERY_KEY,
    () => agendaService.getAgendas(query || {}),
    { placeholderData: (previousData) => previousData },
  );

  const createAgendaMutation = useCommonMutate(
    (formData: FormData) => agendaService.createAgenda(formData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["agenda", "getAgendas"] });
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(getErrorMessage(error, "Lỗi khi tạo agenda"), "error");
      },
    },
  );

  const updateAgendaMutation = useCommonMutate(
    ({ id, formData }: { id: number; formData: FormData }) => agendaService.updateAgenda(id, formData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["agenda", "getAgendas"] });
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(getErrorMessage(error, "Lỗi khi cập nhật agenda"), "error");
      },
    },
  );

  const deleteAgendaMutation = useCommonMutate(
    (id: number) => agendaService.deleteAgenda(id),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ["agenda", "getAgendas"] });
        showToast(data.message, "success");
      },
      onError: (error) => {
        showToast(getErrorMessage(error, "Lỗi khi xóa agenda"), "error");
      },
    },
  );

  return {
    agendaData: agendaQuery.data,
    isLoading: agendaQuery.isLoading,
    isFetching: agendaQuery.isFetching,
    createAgendaMutation,
    updateAgendaMutation,
    deleteAgendaMutation,
    isCreating: createAgendaMutation.isPending,
    isUpdating: updateAgendaMutation.isPending,
    isDeleting: deleteAgendaMutation.isPending,
  };
};

export const useAgendaDetail = (agendaId: number | null) => {
  const agendaDetailQuery = useCommonQuery(
    ["agenda", "getAgendaById", agendaId],
    () => agendaService.getAgendaById(agendaId as number),
    { enabled: agendaId !== null && Number.isFinite(agendaId) },
  );

  return {
    agendaData: agendaDetailQuery.data,
    isLoading: agendaDetailQuery.isLoading,
  };
};
