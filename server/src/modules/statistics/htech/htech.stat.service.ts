import { Injectable } from "@nestjs/common";
import { PrismaService } from "src/infrastructure/prisma/prisma.service";

@Injectable()
export class HtechStatService {
  constructor(private readonly prisma: PrismaService) {}
  
  async getHtechStat() {
    const [featuredProjects, featuredNews, openJobs] = await Promise.all([
      // Query tất cả các dự án nổi bật
      this.prisma.project.findMany({
        where: { is_featured: true },
        include: {
          category: true,
          projectImages: true,
        },
        orderBy: { sort_order: 'asc' },
      }),
      // Query tất cả tin tức nổi bật
      this.prisma.news.findMany({
        where: { is_featured: true },
        include: {
          category: true,
          newsImages: true,
        },
      }),
      // Query công việc tuyển dụng với trạng thái đang mở
      this.prisma.job.findMany({
        where: { is_active: true },
        include: {
          field_of_work: true,
        },
        orderBy: { sort_order: 'asc' },
      }),
    ]);

    return {
      featuredProjects,
      featuredNews,
      openJobs,
    };
  }
}
