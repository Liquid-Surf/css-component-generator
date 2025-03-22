import { getLoggerFor, Logger } from '@solid/community-server';
import { TemplateName } from '../../src/TemplateName';

// We mock the `getLoggerFor` function so we can see what gets logged,
// but make sure none of the other CSS imports get changed.
jest.mock('@solid/community-server', () =>  ({
  ...jest.requireActual('@solid/community-server'),
  getLoggerFor: jest.fn(),
}));

describe('A TemplateName', (): void => {
  let logger: jest.Mocked<Logger>;
  let handler: TemplateName;

  beforeEach(async(): Promise<void> => {
    // We create a mock logger and set that as the result if `getLoggerFor` gets called.
    logger = {
      info: jest.fn(),
    } as any;
    (getLoggerFor as jest.Mock).mockReturnValue(logger);

    handler = new TemplateName();
  });

  it('logs HELLO WORLD!', async(): Promise<void> => {
    // We verify if the expected string gets logged when the TemplateName handle function is called.
    await expect(handler.handle()).resolves.toBeUndefined();
    expect(logger.info).toHaveBeenCalledTimes(1);
    expect(logger.info).toHaveBeenLastCalledWith('HELLO WORLD!');
  });
})
