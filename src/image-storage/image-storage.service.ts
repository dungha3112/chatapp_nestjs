import { Inject, Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { Services } from 'src/utils/constants';
import { UploadImageResponse } from 'src/utils/types';
import { IImageStorageService } from './image-storage';
import { Readable } from 'stream';

@Injectable()
export class ImageStorageService implements IImageStorageService {
  constructor(
    @Inject(Services.CLOUDINARY_CLIENT)
    private readonly cloud: typeof cloudinary,
  ) {}

  async upload(file: Express.Multer.File): Promise<UploadImageResponse> {
    // const res = await this.cloud.uploader.upload(file.path, {
    //   folder: 'images_dev',
    // });
    // return { secure_url: res.secure_url, public_id: res.public_id };

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
}
