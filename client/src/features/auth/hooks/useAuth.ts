"use client";

import { useCommonMutate, useCommonQuery } from "@/common/hooks";
import { useAuthStore } from "@/common/stores";
import { BaseResponse } from "@/common/types";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import {
  IAuthResponse,
  ILoginResponse,
  ITokenResponse,
  LoginResquest,
  ResginterRequest,
} from "../interfaces";
import { authService } from "../services";
import { usePathname } from "next/navigation";

export const useAuth = () => {
  const queryClient = useQueryClient();
  const pathName = usePathname();
  const { setUser, logout: logoutStore } = useAuthStore();
  const isPublicFlag = ["/login", "/register"].includes(pathName);

  const loginMutation = useCommonMutate<
    LoginResquest,
    BaseResponse<ILoginResponse>
  >(authService.login, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
  });

  const registerMutation = useCommonMutate<
    ResginterRequest,
    BaseResponse<IAuthResponse>
  >(authService.register);

  const logoutMutation = useCommonMutate<void, BaseResponse<IAuthResponse>>(
    authService.logout,
    {
      onSuccess: () => {
        logoutStore();
        queryClient.setQueryData(["auth", "me"], null);
        queryClient.removeQueries({ queryKey: ["auth", "me"] });
      },
    },
  );
  const refreshTokenMutation = useCommonMutate<
    void,
    BaseResponse<ITokenResponse>
  >(authService.refreshToken);

  const profileQuery = useCommonQuery(["auth", "me"], authService.getMe, {
    enabled: typeof window !== "undefined" && !isPublicFlag,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  useEffect(() => {
  if (profileQuery.data?.data) {
    setUser(profileQuery.data.data as any);
  }
}, [profileQuery.data, setUser]);

  return {
    login: loginMutation,
    register: registerMutation,
    logout: logoutMutation,
    refreshToken: refreshTokenMutation,
    isLoading:
      loginMutation.isPending ||
      registerMutation.isPending ||
      profileQuery.isFetching,
    user: profileQuery.data?.data?.user,
    isLoadingProfile: profileQuery.isLoading,
    profileQuery,
  };
};