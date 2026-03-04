import { HttpStatus, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateJobDto, CreateFieldOfWorkDto, JobDto } from './dto';
import { Prisma, Job, User } from '@prisma/client';
import { ApiError } from 'src/common/apis';
import { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';

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
export class JobsService {
  constructor(private readonly prisma: PrismaService) { }

  async findAllFieldsOfWork() {
    try {
      const data = await this.prisma.fieldOfWork.findMany({
        orderBy: { created_at: 'desc' },
      });
      if (!data) throw new ApiError('Danh sách Field of Work không tồn tại', HttpStatus.BAD_REQUEST);
      return data;
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async createFieldOfWork(dto: CreateFieldOfWorkDto, user: User) {
    try {
      const slug = slugify(dto.name_vn);

      const existing = await this.prisma.fieldOfWork.findUnique({
        where: { slug }
      });

      if (existing) {
        throw new ApiError('Field of work đã tồn tại với tên tương tự', HttpStatus.BAD_REQUEST);
      }

      const field = await this.prisma.fieldOfWork.create({
        data: {
          name_vn: dto.name_vn,
          name_en: dto.name_en || '',
          slug,
          created_by: user.id
        }
      });

      if (!field) {
        throw new ApiError('Failed creating field of work', HttpStatus.BAD_REQUEST);
      }
      return field;
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteFieldOfWorkService(id: number) {
    return await this.prisma.$transaction(async (db) => {
      try {
        const fieldOfWork = await this.prisma.fieldOfWork.findUnique({
          where: { id }
        });

        if (!fieldOfWork) throw new ApiError('Không tìm thấy Field of Work', HttpStatus.NOT_FOUND);
        await db.job.deleteMany({ where: { field_of_work_id: id } })

        return db.fieldOfWork.delete({
          where: { id },
        });
      } catch (error: any) {
        throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
      }
    })
  }

  async createJobService(dto: CreateJobDto, user: User) {
    try {
      return await this.prisma.$transaction(async (db) => {
        const baseSlug = slugify(dto.title_vn);
        const timestamp = Date.now();
        const slug = `${baseSlug}-${timestamp}`;

        const jobData = {
          title_vn: dto.title_vn,
          title_en: dto.title_en || '',
          slug,
          job_type_vn: dto.job_type_vn || '',
          job_type_en: dto.job_type_en || '',
          experience_vn: dto.experience_vn || '',
          experience_en: dto.experience_en || '',
          description_vn: dto.description_vn,
          description_en: dto.description_en || '',
          recruitment_url: dto.recruitment_url || '',

          is_active: dto.is_active ?? true,
          sort_order: dto.sort_order || 0,

          field_of_work: { connect: { id: dto.field_of_work_id } },

          created_by: user.id,
          updated_by: user.id,
        };

        const createdJob = await db.job.create({ data: jobData });

        if (!createdJob) {
          throw new ApiError('Failed creating job', HttpStatus.BAD_REQUEST);
        }
        return createdJob;
      });
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async getAllJobService(query: IPaginationRequest & { job_type?: string, experience?: string, field_of_work_id?: string }): Promise<IPaginationResponse<Job>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortBy = 'desc',
      search,
      searchBy = 'title_vn',
      job_type,
      experience,
      field_of_work_id
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);

    // Base condition
    const andConditions: Prisma.JobWhereInput[] = [];

    // Search logic equivalent to module standard
    if (search && searchBy) {
      const validSearchFields = ['title_vn', 'title_en'];
      const field = validSearchFields.includes(searchBy) ? searchBy : 'title_vn';

      andConditions.push({
        OR: [
          { title_vn: { contains: String(search), mode: 'insensitive' } },
          { title_en: { contains: String(search), mode: 'insensitive' } },
        ],
      });
    }

    if (job_type) {
      andConditions.push({
        OR: [
          { job_type_vn: job_type },
          { job_type_en: job_type },
        ],
      });
    }

    if (experience) {
      andConditions.push({
        OR: [
          { experience_vn: experience },
          { experience_en: experience },
        ],
      });
    }

    if (field_of_work_id) {
      andConditions.push({ field_of_work_id: Number(field_of_work_id) });
    }

    const where: Prisma.JobWhereInput = andConditions.length > 0 ? { AND: andConditions } : {};

    const validOrderFields = ['id', 'title_vn', 'created_at', 'updated_at', 'sort_order'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const orderCondition: Prisma.JobOrderByWithRelationInput = {
      [orderField]: sortBy.toLowerCase() === 'desc' ? 'desc' : 'asc'
    };

    try {
      const [records, total] = await Promise.all([
        this.prisma.job.findMany({
          where,
          skip,
          take,
          orderBy: orderCondition,
          include: {
            field_of_work: true,
          }
        }),
        this.prisma.job.count({ where }),
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
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async getJobByIdService(id: number) {
    try {
      const data = await this.prisma.job.findUnique({
        where: { id },
        include: {
          field_of_work: true,
        }
      });
      if (!data) throw new ApiError("Không tìm thấy job với id: " + id, HttpStatus.NOT_FOUND);
      return data;
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async updateJobService(dto: JobDto, id: number, user: User) {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id },
      });

      if (!job) throw new ApiError('Không tìm thấy job', HttpStatus.NOT_FOUND);

      const newSlug = dto.title_vn && dto.title_vn !== job.title_vn
        ? `${slugify(dto.title_vn)}-${Date.now()}`
        : job.slug;

      const jobData = {
        title_vn: dto.title_vn !== undefined ? dto.title_vn : job.title_vn,
        slug: newSlug,
        title_en: dto.title_en !== undefined ? dto.title_en : job.title_en,
        job_type_vn: dto.job_type_vn !== undefined ? dto.job_type_vn : job.job_type_vn,
        job_type_en: dto.job_type_en !== undefined ? dto.job_type_en : job.job_type_en,
        experience_vn: dto.experience_vn !== undefined ? dto.experience_vn : job.experience_vn,
        experience_en: dto.experience_en !== undefined ? dto.experience_en : job.experience_en,
        description_vn: dto.description_vn !== undefined ? dto.description_vn : job.description_vn,
        description_en: dto.description_en !== undefined ? dto.description_en : job.description_en,
        recruitment_url: dto.recruitment_url !== undefined ? dto.recruitment_url : job.recruitment_url,

        is_active: dto.is_active !== undefined ? dto.is_active : job.is_active,
        sort_order: dto.sort_order !== undefined ? dto.sort_order : job.sort_order,

        ...(dto.field_of_work_id ? { field_of_work: { connect: { id: dto.field_of_work_id } } } : {}),

        updated_by: user.id,
        updated_at: new Date(),
      };

      return await this.prisma.$transaction(async (db) => {
        const updatedJob = await db.job.update({
          where: { id },
          data: jobData,
        });

        return updatedJob;
      });
    } catch (error: any) {
      throw new ApiError(`System Error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteJobService(id: number) {
    try {
      const job = await this.prisma.job.findUnique({
        where: { id }
      });

      if (!job) throw new ApiError("Job không tồn tại", HttpStatus.NOT_FOUND);

      return await this.prisma.job.delete({
        where: { id }
      });
    } catch (error: any) {
      throw new ApiError(`System error: ${error.message}`, HttpStatus.BAD_REQUEST);
    }
  }
}
