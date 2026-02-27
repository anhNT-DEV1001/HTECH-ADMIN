import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProjectCategoryDto, CreateProjectDto, CreateProjectImageDto, ProjectDto, ProjectImageDto } from "./dto";
import { Prisma, Project, User } from "@prisma/client";
import { ApiError } from "src/common/apis";
import { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";
import { deleteFileFromPublic } from "src/common/utils";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove diacritics
    .replace(/đ/g, 'd').replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '') // remove non-alphanumeric
    .trim()
    .replace(/\s+/g, '-') // spaces to hyphens
    .replace(/-+/g, '-'); // collapse multiple hyphens
}

@Injectable()
export class ProjectService {
  constructor(private readonly prisma: PrismaService) { };

  async createProjectCategoryService(dto: CreateProjectCategoryDto, user: User) {
    try {
      const slug = slugify(dto.name_vn);

      // Kiểm tra slug đã tồn tại chưa
      const existing = await this.prisma.projectCategory.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new ApiError('Category đã tồn tại với tên tương tự', HttpStatus.BAD_REQUEST);
      }

      const createdCategory = await this.prisma.projectCategory.create({
        data: {
          name_vn: dto.name_vn,
          name_en: dto.name_en || '',
          slug,
          created_by: user.id,
          updated_by: user.id,
        },
      });

      if (!createdCategory) {
        throw new ApiError('Failed creating project category', HttpStatus.BAD_REQUEST);
      }
      return createdCategory;
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }


  async createProjectService(dto: CreateProjectDto, user: User) {
    try {
      return await this.prisma.$transaction(async (db) => {
        const baseSlug = slugify(dto.title_vn);
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        const projectData = {
          title_vn: dto.title_vn,
          slug,
          summary_vn: dto.summary_vn,
          description_vn: dto.description_vn,

          title_en: dto.title_en || '',
          summary_en: dto.summary_en || '',
          description_en: dto.description_en || '',

          thumbnail_url: dto.thumbnail_url || '',
          client_name: dto.client_name || '',
          venue_vn: dto.venue_vn || '',
          venue_en: dto.venue_en || '',
          location_url: dto.location_url || '',
          start_date: dto.start_date,
          end_date: dto.end_date || null,
          scale: dto.scale || '',
          industry_vn: dto.industry_vn || '',
          industry_en: dto.industry_en || '',

          status: dto.status || 'UPCOMING',
          is_featured: dto.is_featured || false,
          sort_order: dto.sort_order || 0,

          category: { connect: { id: dto.category_id } },

          created_by: user.id,
          updated_by: user.id,

          projectImages: dto.projectImages && dto.projectImages.length > 0
            ? {
              create: dto.projectImages.map((dtoImage: CreateProjectImageDto) => ({
                image_url: dtoImage.image_url,
                alt_text: dtoImage.alt_text || '',
                sort_order: dtoImage.sort_order || 1,
                created_by: user.id,
                updated_by: user.id,
              }))
            } : undefined,
        };

        const createdProject = await db.project.create({ data: projectData });

        if (!createdProject) {
          throw new ApiError('Failed creating project', HttpStatus.BAD_REQUEST);
        }
        return createdProject;
      });
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllProjectService(query: IPaginationRequest): Promise<IPaginationResponse<Project>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortBy = 'desc',
      search,
      searchBy = 'title_vn'
    } = query;

    const skip = (Number(page) - 1) * Number(limit)
    const take = Number(limit)
    const where: Prisma.ProjectWhereInput = {}

    if (search && searchBy) {
      const validSearchFields = ['title_vn', 'title_en', 'client_name', 'industry_vn'];
      const field = validSearchFields.includes(searchBy) ? searchBy : 'title_vn';
      where[field] = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    const validOrderFields = ['id', 'title_vn', 'created_at', 'updated_at', 'sort_order', 'start_date'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const orderCondition: Prisma.ProjectOrderByWithRelationInput = {
      [orderField]: sortBy.toLowerCase() === 'desc' ? 'desc' : 'asc'
    };

    const [records, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        skip,
        take,
        orderBy: orderCondition,
        include: {
          category: true,
          projectImages: true,
        }
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      records,
      meta: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / Number(limit)),
      }
    }
  }

