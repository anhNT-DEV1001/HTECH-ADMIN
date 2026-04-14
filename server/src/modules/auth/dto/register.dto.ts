import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDate, IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
export class RegisterDto {
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
}
