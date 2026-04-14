import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { useQueryClient } from "@tanstack/react-query";
import { companyService } from "../services";
import { useToast } from "@/common/providers/ToastProvider";

export const useCompanyInfo = () => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["company", "getPublicCompanyInfo"];
  const { showToast } = useToast();

  const companyInfoQuery = useCommonQuery(
    QUERY_KEY,
    () => companyService.getPublicCompanyInfo(),
  );

  const createCompanyMutation = useCommonMutate(
    (formData: FormData) => companyService.createCompanyInfo(formData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        showToast(data.message, 'success');
      },
      onError: (data: any) => {
        showToast(data.message || 'Lỗi khi tạo thông tin', 'error');
      }
    }
  );

  const updateCompanyMutation = useCommonMutate(
    ({ id, formData }: { id: number, formData: FormData }) => companyService.updateCompanyInfo(id, formData),
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: QUERY_KEY });
        showToast(data.message, 'success');
      },
      onError: (data: any) => {
        showToast(data.message || 'Lỗi khi cập nhật thông tin', 'error');
      }
    }
  );

  return {
    companyData: companyInfoQuery.data?.data,
    isLoading: companyInfoQuery.isLoading,
    isFetching: companyInfoQuery.isFetching,
    createCompanyMutation,
    updateCompanyMutation,
    isCreating: createCompanyMutation.isPending,
    isUpdating: updateCompanyMutation.isPending,
  };
};
