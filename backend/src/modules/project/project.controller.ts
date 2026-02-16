import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { AuthUser, RequirePermissions } from "src/common/decorators";
import { RoleConstant } from "src/common/constants";
import type { Project, ProjectCategory, User } from "@prisma/client";
import { CreateProjectCategoryDto, CreateProjectDto, ProjectDto } from "./dto";
import { BaseResponse } from "src/common/apis";
import type { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";

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
  async createProjectController(
    @AuthUser('user') user: User,
    @Body() dto: CreateProjectDto,
  ): Promise<BaseResponse<Project>> {
    const res = await this.projectService.createProjectService(dto, user);
    return {
      status: 'success',
      message: 'successfully create project',
      data: res,
    }
  }

  @Patch(':id')
  @RequirePermissions(RoleConstant.UPDATE)
  async updateProjectController(
    @AuthUser('user') user: User,
    @Param('id') id: number,
    @Body() dto: ProjectDto,
  ): Promise<BaseResponse<Project>> {
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