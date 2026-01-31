import { HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { key } from 'src/configs';
import { PayloadDto } from 'src/modules/auth/dto';
import { IAuth } from 'src/modules/auth/interfaces';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiError } from '../apis';

@Injectable()
export class JwtMiddleware extends PassportStrategy(Strategy, 'jwt') {
  constructor(private readonly prismaService: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => {
          let token = null;
          if (request && request.cookies) {
            token = request.cookies['accessToken'];
          }
          return token;
        },
      ]),
      ignoreExpiration: false,
      secretOrKey: key.jwt.access_secret,
    });
  }

  async validate(payload: PayloadDto): Promise<IAuth> {
    const user = await this.prismaService.user.findUnique({
      where: { id: payload.sub },
    });
    if (!user)
      throw new ApiError('User không tồn tại', HttpStatus.UNAUTHORIZED);
    const token = await this.prismaService.token.findUnique({
      where: { user_id: user.id },
    });
    if (!token)
      throw new ApiError('Token không hợp lệ', HttpStatus.UNAUTHORIZED);
    return { user, token };
  }
}
