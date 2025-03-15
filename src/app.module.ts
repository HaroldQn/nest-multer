import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as path from 'path';

@Module({
  imports: [
    MulterModule.register({
      storage: diskStorage({
        destination: './upload2',
        filename: (req, file, cb) => {
          const fileExt = path.extname(file.originalname); // Extrae la extensión
          const nameCifrado = `${Date.now()}${Math.round(Math.random() * 1e9)}${fileExt}`;
          cb(null, nameCifrado);
        },
      }),
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
