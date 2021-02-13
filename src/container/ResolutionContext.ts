import { Binding } from './Binding';

export class ResolutionContext {
  public readonly instances = new Map<Binding, Object>();
}
