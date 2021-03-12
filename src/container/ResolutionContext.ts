import { Binding } from './bindings';

export class ResolutionContext {
  public readonly cache = new Map<Binding, unknown>();
}
