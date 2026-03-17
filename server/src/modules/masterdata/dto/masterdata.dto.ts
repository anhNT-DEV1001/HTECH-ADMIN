import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateMasterDataDto {
  @IsString()
  @IsNotEmpty({ message: "dataValue không được để trống" })
  dataValue: string;

  @IsString()
  @IsNotEmpty({ message: "dataKey không được để trống" })
  dataKey: string;

  @IsString()
  @IsNotEmpty({ message: "Tên không được để trống" })
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  created_by?: number;
}

export class UpdateMasterDataDto {
  @IsString()
  @IsOptional()
  dataValue?: string;

  @IsString()
  @IsOptional()
  dataKey?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsOptional()
  updated_by?: number;
}

export class MasterDataFilterDto {
  @IsOptional()
  dataKey?: string;

  @IsOptional()
  search?: string;

  @IsOptional()
  page?: number;

  @IsOptional()
  limit?: number;

  @IsOptional()
  sortBy? : string

  @IsOptional()
  orderBy? : string
}
