import { Transform } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

function toNumber(value: any) {
  if (value === '' || value === null || value === undefined) return undefined;
  return typeof value === 'string' ? Number(value) : value;
}

export class CreateQACategoryDto {
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

export class UpdateQACategoryDto {
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

export class CreateQADto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  category_id: number;

  @IsString()
  @IsNotEmpty()
  question_vn: string;

  @IsString()
  @IsOptional()
  question_en?: string;

  @IsString()
  @IsOptional()
  ans_vn?: string;

  @IsString()
  @IsOptional()
  ans_en?: string;
}

export class UpdateQADto {
  @Transform(({ value }) => toNumber(value))
  @IsNumber()
  @IsOptional()
  category_id?: number;

  @IsString()
  @IsOptional()
  question_vn?: string;

  @IsString()
  @IsOptional()
  question_en?: string;

  @IsString()
  @IsOptional()
  ans_vn?: string;

  @IsString()
  @IsOptional()
  ans_en?: string;
}
