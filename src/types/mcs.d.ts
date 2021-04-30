declare namespace Components {
  namespace RequestBodies {
    export type Message = Schemas.Message;
  }
  namespace Responses {
    export interface Message {
      message?: Schemas.Message;
    }
    export type Messages = Schemas.Message[];
  }
  namespace Schemas {
    export type ChannelId = string;
    export interface ErrorResponse {
      statusCode: number;
      message: string;
    }
    export interface Message {
      message: string; // ^[0-9a-fA-F]+$
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
