import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { dotEnvOptions } from 'src/config/dotenv-options';
dotenv.config(dotEnvOptions);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DB_HOST,
  port: +process.env.DB_PORT,
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: ['dist/**/*.entity.js'],
  migrations: ['dist/db/migrations/*.js'],
  logging: true,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
