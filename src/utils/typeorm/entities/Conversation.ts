import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './User';

@Entity({ name: 'conversations' })
export class Conversation {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @OneToOne(() => User, { createForeignKeyConstraints: false })
  creator: User;

  @Column()
  @OneToOne(() => User, { createForeignKeyConstraints: false })
  recipient: User;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: number;

  @Column()
  @JoinColumn({ name: 'last_message_sent' })
  lastMessageSent: string;

  @UpdateDateColumn({ name: 'updated_at' })
  lastMessageSentAt: Date;
}
