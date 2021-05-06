import ApiError from '../api-error';

export interface CustomError {
  message: string;
  code: number;
}

export const Errors = {
  // Join
  ALREADY_JOINED: { message: 'Already joined', code: 400 },
  CHANNEL_NOT_FOUND: { message: 'Channel not found', code: 404 },
  MESSAGE_EXISTS_IN_CHANNEL: { message: 'Same message exists in the channel', code: 500 }
};

export const buildApiError = (error: CustomError): ApiError => new ApiError(error.code, error.message);

const alreadyJoined = buildApiError(Errors.ALREADY_JOINED);
const channelNotFound = buildApiError(Errors.CHANNEL_NOT_FOUND);
const messageExistsInChannel = buildApiError(Errors.MESSAGE_EXISTS_IN_CHANNEL);

export const ErrorFactory = {
  alreadyJoined,
  channelNotFound,
  messageExistsInChannel
};
