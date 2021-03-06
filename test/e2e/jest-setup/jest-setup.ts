import dotenv from 'dotenv';
import path from 'path';
import { parse } from 'pg-connection-string';
import { createTestContainer, setupPostgresContainer } from './docker';

dotenv.config({ path: path.join(__dirname, '../../../.env.test') });

module.exports = async () => {
  const { user, database, password, port } = parse(process.env.DB_CONNECTION_STRING);

  if (createTestContainer)
    await setupPostgresContainer(
      database ? database : 'test',
      user ? user : 'postgres',
      password ? password : 'mysecretpassword',
      port ? port : '5432'
    );
};
