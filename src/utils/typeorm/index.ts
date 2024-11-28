import * as dotenv from 'dotenv';
dotenv.config();
import { DataSource } from 'typeorm';
import { Conversation } from './entities/Conversation';
import { Group } from './entities/Group';
import { Message } from './entities/Message';
import { Session } from './entities/Session';
import { User } from './entities/User';

export const entities = [User, Session, Conversation, Message, Group];

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

export { Conversation, Group, Message, Session, User };
