import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { Token, User, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { ApiError } from 'src/common/apis';
import { key } from 'src/configs';
import { PrismaService } from 'src/prisma/prisma.service';
import { LoginDto, PayloadDto, RegisterDto } from './dto';
import { IAuthResponse, ILoginResponse, ITokenResponse } from './interfaces';
import { AuthResponse } from './response';
import { PermissionService } from '../permission/permission.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly permissionService: PermissionService,
  ) { }
  /**
   * @author Nguyễn Tuấn Anh
   * @Meno Api Đăng ký, có sử dụng transaction
   * Cải tiến thêm : Đang hard code role mặc định, Nên lấy từ bảng datamaster
   * @param dto
   * @return IAuthResponse
   */
  async register(dto: RegisterDto): Promise<IAuthResponse | any> {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    // Sử dụng transaction do cần thêm nhiều bản ghi trong một service
    try {
      await this.prisma.$transaction(async (db) => {
        const toCreate = {
          username: dto.username,
          password: hashedPassword,
          email: dto.email,
          fullName: dto.fullName,
          phone: dto.phone,
          dob: dto.dob,
        } as User;
        // Tạo mới user
        const newUser = await db.user.create({ data: toCreate });
        if (!newUser)
          throw new ApiError('Đăng ký thất bại !', HttpStatus.BAD_REQUEST);
        const initUserRole = {
          role_id: 1,
          user_id: newUser.id,
        } as UserRole;
        // Thêm role mặc định
        await db.userRole.create({ data: initUserRole });
        const authResponse = new AuthResponse(newUser).mapToAuthResponse();
        return authResponse;
      });
    } catch (error: any) {
      throw new ApiError(
        `Lỗi hệ thống: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  /**
   * @author Nguyễn Tuấn Anh
   * @summary Hàm thêm tạo accessToken và refreshToken
   * @param userId
   * @param username
   * @returns
   */
  async generateTokens(
    userId: number,
    username: string,
  ): Promise<ITokenResponse> {
    const payload = {
      sub: userId,
      username,
    } as PayloadDto;
    const accessToken = await this.jwtService.signAsync(payload, {
      secret: key.jwt.access_secret,
      expiresIn: key.jwt.access_exprise,
    } as JwtSignOptions);

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret: key.jwt.refresh_secret,
      expiresIn: key.jwt.refresh_exprise,
    } as JwtSignOptions);
    return {
      accessToken,
      refreshToken,
    };
  }

  /**
   * @author Nguyễn Tuấn Anh
   * @sumary Logic đăng nhập
   * Đăng nhập thành công, Tạo phiên mới + set lại token mới
   * @param dto
   * @param ip
   * @param useragent
   * @returns
   */
  async login(
    dto: LoginDto,
    ip: string,
    useragent: string,
  ): Promise<ILoginResponse> {
    const user = await this.prisma.user.findUnique({
      where: { username: dto.username },
    });
    if (!user)
      throw new ApiError('Người dùng không tồn tại !', HttpStatus.BAD_REQUEST);
    const isPassword = await bcrypt.compare(dto.password, user.password);
    if (!isPassword)
      throw new ApiError('Mật khẩu không hợp lệ !', HttpStatus.BAD_REQUEST);
    const newTokens = await this.generateTokens(user.id, user.username);
    const loginRes = new AuthResponse(user).mapToLoginResponse(newTokens);
    // lưu vào DB (Tạo nếu đã tồn tại và cập nhật nếu có)
    const tokenData = {
      user_id: user.id,
      token: await bcrypt.hash(newTokens.refreshToken, 10),
      ip: ip,
      agent: useragent,
      created_by: user.id,
      updated_by: user.id,
    } as Token;
    const tokenFlag = await this.prisma.token.findUnique({
      where: { user_id: user.id },
    });
    if (tokenFlag) {
      await this.prisma.token.update({
        where: { user_id: user.id },
        data: tokenData,
      });
    } else await this.prisma.token.create({ data: tokenData });
    return loginRes;
  }

  /**
   * @author Nguyễn Tuấn Anh
   * @sumary Logic logout cần xóa phiên đăng nhập
   * @param user
   * @returns
   */
  async logout(user: User): Promise<IAuthResponse> {
    // const token = await this.prisma.token.update({
    //   where: { user_id: user.id },
    //   data : {
    //     token: "",
    //     updated_by: user.id,
    //   }
    // });
    // if (!token)
    //   throw new ApiError('Người dùng không hợp lệ !', HttpStatus.BAD_REQUEST);

    const res = new AuthResponse(user).mapToAuthResponse();
    return res;
  }

  async refreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<ITokenResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user)
      throw new ApiError('Người dùng không hợp lệ !', HttpStatus.BAD_REQUEST);
    const existToken = await this.prisma.token.findUnique({
      where: { user_id: user.id },
    });
    if (!existToken || !existToken.token)
      throw new ApiError('Người dùng chưa đăng nhập !', HttpStatus.BAD_REQUEST);
    const isMatch = await bcrypt.compare(refreshToken, existToken.token);
    if (!isMatch)
      throw new ApiError('Token không hợp lệ !', HttpStatus.BAD_REQUEST);

    const newToken = await this.generateTokens(userId, user.username);

    // Update the hashed refresh token in DB
    await this.prisma.token.update({
      where: { user_id: user.id },
      data: {
        token: await bcrypt.hash(newToken.refreshToken, 10),
        updated_by: user.id,
      },
    });

    return newToken;
  }

  async getAuthPermissions(user: User) {
    const permission = await this.permissionService.getUserPermission(user.id)
    return permission
  }
}
