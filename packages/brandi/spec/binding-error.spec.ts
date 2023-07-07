import { Container, injected, token } from '../src';

describe('common container error', () => {
  const createLoggerModule = () => {
    throw new Error('error to stop logger module from being created')
    return {
      log: (message: string) => {
        // eslint-disable-next-line no-console
        console.log(message)
      },
    }
  }
  type Logger = ReturnType<typeof createLoggerModule>

  const createAdderModule = (logger: Logger) => {
    return {
      add: (a: number, b: number) => {
        logger.log('adding')
        return a + b
      },
    }
  }
  type Adder = ReturnType<typeof createAdderModule>

  const TOKENS = {
    logger: token<Logger>('logger'),
    adder: token<Adder>('adder'),
  }

  const container = new Container()
  injected(createAdderModule, TOKENS.logger)
  container.bind(TOKENS.adder).toInstance(createAdderModule).inSingletonScope()
  container.bind(TOKENS.logger).toInstance(createLoggerModule).inSingletonScope()

  // container.get(TOKENS.adder)

  it('fail to retrieve a module with understandable error', () => {
    expect(() => {
      container.get(TOKENS.adder)
    }).toThrow(new Error("Failed to resolve the binding for 'adder' token."))
  })
})
