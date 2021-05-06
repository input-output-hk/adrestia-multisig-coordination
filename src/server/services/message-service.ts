import { MessageRepository } from '../db/message-repository';
import { NotificationService } from './notification-service';

type ChannelId = Components.Schemas.ChannelId;
type Message = Components.Schemas.Message;
type MessageStored = Components.Schemas.MessageStored;

export class MessageService {
  private repository: MessageRepository;
  private notificationService: NotificationService;

  constructor(notificationService: NotificationService, repository: MessageRepository) {
    this.repository = repository;
    this.notificationService = notificationService;
  }

  async getMessages(channelId: ChannelId, from?: string): Promise<MessageStored[]> {
    return await this.repository.findMessages(channelId, from);
  }

  async sendMessage(channelId: ChannelId, message: Message): Promise<Components.Responses.Message> {
    // Store message
    const result = await this.repository.addMessage(channelId, message);

    // Send to channel
    this.notificationService.sendMessageToChannel(channelId, message);
    return result;
  }
}

const configure = (notificationService: NotificationService, repository: MessageRepository): MessageService =>
  new MessageService(notificationService, repository);

export default configure;
