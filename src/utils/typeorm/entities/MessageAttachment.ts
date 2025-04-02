import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Message } from './Message';

@Entity({
  name: 'message_attachments',
})
export class MessageAttachment {
  @PrimaryGeneratedColumn('uuid')
  key: string;

  @Column()
  secure_url: string;

  @Column()
  public_id: string;

  @Column()
  type: string;

  @ManyToOne(() => Message, (message) => message.attachments, {
    onDelete: 'CASCADE',
  })
  message: Message;
}
