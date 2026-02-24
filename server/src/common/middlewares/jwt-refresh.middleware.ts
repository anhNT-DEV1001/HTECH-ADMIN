import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { key } from 'src/configs';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiError } from '../apis';

@Injectable()
export class JwtRefreshMiddleware extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          const token = request?.cookies?.['refreshToken'];
          return token;
        },
      ]),

      secretOrKey: key.jwt.refresh_secret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: any) {
    const refreshToken = req.cookies?.['refreshToken'];
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });

    const tokenInDb = await this.prismaService.token.findUnique({
      where: { user_id: payload.sub },
    });

    if (!user || !tokenInDb) {
      throw new ApiError(
        'Không tìm thấy thông tin xác thực',
        HttpStatus.UNAUTHORIZED,
      );
    }

    return {
      user: user,
      token: tokenInDb, // Đây là object Token từ Prisma chứa field 'token' đã hash
    };
  }
}
