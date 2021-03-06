import { TokenTypeMap, token } from '../src';

import { Equal, Expect } from './utils';

describe('TokenTypeMap', () => {
  it('returns token type map', () => {
    const TOKENS = {
      num: token<number>('num'),
      str: token<string>('str'),
      nested: {
        num: token<number>('num'),
        str: token<string>('str'),
      },
    };

    type Result = Expect<
      Equal<
        TokenTypeMap<typeof TOKENS>,
        {
          num: number;
          str: string;
          nested: {
            num: number;
            str: string;
          };
        }
      >
    >;

    expect(true).toBe<Result>(true);
  });
});
