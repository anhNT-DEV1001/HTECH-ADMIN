import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @author Nguyen Tuan Anh
 * @summary Lấy thông tin thiết bị đăng nhập
 */
export const UserAgent = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.headers['user-agent'];
  },
);
