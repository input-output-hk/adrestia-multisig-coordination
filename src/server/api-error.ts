export default class ApiError extends Error implements Components.Schemas.ErrorResponse {
  statusCode: number;

  constructor(code: number, message: string) {
    super(message);
    this.statusCode = code;
  }
}
