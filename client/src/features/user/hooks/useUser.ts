import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { IPaginationRequest } from "@/common/interfaces";
import { useQueryClient } from "@tanstack/react-query";
import { userService } from "../services";
import { IUserForm } from "../interfaces";
import { useToast } from "@/common/providers/ToastProvider";

export const useUser = (query? : IPaginationRequest) => {
  const queryClient = useQueryClient();
  const QUERY_KEY = ['users' , 'getAllUsers', query];
  const {showToast} = useToast()
  const userQuery = useCommonQuery(
    QUERY_KEY,
    () =>  userService.getAllUsers(query),
    {
      placeholderData: (prev) => prev,
    }
  )
  const createUserMutation = useCommonMutate(
    (body : IUserForm) => userService.createUser(body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "getAllUsers"] });
      showToast(data.message, "success");
    },
    onError: (error : any) => {
      const message = error.response?.data?.message || 'Lỗi khi tạo người dùng';
      showToast(message, "error");
    }
  })

  const updateUserMutation = useCommonMutate(
    ({ id, body }: { id: number; body: IUserForm }) => userService.updateUser(id, body), {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "getAllUsers"] });
      showToast(data.message, "success");
    },
    onError: (error : any) => {
      const message = error.response?.data?.message || 'Lỗi khi cập nhật người dùng';
      showToast(message, "error");
    }
  })

  const deleteUserMutation = useCommonMutate((id : number) => userService.deleteUser(id), {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["users", "getAllUsers"] });
      showToast(data.message, "success");
    },
    onError: (error : any) => {
      const message = error.response?.data?.message || 'Lỗi khi xóa người dùng';
      showToast(message, "error");
    }
  })

  return {
    usersData: userQuery.data,
    isLoading: userQuery.isLoading,
    isFetching: userQuery.isFetching,
    createUserMutation,
    updateUserMutation,
    deleteUserMutation,
    isCreating: createUserMutation.isPending,
    isUpdating: updateUserMutation.isPending,
    isDeleting: deleteUserMutation.isPending,
  }
}

export const useUserDetail = (userId: number) => {
  const QUERY_KEY = ['user', 'getUserById', userId];
  const userDetailQuery = useCommonQuery(
    QUERY_KEY,
    () => userService.getUserById(userId),
    {
      enabled: !!userId && !isNaN(Number(userId)),
    }
  );

  return {
    userData: userDetailQuery.data,
    isLoading: userDetailQuery.isLoading,
  }
}