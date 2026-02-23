import axiosClient from "@/lib/axios";
import { BaseResponse } from "@/common/types";
import {
  IAuth,
  IAuthResponse,
  ILoginResponse,
  ITokenResponse,
  LoginResquest,
  ResginterRequest,
} from "../interfaces";

export const authService = {
  async login(request: LoginResquest): Promise<BaseResponse<ILoginResponse>> {
    const response = await axiosClient.post("/auth/login", request);
    return response.data;
  },

  async logout(): Promise<BaseResponse<IAuthResponse>> {
    const response = await axiosClient.post("/auth/logout");
    return response.data;
  },

  async refreshToken(): Promise<BaseResponse<ITokenResponse>> {
    const response = await axiosClient.post("/auth/refresh");
    return response.data;
  },

  async register(
    request: ResginterRequest
  ): Promise<BaseResponse<IAuthResponse>> {
    const response = await axiosClient.post("/auth/register", request);
    return response.data;
  },

  async getMe(): Promise<BaseResponse<IAuth>> {
    const response = await axiosClient.get("/auth/me");
    return response.data;
  },
};
