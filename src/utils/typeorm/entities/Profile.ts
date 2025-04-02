import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './User';

@Entity({ name: 'profiles' })
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ default: '', nullable: true })
  about: string;

  @Column({ type: 'simple-json', nullable: true })
  avatar?: { secure_url: string; public_id: string };

  @Column({ type: 'simple-json', nullable: true })
  banner?: { secure_url: string; public_id: string };

  @OneToOne(() => User, { createForeignKeyConstraints: false })
  user: User;
}
