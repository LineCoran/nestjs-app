import { mkdir, writeFile } from 'fs/promises';
import { join } from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';

export interface StoredFile {
  url: string;
  filename: string;
  size: number;
}

/**
 * Хранилище загруженных файлов.
 * Если заданы S3_* переменные — пишет в S3-совместимое облако
 * (по умолчанию Yandex Object Storage). Иначе — на локальный диск (для разработки).
 */
@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private readonly s3?: S3Client;
  private readonly bucket = process.env.S3_BUCKET || '';
  private readonly publicUrl = (process.env.S3_PUBLIC_URL || '').replace(
    /\/+$/,
    '',
  );
  private readonly acl = process.env.S3_ACL || ''; // напр. public-read для AWS; при публичном bucket'е оставить пустым
  private readonly dir = process.env.UPLOAD_DIR || 'media';

  constructor() {
    const endpoint = process.env.S3_ENDPOINT;
    const accessKeyId = process.env.S3_ACCESS_KEY_ID;
    const secretAccessKey = process.env.S3_SECRET_ACCESS_KEY;

    console.log(endpoint);
    if (endpoint && this.bucket && accessKeyId && secretAccessKey) {
      this.s3 = new S3Client({
        endpoint,
        region: process.env.S3_REGION || 'ru-central1',
        credentials: { accessKeyId, secretAccessKey },
        // path-style совместим с Yandex/MinIO; для AWS можно выставить false
        forcePathStyle: process.env.S3_FORCE_PATH_STYLE !== 'false',
      });
      this.logger.log(`Хранилище: S3 (${endpoint}, bucket=${this.bucket})`);
    } else {
      this.logger.warn(
        'Хранилище: локальный диск (S3_* не заданы). Для прода настройте облако.',
      );
    }
  }

  async save(
    filename: string,
    buffer: Buffer,
    mimeType: string,
  ): Promise<StoredFile> {
    const base = this.publicUrl || `${process.env.S3_ENDPOINT}/${this.bucket}`;
    const url = `${base}/${this.dir}/${filename}`;
    if (this.s3) {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: `${this.dir}/${filename}`,
          Body: buffer,
          ContentType: mimeType,
          ...(this.acl ? { ACL: this.acl as never } : {}),
        }),
      );
      return { url, filename, size: buffer.length };
    }

    // Фолбэк: локальный диск
    const dir = join(process.cwd(), this.dir);
    await mkdir(dir, { recursive: true });
    await writeFile(join(dir, filename), buffer);
    return {
      url: `/${this.dir}/${filename}`,
      filename,
      size: buffer.length,
    };
  }
}
