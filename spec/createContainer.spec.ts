import { Container, createContainer } from '../src';

describe('createContainer', () => {
  it('creates a container', () => {
    const container = createContainer();
    expect(container).toBeInstanceOf(Container);
  });

  it('creates a container with arguments', () => {
    const parentContainer = createContainer();
    const childContainer = createContainer(parentContainer);

    expect(childContainer.parent).toBe(parentContainer);
  });
});
