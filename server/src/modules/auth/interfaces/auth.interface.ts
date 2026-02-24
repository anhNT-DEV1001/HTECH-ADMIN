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

export interface Action {
  id: number;
  action: string;
  resource_detail_alias: string;
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
  is_active: boolean;
}

export interface IPermission {
  id: number;
  alias: string;
  parent_alias: string;
  is_active: boolean;
  icon: string;
  herf: string;
  actions: Action[];
  created_at: Date;
  updated_at: Date;
  created_by: number;
  updated_by: number;
}

export interface IAuth {
  user: User;
  token: Token;
  permission: IPermission[];
}


// {
//     "id": 17,
//     "action": "Thêm",
//     "resource_detail_alias": "UserManagerment",
//     "created_at": "2026-02-06T13:13:48.466Z",
//     "updated_at": "2026-02-06T13:13:48.466Z",
//     "created_by": 1,
//     "updated_by": 1,
//     "is_active": true
// },

// "id": 43,
// "alias": "UserManagerment",
// "parent_alias": "Root",
// "is_active": true,
// "icon": null,
// "herf": "/users",
// "created_at": "2026-02-06T13:08:26.336Z",
// "updated_at": "2026-02-06T13:08:26.336Z",
// "created_by": 1,
// "updated_by": 1,