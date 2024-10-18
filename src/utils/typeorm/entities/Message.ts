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

@Entity({ name: 'messages' })
export class Message {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Conversation, (conversation) => conversation.messages, {
    nullable: true,
  })
  conversation: Conversation;

  @Column('text', { nullable: true })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  author: User;
}
