import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { AuthUser, RequirePermissions } from "src/common/decorators";
import { RoleConstant } from "src/common/constants";
import type { Project, ProjectCategory, User } from "@prisma/client";
import { CreateProjectCategoryDto, CreateProjectDto, ProjectDto } from "./dto";
import { ApiError, BaseResponse } from "src/common/apis";
import type { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { multerOptions } from "src/configs";
import { DeleteFileOnErrorFilter } from "src/common/interceptors";

@Controller("project")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

  @Get()
  @RequirePermissions(RoleConstant.VIEW)
  async getAllProjectController(
    @Query() query: IPaginationRequest
  ): Promise<BaseResponse<IPaginationResponse<Project>>> {
    const res = await this.projectService.getAllProjectService(query);
    return {
      status: 'success',
      message: 'successfully get all projects',
      data: res,
    }
  }

  @Get('category')
  async getListProjectCategoryController() {
    const res = await this.projectService.getAllProjectCategoryService();
    // console.log('flag get news category controller')
    return {
      status: 'success',
      message: 'Success getting list of news',
      data: res,
    }
  }

  @Get(':id')
  @RequirePermissions(RoleConstant.VIEW)
  async getProjectByIdController(@Param('id') id: number) {
    const res = await this.projectService.getProjectByIdService(id);
    return {
      status: 'success',
      message: 'successfully get project with id ' + id,
      data: res,
    }
  }

  @Post('category')
  @RequirePermissions(RoleConstant.CREATE)
  async createProjectCategoryController(
    @AuthUser('user') user: User,
    @Body() dto: CreateProjectCategoryDto,
  ): Promise<BaseResponse<ProjectCategory>> {
    const res = await this.projectService.createProjectCategoryService(dto, user);
    return {
      status: 'success',
      message: 'successfully create project category',
      data: res,
    }
  }

  @Post()
  @RequirePermissions(RoleConstant.CREATE)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ], multerOptions('htech', 'project'),
  ), DeleteFileOnErrorFilter)
  async createProjectController(
    @AuthUser('user') user: User,
    @Body() dto: CreateProjectDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
  ): Promise<BaseResponse<Project>> {
    if (files?.thumbnail && files.thumbnail[0]) {
      const thumbPath = files.thumbnail[0].path.replace(/\\/g, '/').split('public')[1];
      dto.thumbnail_url = thumbPath;
    }

    // Parse các field dạng string từ FormData sang đúng kiểu
    if (typeof dto.category_id === 'string') dto.category_id = Number(dto.category_id);
    if (typeof dto.sort_order === 'string') dto.sort_order = Number(dto.sort_order);
    if (typeof dto.is_featured === 'string') dto.is_featured = dto.is_featured === 'true';

    const res = await this.projectService.createProjectService(dto, user);
    return {
      status: 'success',
      message: 'successfully create project',
      data: res,
    }
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  @UseInterceptors(FileFieldsInterceptor(
    [
      { name: 'thumbnail', maxCount: 1 },
      { name: 'images', maxCount: 10 },
    ], multerOptions('htech', 'project'),
  ), DeleteFileOnErrorFilter)
  async updateProjectController(
    @AuthUser('user') user: User,
    @Param('id') id: number,
    @Body() dto: ProjectDto,
    @UploadedFiles() files: { thumbnail?: Express.Multer.File[], images?: Express.Multer.File[] }
  ): Promise<BaseResponse<Project>> {
    if (files?.thumbnail && files.thumbnail[0]) {
      dto.thumbnail_url = files.thumbnail[0].path.replace(/\\/g, '/').split('public')[1];
    }

    // Parse các field dạng string từ FormData sang đúng kiểu
    if (typeof dto.category_id === 'string') dto.category_id = Number(dto.category_id);
    if (typeof dto.sort_order === 'string') dto.sort_order = Number(dto.sort_order);
    if (typeof dto.is_featured === 'string') dto.is_featured = (dto.is_featured as any) === 'true';

    const res = await this.projectService.updateProjectService(dto, id, user);
    return {
      status: 'success',
      message: 'successfully update project',
      data: res,
    }
  }

  @Delete(':id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteProjectController(
    @Param('id') id: number,
  ) {
    await this.projectService.deleteProjectService(id);
    return {
      status: 'success',
      message: 'delete project successfully',
      data: null,
    }
  }

  @Delete('category/:id')
  @RequirePermissions(RoleConstant.DELETE)
  async deleteProjectCategoryController(
    @Param('id') id: number
  ): Promise<BaseResponse<any>> {
    const res = await this.projectService.deleteProjectCategoryService(id);
    return {
      status: 'success',
      message: 'success deleting news category',
      data: res
    }
  }
}