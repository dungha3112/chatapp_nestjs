import { Module } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { ConfigService } from '@nestjs/config';
import { ImageStorageService } from './image-storage.service';
import { Services } from 'src/utils/constants';

@Module({
  providers: [
    {
      provide: Services.CLOUDINARY_CLIENT,
      useFactory: (config: ConfigService) => {
        cloudinary.config({
          cloud_name: config.get('CLOUDINARY_CLOUD_NAME'),
          api_key: config.get('CLOUDINARY_API_KEY'),
          api_secret: config.get('CLOUDINARY_API_SECRET'),
          secure: true,
        });

        return cloudinary;
      },
      inject: [ConfigService],
    },

    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
  ],

  exports: [
    {
      provide: Services.IMAGE_UPLOAD_SERVICE,
      useClass: ImageStorageService,
    },
  ],
})
export class ImageStorageModule {}
