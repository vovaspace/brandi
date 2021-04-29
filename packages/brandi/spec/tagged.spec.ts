import { tag, tagged } from '../src';
import { tagsRegistry } from '../src/registries';

describe('tagged', () => {
  beforeAll(() => {
    tagsRegistry.clear();
  });

  afterEach(() => {
    tagsRegistry.clear();
  });

  it('registers a single tag', () => {
    class SomeClass {}

    const tags = {
      some: tag('some'),
    };

    tagged(SomeClass, tags.some);

    expect(tagsRegistry.get(SomeClass)).toStrictEqual([tags.some]);
  });

  it('registers multiple tags', () => {
    class SomeClass {}

    const tags = {
      some: tag('some'),
      another: tag('another'),
    };

    tagged(SomeClass, tags.some, tags.another);

    expect(tagsRegistry.get(SomeClass)).toStrictEqual([
      tags.some,
      tags.another,
    ]);
  });

  it('rewrites tags', () => {
    class SomeClass {}

    const tags = {
      some: tag('some'),
      another: tag('another'),
    };

    tagged(SomeClass, tags.some);
    tagged(SomeClass, tags.another);

    expect(tagsRegistry.get(SomeClass)).toStrictEqual([tags.another]);
  });
});
