import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
import { Transform, Type } from "class-transformer";
import { ProjectStatus } from "@prisma/client";

export class CreateProjectImageDto {
  @IsNumber()
  @IsOptional()
  id: number

  @IsString()
  @IsNotEmpty({ message: "" })
  image_url: string

  @IsString()
  @IsOptional()
  alt_text: string

  @IsNumber()
  @IsOptional()
  sort_order: number
}

export class ProjectImageDto {
  @IsNumber()
  @IsOptional()
  id: number

  @IsString()
  @IsOptional()
  image_url: string

  @IsString()
  @IsOptional()
  alt_text: string

  @IsNumber()
  @IsOptional()
  sort_order: number
}

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty({ message: "" })
  title_vn: string

  @IsString()
  @IsNotEmpty({ message: "" })
  summary_vn: string

  @IsString()
  @IsNotEmpty({ message: "" })
  description_vn: string

  @IsString()
  @IsOptional()
  title_en: string

  @IsString()
  @IsOptional()
  summary_en: string

  @IsString()
  @IsOptional()
  description_en: string

  @IsString()
  @IsOptional()
  thumbnail_url: string

  @IsString()
  @IsOptional()
  client_name: string

  @IsString()
  @IsOptional()
  venue_vn: string

  @IsString()
  @IsOptional()
  venue_en: string

  @IsString()
  @IsOptional()
  location_url: string

  @IsOptional()
  @IsDate()
  start_date: Date

  @IsOptional()
  @IsDate()
  end_date: Date

  @IsString()
  @IsOptional()
  scale: string

  @IsString()
  @IsOptional()
  industry_vn: string

  @IsString()
  @IsOptional()
  industry_en: string

  @IsEnum(ProjectStatus)
  @IsOptional()
  status: ProjectStatus

  @IsOptional()
  @Transform(({ value }) => {
    if (value === '1' || value === 1 || value === 'true' || value === true) return true;
    if (value === '0' || value === 0 || value === 'false' || value === false) return false;
    return false;
  })
  is_featured: boolean

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  sort_order: number

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  category_id: number

  @IsArray()
  @IsOptional()
  projectImages: CreateProjectImageDto[]
}

export class ProjectDto {
  @IsNumber()
  @IsOptional()
  id: number

  @IsString()
  @IsOptional()
  title_vn: string

  @IsString()
  @IsOptional()
  summary_vn: string

  @IsString()
  @IsOptional()
  description_vn: string

  @IsString()
  @IsOptional()
  title_en: string

  @IsString()
  @IsOptional()
  summary_en: string

  @IsString()
  @IsOptional()
  description_en: string

  @IsString()
  @IsOptional()
  thumbnail_url: string

  @IsString()
  @IsOptional()
  client_name: string

  @IsString()
  @IsOptional()
  venue_vn: string

  @IsString()
  @IsOptional()
  venue_en: string

  @IsString()
  @IsOptional()
  location_url: string

  @IsOptional()
  @IsDate()
  start_date: Date

  @IsOptional()
  @IsDate()
  end_date: Date

  @IsString()
  @IsOptional()
  scale: string

  @IsString()
  @IsOptional()
  industry_vn: string

  @IsString()
  @IsOptional()
  industry_en: string

  @IsEnum(ProjectStatus)
  @IsOptional()
  status: ProjectStatus

  @IsOptional()
  @Transform(({ value }) => {
    // Nếu giá trị đã là boolean (do NestJS ép kiểu trước đó)
    if (typeof value === 'boolean') return value;

    // Xử lý giá trị dạng chuỗi từ FormData
    const truthyValues = ['1', 'true'];
    const falsyValues = ['0', 'false'];

    if (truthyValues.includes(String(value).toLowerCase())) return true;
    if (falsyValues.includes(String(value).toLowerCase())) return false;

    return false;
  })
  is_featured: boolean;

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  sort_order: number

  @IsNumber()
  @IsOptional()
  @Transform(({ value }) => (typeof value === 'string' ? Number(value) : value))
  category_id: number

  @IsArray()
  @IsOptional()
  projectImages: ProjectImageDto[]
}

export class CreateProjectCategoryDto {
  @IsString()
  @IsNotEmpty({ message: "" })
  name_vn: string

  @IsString()
  @IsOptional()
  name_en: string
}

export class ProjectCategoryDto {
  @IsNumber()
  @IsOptional()
  id: number

  @IsString()
  @IsOptional()
  name_vn: string

  @IsString()
  @IsOptional()
  name_en: string
}