import { Injectable, PipeTransform } from '@nestjs/common';
import { CustomException } from '@common/exceptions';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

@Injectable()
export class ImageFileRequiredPipe implements PipeTransform {
  transform(file: Express.Multer.File) {
    if (!file) throw new CustomException('general.required.image', 'BAD_REQUEST');
    return this.validate(file);
  }

  protected validate(file: Express.Multer.File) {
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype))
      throw new CustomException('general.invalidType.image', 'BAD_REQUEST');
    if (file.size > MAX_FILE_SIZE)
      throw new CustomException('general.tooLarge.image', 'BAD_REQUEST');
    return file;
  }
}

@Injectable()
export class ImageFileOptionalPipe extends ImageFileRequiredPipe implements PipeTransform {
  transform(file: Express.Multer.File | undefined) {
    if (!file) return undefined;
    return this.validate(file);
  }
}
