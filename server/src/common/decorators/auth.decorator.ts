import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { IAuth } from 'src/modules/auth/interfaces';
/**
 * @author Nguyen Tuan Anh
 * @sumary Lấy thông tin user đăng nhập
 */
export const AuthUser = createParamDecorator(
  (data: keyof IAuth | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const authPayload = request.user as IAuth;
    if (!authPayload) {
      return null;
    }
    if (data) {
      return authPayload[data];
    }
    return authPayload;
  },
);
