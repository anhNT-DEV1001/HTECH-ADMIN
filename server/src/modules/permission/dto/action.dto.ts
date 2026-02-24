import { IsArray, IsNumber, IsOptional } from 'class-validator';

export class ResourceDetailActionDto {
  @IsOptional()
  id: number;
  @IsOptional()
  alias: string;
  @IsOptional()
  is_active: boolean;
  @IsOptional()
  icon: string;
  @IsOptional()
  href: string;
}

export class CreateActionsDto {
  @IsOptional()
  resourceDetail: ResourceDetailActionDto;
  @IsOptional()
  @IsArray()
  actions: CreateActionDto[] | [];
}

export class ActionDto {
  @IsOptional()
  id: number;
  @IsOptional()
  action?: string;
  @IsOptional()
  resourceDetailAlias?: string;
}

export class CreateActionDto {
  @IsOptional()
  action: string;
  @IsOptional()
  resourcDetailAlias: string;
}


