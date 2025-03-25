import { Exclude } from 'class-transformer';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToMany,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Group } from './Group';
import { Profile } from './Profile';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column({ unique: true })
  username: string;

  @OneToOne(() => Profile, { cascade: ['insert', 'update'] })
  @JoinColumn()
  profile: Profile;

  @Column({ select: false })
  @Exclude()
  password: string;

  @ManyToMany(() => Group, (group) => group.users)
  groups: Group[];
}
