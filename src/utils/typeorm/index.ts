import { DataSource } from 'typeorm';
import { Session } from './session';
import { User } from './user';
import { configDotenv } from 'dotenv';
configDotenv({ path: '.env' });

export const entities = [User, Session];

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

export { Session, User };
