import { HttpStatus, Injectable } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { CreateProjectCategoryDto, CreateProjectDto, CreateProjectImageDto } from "./dto";
import { User } from "@prisma/client";
import { ApiError } from "src/common/apis";

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
}