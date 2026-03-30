import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './common/guards';
import { AuthModule } from './modules/auth/auth.module';
import { PrismaModule } from './infrastructure/prisma/prisma.module';
import { ResourceModule } from './modules/resource/resource.module';
import { RoleModule } from './modules/role/role.module';
import { PermissionModule } from './modules/permission/permission.module';
import { UserModule } from './modules/user/user.module';
import { NewsModule } from './modules/news/news.module';
import { ProjectModule } from './modules/project/project.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { StatisticsModule } from './modules/statistics/statistics.module';
import { MasterdataModule } from './modules/masterdata/masterdata.module';
import { MailsModule } from './infrastructure/mails/mails.module';

@Module({
  imports: [PrismaModule, AuthModule, ResourceModule, RoleModule, PermissionModule, UserModule, NewsModule, ProjectModule, JobsModule, StatisticsModule, MasterdataModule, MailsModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule { }
