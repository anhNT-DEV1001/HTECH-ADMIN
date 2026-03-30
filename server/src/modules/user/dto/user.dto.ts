import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';
export class UserDto {
  @ApiProperty()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return typeof value === 'string' ? new Date(value) : value;
  })
  @IsDate()
  dob: Date;

  @ApiProperty()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    return Number(value);
  })
  @IsNumber()
  role_id: number;

}

export class UpdateUserDto {
  @ApiProperty()
  @IsOptional()
  username: string;

  @ApiProperty()
  @IsOptional()
  password: string;

  @ApiProperty()
  @IsOptional()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsOptional()
  fullName: string;

  @ApiProperty()
  @IsOptional()
  phone: string;

  @ApiProperty()
  @IsOptional()
  @Transform(({ value }) => {
    if (!value) return undefined;
    return typeof value === 'string' ? new Date(value) : value;
  })
  @IsDate()
  dob: Date;

  @ApiProperty()
  @Transform(({ value }) => {
    if (value === null || value === undefined) return undefined;
    return Number(value);
  })
  @IsOptional()
  @IsNumber()
  role_id: number;
}

