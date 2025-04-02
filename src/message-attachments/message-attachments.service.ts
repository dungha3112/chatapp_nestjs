import { Inject, Injectable } from '@nestjs/common';
import { IMessageAttachmentsService } from './message-attachments';
import { MessageAttachment } from 'src/utils/typeorm';
import { Attachment } from 'src/utils/types';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { IImageStorageService } from 'src/image-storage/image-storage';
import { Services } from 'src/utils/constants';

@Injectable()
export class MessageAttachmentsService implements IMessageAttachmentsService {
  constructor(
    @InjectRepository(MessageAttachment)
    private readonly attachmentRepository: Repository<MessageAttachment>,

    @Inject(Services.IMAGE_UPLOAD_SERVICE)
    private readonly imageUploadService: IImageStorageService,
  ) {}

  async createConversationAttachment(
    attachments: Attachment[],
  ): Promise<MessageAttachment[]> {
    const promise = attachments.map(async (attachment) => {
      const res = await this.imageUploadService.upload(attachment);

      const newAttachment = this.attachmentRepository.create({
        public_id: res.public_id,
        secure_url: res.secure_url,
        type: attachment.mimetype,
      });
      const messageAttachment =
        await this.attachmentRepository.save(newAttachment);

      return messageAttachment;
    });

    return Promise.all(promise);
  }

  async deteleMessageAttachment(messageAttachments: MessageAttachment[]) {
    const promise = messageAttachments.map(async (messageAttachment) => {
      if (messageAttachment) {
        await this.imageUploadService.removeImageByPublicId(
          messageAttachment.public_id,
        );
      }
    });

    return Promise.all(promise);
  }
}
