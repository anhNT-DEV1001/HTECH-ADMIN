import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  IsArray,
  ValidateNested,
} from 'class-validator';
export class UpdateResourceWithDetailDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  // @IsBoolean()
  @IsOptional()
  is_active?: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsArray()
  @IsOptional()
  // @ValidateNested({ each: true })
  // @Type(() => ResourceDetailDto)
  resourceDetails?: ResourceDetailDto[];
  @IsOptional()
  created_at?: Date;
  @IsOptional()
  updated_at?: Date;
  @IsOptional()
  created_by?: Date;
  @IsOptional()
  updated_by?: Date;
}

export class ResourceDetailDto {
  @IsString()
  @IsNotEmpty({ message: 'Alias không được để trống' })
  alias: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean = true;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsString()
  @IsOptional()
  href?: string;

  @IsOptional()
  created_at?: Date;
  @IsOptional()
  updated_at?: Date;
  @IsOptional()
  created_by?: Date;
  @IsOptional()
  updated_by?: Date;
}

export class CreateResourceDto {
  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  icon?: string;

  @IsBoolean()
  @IsOptional()
  is_active?: boolean;

  @IsString()
  @IsOptional()
  href?: string;

  @IsOptional()
  @IsArray()
  resourceDetails?: ResourceDetailDto[];
}
