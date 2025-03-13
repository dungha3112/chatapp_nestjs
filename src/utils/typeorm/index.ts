import * as dotenv from 'dotenv';
import { DataSource } from 'typeorm';
import { Conversation } from './entities/Conversation';
import { GroupMessage } from './entities/GroupMessage';
import { Group } from './entities/Group';
import { Message } from './entities/Message';
import { Session } from './entities/Session';
import { User } from './entities/User';
import { Friend } from './entities/Friend';
import { FriendRequest } from './entities/FriendRequest';
dotenv.config();

export const entities = [
  User,
  Session,
  Conversation,
  Message,
  Group,
  GroupMessage,
  FriendRequest,
  Friend,
];

export const AppDataSource = new DataSource({
  type: 'mysql',
  host: process.env.MYSQL_DB_HOST,
  port: process.env.MYSQL_DB_PORT,
  username: process.env.MYSQL_DB_USERNAME,
  password: process.env.MYSQL_DB_PASSWORD,
  database: process.env.MYSQL_DB_DATABASE,
  entities: [Session],
  synchronize: true,
});

export {
  User,
  Session,
  Conversation,
  Message,
  Group,
  GroupMessage,
  Friend,
  FriendRequest,
};
