import { Transform } from 'class-transformer';
import { IsArray, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

function toNumber(value: any) {
  if (value === '' || value === null || value === undefined) return undefined;
  return typeof value === 'string' ? Number(value) : value;
}

function toBoolean(value: any) {
  if (value === '' || value === null || value === undefined) return undefined;
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true' || normalized === '1') return true;
    if (normalized === 'false' || normalized === '0') return false;
  }
  return Boolean(value);
}

function toNumberArray(value: any) {
  if (value === '' || value === null || value === undefined) return undefined;
  if (Array.isArray(value)) return value.map(Number);
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.map(Number) : [];
    } catch {
      return value.split(',').filter(Boolean).map(Number);
    }
  }
  return value;
}

export class CreateZoneDto {
  @IsString()
  @IsNotEmpty()
  name_vn: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  web_id: number;
}

export class UpdateZoneDto {
  @IsString()
  @IsOptional()
  name_vn?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  web_id?: number;
}

export class CreateExhibitorRankDto {
  @IsString()
  @IsNotEmpty()
  name_vn: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  display_order?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  web_id: number;
}

export class UpdateExhibitorRankDto {
  @IsString()
  @IsOptional()
  name_vn?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  display_order?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  web_id?: number;
}

export class CreateBoothDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  web_id: number;
}

export class UpdateBoothDto {
  @IsString()
  @IsOptional()
  name?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  web_id?: number;
}

export class CreateExhibitionDto {
  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsNotEmpty()
  name_vn: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsNotEmpty()
  title_vn: string;

  @IsString()
  @IsOptional()
  title_en?: string;

  @IsString()
  @IsOptional()
  sumary_vn?: string;

  @IsString()
  @IsOptional()
  sumary_en?: string;

  @IsString()
  @IsOptional()
  content_vn?: string;

  @IsString()
  @IsOptional()
  content_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  display_order?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  web_id: number;

  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  zone_ids: number[];

  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  exhibitor_ids?: number[];
}

export class UpdateExhibitionDto {
  @IsString()
  @IsOptional()
  logo?: string;

  @IsString()
  @IsOptional()
  logo_url?: string;

  @IsString()
  @IsOptional()
  name_vn?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  title_vn?: string;

  @IsString()
  @IsOptional()
  title_en?: string;

  @IsString()
  @IsOptional()
  sumary_vn?: string;

  @IsString()
  @IsOptional()
  sumary_en?: string;

  @IsString()
  @IsOptional()
  content_vn?: string;

  @IsString()
  @IsOptional()
  content_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  display_order?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  web_id?: number;

  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  zone_ids?: number[];

  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  exhibitor_ids?: number[];
}

export class CreateExhibitorDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  img?: string;

  @IsString()
  @IsNotEmpty()
  sumary_vn: string;

  @IsString()
  @IsOptional()
  sumary_en?: string;

  @IsString()
  @IsNotEmpty()
  content_vn: string;

  @IsString()
  @IsOptional()
  content_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  rankId: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  boothId: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  web_id: number;

  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  exhibition_ids?: number[];
}

export class UpdateExhibitorDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  img?: string;

  @IsString()
  @IsOptional()
  sumary_vn?: string;

  @IsString()
  @IsOptional()
  sumary_en?: string;

  @IsString()
  @IsOptional()
  content_vn?: string;

  @IsString()
  @IsOptional()
  content_en?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  rankId?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  boothId?: number;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  web_id?: number;

  @Transform(({ value }) => toNumberArray(value))
  @IsArray()
  @IsNumber({}, { each: true })
  @IsOptional()
  exhibition_ids?: number[];

  @Transform(({ value }) => toBoolean(value))
  @IsOptional()
  remove_img?: boolean;
}
