import { parseEnvironment } from '../../src/server/utils/environment-parser';

const fakeHost = '129.this.412.is-a-super-fake-host12*312/40120|¿';
const fakeNumber = 'thisIsNotANumber';

const environmentParser = () => parseEnvironment();

describe('Environment parser test', () => {
  test('Should throw an error if a field is expected to be a number but its not', () => {
    const previousPort = process.env.PORT;
    process.env.PORT = Number(fakeNumber);
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | undefined): never => {
      throw new Error(code?.toString());
    });
    expect(environmentParser).toThrowError();
    expect(mockExit).toHaveBeenCalledWith(1);
    process.env.PORT = previousPort;
  });
  test('Should throw an error if a field is expected to be a valid host but its not', () => {
    const previousAddress = process.env.BIND_ADDRESS;
    process.env.BIND_ADDRESS = fakeHost;
    const mockExit = jest.spyOn(process, 'exit').mockImplementation((code?: number | undefined): never => {
      throw new Error(code?.toString());
    });
    expect(environmentParser).toThrowError();
    expect(mockExit).toHaveBeenCalledWith(1);
    process.env.BIND_ADDRESS = previousAddress;
  });
  test('Should return all environment variables and topology file parsed', () => {
    const environment = environmentParser();
    expect(environment).not.toBeUndefined();
  });
});
