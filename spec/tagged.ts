import { tag, tagged } from '../src';
import { tagsRegistry } from '../src/globals';

describe('tagged', () => {
  beforeAll(() => {
    tagsRegistry.clear();
  });

  afterEach(() => {
    tagsRegistry.clear();
  });

  it("adds a single tag to 'tagsRegistry'", () => {
    const someTag = tag('someTag');
    class SomeClass {}

    tagged(SomeClass, someTag);

    expect(tagsRegistry.get(SomeClass)).toStrictEqual([someTag]);
  });

  it("adds multiple tags to 'tagsRegistry'", () => {
    const tags = {
      first: tag('firstTag'),
      second: tag('secondTag'),
    };
    class SomeClass {}

    tagged(SomeClass, tags.first, tags.second);

    expect(tagsRegistry.get(SomeClass)).toStrictEqual([
      tags.first,
      tags.second,
    ]);
  });

  it('rewrites tags', () => {
    const tags = {
      first: tag('firstTag'),
      second: tag('secondTag'),
    };
    class SomeClass {}

    tagged(SomeClass, tags.first);
    tagged(SomeClass, tags.second);

    expect(tagsRegistry.get(SomeClass)).toStrictEqual([tags.second]);
  });
});
