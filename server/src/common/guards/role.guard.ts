import { CanActivate, ExecutionContext, Injectable, HttpStatus } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { IAuth } from 'src/modules/auth/interfaces';
import { ApiError } from '../apis';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredPermissions) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user as IAuth;

    if (!user || !user.permission) {
      throw new ApiError('Bạn không có quyền truy cập !', HttpStatus.FORBIDDEN);
    }

    const controllerPath = this.reflector.get<string | string[]>('path', context.getClass());
    
    // Normalize path to string (take first if array)
    const path = Array.isArray(controllerPath) ? controllerPath[0] : controllerPath;

    if (!path) {
      return false;
    }

    const permission = user.permission.find((p) => {
      const pHerf = p.herf.replace(/^\//, '');
      const cPath = path.replace(/^\//, '');
      return pHerf === cPath;
    });

    if (!permission) {
      throw new ApiError('Bạn không có quyền truy cập tài nguyên này !', HttpStatus.FORBIDDEN);
    }

    const hasPermission = requiredPermissions.every((requiredAction) => {
      const action = permission.actions.find((a) => a.action === requiredAction);
      return action && action.is_active;
    });

    if (!hasPermission) {
        throw new ApiError('Bạn không có quyền thực hiện thao tác này !', HttpStatus.FORBIDDEN);
    }

    return true;
  }
}
