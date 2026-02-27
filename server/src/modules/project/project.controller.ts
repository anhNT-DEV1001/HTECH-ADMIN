import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { AuthUser, RequirePermissions } from "src/common/decorators";
import { RoleConstant } from "src/common/constants";
import type { Project, ProjectCategory, User } from "@prisma/client";
import { CreateProjectCategoryDto, CreateProjectDto, ProjectDto } from "./dto";
import { ApiError, BaseResponse } from "src/common/apis";
import type { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { DeleteFileOnErrorFilter } from "src/common/interceptors";
import { multerOptions } from "src/configs";

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
    if (files.thumbnail && files.thumbnail[0]) {
      const thumbPath = files.thumbnail[0].path.replace(/\\/g, '/').split('public')[1];
      dto.thumbnail_url = thumbPath;
    }
    if (files.images && files.images.length > 0 && dto.projectImages) {
      files.images.forEach((file, index) => {
        if (dto.projectImages[index]) {
          const imagePath = file.path.replace(/\\/g, '/').split('public')[1];
          dto.projectImages[index].image_url = imagePath;
        }
      });
    }
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
    if (files.thumbnail && files.thumbnail[0]) {
      dto.thumbnail_url = files.thumbnail[0].path.replace(/\\/g, '/').split('public')[1];
    }
    if (dto.projectImages && typeof dto.projectImages === 'string') {
      try { dto.projectImages = JSON.parse(dto.projectImages as any); } catch (e) { }
    }

    if (dto.projectImages && Array.isArray(dto.projectImages)) {
      let fileIndex = 0;
      dto.projectImages = dto.projectImages.map((item, index) => {
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
}