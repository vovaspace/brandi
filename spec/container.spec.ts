import { Container, token } from '../src';

describe('container', () => {
  it('returns a value from the parent container', () => {
    const someValue = 1;

    const tokens = {
      someValue: token<number>('someValue'),
    };

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toValue(someValue);

    const childContainer = new Container(parentContainer);

    expect(childContainer.get(tokens.someValue)).toBe(someValue);
  });

  it("rebinds a parent container's binding in the child container", () => {
    const someValue = 1;
    const anotherValue = 2;

    const tokens = {
      someValue: token<number>('someValue'),
    };

    const parentContainer = new Container();
    parentContainer.bind(tokens.someValue).toValue(someValue);

    const childContainer = new Container(parentContainer);
    childContainer.bind(tokens.someValue).toValue(anotherValue);

    expect(parentContainer.get(tokens.someValue)).toBe(someValue);
    expect(childContainer.get(tokens.someValue)).toBe(anotherValue);
  });

  it('throws when the token was not bound', () => {
    const tokens = {
      some: token<unknown>('some'),
    };

    const container = new Container();

    expect(() => container.get(tokens.some)).toThrowErrorMatchingSnapshot();
  });

  it("returns an unlinked container from 'copy' method", () => {
    const parentValue = 1;
    const someValue = 2;
    const anotherValue = 3;
    const copiedValue = 4;

    const tokens = {
      parent: token<number>('parent'),
      original: token<number>('original'),
      copied: token<number>('copied'),
    };

    const parentContainer = new Container();
    parentContainer.bind(tokens.parent).toValue(parentValue);

    const originalContainer = new Container(parentContainer);
    originalContainer.bind(tokens.original).toValue(someValue);

    const copiedContainer = originalContainer.copy();
    copiedContainer.bind(tokens.original).toValue(anotherValue);
    copiedContainer.bind(tokens.copied).toValue(copiedValue);

    expect(originalContainer.get(tokens.original)).toBe(someValue);
    expect(() =>
      originalContainer.get(tokens.copied),
    ).toThrowErrorMatchingSnapshot();

    expect(copiedContainer.get(tokens.parent)).toBe(parentValue);
    expect(copiedContainer.get(tokens.original)).toBe(anotherValue);
    expect(copiedContainer.get(tokens.copied)).toBe(copiedValue);
  });
});
