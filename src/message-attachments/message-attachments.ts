import { GroupMessageAttachment, MessageAttachment } from 'src/utils/typeorm';
import { Attachment } from 'src/utils/types';

export interface IMessageAttachmentsService {
  createConversationAttachment(
    attachments: Attachment[],
  ): Promise<MessageAttachment[]>;

  createGroupAttachment(
    attachments: Attachment[],
  ): Promise<GroupMessageAttachment[]>;

  deteleMessageAttachment(messageAttachments: MessageAttachment[]);

  deteleGroupMessageAttachment(messageAttachments: GroupMessageAttachment[]);
}
