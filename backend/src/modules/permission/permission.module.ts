import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResourceModule } from '../resource/resource.module';

@Module({
  imports: [PrismaModule, ResourceModule],
  providers: [PermissionService],
  controllers: [PermissionController],
})
export class PermissionModule {}
