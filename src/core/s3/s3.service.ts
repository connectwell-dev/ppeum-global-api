import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DeleteObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import * as path from 'path';

@Injectable()
export class S3Service implements OnModuleInit {
  private client: S3Client;
  private bucket: string;

  constructor(private readonly configService: ConfigService) { }

  onModuleInit() {
    this.client = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_S3_CLOUDFRONT_ACCESS_KEY'),
        secretAccessKey: this.configService.get<string>('AWS_S3_CLOUDFRONT_SECRET_KEY'),
      },
    });
    this.bucket = this.configService.get<string>('AWS_S3_BUCKET');
  }

  async upload(file: Express.Multer.File, directory: string = ''): Promise<string> {
    const ext = path.extname(file.originalname).toLowerCase();
    const key = `${directory}/${uuidv4()}${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
      }),
    );

    return key;
  }

  async uploadMany(files: Express.Multer.File[], directory: string = ''): Promise<string[]> {
    if (!files?.length) return [];
    return Promise.all(files.map((file) => this.upload(file, directory)));
  }

  async delete(key: string): Promise<void> {
    if (!key) return;
    await this.client.send(
      new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
    );
  }
}
