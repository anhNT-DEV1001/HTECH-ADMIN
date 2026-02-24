import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * @author Nguyen Tuan Anh
 * @sumary Lấy thông tin ip đăng nhập
 */
export const UserIP = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const xForwardedFor = request.headers['x-forwarded-for'];
    if (xForwardedFor) {
      return Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : xForwardedFor.split(',')[0].trim();
    }

    return request.socket.remoteAddress || request.ip;
  },
);
