import { TokenTypeMap, token } from '../src';

import { Equal, Expect } from './utils';

describe('TokenTypeMap', () => {
  it('returns token type map', () => {
    const tokens = {
      num: token<number>('num'),
      str: token<string>('str'),
      nested: {
        num: token<number>('num'),
        str: token<string>('str'),
      },
    };

    type Result = Expect<
      Equal<
        TokenTypeMap<typeof tokens>,
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

    const result: Result = true;

    expect(result).toBe(true);
  });
});
