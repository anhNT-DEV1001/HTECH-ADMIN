import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCompanyDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsEmail()
  @IsOptional()
  email_en?: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsString()
  @IsOptional()
  phone_en?: string;

  @IsString()
  @IsNotEmpty()
  address: string;

  @IsString()
  @IsOptional()
  address_en?: string;

  @IsString()
  @IsOptional()
  banner?: string;
}

export class UpdateCompanyDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  name_en?: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsEmail()
  @IsOptional()
  email_en?: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsString()
  @IsOptional()
  phone_en?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsString()
  @IsOptional()
  address_en?: string;

  @IsString()
  @IsOptional()
  banner?: string;
}
