import { IsOptional } from "class-validator";

export class ContactDto {
  @IsOptional()
  fullName: string;
  @IsOptional()
  email: string;
  @IsOptional()
  phone: string;
  @IsOptional()
  company?: string;
  @IsOptional() 
  message: string;
}