  async getProjectByIdService(projectId: number) {
    const data = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        category: true,
        projectImages: true,
      }
    })
    if (!data) throw new ApiError("Không tìm thấy dự án với id: " + projectId, HttpStatus.NOT_FOUND);
    return data;
  }

  async updateProjectService(dto: ProjectDto, id: number, user: User) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: { projectImages: true },
      });

      if (!project) throw new ApiError('Không tìm thấy project', HttpStatus.NOT_FOUND);
      const filesToDelete: string[] = [];

      if (dto.thumbnail_url && dto.thumbnail_url !== project.thumbnail_url) {
        filesToDelete.push(project.thumbnail_url as any);
      }

      if (dto.projectImages && Array.isArray(dto.projectImages)) {
        const newImageUrls = dto.projectImages.map(img => img.image_url).filter(url => url);
        const oldImageUrls = project.projectImages.map(img => img.image_url);
        const imagesToDelete = oldImageUrls.filter(oldUrl => !newImageUrls.includes(oldUrl));

        filesToDelete.push(...imagesToDelete);
      }

      const newSlug = dto.title_vn ? `${slugify(dto.title_vn)}-${Date.now()}` : project.slug;

      const projectData = {
        title_vn: dto.title_vn || project.title_vn,
        slug: newSlug,
        summary_vn: dto.summary_vn || project.summary_vn,
        description_vn: dto.description_vn || project.description_vn,

        title_en: dto.title_en || project.title_en,
        summary_en: dto.summary_en || project.summary_en,
        description_en: dto.description_en || project.description_en,

        thumbnail_url: dto.thumbnail_url || project.thumbnail_url,
        client_name: dto.client_name || project.client_name,
        venue_vn: dto.venue_vn || project.venue_vn,
        venue_en: dto.venue_en || project.venue_en,
        location_url: dto.location_url || project.location_url,
        start_date: dto.start_date || project.start_date,
        end_date: dto.end_date || project.end_date,
        scale: dto.scale || project.scale,
        industry_vn: dto.industry_vn || project.industry_vn,
        industry_en: dto.industry_en || project.industry_en,

        status: dto.status || project.status,
        is_featured: dto.is_featured ?? project.is_featured,
        sort_order: dto.sort_order ?? project.sort_order,

        ...(dto.category_id ? { category: { connect: { id: dto.category_id } } } : {}),

        updated_by: user.id,
        updated_at: new Date(),

        projectImages: dto.projectImages && dto.projectImages.length > 0
          ? {
            deleteMany: {},
            create: dto.projectImages.map((dtoImage: ProjectImageDto) => ({
              image_url: dtoImage.image_url || '',
              alt_text: dtoImage.alt_text || '',
              sort_order: dtoImage.sort_order || 1,
              updated_by: user.id,
              updated_at: new Date(),
            }))
          } : {},
      };

      return await this.prisma.$transaction(async (db) => {
        const updatedProject = await db.project.update({
          where: { id },
          data: projectData,
        });

        if (updatedProject) {
          await Promise.all(filesToDelete.map(path => deleteFileFromPublic(path)));
        }

        return updatedProject;
      });
    } catch (error: any) {
      throw new ApiError(`System Error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteProjectService(id: number) {
    try {
      const project = await this.prisma.project.findUnique({
        where: { id },
        include: { projectImages: true },
      });

      if (!project) throw new ApiError("Project không tồn tại", HttpStatus.NOT_FOUND);
      await deleteFileFromPublic(project.thumbnail_url as any);
      return await this.prisma.$transaction(async (db) => {
        await Promise.all(project.projectImages.map(img => deleteFileFromPublic(img.image_url as any)));
        await db.projectImage.deleteMany({
          where: { project_id: id }
        });

        await db.project.delete({
          where: { id }
        });
      });
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}