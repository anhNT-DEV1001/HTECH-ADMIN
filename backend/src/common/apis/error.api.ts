import { HttpException, HttpStatus } from '@nestjs/common';

export class ApiError extends HttpException {
  constructor(
    message: string,
    status: HttpStatus,
    field: Record<string, string> = {},
  ) {
    super(
      {
        statusCode: status,
        message,
        field: Object.keys(field).length > 0 ? field : null,
      },
      status,
    );
  }
}
