import { Op, WhereOptions } from 'sequelize';
import Message from '../model/message';
import { Environment } from '../utils/environment-parser';
import { ErrorFactory } from '../utils/errors';

export type ChannelResponse = Promise<Components.Schemas.ChannelId | null>;

type ChannelId = Components.Schemas.ChannelId;
type MessageStored = Components.Schemas.MessageStored;

export interface MessageRepository {
  findMessages(channelId: ChannelId, from?: string): Promise<MessageStored[]>;
  addMessage(channelId: ChannelId, message: Components.Schemas.Message): Promise<MessageStored>;
}

export const configure = (environment: Environment): MessageRepository => ({
  findMessages: async (channelId, from) => {
    const whereClause: WhereOptions[] = [{ channelId }];

    if (from)
      whereClause.push({
        createdAt: {
          [Op.gte]: new Date(from)
        }
      });

    const result = await Message.findAll({
      order: [['createdAt', 'ASC']],
      where: {
        [Op.and]: whereClause
      }
    });

    return result.map(message => message.toDTO());
  },

  addMessage: async (channelId: ChannelId, message: Components.Schemas.Message) => {
    const [result, created] = await Message.findOrCreate({
      where: { channelId, message },
      defaults: { channelId, message }
    });

    if (!created) throw ErrorFactory.messageExistsInChannel;

    return result.toDTO();
  }
});
