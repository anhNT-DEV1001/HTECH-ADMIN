import { HttpStatus, Injectable } from "@nestjs/common";
import { CreateNewsDto, CreateNewsImageDto, NewsDto, NewsImageDto } from "./dto";
import { News, NewsImage, Prisma, User } from "@prisma/client";
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiError } from "src/common/apis";
import { IPaginationRequest, IPaginationResponse } from "src/common/interfaces";

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
      const news = await this.prisma.news.findUnique({
        where: { id }
      });

      if (!news) throw new ApiError('News is not existed', HttpStatus.NOT_FOUND);

      const newsData = {
        title_vn: dto.title_vn ? dto.title_vn : news.title_vn,
        thumbnail_url: dto.thumbnail_url ? dto.thumbnail_url : news.thumbnail_url,
        summary_vn: dto.summary_vn ? dto.summary_vn : news.summary_vn,
        content_vn: dto.content_vn ? dto.content_vn : news.content_vn,

        title_en: dto.title_en ? dto.title_en : news.title_en,
        summary_en: dto.summary_en ? dto.summary_en : news.summary_en,
        content_en: dto.content_en ? dto.content_en : news.content_en,

        updated_at: new Date(),

        //Check if dto contains image -> delete all old images and create new one
        newsImages: dto.newsImage && dto.newsImage.length > 0
          ? {
            deleteMany: {},
            create: dto.newsImage.map((dtoImage: NewsImageDto) => ({
              image_url: dtoImage.image_url || '',
              alt_text: dtoImage.alt_text || '',
              sort_order: dtoImage.sort_order || 1,
              updated_at: new Date()
            }))
          } : {}
      }

      return await this.prisma.$transaction(async (db) => {

        const updatedNews = await db.news.update({
          where: { id },
          data: newsData
        });

        if (!updatedNews) {
          throw new ApiError('Failed updating news', HttpStatus.BAD_REQUEST);
        }

        return updatedNews;
      });
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
        where: { id }
      });

      if (!news) throw new ApiError('News is not existed', HttpStatus.NOT_FOUND);

      console.log("flag news service found")
      // const deletedNews = await this.prisma.news.delete({
      //   where: { id },
      //   include: {
      //     newsImages: true
      //   }
      // });
      return await this.prisma.$transaction(async (db) => {
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
}