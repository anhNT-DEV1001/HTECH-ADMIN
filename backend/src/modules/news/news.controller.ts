import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { NewsService } from "./news.service";
import { AuthUser, RequirePermissions } from "src/common/decorators";
import { RoleConstant } from "src/common/constants";
import type { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";
import { BaseResponse } from "src/common/apis";
import type { News, User } from "@prisma/client";
import { CreateNewsDto, NewsDto } from "./dto";

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
  async createNewsController(
    @AuthUser('user') user: User,
    @Body() dto: CreateNewsDto,
  ): Promise<BaseResponse<News>> {
    const res = await this.service.createNewsService(dto, user);
    return {
      status: 'success',
      message: 'Success creating news',
      data: res,
    }
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateNewsController(
    @Param('id') id: number,
    @Body() dto: NewsDto
  ): Promise<BaseResponse<News>> {
    const res = await this.service.updateNewsService(dto, id);
    return {
      status: 'success',
      message: 'Success updating news',
      data: res
    }
  }


  @Post(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  async deleteNewsController(
    @Param('id') id: number
  ): Promise<BaseResponse<News>> {
    const res = await this.service.deleteNewsService(id);
    return {
      status: 'success',
      message: 'Success deleting news',
      data: res
    }
  }
}