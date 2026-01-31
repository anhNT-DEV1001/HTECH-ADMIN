import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import type { User } from '@prisma/client';
import type { Request, Response } from 'express';
import { BaseResponse } from 'src/common/apis';
import { AuthUser, Public, UserAgent, UserIP } from 'src/common/decorators';
import { JwtRefreshGuard } from 'src/common/guards';
import { getCookieConfig } from 'src/configs';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto } from './dto';
import type {
  IAuth,
  IAuthResponse,
  ILoginResponse,
  ITokenResponse,
} from './interfaces';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginController(
    @Body() dto: LoginDto,
    @UserIP() ip: string,
    @UserAgent() userAgent: string,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponse<ILoginResponse>> {
    const res = await this.authService.login(dto, ip, userAgent);
    response.cookie(
      'accessToken',
      res.token.accessToken,
      getCookieConfig.accessToken,
    );
    response.cookie(
      'refreshToken',
      res.token.refreshToken,
      getCookieConfig.refreshToken,
    );
    return {
      status: 'success',
      message: 'Đăng nhập thành công !',
      data: res,
    };
  }

  @Public()
  @Post('register')
  async registerController(
    @Body() dto: RegisterDto,
  ): Promise<BaseResponse<IAuthResponse>> {
    const res = await this.authService.register(dto);
    return {
      status: 'success',
      message: 'Đăng ký thành công !',
      data: res,
    };
  }

  @Post('logout')
  async logoutController(
    @AuthUser('user') user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponse<IAuthResponse>> {
    const res = await this.authService.logout(user);
    response.clearCookie('accessToken', { path: '/' });
    response.clearCookie('refreshToken', { path: '/api/v1/auth/refresh' });
    return {
      status: 'success',
      message: 'Đăng xuất thành công !',
      data: res,
    };
  }

  @Public()
  @UseGuards(JwtRefreshGuard)
  @Post('refresh')
  async refreshController(
    // dto : any,
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ): Promise<BaseResponse<ITokenResponse>> {
    const { user, token } = req.user as IAuth;
    const refreshFormCookies = req.cookies['refreshToken'];

    const res = await this.authService.refreshToken(
      user.id,
      refreshFormCookies,
    );
    response.cookie(
      'accessToken',
      res.accessToken,
      getCookieConfig.accessToken,
    );
    response.cookie(
      'refreshToken',
      res.refreshToken,
      getCookieConfig.refreshToken,
    );
    return {
      status: 'success',
      message: 'Refresh thành công !',
      data: res,
    };
  }

  @Get('me')
  async getMe(
    @AuthUser() auth: IAuth,
    @Req() req: Request,
  ): Promise<BaseResponse<IAuth>> {
    const userReq = req;
    console.log(userReq);
    return {
      status: 'success',
      message: '',
      data: auth,
    };
  }
}
