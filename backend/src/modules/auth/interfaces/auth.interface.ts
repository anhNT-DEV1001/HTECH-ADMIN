import { Token, User } from '@prisma/client';

export interface IAuthResponse {
  id: number;
  username: string;
  email?: string;
  fullName?: string;
  phone?: string;
  dob?: Date;
  created_at?: Date;
  updated_at?: Date;
}

export interface ITokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface ILoginResponse {
  user: IAuthResponse;
  token: ITokenResponse;
}

export interface IAuth {
  user: User;
  token: Token;
}
