import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

const UPLOAD_DIR = process.env.UPLOAD_DIR || 'uploads';
const MAX_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 10);
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];

@UseGuards(JwtAuthGuard)
@Controller('admin/upload')
export class UploadController {
  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: UPLOAD_DIR,
        filename: (_req, file, cb) => {
          cb(null, `${randomUUID()}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: MAX_SIZE_MB * 1024 * 1024 },
      fileFilter: (_req, file, cb) => {
        if (!ALLOWED_MIME.includes(file.mimetype)) {
          return cb(
            new BadRequestException(
              'Разрешены только изображения JPG, PNG или WEBP',
            ),
            false,
          );
        }
        cb(null, true);
      },
    }),
  )
  upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }
    return {
      url: `/${UPLOAD_DIR}/${file.filename}`,
      filename: file.filename,
      size: file.size,
    };
  }
}
