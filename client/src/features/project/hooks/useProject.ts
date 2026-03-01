import { IPaginationRequest } from "@/common/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/common/providers/ToastProvider";
import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { projectService } from "../services";
import { ICreateProject, IUpdateProject } from "../interfaces";
import { number } from "zod";
export const useProject = (query?: IPaginationRequest) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ["project", "getProject", query];
  const { showToast } = useToast();
  const projectQuery = useCommonQuery(
    QUERY_KEY,
    () => projectService.getProject(query || {}),
    { placeholderData: (prev) => prev }
  );

  const createProjectMutation = useCommonMutate(
    (body: ICreateProject) => projectService.createProject(body as any),
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
  )

  const updateProjectMutation = useCommonMutate(
    ({ body, id }: { body: IUpdateProject, id: number }) => projectService.updateProject(id, body as any),
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
  )

  const deleteProjectMutation = useCommonMutate(
    (id: number) => projectService.deleteProject(id),
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
  )

  return {
    projectData: projectQuery.data,
    isLoading: projectQuery.isLoading,
    isFetching: projectQuery.isFetching,
    createProjectMutation,
    updateProjectMutation,
    deleteProjectMutation,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: updateProjectMutation.isPending,
  }
}

export const useProjectCategories = () => {
  const QUERY_KEY = ["project", "getProjectCategories"];
  const categoriesQuery = useCommonQuery(
    QUERY_KEY,
    () => projectService.getProjectCategories(),
  );
  return {
    categories: categoriesQuery.data?.data || [],
    isLoading: categoriesQuery.isLoading,
  };
};

export const useProjectDetail = (projectId: number) => {
  const QUERY_KEY = ["project", "getProjectById", projectId];
  const projectDetailQuery = useCommonQuery(
    QUERY_KEY,
    () => projectService.getProjectById(projectId),
    { enabled: !!projectId && !isNaN(Number(projectId)) }
  );
  return {
    projectData: projectDetailQuery.data,
    isLoading: projectDetailQuery.isLoading
  }
}