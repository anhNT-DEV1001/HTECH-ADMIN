import { Module } from '@nestjs/common';
import { JwtModule, JwtSignOptions } from '@nestjs/jwt';
import { JwtMiddleware, JwtRefreshMiddleware } from 'src/common/middlewares';
import { key } from 'src/configs';
import { PrismaModule } from 'src/prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
@Module({
  imports: [
    PrismaModule,
    JwtModule.registerAsync({
      useFactory: async () => ({
        secret: key.jwt.access_secret,
        signOptions: {
          expiresIn: key.jwt.access_exprise,
        } as JwtSignOptions,
      }),
    }),
  ],
  providers: [AuthService, JwtMiddleware, JwtRefreshMiddleware],
  controllers: [AuthController],
  exports: [JwtMiddleware],
})
export class AuthModule {}
