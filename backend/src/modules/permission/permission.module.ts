import { Module } from '@nestjs/common';
import { PermissionService } from './permission.service';
import { PermissionController } from './permission.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { ResourceModule } from '../resource/resource.module';
import { RoleModule } from '../role/role.module';

@Module({
  imports: [PrismaModule, ResourceModule , RoleModule],
  providers: [PermissionService],
  controllers: [PermissionController],
  exports: [PermissionService]
})
export class PermissionModule {}
