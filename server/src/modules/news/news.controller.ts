import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { NewsService } from "./news.service";
import { AuthUser, RequirePermissions } from "src/common/decorators";
import { RoleConstant } from "src/common/constants";
import type { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";
import { ApiError, BaseResponse } from "src/common/apis";
import type { News, NewsCategory, User } from "@prisma/client";
import { CreateNewsCategoryDto, CreateNewsDto, NewsDto } from "./dto";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/configs";
import { DeleteFileOnErrorFilter } from "src/common/interceptors";

@Controller('news')
export class NewsController {
  constructor(private readonly service: NewsService) { }

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async getListNewsController(
    @Query() query: IPaginationRequest
  ): Promise<BaseResponse<IPaginationResponse<News>>> {
    const res = await this.service.getAllNewsService(query);
    return {
      status: 'success',
      message: 'Success getting list of news',
      data: res,
    }
  }

  @Get('category')
  async getListNewsCategoryController() {
    const res = await this.service.getAllNewsCategoryService();
    // console.log('flag get news category controller')
    return {
      status: 'success',
      message: 'Success getting list of news',
      data: res,
    }
  }

  @Get(':id')
  @RequirePermissions(RoleConstant.VIEW)
  async getNewsByIdController(@Param('id') id: number) {
    const res = await this.service.getNewsById(id);
    return {
      status: 'success',
      message: 'Success getting news by id: ' + id,
      data: res,
    }
  }

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ], multerOptions('htech', 'news'),
  ), DeleteFileOnErrorFilter)
  async createNewsController(
    @AuthUser('user') user: User,
    @Body() dto: CreateNewsDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
  ): Promise<BaseResponse<News>> {

    if (files.thumbnail && files.thumbnail[0]) {
      const thumbPath = files.thumbnail[0].path.replace(/\\/g, '/').split('public')[1];
      dto.thumbnail_url = thumbPath;
    }

    if (files.images && files.images.length > 0 && dto.newsImage) {
      files.images.forEach((file, index) => {
        if (dto.newsImage[index]) {
          const imagePath = file.path.replace(/\\/g, '/').split('public')[1];
          dto.newsImage[index].image_url = imagePath;
        }
      });
    }
    const res = await this.service.createNewsService(dto, user);
    return {
      status: 'success',
      message: 'Success creating news',
      data: res,
    }
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ], multerOptions('htech', 'news'),
  ), DeleteFileOnErrorFilter)
  async updateNewsController(
    @Param('id') id: number,
    @Body() dto: NewsDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
  ): Promise<BaseResponse<News>> {
    if (files.thumbnail && files.thumbnail[0]) {
      dto.thumbnail_url = files.thumbnail[0].path.replace(/\\/g, '/').split('public')[1];
    }

    if (dto.newsImage && typeof dto.newsImage === 'string') {
      try { dto.newsImage = JSON.parse(dto.newsImage as any); } catch (e) { }
    }

    if (dto.newsImage && Array.isArray(dto.newsImage)) {
      let fileIndex = 0;

      dto.newsImage = dto.newsImage.map((item, index) => {
        const isNewImage = !item.image_url || item.image_url.trim() === '';

        if (isNewImage) {
          const currentFile = files.images ? files.images[fileIndex] : undefined;
          if (currentFile) {
            const path = currentFile.path.replace(/\\/g, '/').split('public')[1];
            fileIndex++;
            return { ...item, image_url: path };
          } else {
            throw new ApiError(
              `Bạn đang gửi 2 object ảnh nhưng chỉ upload ${fileIndex} file ảnh. Vui lòng kiểm tra lại Postman tại index ${index}.`,
              HttpStatus.BAD_REQUEST
            );
          }
        }

        return item;
      });
    }
    const res = await this.service.updateNewsService(dto, id);
    return {
      status: 'success',
      message: 'Success updating news',
      data: res
    }
  }

  @Delete(':id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteNewsController(
    @Param('id') id: number
  ): Promise<BaseResponse<any>> {
    // console.log("flag controller delete")
    const res = await this.service.deleteNewsService(id);
    return {
      status: 'success',
      message: 'Success deleting news',
      data: res
    }
  }

  @Post('category')
  @RequirePermissions(RoleConstant.CREATE)
  async createNewsCategoryController(
    @AuthUser('user') user: User,
    @Body() dto: CreateNewsCategoryDto,
  ): Promise<BaseResponse<any>> {
    const res = await this.service.createNewsCategoryService(dto, user);
    return {
      status: 'success',
      message: 'Success creating news category',
      data: res,
    }
  }


  @Delete('category/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteNewsCategoryController(
    @Param('id') id: number
  ): Promise<BaseResponse<any>> {
    const res = await this.service.deleteNewsCategoryService(id);
    return {
      status: 'success',
      message: 'success deleting news category',
      data: res
    }
  }
}