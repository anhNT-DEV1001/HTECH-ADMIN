import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { CompanyService } from './company.service';
import { AuthUser, Public, RequirePermissions } from 'src/common/decorators';
import { RoleConstant } from 'src/common/constants';
import type { CompanyInfo, User } from '@prisma/client';
import { CreateCompanyDto, UpdateCompanyDto } from './dto';
import { BaseResponse } from 'src/common/apis';
import type { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerMediaOptions } from 'src/configs';
import { DeleteFileOnErrorFilter } from 'src/common/interceptors';

@Controller('company')
export class CompanyController {
  constructor(private readonly companyService: CompanyService) {}

  @Public()
  @Get('get-company-info')
  async getPublicCompanyInfoController() {
    const res = await this.companyService.getPublicInfoService();
    return {
      status: 'success',
      message: 'Lấy thông tin công ty thành công',
      data: res,
    };
  }

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async getAllCompanyController(
    @Query() query: IPaginationRequest
  ): Promise<BaseResponse<IPaginationResponse<CompanyInfo>>> {
    const res = await this.companyService.getAllCompanyService(query);
    return {
      status: 'success',
      message: 'Lấy danh sách công ty thành công',
      data: res,
    };
  }

  @Get(':id')
  @RequirePermissions(RoleConstant.VIEW)
  async getCompanyByIdController(@Param('id') id: string) {
    const res = await this.companyService.getCompanyByIdService(+id);
    return {
      status: 'success',
      message: 'Lấy thông tin công ty thành công',
      data: res,
    };
  }

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  @UseInterceptors(
    FileInterceptor('banner', multerMediaOptions('htech', 'company')),
    DeleteFileOnErrorFilter
  )
  async createCompanyController(
    @AuthUser('user') user: User,
    @Body() dto: CreateCompanyDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<BaseResponse<CompanyInfo>> {
    if (file) {
      dto.banner = file.path.replace(/\\/g, '/').split('public')[1];
    }
    const res = await this.companyService.createCompanyService(dto, user);
    return {
      status: 'success',
      message: 'Tạo thông tin công ty thành công!',
      data: res,
    };
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(
    FileInterceptor('banner', multerMediaOptions('htech', 'company')),
    DeleteFileOnErrorFilter
  )
  async updateCompanyController(
    @AuthUser('user') user: User,
    @Param('id') id: string,
    @Body() dto: UpdateCompanyDto,
    @UploadedFile() file?: Express.Multer.File
  ): Promise<BaseResponse<CompanyInfo>> {
    if (file) {
      dto.banner = file.path.replace(/\\/g, '/').split('public')[1];
    }
    const res = await this.companyService.updateCompanyService(dto, +id, user);
    return {
      status: 'success',
      message: 'Cập nhật thông tin công ty thành công!',
      data: res,
    };
  }

  @Delete(':id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteCompanyController(
    @Param('id') id: string
  ): Promise<BaseResponse<any>> {
    const res = await this.companyService.deleteCompanyService(+id);
    return {
      status: 'success',
      message: 'Xóa thông tin công ty thành công!',
      data: res,
    };
  }
}
