/* eslint-disable no-magic-numbers */
const KB_TO_CHAR = 1000;

const MAX_CHANNEL_LENGTH = 512;
const MAX_MESSAGE_LENGTH = (process.env.MESSAGE_SIZE ?? 128) * KB_TO_CHAR;
const MESSAGE_PATTERN = '^[0-9a-fA-F]+$';

const STATUS_CODES = {
  BAD_REQUEST: 400,
  NOT_FOUND: 404
};

export { MAX_CHANNEL_LENGTH, MAX_MESSAGE_LENGTH, MESSAGE_PATTERN, STATUS_CODES };
