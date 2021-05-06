/* eslint-disable new-cap */
import { Model, Sequelize, DataTypes } from 'sequelize';
import { MAX_CHANNEL_LENGTH, MAX_MESSAGE_LENGTH, MESSAGE_PATTERN } from '../utils/constants';

type ChannelId = Components.Schemas.ChannelId;
type Message = Components.Schemas.Message;

export interface MessageAttributes {
  channelId: ChannelId;
  message: Message;
}

type MessageAttributesCreation = MessageAttributes;

class MessageClass extends Model<MessageAttributes, MessageAttributesCreation> implements MessageAttributes {
  public channelId!: ChannelId;
  public message!: Message;

  public readonly createdAt!: Date;

  public getMessages!: Promise<Message[]>;
  public addMessage!: Promise<Message>;

  public toDTO(): Components.Schemas.MessageStored {
    return {
      channelId: this.channelId,
      message: this.message,
      createdAt: this.createdAt.toISOString()
    };
  }

  public static initialize(sequelize: Sequelize): void {
    this.init(
      {
        channelId: {
          type: DataTypes.STRING(MAX_CHANNEL_LENGTH),
          validate: {
            len: [1, MAX_CHANNEL_LENGTH],
            notEmpty: true
          },
          allowNull: false
        },
        message: {
          type: DataTypes.STRING(MAX_MESSAGE_LENGTH),
          validate: {
            is: [MESSAGE_PATTERN, 'i'],
            len: [1, MAX_MESSAGE_LENGTH],
            notEmpty: true
          },
          allowNull: false
        }
      },
      {
        sequelize,
        tableName: 'messages',
        timestamps: true
      }
    );
  }
}
export default MessageClass;
