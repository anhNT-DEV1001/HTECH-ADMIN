import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateNewsCategoryDto, CreateNewsDto, CreateNewsImageDto, NewsDto, NewsImageDto } from "./dto";
import { News, NewsImage, Prisma, User } from "@prisma/client";
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiError } from "src/common/apis";
import { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";
import { deleteFileFromPublic } from "src/common/utils";

@Injectable()
export class NewsService {

  constructor(private readonly prisma: PrismaService) { }
  async createNewsService(dto: CreateNewsDto, user: User) {
    try {
      return await this.prisma.$transaction(async (db) => {
        const newsData = {
          title_vn: dto.title_vn,
          thumbnail_url: dto.thumbnail_url,
          summary_vn: dto.summary_vn,
          content_vn: dto.content_vn,

          title_en: dto.title_en || '',
          summary_en: dto.summary_en || '',
          content_en: dto.content_en || '',

          created_by: user.id,
          updated_by: user.id,

          category: { connect: { id: dto.category_id } },

          newsImages: dto.newsImage && dto.newsImage.length > 0
            ? {
              create: dto.newsImage.map((dtoImage: CreateNewsImageDto) => ({
                image_url: dtoImage.image_url,
                alt_text: dtoImage.alt_text || '',
                sort_order: dtoImage.sort_order || 1,
                created_by: user.id,
                updated_by: user.id
              }))
            } : undefined
        }

        const createdNews = await db.news.create({ data: newsData });

        if (!createdNews) {
          throw new ApiError('Failed creating news', HttpStatus.BAD_REQUEST);
        }

        return createdNews;
      });
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async updateNewsService(dto: NewsDto, id: number) {
    try {
      const oldNews = await this.prisma.news.findUnique({
        where: { id },
        include: { newsImages: true },
      });

      if (!oldNews) throw new ApiError('News is not existed', HttpStatus.NOT_FOUND);
      const filesToDelete: string[] = [];

      if (dto.thumbnail_url && dto.thumbnail_url !== oldNews.thumbnail_url) {
        filesToDelete.push(oldNews.thumbnail_url as any);
      }

      if (dto.newsImage && Array.isArray(dto.newsImage)) {
        const newImageUrls = dto.newsImage.map(img => img.image_url).filter(url => url);
        const oldImageUrls = oldNews.newsImages.map(img => img.image_url);
        const imagesToDelete = oldImageUrls.filter(oldUrl => !newImageUrls.includes(oldUrl));

        filesToDelete.push(...imagesToDelete);
      }
      const newsData = {
        title_vn: dto.title_vn ?? oldNews.title_vn,
        thumbnail_url: dto.thumbnail_url ?? oldNews.thumbnail_url,
        summary_vn: dto.summary_vn ?? oldNews.summary_vn,
        content_vn: dto.content_vn ?? oldNews.content_vn,
        title_en: dto.title_en ?? oldNews.title_en,
        summary_en: dto.summary_en ?? oldNews.summary_en,
        content_en: dto.content_en ?? oldNews.content_en,
        updated_at: new Date(),

        category: { connect: { id: dto.category_id ?? oldNews.category_id } },

        newsImages: dto.newsImage && Array.isArray(dto.newsImage)
          ? {
            deleteMany: {},
            create: dto.newsImage.map((dtoImage: NewsImageDto) => ({
              image_url: dtoImage.image_url || '',
              alt_text: dtoImage.alt_text || '',
              sort_order: dtoImage.sort_order || 1,
              updated_at: new Date()
            }))
          } : undefined
      };
      const updatedNews = await this.prisma.$transaction(async (db) => {
        const res = await db.news.update({
          where: { id },
          data: newsData
        });
        return res;
      });

      if (updatedNews) {
        await Promise.all(filesToDelete.map(path => deleteFileFromPublic(path)));
      }

      return updatedNews;

    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async deleteNewsService(id: number) {
    try {
      const news = await this.prisma.news.findUnique({
        where: { id },
        include: { newsImages: true },
      });

      if (!news) throw new ApiError('News is not existed', HttpStatus.NOT_FOUND);
      await deleteFileFromPublic(news.thumbnail_url as any);
      return await this.prisma.$transaction(async (db) => {
        await Promise.all(news.newsImages.map(img => deleteFileFromPublic(img.image_url as any)));
        await db.newsImage.deleteMany({
          where: { news_id: id }
        })
        await db.news.delete({
          where: { id }
        })
      })
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  async createNewsCategoryService(dto: CreateNewsCategoryDto, user: User) {
    try {
      const slug = slugify(dto.name_vn);

      // Kiểm tra slug đã tồn tại chưa
      const existing = await this.prisma.newsCategory.findUnique({
        where: { slug },
      });
      if (existing) {
        throw new ApiError('News category đã tồn tại với tên tương tự', HttpStatus.BAD_REQUEST);
      }

      const createdCategory = await this.prisma.newsCategory.create({
        data: {
          name_vn: dto.name_vn,
          name_en: dto.name_en || '',
          slug,
          created_by: user.id,
          updated_by: user.id,
        },
      });

      if (!createdCategory) {
        throw new ApiError('Failed creating news category', HttpStatus.BAD_REQUEST);
      }
      return createdCategory;
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  async deleteNewsCategoryService(id: number) {
    try {
      const newscate = await this.prisma.newsCategory.findUnique({
        where: { id },
      });

      if (!newscate) throw new ApiError('News category is not existed', HttpStatus.BAD_REQUEST);

      return this.prisma.newsCategory.delete({
        where: { id },
      });
    } catch (error: any) {
      throw new ApiError(
        `System error: ${error.message}`,
        HttpStatus.BAD_REQUEST
      );
    }
  }

  //Not sure
  async getAllNewsService(query: IPaginationRequest): Promise<IPaginationResponse<News>> {
    const {
      page = 1,
      limit = 10,
      orderBy = 'created_at',
      sortBy = 'desc',
      search,
      searchBy = 'title_vn',
    } = query;

    const skip = (Number(page) - 1) * Number(limit);
    const take = Number(limit);
    const where: Prisma.NewsWhereInput = {};

    if (search && searchBy) {
      const validSearchFields = ['title_vn', 'summary_vn', 'summary_vn', 'summary_en'];
      const field = validSearchFields.includes(searchBy) ? searchBy : 'title_vn';
      where[field] = {
        contains: String(search),
        mode: 'insensitive',
      };
    }

    const validOrderFields = ['id', 'title_vn', 'summary_vn', 'created_at', 'updated_at'];
    const orderField = validOrderFields.includes(orderBy) ? orderBy : 'created_at';
    const orderCondition: Prisma.NewsOrderByWithRelationInput = {
      [orderField]: sortBy.toLowerCase() === 'desc' ? 'desc' : 'asc'
    };

    const [records, total] = await Promise.all([
      this.prisma.news.findMany({
        where,
        skip,
        take,
        orderBy: orderCondition,
        include: {
          newsImages: true
        }
      }),
      this.prisma.news.count({ where })
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

  async getNewsById(newsId: number) {
    const data = await this.prisma.news.findUnique({
      where: { id: newsId },
      include: {
        newsImages: true
      }
    })
    if (!data) throw new ApiError('News not found with provided id: ' + newsId,
      HttpStatus.BAD_REQUEST)
    return data;
  }

  async getAllNewsCategoryService() {
    // console.log('flag get news category services')
    const data = await this.prisma.newsCategory.findMany({
      orderBy: {
        name_vn: 'asc'
      }
    })
    if (!data) throw new ApiError('List of News category not found', HttpStatus.BAD_REQUEST)
    return data
  }
}

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