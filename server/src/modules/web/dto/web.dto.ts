import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateWebDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  alias: string;

  @IsString()
  @IsNotEmpty()
  url: string;
}

export class UpdateWebDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  alias?: string;

  @IsString()
  @IsOptional()
  url?: string;
}
