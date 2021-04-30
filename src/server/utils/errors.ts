import ApiError from '../api-error';

export interface CustomError {
  message: string;
  code: number;
}

export const Errors = {
  // Join
  ALREADY_JOINED: { message: 'Already joined', code: 400 }
};

export const buildApiError = (error: CustomError): ApiError => new ApiError(error.code, error.message);

const alreadyJoined = buildApiError(Errors.ALREADY_JOINED);

export const ErrorFactory = {
  alreadyJoined
};
