import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { API_PRIFIX } from './common/apis';
import { AllExceptionsFilter } from './common/filters';
import { corsConfig, key, swaggerConfig, validationConfig } from './configs';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix(API_PRIFIX);
  app.use(cookieParser());
  app.enableCors(corsConfig);
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  app.useGlobalFilters(new AllExceptionsFilter());

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_PRIFIX, app, swaggerDoc);
  await app.listen(key.app.port ?? 5000, '0.0.0.0');
  console.log(
    `${key.app.env} api docs: http://${key.app.host}:${key.app.port + API_PRIFIX}`,
  );
}
bootstrap();
