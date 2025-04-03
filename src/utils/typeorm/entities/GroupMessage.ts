import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './Group';
import { GroupMessageAttachment } from './GroupMessageAttachment';
import { User } from './User';

// import BaseMessage from './BaseMessage';
abstract class BaseMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  author: User;
}

@Entity({ name: 'group_messages' })
export class GroupMessage extends BaseMessage {
  @ManyToOne(() => Group, (group) => group.messages)
  group: Group;

  @OneToMany(() => GroupMessageAttachment, (attachment) => attachment.message)
  @JoinColumn()
  attachments?: GroupMessageAttachment[];
}
