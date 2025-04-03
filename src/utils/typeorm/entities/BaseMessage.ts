import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  OneToOne,
  JoinColumn,
  Entity,
} from 'typeorm';
import { User } from './User';

@Entity()
abstract class BaseMessage {
  @PrimaryGeneratedColumn()
  id: number;

  @Column('text', { nullable: true })
  content: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  @JoinColumn()
  author: User;
}

/**
 * Message can not extends BaseMessage
 * Error message: Class extends value undefined is not a constructor or null
 */
export default BaseMessage;
