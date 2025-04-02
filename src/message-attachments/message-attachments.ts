import { MessageAttachment } from 'src/utils/typeorm';
import { Attachment } from 'src/utils/types';

export interface IMessageAttachmentsService {
  createConversationAttachment(
    attachments: Attachment[],
  ): Promise<MessageAttachment[]>;

  deteleMessageAttachment(messageAttachments: MessageAttachment[]);
}
