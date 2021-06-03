import moment from 'moment';
import { Op } from 'sequelize';
import Message from '../model/message';
import { Environment } from '../utils/environment-parser';

export interface DBCleaner {
  pruneMessages(): Promise<number>;
}

export default (environment: Environment): DBCleaner => ({
  pruneMessages: async () =>
    await Message.destroy({
      where: {
        [Op.and]: {
          createdAt: {
            [Op.lte]: moment()
              .subtract(environment.PRUNING_TIME, 'minutes')
              .toDate()
          }
        }
      }
    })
});
