import { createTestContainer, removePostgresContainer } from './docker';

module.exports = async () => {
  if (createTestContainer) await removePostgresContainer();
};
