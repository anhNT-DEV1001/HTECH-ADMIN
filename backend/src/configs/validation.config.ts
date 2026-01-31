import {
  HttpException,
  HttpStatus,
  ValidationPipeOptions,
} from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
  whitelist: true,
  transform: true,
  forbidNonWhitelisted: true,
  transformOptions: {
    enableImplicitConversion: true,
  },
  exceptionFactory: (errors) => {
    return new HttpException(
      {
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Validation failed',
        field: errors.reduce((acc, err) => {
          acc[err.property] = err.constraints
            ? Object.values(err.constraints)[0]
            : '';
          return acc;
        }, {}),
      },
      HttpStatus.BAD_REQUEST,
    );
  },
};
