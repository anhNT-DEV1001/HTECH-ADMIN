import { IsArray, IsBoolean, IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";
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

  @IsBoolean()
  @IsOptional()
  is_featured: boolean

  @IsNumber()
  @IsOptional()
  sort_order: number

  @IsNumber()
  @IsOptional()
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
  @  IsDate()
  start_date: Date

  @IsOptional()
  @  IsDate()
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

  @IsBoolean()
  @IsOptional()
  is_featured: boolean

  @IsNumber()
  @IsOptional()
  sort_order: number

  @IsNumber()
  @IsOptional()
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