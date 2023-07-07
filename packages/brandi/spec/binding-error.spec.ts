import { Container, injected, token } from '../src';

describe('common container error', () => {
  const INITIAL_ERR_MSG = 'error to stop logger module from being created'

  it('provides clear error when modules are functions', () => {
    const createLoggerModule = () => {
      throw new Error(INITIAL_ERR_MSG)
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

    expect(() => {
      container.get(TOKENS.adder)
    }).toThrow(new Error(`Failed to get token 'adder':
0. Failed to resolve the binding for 'adder' token.
1. Failed to resolve the binding for 'logger' token.
2. Failed to instantiate createLoggerModule: ${INITIAL_ERR_MSG}`))
  })

  it('provides clear error when modules are classes', () => {
    class LoggerModule {
      constructor() {
        throw new Error(INITIAL_ERR_MSG)
      }
      // eslint-disable-next-line
      public log(message: string) {
        // eslint-disable-next-line no-console
        console.log(message);
      }
    }

    class AdderModule {
      constructor(
          public loggerModule: LoggerModule,
      ) {
        throw new Error('error to stop logger module from being created')
      }
      // eslint-disable-next-line
      public add(a: number, b: number) {
        this.loggerModule.log('adding')
        return a + b
      }
    }

    const TOKENS = {
      logger: token<LoggerModule>('logger'),
      adder: token<AdderModule>('adder'),
    }

    const container = new Container()
    injected(AdderModule, TOKENS.logger)
    container.bind(TOKENS.adder).toInstance(AdderModule).inSingletonScope()
    container.bind(TOKENS.logger).toInstance(LoggerModule).inSingletonScope()

    expect(() => {
      container.get(TOKENS.adder)
    }).toThrow(new Error(`Failed to get token 'adder':
0. Failed to resolve the binding for 'adder' token.
1. Failed to resolve the binding for 'logger' token.
2. Failed to instantiate LoggerModule: ${INITIAL_ERR_MSG}`))
  })
})
