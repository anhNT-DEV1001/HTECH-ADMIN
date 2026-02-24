import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { API_PRIFIX } from './common/apis';
import { AllExceptionsFilter } from './common/filters';
import { corsConfig, key, swaggerConfig, validationConfig } from './configs';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix(API_PRIFIX);
  app.use(cookieParser());
  app.enableCors(corsConfig);
  app.useGlobalPipes(new ValidationPipe(validationConfig));
  app.useGlobalFilters(new AllExceptionsFilter());
  const publicPath = join(process.cwd(), 'public');
  app.useStaticAssets(publicPath);

  const swaggerDoc = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup(API_PRIFIX, app, swaggerDoc);
  await app.listen(key.app.port ?? 5050, '0.0.0.0');
  console.log('Static Assets Path:', publicPath);
  console.log(
    `${key.app.env} api docs: http://${key.app.host}:${key.app.port + API_PRIFIX}`,
  );
}
bootstrap();
