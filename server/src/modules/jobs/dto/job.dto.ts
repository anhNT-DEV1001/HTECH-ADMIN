import { IsString, IsOptional, IsBoolean, IsNotEmpty, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateJobDto {
    @IsString()
    @IsNotEmpty({ message: "" })
    title_vn: string;

    @IsString()
    @IsOptional()
    title_en?: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsString()
    @IsOptional()
    job_type_vn?: string;

    @IsString()
    @IsOptional()
    job_type_en?: string;

    @IsString()
    @IsOptional()
    experience_vn?: string;

    @IsString()
    @IsOptional()
    experience_en?: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
    field_of_work_id: number;

    @IsString()
    @IsOptional()
    description_vn: string;

    @IsString()
    @IsOptional()
    description_en?: string;

    @IsString()
    @IsOptional()
    recruitment_url: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    is_active?: boolean;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
    sort_order: number;
}

export class JobDto {
    @IsNumber()
    @IsOptional()
    id: number;

    @IsString()
    @IsOptional()
    title_vn: string;

    @IsString()
    @IsOptional()
    title_en: string;

    @IsOptional()
    @IsString()
    slug?: string;

    @IsString()
    @IsOptional()
    job_type_vn: string;

    @IsString()
    @IsOptional()
    job_type_en: string;

    @IsString()
    @IsOptional()
    experience_vn: string;

    @IsString()
    @IsOptional()
    experience_en: string;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
    field_of_work_id: number;

    @IsString()
    @IsOptional()
    description_vn: string;

    @IsString()
    @IsOptional()
    description_en: string;

    @IsString()
    @IsOptional()
    recruitment_url: string;

    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => {
        if (value === 'true') return true;
        if (value === 'false') return false;
        return value;
    })
    is_active?: boolean;

    @IsNumber()
    @IsOptional()
    @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
    sort_order: number;
}

export class CreateFieldOfWorkDto {
    @IsString()
    @IsNotEmpty({ message: "" })
    name_vn: string

    @IsString()
    @IsOptional()
    name_en: string;
}

export class FieldOfWorkDto {
    @IsNumber()
    @IsOptional()
    id: number;

    @IsString()
    @IsOptional()
    name_vn: string;

    @IsString()
    @IsOptional()
    name_en: string;
}
