/* eslint-disable no-magic-numbers */
/* eslint-disable no-console */
import Docker from 'dockerode';
import { containerExec, imageExists, pullImageAsync } from 'dockerode-utils';

const CONTAINER_IMAGE = 'postgres:11.5-alpine';
const CONTAINER_NAME = 'mcs-test';

export const removePostgresContainer = async (): Promise<void> => {
  const docker = new Docker();
  const container = docker.getContainer(CONTAINER_NAME);
  await container.stop();
  await container.remove();
};

export const createTestContainer = process.env.SKIP_TEST_PG_CONTAINER !== 'true';

export const setupPostgresContainer = async (
  database: string,
  user: string,
  password: string,
  port: string
): Promise<void> => {
  const docker = new Docker();

  const needsToPull = !(await imageExists(docker, CONTAINER_IMAGE));
  if (needsToPull) await pullImageAsync(docker, CONTAINER_IMAGE);

  const container = await docker.createContainer({
    Image: CONTAINER_IMAGE,
    Env: [`POSTGRES_DB=${database}`, `POSTGRES_PASSWORD=${password}`, `POSTGRES_USER=${user}`],
    HostConfig: {
      PortBindings: {
        '5432/tcp': [
          {
            HostPort: port
          }
        ]
      }
    },
    name: CONTAINER_NAME
  });
  await container.start();

  // Uncomment the following lines if you are going to populate the db with a snapshot

  // Wait for the db service to be running (container started event is not enough)
  await containerExec(container, [
    'bash',
    '-c',
    `until psql -U ${user} -d ${database} -c "select 1" > /dev/null 2>&1 ; do sleep 1; done`
  ]);
};
