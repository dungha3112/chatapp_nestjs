import { InjectRepository } from '@nestjs/typeorm';
import { Group, GroupMessage, GroupMessageAttachment } from 'src/utils/typeorm';
import {
  CreateMessageParams,
  CreateGroupMessageResponse,
  DeleteGroupMessageParams,
  EditGroupMessageParams,
} from 'src/utils/types';
import { DeepPartial, Repository } from 'typeorm';
import { IGroupMessageServices } from '../interfaces/group-messages';
import { HttpException, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { Services } from 'src/utils/constants';
import { IGroupServices } from '../interfaces/group';
import { GroupNotFoundException } from '../exceptions/GroupNotFound';
import { UserNotFoundException } from 'src/users/exceptions/UserNotFound';
import { IMessageAttachmentsService } from 'src/message-attachments/message-attachments';

@Injectable()
export class GroupMessageServices implements IGroupMessageServices {
  constructor(
    @InjectRepository(GroupMessage)
    private readonly groupMessageRepository: Repository<GroupMessage>,

    @Inject(Services.GROUPS) private readonly groupServices: IGroupServices,
    @Inject(Services.MESSAGE_ATTACHMENTS)
    private readonly messageAttachmentsService: IMessageAttachmentsService,
  ) {}

  /**
   * createGroupMessage
   * @param params
   * @returns
   */
  async createGroupMessage(
    params: CreateMessageParams,
  ): Promise<CreateGroupMessageResponse> {
    const { content, id, user } = params;

    const group = await this.groupServices.findGroupById(id);
    if (!group) throw new GroupNotFoundException();

    const findUser = group.users.find((u) => u.id === user.id);
    if (!findUser) throw new UserNotFoundException();

    const attachments = params.attachments
      ? await this.messageAttachmentsService.createGroupAttachment(
          params.attachments,
        )
      : [];

    const newGroupMessage = this.groupMessageRepository.create({
      author: user,
      content,
      group: { id },
      attachments,
    });

    const saveGroupMessage =
      await this.groupMessageRepository.save(newGroupMessage);

    // update lastMessage
    group.lastMessageSent = { id: saveGroupMessage.id } as GroupMessage;
    const updateGroup = await this.groupServices.saveGroup(group);
    delete saveGroupMessage.group;

    return {
      message: saveGroupMessage,
      group: { ...updateGroup, lastMessageSent: saveGroupMessage },
    };
  }

  async getGroupMessagesById(
    id: number,
    skip: number,
  ): Promise<GroupMessage[]> {
    const group = await this.groupServices.findGroupById(id);
    if (!group) throw new GroupNotFoundException();

    if (!skip) return;

    const messages = await this.groupMessageRepository.find({
      where: { group: { id } },
      relations: ['author', 'author.profile'],
      order: { createdAt: 'DESC' },
    });

    return messages;
  }

  async deleteGroupMessage(params: DeleteGroupMessageParams) {
    const { userId, id, messageId } = params;
    const msgParams = { id, limit: 5 };

    const group = await this.groupServices.getMessages(msgParams);

    const message = await this.groupMessageRepository.findOne({
      where: {
        id: messageId,
        author: { id: userId },
      },
      relations: ['group', 'author', 'attachments'],
    });

    if (!message)
      throw new HttpException(
        'Message not found or you can not delete',
        HttpStatus.BAD_REQUEST,
      );

    // delete attachments message
    if (message.attachments.length > 0) {
      await this.messageAttachmentsService.deteleGroupMessageAttachment(
        message.attachments,
      );
    }

    if (group.lastMessageSent.id !== message.id) {
      await this.groupMessageRepository.delete({ id: messageId });
    } else {
      await this.deleteLastMessage(group, message);
    }

    return message;
  }

  async deleteLastMessage(group: Group, message: GroupMessage) {
    const size = group.messages.length;
    const SECOND_MESSAGE_INDEX = 1;

    if (size <= 1) {
      console.log('Last group Message Sent is deleted');

      await this.groupServices.updateGroup({
        id: group.id,
        lastMessageSent: null,
      });

      return this.groupMessageRepository.delete({ id: message.id });
    } else {
      console.log('There are more than 1 conversation message');
      const newLastMessage = group.messages[SECOND_MESSAGE_INDEX];

      await this.groupServices.updateGroup({
        id: group.id,
        lastMessageSent: newLastMessage,
      });

      return this.groupMessageRepository.delete({ id: message.id });
    }
  }

  async editMessage(params: EditGroupMessageParams): Promise<GroupMessage> {
    const { content, id, messageId, userId } = params;

    const messageDb = await this.groupMessageRepository.findOne({
      where: {
        id: messageId,
        group: { id },
        author: { id: userId },
      },
      relations: ['group', 'group.owner', 'group.users', 'author'],
    });

    if (!messageDb)
      throw new HttpException(
        'Message not found or you can not edit message',
        HttpStatus.BAD_REQUEST,
      );

    messageDb.content = content;
    return await this.groupMessageRepository.save(messageDb);
  }
}
