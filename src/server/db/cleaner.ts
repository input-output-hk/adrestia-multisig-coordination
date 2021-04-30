// import sequelize, { Op } from 'sequelize';
import { Environment } from '../utils/environment-parser';

interface PruneParams {
  pruningTime: number;
}

export class DBCleaner {
  private pruneParams: PruneParams;

  constructor(environment: Environment) {
    this.pruneParams = {
      pruningTime: environment.PRUNING_TIME
    };
  }
}

export default (environment: Environment): DBCleaner => new DBCleaner(environment);
