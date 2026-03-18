import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { AuthUser, Public, RequirePermissions } from "src/common/decorators";
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

  @Public()
  @Get('htech/outstanding')
  async getOutStandingProjectController() {
    const res = await this.projectService.getOutStandingProjectService();
    return {
      status: 'success',
      message: 'Success getting list of outstanding projects',
      data: res,
    }
  }

  @Public()
  @Get('htech/all')
  async getPublicProjectsController(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('search') search?: string,
    @Query('category_id') category_id?: number,
  ) {
    const res = await this.projectService.getPublicProjectsService({ page, limit, search, category_id });
    return {
      status: 'success',
      message: 'Success getting all public projects',
      data: res,
    };
  }

  @Public()
  @Get('htech/categories')
  async getPublicCategoriesController() {
    const res = await this.projectService.getPublicCategoriesService();
    return {
      status: 'success',
      message: 'Success getting project categories',
      data: res,
    };
  }

  @Public()
  @Get('htech/:id')
  async getPublicProjectByIdController(@Param('id') id: number) {
    const res = await this.projectService.getProjectByIdService(id);
    return {
      status: 'success',
      message: 'Success getting project detail',
      data: res,
    };
  }

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
      message: 'Tạo danh mục dự án thành công !',
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

    if (files?.images && files.images.length > 0) {
      dto.projectImages = files.images.map((img, idx) => ({
        image_url: img.path.replace(/\\/g, '/').split('public')[1],
        alt_text: '',
        sort_order: idx + 1,
      })) as any;
    }

    const res = await this.projectService.createProjectService(dto, user);
    return {
      status: 'success',
      message: 'Tạo dự án thành công !',
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

    // Parse ảnh cũ muốn giữ lại
    let keepImages: { image_url: string; alt_text: string; sort_order: number }[] = [];
    if ((dto as any).keepImageUrls) {
      try {
        const urls = JSON.parse((dto as any).keepImageUrls as string) as string[];
        keepImages = urls.map((url, idx) => ({ image_url: url, alt_text: '', sort_order: idx + 1 }));
      } catch { /* ignore parse error */ }
    }

    // Merge ảnh cũ giữ lại + ảnh mới upload
    const newImages = (files?.images ?? []).map((img, idx) => ({
      image_url: img.path.replace(/\\/g, '/').split('public')[1],
      alt_text: '',
      sort_order: keepImages.length + idx + 1,
    }));

    if (keepImages.length > 0 || newImages.length > 0) {
      dto.projectImages = [...keepImages, ...newImages] as any;
    }

    const res = await this.projectService.updateProjectService(dto, id, user);
    return {
      status: 'success',
      message: 'Cập nhật dự án thành công !',
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
      message: 'Xóa dự án thành công !',
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
      message: 'Xóa danh mục dự án thành công !',
      data: res
    }
  }
}