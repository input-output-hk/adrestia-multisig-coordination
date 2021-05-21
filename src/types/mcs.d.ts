declare namespace Components {
  namespace RequestBodies {
    export interface Message {
      message: Schemas.Message /* ^([0-9a-fA-F]{2})*$ */;
    }
  }
  namespace Responses {
    export type Message = Schemas.MessageStored;
    export type Messages = Schemas.MessageList;
  }
  namespace Schemas {
    export type ChannelId = string;
    export interface ErrorResponse {
      statusCode: number;
      message: string;
    }
    export type Message = string; // ^([0-9a-fA-F]{2})*$
    export type MessageList = MessageStored[];
    export interface MessageStored {
      channelId: ChannelId;
      message: Message /* ^([0-9a-fA-F]{2})*$ */;
      createdAt: string;
    }
  }
}
declare namespace Paths {
  namespace GetMessages {
    namespace Parameters {
      export type ChannelId = Components.Schemas.ChannelId;
      export type From = string; // date-time
    }
    export interface PathParameters {
      channelId: Parameters.ChannelId;
    }
    export interface QueryParameters {
      from?: Parameters.From /* date-time */;
    }
    namespace Responses {
      export type $200 = Components.Responses.Messages;
      export type $404 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
  namespace SendMessage {
    namespace Parameters {
      export type ChannelId = Components.Schemas.ChannelId;
    }
    export interface PathParameters {
      channelId: Parameters.ChannelId;
    }
    export type RequestBody = Components.RequestBodies.Message;
    namespace Responses {
      export type $200 = Components.Responses.Message;
      export type $400 = Components.Schemas.ErrorResponse;
      export type $500 = Components.Schemas.ErrorResponse;
    }
  }
}
