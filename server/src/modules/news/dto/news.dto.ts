import { Transform } from "class-transformer";
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl } from "class-validator";

export class CreateNewsDto {
  @IsString()
  @IsNotEmpty({ message: '' })
  title_vn: string

  // @IsString()
  @IsOptional()
  @IsNotEmpty({ message: '' })
  thumbnail_url: string

  @IsString()
  @IsNotEmpty({ message: '' })
  summary_vn: string

  @IsString()
  @IsNotEmpty({ message: '' })
  content_vn: string

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  @IsArray()
  newsImage: CreateNewsImageDto[] | []

  @IsString()
  @IsOptional()
  title_en: string
  @IsString()
  @IsOptional()
  summary_en: string
  @IsString()
  @IsOptional()
  content_en: string
}

export class NewsDto {
  @IsNumber()
  @IsOptional()
  id: number

  @IsString()
  @IsOptional()
  thumbnail_url: string

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch (e) {
        return [];
      }
    }
    return value;
  })
  @IsArray()
  newsImage: NewsImageDto[] | []

  @IsString()
  @IsOptional()
  title_vn: string
  @IsString()
  @IsOptional()
  summary_vn: string
  @IsString()
  @IsOptional()
  content_vn: string

  @IsString()
  @IsOptional()
  title_en: string
  @IsString()
  @IsOptional()
  summary_en: string
  @IsString()
  @IsOptional()
  content_en: string
}

export class CreateNewsImageDto {
  @IsNumber()
  @IsOptional()
  id: number

  @IsString()
  @IsNotEmpty()
  image_url: string

  @IsString()
  @IsOptional()
  alt_text: string

  @IsNumber()
  @IsOptional()
  sort_order: number
}

export class NewsImageDto {
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