declare namespace Components {
  namespace Schemas {
    /**
     * Sample request
     */
    export interface SampleRequest {
      param: string;
    }
    /**
     * Sample response object.
     */
    export interface SampleResponse {
      msg: string;
    }
    /**
     * Sample response error object.
     */
    export interface SampleResponseError {
      error: string;
    }
  }
}
declare namespace Paths {
  namespace SampleMethod {
    export type RequestBody = /* Sample request */ Components.Schemas.SampleRequest;
    namespace Responses {
      export type $200 = /* Sample response object. */ Components.Schemas.SampleResponse;
      export type $500 = /* Sample response error object. */ Components.Schemas.SampleResponseError;
    }
  }
}
