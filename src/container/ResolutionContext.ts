import { Binding } from './bindings';

export class ResolutionContext {
  public readonly instances = new Map<Binding, Object>();
}
