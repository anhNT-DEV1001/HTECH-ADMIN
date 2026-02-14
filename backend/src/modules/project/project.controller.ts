import { Body, Controller, Post } from "@nestjs/common";
import { ProjectService } from "./project.service";
import { AuthUser, RequirePermissions } from "src/common/decorators";
import { RoleConstant } from "src/common/constants";
import type { Project, ProjectCategory, User } from "@prisma/client";
import { CreateProjectCategoryDto, CreateProjectDto } from "./dto";
import { BaseResponse } from "src/common/apis";

@Controller("project")
export class ProjectController {
  constructor(private readonly projectService: ProjectService) { }

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

}