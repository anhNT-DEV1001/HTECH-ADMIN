import {
  Equals,
  IsEmail,
  IsIn,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class VnsecContactDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  fullName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email!: string;

  @IsString()
  @IsOptional()
  @MaxLength(30)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  company?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  department?: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  message!: string;
}

export const VNSEC_REGISTER_TYPES = ['visitor', 'exhibitor', 'speaker', 'sponsor'] as const;

export type VnsecRegisterType = (typeof VNSEC_REGISTER_TYPES)[number];

export class VnsecRegisterDto {
  @IsString()
  @IsIn(VNSEC_REGISTER_TYPES)
  registerType!: VnsecRegisterType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  lastName!: string;

  @IsEmail()
  @IsNotEmpty()
  @MaxLength(150)
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(30)
  phone!: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  company?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  position?: string;

  @IsString()
  @IsOptional()
  @MaxLength(150)
  interest?: string;

  @IsBoolean()
  @Equals(true)
  acceptedPolicy!: boolean;
}
