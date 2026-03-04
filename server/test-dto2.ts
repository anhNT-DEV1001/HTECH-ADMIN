import 'reflect-metadata';
import { plainToInstance, Transform } from 'class-transformer';
import { IsOptional } from 'class-validator';

class NewsDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true || value === 1 || value === '1')
  is_featured: boolean;
}

const reqBody = { is_featured: 'false' };
const dto = plainToInstance(NewsDto, reqBody, { enableImplicitConversion: true });
console.log('DTO:', dto);
