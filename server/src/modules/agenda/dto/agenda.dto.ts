import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDate,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

function toNumber(value: unknown) {
  if (value === '' || value === null || value === undefined) return undefined;
  return typeof value === 'string' ? Number(value) : value;
}

function toDate(value: unknown) {
  if (value === '' || value === null || value === undefined) return undefined;
  return value instanceof Date ? value : new Date(value as string);
}

function toTime(value: unknown) {
  if (value === '' || value === null || value === undefined) return undefined;
  if (value instanceof Date) return value;
  if (typeof value === 'string' && /^\d{2}:\d{2}(:\d{2})?$/.test(value)) {
    const normalizedTime = value.length === 5 ? `${value}:00` : value;
    return new Date(`1970-01-01T${normalizedTime}.000Z`);
  }
  return new Date(value as string);
}

function toArray(value: unknown) {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return [];
    }
  }
  return value;
}

export class CreateAgendaTimelineDto {
  @Transform(({ value }) => toTime(value))
  @IsDate()
  STime: Date;

  @Transform(({ value }) => toTime(value))
  @IsDate()
  ETime: Date;

  @IsString()
  @IsNotEmpty()
  name_vn: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsNotEmpty()
  short_name_vn: string;

  @IsString()
  @IsOptional()
  short_name_en?: string;

  @IsString()
  @IsNotEmpty()
  locate_vn: string;

  @IsString()
  @IsOptional()
  locate_en?: string;
}

export class UpdateAgendaTimelineDto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  id?: number;

  @Transform(({ value }) => toTime(value))
  @IsDate()
  @IsOptional()
  STime?: Date;

  @Transform(({ value }) => toTime(value))
  @IsDate()
  @IsOptional()
  ETime?: Date;

  @IsString()
  @IsOptional()
  name_vn?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  short_name_vn?: string;

  @IsString()
  @IsOptional()
  short_name_en?: string;

  @IsString()
  @IsOptional()
  locate_vn?: string;

  @IsString()
  @IsOptional()
  locate_en?: string;
}

export class CreateAgendaDateDto {
  @Transform(({ value }) => toDate(value))
  @IsDate()
  date: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => toArray(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAgendaTimelineDto)
  @IsOptional()
  timelines?: CreateAgendaTimelineDto[];
}

export class UpdateAgendaDateDto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  id?: number;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  date?: Date;

  @IsString()
  @IsOptional()
  description?: string;

  @Transform(({ value }) => toArray(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAgendaTimelineDto)
  @IsOptional()
  timelines?: UpdateAgendaTimelineDto[];
}

export class CreateAgendaDto {
  @IsString()
  @IsNotEmpty()
  name_vn: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  file_url?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  web_id: number;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  SDate: Date;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  EDate: Date;

  @Transform(({ value }) => toArray(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateAgendaDateDto)
  @IsOptional()
  agendaDates?: CreateAgendaDateDto[];
}

export class UpdateAgendaDto {
  @IsString()
  @IsOptional()
  name_vn?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsString()
  @IsOptional()
  file_url?: string;

  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  web_id?: number;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  SDate?: Date;

  @Transform(({ value }) => toDate(value))
  @IsDate()
  @IsOptional()
  EDate?: Date;

  @Transform(({ value }) => toArray(value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAgendaDateDto)
  @IsOptional()
  agendaDates?: UpdateAgendaDateDto[];
}
