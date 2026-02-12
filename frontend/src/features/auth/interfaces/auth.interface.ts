export interface IAuthResponse {
  id: number;
  username: string;
  email?: string;
  phone?: string;
  dob?: Date;
  fullName?: string;
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

export interface LoginResquest {
  username: string;
  password: string;
}

export interface ResginterRequest {
  username: string;
  password: string;
  email?: string;
  phone?: string;
  dob?: Date | string;
  fullName?: string;
  
}

export interface IAuth {
  user: IAuthResponse;
  token: ITokenResponse;
}
