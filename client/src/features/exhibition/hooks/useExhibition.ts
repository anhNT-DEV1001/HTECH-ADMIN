"use client";

import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import type { ErrorResponse } from "@/common/types";
import { useToast } from "@/common/providers/ToastProvider";
import { useQueryClient } from "@tanstack/react-query";
import { isAxiosError } from "axios";
import type {
  ICreateBooth,
  ICreateConference,
  ICreateExhibition,
  ICreateExhibitor,
  ICreateExhibitorRank,
  ICreateZone,
  IUpdateBooth,
  IUpdateConference,
  IUpdateExhibition,
  IUpdateExhibitor,
  IUpdateExhibitorRank,
  IUpdateZone,
} from "../interfaces";
import { exhibitionService } from "../services";

const EXHIBITION_QUERY_KEY = ["exhibition", "getExhibitions"];
const ZONE_QUERY_KEY = ["exhibition", "getZones"];
const EXHIBITOR_RANK_QUERY_KEY = ["exhibition", "getExhibitorRanks"];
const BOOTH_QUERY_KEY = ["exhibition", "getBooths"];
const CONFERENCE_QUERY_KEY = ["exhibition", "getConferences"];
const EXHIBITOR_QUERY_KEY = ["exhibition", "getExhibitors"];

const getErrorMessage = (error: Error, fallback: string) => {
  if (isAxiosError<ErrorResponse>(error)) {
    return error.response?.data?.message || fallback;
  }

  return error.message || fallback;
};

