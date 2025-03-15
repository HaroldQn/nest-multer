import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { Express } from 'express'

@Injectable()
export class ValidateFilePipe implements PipeTransform {

  private readonly formatPdf = ['application/pdf'];
  private readonly maxSize = 2 * 1024 * 1024; // 2MB

  transform(file: Express.Multer.File) {
    console.log(file);
    if (!file) {
      throw new BadRequestException('File is required');
    }

    if (!this.formatPdf.includes(file.mimetype)) {
      throw new BadRequestException('Invalid file format');
    }

    if (file.size > this.maxSize) {
      throw new BadRequestException('File size exceeds the limit');
    }

    return file;



  }
}
