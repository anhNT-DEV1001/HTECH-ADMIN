import { User } from '@prisma/client';
import { IAuthResponse, ILoginResponse, ITokenResponse } from '../interfaces';

export class AuthResponse {
  constructor(private user: User) {}
  mapToAuthResponse(): IAuthResponse {
    return Object.keys(this.user).reduce((userObj, key) => {
      if (key !== 'password') {
        userObj[key] = this.user[key];
      }
      return userObj;
    }, {} as IAuthResponse);
  }
  mapToLoginResponse(token: ITokenResponse): ILoginResponse {
    const userRes = this.mapToAuthResponse();
    return {
      user: userRes,
      token: token,
    } as ILoginResponse;
  }
}
