import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { JobsService } from './jobs.service';
import { AuthUser, RequirePermissions } from 'src/common/decorators';
import { RoleConstant } from 'src/common/constants';
import type { Job, FieldOfWork, User } from '@prisma/client';
import { CreateJobDto, CreateFieldOfWorkDto, JobDto } from './dto';
import { BaseResponse } from 'src/common/apis';
import type { IPaginationRequest, IPaginationResponse } from 'src/common/interfaces';

@Controller('jobs')
export class JobsController {
    constructor(private readonly jobsService: JobsService) { }

    // FIELD OF WORK ENDPOINTS
    @Get('field-of-works')
    async getAllFieldOfWorkController(): Promise<BaseResponse<FieldOfWork[]>> {
        const res = await this.jobsService.findAllFieldsOfWork();
        return {
            status: 'success',
            message: 'Successfully get all fields of work',
            data: res,
        }
    }

    @Post('field-of-works')
    @RequirePermissions(RoleConstant.CREATE)
    async createFieldOfWorkController(
        @AuthUser('user') user: User,
        @Body() dto: CreateFieldOfWorkDto,
    ): Promise<BaseResponse<FieldOfWork>> {
        const res = await this.jobsService.createFieldOfWork(dto, user);
        return {
            status: 'success',
            message: 'Successfully create field of work',
            data: res,
        }
    }

    @Delete('field-of-works/:id')
    @RequirePermissions(RoleConstant.DELETE)
    async deleteFieldOfWorkController(
        @Param('id') id: number,
    ): Promise<BaseResponse<any>> {
        const res = await this.jobsService.deleteFieldOfWorkService(id);
        return {
            status: 'success',
            message: 'Successfully delete field of work',
            data: res,
        }
    }

    // JOB ENDPOINTS
    @Get()
    @RequirePermissions(RoleConstant.VIEW)
    async getAllJobController(
        @Query() query: IPaginationRequest & { job_type?: string; experience?: string; field_of_work_id?: string },
    ): Promise<BaseResponse<IPaginationResponse<Job>>> {
        const res = await this.jobsService.getAllJobService(query);
        return {
            status: 'success',
            message: 'Successfully get all jobs',
            data: res,
        }
    }

    @Get(':id')
    @RequirePermissions(RoleConstant.VIEW)
    async getJobByIdController(@Param('id') id: number) {
        const res = await this.jobsService.getJobByIdService(id);
        return {
            status: 'success',
            message: 'Successfully get job with id ' + id,
            data: res,
        }
    }

    @Post()
    @RequirePermissions(RoleConstant.CREATE)
    async createJobController(
        @AuthUser('user') user: User,
        @Body() dto: CreateJobDto,
    ): Promise<BaseResponse<Job>> {
        // Parse các field dạng string từ FormData sang đúng kiểu
        if (typeof dto.field_of_work_id === 'string') dto.field_of_work_id = Number(dto.field_of_work_id);
        if (typeof dto.sort_order === 'string') dto.sort_order = Number(dto.sort_order);
        if (typeof dto.is_active === 'string') dto.is_active = dto.is_active === 'true';

        const res = await this.jobsService.createJobService(dto, user);
        return {
            status: 'success',
            message: 'Successfully create job',
            data: res,
        }
    }

    @Patch(':id')
    @RequirePermissions(RoleConstant.UPDATE)
    async updateJobController(
        @AuthUser('user') user: User,
        @Param('id') id: number,
        @Body() dto: JobDto,
    ): Promise<BaseResponse<Job>> {
        // Parse các field dạng string từ FormData sang đúng kiểu
        if (typeof dto.field_of_work_id === 'string') dto.field_of_work_id = Number(dto.field_of_work_id);
        if (typeof dto.sort_order === 'string') dto.sort_order = Number(dto.sort_order);
        if (typeof dto.is_active === 'string') dto.is_active = (dto.is_active as any) === 'true';

        const res = await this.jobsService.updateJobService(dto, id, user);
        return {
            status: 'success',
            message: 'Successfully update job',
            data: res,
        }
    }

    @Delete(':id')
    @RequirePermissions(RoleConstant.DELETE)
    async deleteJobController(
        @Param('id') id: number,
    ) {
        await this.jobsService.deleteJobService(id);
        return {
            status: 'success',
            message: 'Successfully delete job',
            data: null,
        }
    }
}
