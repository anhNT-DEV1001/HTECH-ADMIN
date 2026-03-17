import { UseMutationResult, UseQueryResult, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { masterDataApi } from "./api";
import {
  IMasterData,
  IMasterDataFilterParams,
  ICreateMasterDataDto,
  IUpdateMasterDataDto,
  MasterDataResponse
} from "./interfaces";
import { useToast } from "@/common/providers/ToastProvider";

export const MASTERDATA_QUERY_KEYS = {
  all: ["masterdata"] as const,
  lists: () => [...MASTERDATA_QUERY_KEYS.all, "list"] as const,
  list: (params: IMasterDataFilterParams) => [...MASTERDATA_QUERY_KEYS.lists(), params] as const,
  details: () => [...MASTERDATA_QUERY_KEYS.all, "detail"] as const,
  detail: (id: number) => [...MASTERDATA_QUERY_KEYS.details(), id] as const,
  byKey: (key: string) => [...MASTERDATA_QUERY_KEYS.all, "byKey", key] as const,
};

export const useMasterData = (params?: IMasterDataFilterParams) => {
  const queryClient = useQueryClient();
  const { showToast } = useToast();

  const masterDataQuery: UseQueryResult<MasterDataResponse> = useQuery({
    queryKey: MASTERDATA_QUERY_KEYS.list(params || {}),
    queryFn: () => masterDataApi.getAllMasterData(params || {}),
    refetchOnWindowFocus: false,
  });

  const createMasterDataMutation: UseMutationResult<IMasterData, Error, ICreateMasterDataDto> = useMutation({
    mutationFn: masterDataApi.createMasterData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERDATA_QUERY_KEYS.lists() });
      showToast("Thêm mới thành công", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || "Thêm mới thất bại", "error");
    },
  });

  const updateMasterDataMutation: UseMutationResult<
    IMasterData,
    Error,
    { id: number; data: IUpdateMasterDataDto }
  > = useMutation({
    mutationFn: ({ id, data }) => masterDataApi.updateMasterData(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: MASTERDATA_QUERY_KEYS.lists() });
      queryClient.invalidateQueries({ queryKey: MASTERDATA_QUERY_KEYS.detail(variables.id) });
      showToast("Cập nhật thành công", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || "Cập nhật thất bại", "error");
    },
  });

  const deleteMasterDataMutation: UseMutationResult<void, Error, number> = useMutation({
    mutationFn: masterDataApi.deleteMasterData,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MASTERDATA_QUERY_KEYS.lists() });
      showToast("Xóa thành công", "success");
    },
    onError: (error: any) => {
      showToast(error.response?.data?.message || "Xóa thất bại", "error");
    },
  });

  return {
    masterData: masterDataQuery.data,
    isLoading: masterDataQuery.isLoading,
    isFetching: masterDataQuery.isFetching,
    error: masterDataQuery.error,
    createMasterData: createMasterDataMutation,
    updateMasterData: updateMasterDataMutation,
    deleteMasterData: deleteMasterDataMutation,
  };
};

export const useMasterDataByKey = (dataKey: string) => {
  return useQuery({
    queryKey: MASTERDATA_QUERY_KEYS.byKey(dataKey),
    queryFn: () => masterDataApi.getMasterDataByKey(dataKey),
    enabled: !!dataKey,
  });
};
