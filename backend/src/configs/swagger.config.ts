import { DocumentBuilder } from '@nestjs/swagger';
import { key } from './key.config';
export const swaggerConfig = new DocumentBuilder()
  .setTitle(key.app.name)
  .setDescription(key.app.name + 'api documents')
  .setVersion('1.0')
  .addBearerAuth(
    {
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      in: 'header',
    },
    'access-token',
  )
  .build();
