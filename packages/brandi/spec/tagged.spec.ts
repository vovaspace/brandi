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
    class Some {}

    const TAGS = {
      some: tag('some'),
    };

    tagged(Some, TAGS.some);

    expect(tagsRegistry.get(Some)).toStrictEqual([TAGS.some]);
  });

  it('registers multiple tags', () => {
    class Some {}

    const TAGS = {
      some: tag('some'),
      another: tag('another'),
    };

    tagged(Some, TAGS.some, TAGS.another);

    expect(tagsRegistry.get(Some)).toStrictEqual([TAGS.some, TAGS.another]);
  });

  it('rewrites tags', () => {
    class Some {}

    const TAGS = {
      some: tag('some'),
      another: tag('another'),
    };

    tagged(Some, TAGS.some);
    tagged(Some, TAGS.another);

    expect(tagsRegistry.get(Some)).toStrictEqual([TAGS.another]);
  });
});
