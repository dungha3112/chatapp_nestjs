import { UploadImageResponse } from 'src/utils/types';

export interface IImageStorageService {
  upload(file: Express.Multer.File): Promise<UploadImageResponse>;

  removeImageByPublicId(id: string);
}
