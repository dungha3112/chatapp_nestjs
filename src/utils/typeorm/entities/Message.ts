import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Conversation } from './Conversation';
import { User } from './User';
import BaseMessage from './BaseMessage';

/**
 * Message can not extends BaseMessage
 * Error message: Class extends value undefined is not a constructor or null
 */

// abstract class BaseMessage {
//   @PrimaryGeneratedColumn()
//   id: number;

//   @Column('text', { nullable: true })
//   content: string;

//   @CreateDateColumn({ name: 'created_at' })
//   createdAt: number;

//   @OneToOne(() => User, { createForeignKeyConstraints: false })
//   @JoinColumn()
//   author: User;
// }

@Entity({ name: 'messages' })
export class Message extends BaseMessage {
  @ManyToOne(() => Conversation, (conversation) => conversation.messages)
  conversation: Conversation;
}
