import {
  Body,
  Controller,
  InternalServerErrorException,
  Post,
  UploadedFile,
  UseInterceptors,
  UsePipes,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ValidateFilePipe } from './pipe/validate-file/validate-file.pipe';
import { memoryStorage } from 'multer';

import * as pdfParse from 'pdf-parse';

import * as fs from 'fs';
import * as path from 'path';
import { AppService } from './app.service';
import { response } from 'express';
@Controller('files')
export class AppController {
  //Modelo 4
  constructor(private readonly appService: AppService) {}

  /**
   * De esta manera se puede subir un archivo a la carpeta upload
   * pero antes de eso poder validarlo con un pipe, pero si se quiere
   * subir todo los archivos sin validaciones(modelo 2)
   * */

  // Modelo 1
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  @UsePipes(ValidateFilePipe)
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    try {
      const nameCifrado = `${Date.now()}-${Math.round(Math.random() * 1e9)}.pdf`;
      const ruta = path.join(__dirname, '..', 'upload');
      if (!fs.existsSync(ruta)) {
        fs.mkdirSync(ruta, { recursive: true });
      }
      const uploadPath = path.join(ruta, nameCifrado);
      fs.writeFileSync(uploadPath, file.buffer);

      return {
        message: 'File uploaded successfully',
        file: nameCifrado,
      };
    } catch (error) {
      console.error('Error al guardar el archivo:', error);
      throw new InternalServerErrorException('No se pudo guardar el archivo');
    }
  }

  // Modelo 2

  @Post('upload2')
  @UseInterceptors(FileInterceptor('all'))
  UploadModel2(@UploadedFile() file: Express.Multer.File) {
    try {
      return {
        message: 'File uploaded successfully',
        file: file.originalname,
      };
    } catch (error) {
      return error;
    }
  }

  // Modelo 3 - Todo se manejara en memoria
  @Post('upload3')
  @UsePipes(ValidateFilePipe)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async UploadModel3(@UploadedFile() file: Express.Multer.File) {
    try {
      const extractedText = await pdfParse(file.buffer);
      return {
        message: 'File uploaded successfully',
        file: extractedText.text,
      };
    } catch (error) {
      throw new InternalServerErrorException(
        'No se pudo procesar el archivo PDF',
      );
    }
  }

  // Modelo 4 - Extra del modelo 3, esta vez analizaremos el archivo PDF usando Gemini IA
  @Post('upload_ia')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async UploadModel4(
    @UploadedFile(ValidateFilePipe) file: Express.Multer.File,
    @Body() body : { question: string },
  ) {
    try {
      const extractedText = await pdfParse(file.buffer);
      const data = extractedText.text;
      const res = await this.appService.geminIA_api(data, body.question);
      return {
        message : 'File uploaded successfully',
        file_origin : {
          name : file.originalname,
          size : file.size,
          type : file.mimetype
        },
        question : body.question,
        res,
        status : 'success'
      };
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(
        'No se pudo procesar el archivo PDF',
      );
    }
  }
}
