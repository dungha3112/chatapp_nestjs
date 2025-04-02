import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Services } from 'src/utils/constants';
import { UploadImageResponse } from 'src/utils/types';
import { Readable } from 'stream';
import { IImageStorageService } from './image-storage';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  constructor(
    @Inject(Services.CLOUDINARY_CLIENT)
    private readonly cloud: typeof cloudinary,
  ) {}

  async upload(file: Express.Multer.File): Promise<UploadImageResponse> {
    return new Promise((resolve, reject) => {
      const uploadStream = this.cloud.uploader.upload_stream(
        {
          folder: 'images_dev',
        },

        (err, result) => {
          if (err) return reject(err);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
          });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async removeImageByPublicId(id: string) {
    return new Promise<void>((resolve, reject) => {
      this.cloud.uploader.destroy(id, (err, result) => {
        if (err) return reject(err);
        resolve();
      });
    });
  }
}
