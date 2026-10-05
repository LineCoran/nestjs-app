import {
  BadRequestException,
  Body,
  Controller,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { IsString } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { StorageService } from './storage.service';
import { buildImageVariants } from './image-variants';

const MAX_SIZE_MB = Number(process.env.MAX_UPLOAD_SIZE_MB || 10);
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MIME_BY_EXT: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

class ImageVariantsDto {
  /** Ссылка на ранее загруженное фото из нашего хранилища. */
  @IsString()
  url: string;
}

@UseGuards(JwtAuthGuard)
@Controller('admin/upload')
export class UploadController {
  constructor(private readonly storage: StorageService) {}

  @Post()
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
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
  async upload(@UploadedFile() file?: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException('Файл не передан');
    }
    const filename = `${randomUUID()}${extname(file.originalname)}`;
    const stored = await this.storage.save(
      filename,
      file.buffer,
      file.mimetype,
    );
    // Копии 480/1280 для карточек и галереи; оригинал остаётся для просмотра.
    await this.saveVariants(filename, file.buffer);
    return stored;
  }

  /**
   * Копии для уже загруженного фото (фото, залитые до появления копий).
   * Оригинал перезаливается как есть — чтобы получить заголовок кэша.
   */
  @Post('variants')
  async variants(@Body() dto: ImageVariantsDto) {
    const prefix = this.storage.publicPrefix;
    if (!dto.url.startsWith(prefix)) {
      throw new BadRequestException('Ссылка ведёт не в наше хранилище');
    }
    const filename = dto.url.slice(prefix.length);
    const mime = MIME_BY_EXT[extname(filename).toLowerCase()];
    if (!mime || filename.includes('/') || /-w\d+\.webp$/.test(filename)) {
      throw new BadRequestException('Это не оригинал фото');
    }
    const buffer = await this.storage.read(filename);
    await this.storage.save(filename, buffer, mime);
    return {
      url: dto.url,
      variants: await this.saveVariants(filename, buffer),
    };
  }

  private async saveVariants(filename: string, buffer: Buffer) {
    const variants = await buildImageVariants(filename, buffer);
    return Promise.all(
      variants.map((v) =>
        this.storage.save(v.filename, v.buffer, 'image/webp'),
      ),
    );
  }
}