export const useExhibition = () => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const exhibitionQuery = useCommonQuery(EXHIBITION_QUERY_KEY, () => exhibitionService.getExhibitions());
  const zoneQuery = useCommonQuery(ZONE_QUERY_KEY, () => exhibitionService.getZones());
  const exhibitorRankQuery = useCommonQuery(EXHIBITOR_RANK_QUERY_KEY, () =>
    exhibitionService.getExhibitorRanks(),
  );
  const boothQuery = useCommonQuery(BOOTH_QUERY_KEY, () => exhibitionService.getBooths());
  const conferenceQuery = useCommonQuery(CONFERENCE_QUERY_KEY, () => exhibitionService.getConferences());
  const exhibitorQuery = useCommonQuery(EXHIBITOR_QUERY_KEY, () => exhibitionService.getExhibitors());

  const invalidateExhibitionData = () => {
    queryClient.invalidateQueries({ queryKey: EXHIBITION_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: ZONE_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: EXHIBITOR_RANK_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: BOOTH_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: CONFERENCE_QUERY_KEY });
    queryClient.invalidateQueries({ queryKey: EXHIBITOR_QUERY_KEY });
  };

  const createExhibitionMutation = useCommonMutate(
    (body: ICreateExhibition) => exhibitionService.createExhibition(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo exhibition"), "error"),
    },
  );

  const updateExhibitionMutation = useCommonMutate(
    (body: IUpdateExhibition) => exhibitionService.updateExhibition(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật exhibition"), "error"),
    },
  );

  const deleteExhibitionMutation = useCommonMutate(
    (id: number) => exhibitionService.deleteExhibition(id),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa exhibition"), "error"),
    },
  );

  const createZoneMutation = useCommonMutate((body: ICreateZone) => exhibitionService.createZone(body), {
    onSuccess: (data) => {
      invalidateExhibitionData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo zone"), "error"),
  });

  const updateZoneMutation = useCommonMutate((body: IUpdateZone) => exhibitionService.updateZone(body), {
    onSuccess: (data) => {
      invalidateExhibitionData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật zone"), "error"),
  });

  const deleteZoneMutation = useCommonMutate((id: number) => exhibitionService.deleteZone(id), {
    onSuccess: (data) => {
      invalidateExhibitionData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa zone"), "error"),
  });

  const createExhibitorRankMutation = useCommonMutate(
    (body: ICreateExhibitorRank) => exhibitionService.createExhibitorRank(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo rank"), "error"),
    },
  );

  const updateExhibitorRankMutation = useCommonMutate(
    (body: IUpdateExhibitorRank) => exhibitionService.updateExhibitorRank(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật rank"), "error"),
    },
  );

  const deleteExhibitorRankMutation = useCommonMutate(
    (id: number) => exhibitionService.deleteExhibitorRank(id),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa rank"), "error"),
    },
  );

  const createBoothMutation = useCommonMutate((body: ICreateBooth) => exhibitionService.createBooth(body), {
    onSuccess: (data) => {
      invalidateExhibitionData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo booth"), "error"),
  });

  const updateBoothMutation = useCommonMutate((body: IUpdateBooth) => exhibitionService.updateBooth(body), {
    onSuccess: (data) => {
      invalidateExhibitionData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật booth"), "error"),
  });

  const deleteBoothMutation = useCommonMutate((id: number) => exhibitionService.deleteBooth(id), {
    onSuccess: (data) => {
      invalidateExhibitionData();
      showToast(data.message, "success");
    },
    onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa booth"), "error"),
  });

  const createConferenceMutation = useCommonMutate(
    (body: ICreateConference) => exhibitionService.createConference(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo conference"), "error"),
    },
  );

  const updateConferenceMutation = useCommonMutate(
    (body: IUpdateConference) => exhibitionService.updateConference(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật conference"), "error"),
    },
  );

  const deleteConferenceMutation = useCommonMutate(
    (id: number) => exhibitionService.deleteConference(id),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa conference"), "error"),
    },
  );

  const createExhibitorMutation = useCommonMutate(
    (body: ICreateExhibitor) => exhibitionService.createExhibitor(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi tạo exhibitor"), "error"),
    },
  );

  const updateExhibitorMutation = useCommonMutate(
    (body: IUpdateExhibitor) => exhibitionService.updateExhibitor(body),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi cập nhật exhibitor"), "error"),
    },
  );

  const deleteExhibitorMutation = useCommonMutate(
    (id: number) => exhibitionService.deleteExhibitor(id),
    {
      onSuccess: (data) => {
        invalidateExhibitionData();
        showToast(data.message, "success");
      },
      onError: (error) => showToast(getErrorMessage(error, "Lỗi khi xóa exhibitor"), "error"),
    },
  );

  return {
    exhibitionData: exhibitionQuery.data,
    zoneData: zoneQuery.data,
    exhibitorRankData: exhibitorRankQuery.data,
    boothData: boothQuery.data,
    conferenceData: conferenceQuery.data,
    exhibitorData: exhibitorQuery.data,
    isLoadingExhibitions: exhibitionQuery.isLoading,
    isLoadingZones: zoneQuery.isLoading,
    isLoadingExhibitorRanks: exhibitorRankQuery.isLoading,
    isLoadingBooths: boothQuery.isLoading,
    isLoadingConferences: conferenceQuery.isLoading,
    isLoadingExhibitors: exhibitorQuery.isLoading,
    isFetchingExhibitions: exhibitionQuery.isFetching,
    isFetchingZones: zoneQuery.isFetching,
    isFetchingExhibitorRanks: exhibitorRankQuery.isFetching,
    isFetchingBooths: boothQuery.isFetching,
    isFetchingConferences: conferenceQuery.isFetching,
    isFetchingExhibitors: exhibitorQuery.isFetching,
    createExhibition: createExhibitionMutation.mutate,
    updateExhibition: updateExhibitionMutation.mutate,
    deleteExhibition: deleteExhibitionMutation.mutate,
    createZone: createZoneMutation.mutate,
    updateZone: updateZoneMutation.mutate,
    deleteZone: deleteZoneMutation.mutate,
    createExhibitorRank: createExhibitorRankMutation.mutate,
    updateExhibitorRank: updateExhibitorRankMutation.mutate,
    deleteExhibitorRank: deleteExhibitorRankMutation.mutate,
    createBooth: createBoothMutation.mutate,
    updateBooth: updateBoothMutation.mutate,
    deleteBooth: deleteBoothMutation.mutate,
    createConference: createConferenceMutation.mutate,
    updateConference: updateConferenceMutation.mutate,
    deleteConference: deleteConferenceMutation.mutate,
    createExhibitor: createExhibitorMutation.mutate,
    updateExhibitor: updateExhibitorMutation.mutate,
    deleteExhibitor: deleteExhibitorMutation.mutate,
    isCreatingExhibition: createExhibitionMutation.isPending,
    isUpdatingExhibition: updateExhibitionMutation.isPending,
    isDeletingExhibition: deleteExhibitionMutation.isPending,
    isCreatingZone: createZoneMutation.isPending,
    isUpdatingZone: updateZoneMutation.isPending,
    isDeletingZone: deleteZoneMutation.isPending,
    isCreatingExhibitorRank: createExhibitorRankMutation.isPending,
    isUpdatingExhibitorRank: updateExhibitorRankMutation.isPending,
    isDeletingExhibitorRank: deleteExhibitorRankMutation.isPending,
    isCreatingBooth: createBoothMutation.isPending,
    isUpdatingBooth: updateBoothMutation.isPending,
    isDeletingBooth: deleteBoothMutation.isPending,
    isCreatingConference: createConferenceMutation.isPending,
    isUpdatingConference: updateConferenceMutation.isPending,
    isDeletingConference: deleteConferenceMutation.isPending,
    isCreatingExhibitor: createExhibitorMutation.isPending,
    isUpdatingExhibitor: updateExhibitorMutation.isPending,
    isDeletingExhibitor: deleteExhibitorMutation.isPending,
  };
};
