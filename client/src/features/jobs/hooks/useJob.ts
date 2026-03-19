import { IPaginationRequest } from "@/common/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/common/providers/ToastProvider";
import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { jobService } from "../services/jobs.service";
import { ICreateJob, IUpdateJob } from "../interfaces/jobs.interface";

export const useJobs = (query?: IPaginationRequest) => {
    const queryClient = useQueryClient();
    const QUERY_KEY = ["jobs", "getJobs", query];
    const { showToast } = useToast();

    const jobsQuery = useCommonQuery(
        QUERY_KEY,
        () => jobService.getJobs(query || {}),
        { placeholderData: (prev) => prev }
    );

    const createJobMutation = useCommonMutate(
        (body: ICreateJob) => jobService.createJob(body),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEY[0], QUERY_KEY[1]]
                });
                showToast(data.message, 'success');
            },
            onError: (data) => {
                showToast(data.message, 'error');
            }
        }
    );

    const updateJobMutation = useCommonMutate(
        ({ body, id }: { body: IUpdateJob; id: number }) => jobService.updateJob(id, body),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEY[0], QUERY_KEY[1]]
                });
                showToast(data.message, 'success');
            },
            onError: (data) => {
                showToast(data.message, 'error');
            }
        }
    );

    const deleteJobMutation = useCommonMutate(
        (id: number) => jobService.deleteJob(id),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries({
                    queryKey: [QUERY_KEY[0], QUERY_KEY[1]],
                });
                showToast(data.message, 'success');
            },
            onError: (data) => {
                showToast(data.message, 'error');
            }
        }
    );

    return {
        jobsData: jobsQuery.data,
        isLoading: jobsQuery.isLoading,
        isFetching: jobsQuery.isFetching,
        createJobMutation,
        updateJobMutation,
        deleteJobMutation,
        isCreating: createJobMutation.isPending,
        isUpdating: updateJobMutation.isPending,
        isDeleting: deleteJobMutation.isPending,
    }
};

export const useFieldsOfWork = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const QUERY_KEY = ["jobs", "getFieldsOfWork"];

    const fieldsQuery = useCommonQuery(
        QUERY_KEY,
        () => jobService.getFieldsOfWork(),
    );

    const createFieldMutation = useCommonMutate(
        (body: { name_vn: string; name_en?: string }) => jobService.createFieldOfWork(body),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: QUERY_KEY });
                showToast("Thêm lĩnh vực thành công", 'success');
            },
            onError: (data) => {
                showToast(data.message || "Lỗi khi thêm lĩnh vực", 'error');
            }
        }
    );

    const deleteFieldMutation = useCommonMutate(
        (id: number) => jobService.deleteFieldOfWork(id),
        {
            onSuccess: (data) => {
                queryClient.invalidateQueries({ queryKey: QUERY_KEY });
                showToast("Xóa lĩnh vực thành công", 'success');
            },
            onError: (data) => {
                showToast(data.message || "Lỗi khi xóa lĩnh vực", 'error');
            }
        }
    );

    return {
        fieldsOfWork: fieldsQuery.data?.data || [],
        isLoading: fieldsQuery.isLoading,
        createFieldMutation,
        deleteFieldMutation,
        isCreatingField: createFieldMutation.isPending,
        isDeletingField: deleteFieldMutation.isPending
    };
};

export const useJobDetail = (jobId: number) => {
    const QUERY_KEY = ["jobs", "getJobById", jobId];
    const jobDetailQuery = useCommonQuery(
        QUERY_KEY,
        () => jobService.getJobById(jobId),
        { enabled: !!jobId && !isNaN(Number(jobId)) }
    );
    return {
        jobData: jobDetailQuery.data,
        isLoading: jobDetailQuery.isLoading,
    }
};
