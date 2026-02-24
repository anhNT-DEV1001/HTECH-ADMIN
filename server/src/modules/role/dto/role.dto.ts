import { IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRoleDto {
  @IsNotEmpty({ message: 'Tên quyền không được để trống' })
  @IsString({ message: 'Tên quyền phải là chuỗi ký tự' })
  name: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}

export class UpdateRoleDto {
  @IsOptional()
  @IsNotEmpty({ message: 'Tên quyền không được để trống' })
  @IsString({ message: 'Tên quyền phải là chuỗi ký tự' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'Mô tả phải là chuỗi ký tự' })
  description?: string;
}