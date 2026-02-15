import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { unlink } from 'fs';
import { promisify } from 'util';

const unlinkAsync = promisify(unlink);

@Injectable()
export class DeleteFileOnErrorFilter implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(
      catchError(async (err) => {
        const req = context.switchToHttp().getRequest();
        const files = req.files;
        if (req.file) {
          await this.deleteFile(req.file.path);
        }
        if (files) {
          const fileKeys = Object.keys(files);
          for (const key of fileKeys) {
            const fileArray = files[key];
            if (Array.isArray(fileArray)) {
              for (const file of fileArray) {
                await this.deleteFile(file.path);
              }
            }
          }
        }

        return throwError(() => err);
      }),
    );
  }

  async deleteFile(path: string) {
    try {
      await unlinkAsync(path);
      console.log(`[System] Deleted junk file due to error: ${path}`);
    } catch (error) {
      console.error(`[System] Failed to delete file: ${path}`, error);
    }
  }
}